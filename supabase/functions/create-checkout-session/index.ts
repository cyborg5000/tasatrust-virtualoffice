import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.25.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "../_shared/cors.ts";
import { PLAN_PRICING, type SubscriptionTier } from "../_shared/plans.ts";

interface CheckoutRequestBody {
  tier: SubscriptionTier;
  addonIds?: string[];
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function isTier(value: string): value is SubscriptionTier {
  return value === "basic" || value === "essential" || value === "professional";
}

function normalizeInterval(interval: string | null) {
  if (!interval) return "month";
  const lower = interval.toLowerCase();
  if (lower === "monthly") return "month";
  if (lower === "yearly" || lower === "annual" || lower === "annually") return "year";
  if (lower === "week" || lower === "weekly") return "week";
  if (lower === "day" || lower === "daily") return "day";
  return "month";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey || !stripeSecretKey) {
    return jsonResponse({ error: "Missing required environment variables." }, 500);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return jsonResponse({ error: "Missing authorization header." }, 401);
  }

  let body: CheckoutRequestBody;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, 400);
  }

  if (!body?.tier || !isTier(body.tier)) {
    return jsonResponse({ error: "Invalid subscription tier." }, 400);
  }

  const addonIds = Array.isArray(body.addonIds)
    ? body.addonIds.filter((id): id is string => typeof id === "string")
    : [];

  if (addonIds.length > 30) {
    return jsonResponse({ error: "Too many addons selected." }, 400);
  }

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  });
  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-06-20" });

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    return jsonResponse({ error: "Unauthorized." }, 401);
  }

  const { data: existingMember, error: memberError } = await adminClient
    .from("members")
    .select("id, email, company_name, stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  if (memberError) {
    return jsonResponse({ error: "Unable to load member profile." }, 400);
  }

  let member = existingMember;

  if (!member) {
    const fallbackCompanyName =
      typeof user.user_metadata?.company_name === "string" && user.user_metadata.company_name.trim().length > 0
        ? user.user_metadata.company_name.trim()
        : "New Company";

    const { data: createdMember, error: createMemberError } = await adminClient
      .from("members")
      .insert({
        id: user.id,
        email: user.email || "",
        company_name: fallbackCompanyName,
      })
      .select("id, email, company_name, stripe_customer_id")
      .single();

    if (createMemberError || !createdMember) {
      return jsonResponse({ error: "Unable to create member profile." }, 400);
    }

    member = createdMember;
  }

  const plan = PLAN_PRICING[body.tier];

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    {
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: Math.round(plan.monthly * 100),
        recurring: { interval: "month" },
        product_data: {
          name: `${plan.name} Plan`,
          description: "TASA Trust virtual office subscription",
        },
      },
    },
  ];

  const validAddonIds: string[] = [];

  if (addonIds.length > 0) {
    const { data: servicesData, error: servicesError } = await adminClient
      .from("services")
      .select("id, name, visibility, is_active")
      .in("id", addonIds)
      .eq("is_active", true)
      .in("visibility", ["pricing_page", "both"]);

    if (servicesError) {
      return jsonResponse({ error: "Unable to load selected add-ons." }, 400);
    }

    const { data: pricingData, error: pricingError } = await adminClient
      .from("service_pricing")
      .select("service_id, is_included, one_time_price, recurring_price, recurring_interval")
      .eq("tier", body.tier)
      .in("service_id", addonIds);

    if (pricingError) {
      return jsonResponse({ error: "Unable to load add-on pricing." }, 400);
    }

    const serviceById = new Map((servicesData || []).map((service) => [service.id, service]));
    const pricingByServiceId = new Map((pricingData || []).map((pricing) => [pricing.service_id, pricing]));

    for (const addonId of addonIds) {
      const service = serviceById.get(addonId);
      const pricing = pricingByServiceId.get(addonId);
      if (!service || !pricing || pricing.is_included) continue;

      const oneTimePrice = Number(pricing.one_time_price || 0);
      const recurringPrice = Number(pricing.recurring_price || 0);

      if (oneTimePrice <= 0 && recurringPrice <= 0) continue;

      validAddonIds.push(addonId);

      if (oneTimePrice > 0) {
        lineItems.push({
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(oneTimePrice * 100),
            product_data: {
              name: `Addon: ${service.name}`,
              description: "One-time setup fee",
            },
          },
        });
      }

      if (recurringPrice > 0) {
        lineItems.push({
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(recurringPrice * 100),
            recurring: {
              interval: normalizeInterval(pricing.recurring_interval) as "month" | "year" | "week" | "day",
            },
            product_data: {
              name: `Addon: ${service.name}`,
              description: "Recurring add-on charge",
            },
          },
        });
      }
    }
  }

  let customerId = member.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email || member.email,
      name: member.company_name,
      metadata: {
        member_id: user.id,
      },
    });

    customerId = customer.id;

    await adminClient
      .from("members")
      .update({ stripe_customer_id: customer.id, updated_at: new Date().toISOString() })
      .eq("id", member.id);
  }

  const siteUrl = (Deno.env.get("SITE_URL") || req.headers.get("origin") || "http://localhost:5173").replace(
    /\/+$/,
    ""
  );

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    allow_promotion_codes: true,
    line_items: lineItems,
    success_url: `${siteUrl}/member/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/member/onboarding?step=addons&tier=${body.tier}`,
    client_reference_id: user.id,
    metadata: {
      member_id: user.id,
      tier: body.tier,
      selected_addon_ids: validAddonIds.join(","),
      base_plan_monthly: plan.monthly.toString(),
    },
    subscription_data: {
      metadata: {
        member_id: user.id,
        tier: body.tier,
        selected_addon_ids: validAddonIds.join(","),
      },
    },
  });

  return jsonResponse({
    url: session.url,
    sessionId: session.id,
  });
});
