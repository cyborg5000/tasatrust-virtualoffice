import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.25.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "../_shared/cors.ts";
import { PLAN_PRICING, type SubscriptionTier } from "../_shared/plans.ts";

type DbSubscriptionStatus = "active" | "cancelled" | "past_due" | "paused";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function isTier(value: string | undefined): value is SubscriptionTier {
  return value === "basic" || value === "essential" || value === "professional";
}

function mapStripeStatus(status: string): DbSubscriptionStatus {
  if (status === "active" || status === "trialing") return "active";
  if (status === "past_due" || status === "unpaid" || status === "incomplete") return "past_due";
  if (status === "canceled" || status === "incomplete_expired") return "cancelled";
  return "paused";
}

function parseSelectedAddonIds(value: string | undefined) {
  if (!value) return [];
  return value
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id.length > 0);
}

function normalizeInterval(interval?: string | null) {
  if (!interval) return "month";
  const lower = interval.toLowerCase();
  if (lower === "monthly") return "month";
  if (lower === "yearly" || lower === "annual" || lower === "annually") return "year";
  if (lower === "weekly") return "week";
  if (lower === "daily") return "day";
  return lower;
}

function toAnnualAmount(price: number, interval?: string | null) {
  const normalized = normalizeInterval(interval);
  if (normalized === "year") return price;
  if (normalized === "week") return price * 52;
  if (normalized === "day") return price * 365;
  return price * 12;
}

function getCustomerId(session: Stripe.Checkout.Session) {
  if (typeof session.customer === "string") return session.customer;
  if (session.customer && "id" in session.customer) return session.customer.id;
  return null;
}

async function ensureMemberProfile(
  adminClient: ReturnType<typeof createClient>,
  {
    memberId,
    email,
    companyName,
    stripeCustomerId,
  }: {
    memberId: string;
    email: string;
    companyName: string;
    stripeCustomerId: string | null;
  },
) {
  const { data: existingMember, error: existingMemberError } = await adminClient
    .from("members")
    .select("id")
    .eq("id", memberId)
    .maybeSingle();

  if (existingMemberError) {
    throw new Error("Unable to load member profile.");
  }

  const payload = {
    email,
    company_name: companyName,
    stripe_customer_id: stripeCustomerId,
    updated_at: new Date().toISOString(),
  };

  if (existingMember) {
    const { error } = await adminClient
      .from("members")
      .update(payload)
      .eq("id", memberId);

    if (error) throw new Error("Unable to update member profile.");
    return;
  }

  const { error } = await adminClient.from("members").insert({
    id: memberId,
    ...payload,
  });

  if (error) throw new Error("Unable to create member profile.");
}

async function ensureOrder(
  adminClient: ReturnType<typeof createClient>,
  {
    memberId,
    serviceId,
    type,
    amount,
    dedupeKey,
  }: {
    memberId: string;
    serviceId: string | null;
    type: string;
    amount: number;
    dedupeKey: string;
  },
) {
  const { data: existingOrder } = await adminClient
    .from("orders")
    .select("id")
    .eq("stripe_payment_intent_id", dedupeKey)
    .maybeSingle();

  if (existingOrder) return;

  const { error } = await adminClient.from("orders").insert({
    member_id: memberId,
    service_id: serviceId,
    type,
    amount,
    status: "completed",
    stripe_payment_intent_id: dedupeKey,
  });

  if (error) throw new Error("Unable to record checkout order.");
}

async function ensureMemberService(
  adminClient: ReturnType<typeof createClient>,
  {
    memberId,
    serviceId,
    tier,
    oneTimePurchased,
    recurringPurchased,
  }: {
    memberId: string;
    serviceId: string;
    tier: SubscriptionTier;
    oneTimePurchased: boolean;
    recurringPurchased: boolean;
  },
) {
  const { data: existing } = await adminClient
    .from("member_services")
    .select("id, one_time_purchased, recurring_purchased")
    .eq("member_id", memberId)
    .eq("service_id", serviceId)
    .maybeSingle();

  if (existing) {
    const { error } = await adminClient
      .from("member_services")
      .update({
        one_time_purchased: Boolean(existing.one_time_purchased) || oneTimePurchased,
        recurring_purchased: Boolean(existing.recurring_purchased) || recurringPurchased,
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (error) throw new Error("Unable to update member service.");
    return;
  }

  const { error } = await adminClient.from("member_services").insert({
    member_id: memberId,
    service_id: serviceId,
    tier_at_purchase: tier,
    one_time_purchased: oneTimePurchased,
    recurring_purchased: recurringPurchased,
    is_active: true,
  });

  if (error) throw new Error("Unable to record member service.");
}

async function upsertMemberSubscription(
  adminClient: ReturnType<typeof createClient>,
  {
    memberId,
    tier,
    status,
    stripeSubscriptionId,
    currentPeriodStart,
    currentPeriodEnd,
    cancelAtPeriodEnd,
  }: {
    memberId: string;
    tier: SubscriptionTier;
    status: DbSubscriptionStatus;
    stripeSubscriptionId: string | null;
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  },
) {
  let existingSubscription: { id: string } | null = null;

  if (stripeSubscriptionId) {
    const { data } = await adminClient
      .from("subscriptions")
      .select("id")
      .eq("stripe_subscription_id", stripeSubscriptionId)
      .limit(1)
      .maybeSingle();

    existingSubscription = data;
  }

  if (!existingSubscription) {
    const { data } = await adminClient
      .from("subscriptions")
      .select("id")
      .eq("member_id", memberId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    existingSubscription = data;
  }

  const payload = {
    member_id: memberId,
    tier,
    status,
    stripe_subscription_id: stripeSubscriptionId,
    current_period_start: currentPeriodStart,
    current_period_end: currentPeriodEnd,
    cancel_at_period_end: cancelAtPeriodEnd,
    updated_at: new Date().toISOString(),
  };

  if (existingSubscription) {
    const { error } = await adminClient
      .from("subscriptions")
      .update(payload)
      .eq("id", existingSubscription.id);

    if (error) throw new Error("Unable to update subscription.");
    return;
  }

  const { error } = await adminClient.from("subscriptions").insert(payload);
  if (error) throw new Error("Unable to create subscription.");
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
  const stripeSecretKey = Deno.env.get("STRIPE_RESTRICTED_KEY") || Deno.env.get("STRIPE_SECRET_KEY");

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey || !stripeSecretKey) {
    return jsonResponse({ error: "Missing required environment variables." }, 500);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return jsonResponse({ error: "Missing authorization header." }, 401);
  }

  let sessionId: string | undefined;
  try {
    const body = await req.json();
    sessionId = typeof body?.sessionId === "string" ? body.sessionId.trim() : undefined;
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, 400);
  }

  if (!sessionId || !sessionId.startsWith("cs_")) {
    return jsonResponse({ error: "Invalid checkout session." }, 400);
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

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    if (session.mode !== "subscription") {
      return jsonResponse({ error: "Checkout session is not a subscription." }, 400);
    }

    if (session.status !== "complete" || session.payment_status !== "paid") {
      return jsonResponse(
        {
          error: "Checkout session is not paid yet.",
          activated: false,
          sessionStatus: session.status,
          paymentStatus: session.payment_status,
        },
        409,
      );
    }

    const memberId = session.metadata?.member_id || session.client_reference_id;
    const tier = isTier(session.metadata?.tier) ? session.metadata.tier : undefined;

    if (!memberId || !tier) {
      return jsonResponse({ error: "Checkout session is missing required metadata." }, 400);
    }

    if (memberId !== user.id) {
      return jsonResponse({ error: "Checkout session does not belong to this user." }, 403);
    }

    const stripeCustomerId = getCustomerId(session);
    const userEmail = user.email || session.customer_details?.email || `${memberId}@unknown.local`;
    const companyName =
      typeof user.user_metadata?.company_name === "string" && user.user_metadata.company_name.trim().length > 0
        ? user.user_metadata.company_name.trim()
        : session.customer_details?.name || userEmail.split("@")[0] || "New Company";

    await ensureMemberProfile(adminClient, {
      memberId,
      email: userEmail,
      companyName,
      stripeCustomerId,
    });

    const stripeSubscription =
      typeof session.subscription === "string"
        ? await stripe.subscriptions.retrieve(session.subscription)
        : session.subscription;
    const stripeSubscriptionId = stripeSubscription?.id || null;
    const subscriptionStatus = stripeSubscription ? mapStripeStatus(stripeSubscription.status) : "active";
    const currentPeriodStart = stripeSubscription
      ? new Date(stripeSubscription.current_period_start * 1000).toISOString()
      : null;
    const currentPeriodEnd = stripeSubscription
      ? new Date(stripeSubscription.current_period_end * 1000).toISOString()
      : null;
    const cancelAtPeriodEnd = Boolean(stripeSubscription?.cancel_at_period_end);

    await upsertMemberSubscription(adminClient, {
      memberId,
      tier,
      status: subscriptionStatus,
      stripeSubscriptionId,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd,
    });

    const billingCycle = session.metadata?.billing_cycle === "annual" ? "annual" : "monthly";
    const basePlanAmount = Number(
      session.metadata?.base_plan_amount ||
        session.metadata?.base_plan_monthly ||
        (billingCycle === "annual" ? PLAN_PRICING[tier].annual * 12 : PLAN_PRICING[tier].monthly),
    );

    await ensureOrder(adminClient, {
      memberId,
      serviceId: null,
      type: "subscription",
      amount: basePlanAmount,
      dedupeKey: `checkout:${session.id}:plan`,
    });

    const selectedAddonIds = parseSelectedAddonIds(session.metadata?.selected_addon_ids);
    if (selectedAddonIds.length > 0) {
      const { data: addOnPricingRows, error: addOnPricingError } = await adminClient
        .from("service_pricing")
        .select("service_id, is_included, one_time_price, recurring_price, recurring_interval")
        .eq("tier", tier)
        .in("service_id", selectedAddonIds);

      if (addOnPricingError) throw new Error("Unable to load add-on pricing.");

      for (const pricing of addOnPricingRows || []) {
        if (!pricing.service_id || pricing.is_included) continue;

        const oneTimePrice = Number(pricing.one_time_price || 0);
        const recurringPrice = Number(pricing.recurring_price || 0);
        const recurringAmount =
          billingCycle === "annual"
            ? toAnnualAmount(recurringPrice, pricing.recurring_interval)
            : recurringPrice;

        if (oneTimePrice > 0) {
          await ensureOrder(adminClient, {
            memberId,
            serviceId: pricing.service_id,
            type: "one_time",
            amount: oneTimePrice,
            dedupeKey: `checkout:${session.id}:${pricing.service_id}:one_time`,
          });
        }

        if (recurringAmount > 0) {
          await ensureOrder(adminClient, {
            memberId,
            serviceId: pricing.service_id,
            type: "recurring",
            amount: recurringAmount,
            dedupeKey: `checkout:${session.id}:${pricing.service_id}:recurring`,
          });
        }

        await ensureMemberService(adminClient, {
          memberId,
          serviceId: pricing.service_id,
          tier,
          oneTimePurchased: oneTimePrice > 0,
          recurringPurchased: recurringAmount > 0,
        });
      }
    }

    return jsonResponse({
      activated: subscriptionStatus === "active",
      status: subscriptionStatus,
      tier,
      subscriptionId: stripeSubscriptionId,
      currentPeriodEnd,
    });
  } catch (error) {
    console.error("Checkout reconciliation failed:", error);
    return jsonResponse({ error: "Unable to reconcile checkout session." }, 500);
  }
});
