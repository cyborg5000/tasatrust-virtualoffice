import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.25.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { PLAN_PRICING, type SubscriptionTier } from "../_shared/plans.ts";

type DbSubscriptionStatus = "active" | "cancelled" | "past_due" | "paused";

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
  }
) {
  const { data: existingOrder } = await adminClient
    .from("orders")
    .select("id")
    .eq("stripe_payment_intent_id", dedupeKey)
    .maybeSingle();

  if (existingOrder) return;

  await adminClient.from("orders").insert({
    member_id: memberId,
    service_id: serviceId,
    type,
    amount,
    status: "completed",
    stripe_payment_intent_id: dedupeKey,
  });
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
  }
) {
  const { data: existing } = await adminClient
    .from("member_services")
    .select("id, one_time_purchased, recurring_purchased")
    .eq("member_id", memberId)
    .eq("service_id", serviceId)
    .maybeSingle();

  if (existing) {
    await adminClient
      .from("member_services")
      .update({
        one_time_purchased: existing.one_time_purchased || oneTimePurchased,
        recurring_purchased: existing.recurring_purchased || recurringPurchased,
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    return;
  }

  await adminClient.from("member_services").insert({
    member_id: memberId,
    service_id: serviceId,
    tier_at_purchase: tier,
    one_time_purchased: oneTimePurchased,
    recurring_purchased: recurringPurchased,
    is_active: true,
  });
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
  }
) {
  const { data: existingSubscription } = await adminClient
    .from("subscriptions")
    .select("id")
    .eq("member_id", memberId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

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
    await adminClient.from("subscriptions").update(payload).eq("id", existingSubscription.id);
  } else {
    await adminClient.from("subscriptions").insert(payload);
  }
}

async function handleCheckoutCompleted(
  stripe: Stripe,
  adminClient: ReturnType<typeof createClient>,
  session: Stripe.Checkout.Session
) {
  const memberId = session.metadata?.member_id || session.client_reference_id;
  const tier = isTier(session.metadata?.tier) ? session.metadata?.tier : undefined;
  if (!memberId || !tier) return;

  const selectedAddonIds = parseSelectedAddonIds(session.metadata?.selected_addon_ids);
  const billingCycle = session.metadata?.billing_cycle === "annual" ? "annual" : "monthly";
  const stripeCustomerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id || null;
  const stripeSubscriptionId =
    typeof session.subscription === "string" ? session.subscription : session.subscription?.id || null;

  if (stripeCustomerId) {
    await adminClient
      .from("members")
      .update({
        stripe_customer_id: stripeCustomerId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", memberId);
  }

  let currentPeriodStart: string | null = null;
  let currentPeriodEnd: string | null = null;
  let cancelAtPeriodEnd = false;
  let subscriptionStatus: DbSubscriptionStatus = "active";

  if (stripeSubscriptionId) {
    const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000).toISOString();
    currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000).toISOString();
    cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;
    subscriptionStatus = mapStripeStatus(stripeSubscription.status);
  }

  await upsertMemberSubscription(adminClient, {
    memberId,
    tier,
    status: subscriptionStatus,
    stripeSubscriptionId,
    currentPeriodStart,
    currentPeriodEnd,
    cancelAtPeriodEnd,
  });

  const basePlanAmount = Number(
    session.metadata?.base_plan_amount ||
      session.metadata?.base_plan_monthly ||
      (billingCycle === "annual" ? PLAN_PRICING[tier].annual * 12 : PLAN_PRICING[tier].monthly)
  );

  await ensureOrder(adminClient, {
    memberId,
    serviceId: null,
    type: "subscription",
    amount: basePlanAmount,
    dedupeKey: `checkout:${session.id}:plan`,
  });

  if (selectedAddonIds.length === 0) return;

  const { data: addOnPricingRows } = await adminClient
    .from("service_pricing")
    .select("service_id, is_included, one_time_price, recurring_price, recurring_interval")
    .eq("tier", tier)
    .in("service_id", selectedAddonIds);

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

async function handleSubscriptionUpdated(
  adminClient: ReturnType<typeof createClient>,
  subscription: Stripe.Subscription
) {
  const memberId = subscription.metadata?.member_id;
  const tier = isTier(subscription.metadata?.tier) ? subscription.metadata.tier : null;
  if (!memberId || !tier) return;

  await upsertMemberSubscription(adminClient, {
    memberId,
    tier,
    status: mapStripeStatus(subscription.status),
    stripeSubscriptionId: subscription.id,
    currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  });
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  // Prefer restricted API key when provided; fall back to full secret key.
  const stripeSecretKey = Deno.env.get("STRIPE_RESTRICTED_KEY") || Deno.env.get("STRIPE_SECRET_KEY");
  const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!supabaseUrl || !serviceRoleKey || !stripeSecretKey || !stripeWebhookSecret) {
    return new Response("Missing required environment variables", { status: 500 });
  }

  const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-06-20" });
  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  const payload = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(payload, signature, stripeWebhookSecret);
  } catch (error) {
    console.error("Invalid Stripe signature:", error);
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          stripe,
          adminClient,
          event.data.object as Stripe.Checkout.Session
        );
        break;
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await handleSubscriptionUpdated(
          adminClient,
          event.data.object as Stripe.Subscription
        );
        break;
      default:
        break;
    }
  } catch (error) {
    console.error("Stripe webhook handler error:", error);
    return new Response("Webhook processing failed", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
