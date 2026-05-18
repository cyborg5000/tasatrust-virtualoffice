import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.25.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { PLAN_PRICING, type SubscriptionTier } from "../_shared/plans.ts";
import {
  type ResendSendResult,
  escapeHtml,
  getAdminNotificationEmails,
  normalizeEmail,
  sendResendEmail,
} from "../_shared/email.ts";

type DbSubscriptionStatus = "active" | "cancelled" | "past_due" | "paused";

type MembershipProfile = {
  id: string;
  email: string | null;
  company_name: string | null;
  stripe_customer_id: string | null;
};

type NotificationEventType = "checkout.session.completed" | "customer.subscription.updated" | "customer.subscription.deleted";

type CheckoutSummary = {
  member: MembershipProfile | null;
  tier: SubscriptionTier;
  billingCycle: "monthly" | "annual";
  subscriptionStatus: DbSubscriptionStatus;
  subscriptionId: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  amountChargedCents: number | null;
  currency: string;
  customerEmail: string | null;
};

type SubscriptionSummary = {
  member: MembershipProfile | null;
  tier: SubscriptionTier;
  subscriptionStatus: DbSubscriptionStatus;
  subscriptionId: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  shouldNotify: boolean;
  previousStatus: DbSubscriptionStatus | null;
  eventType: NotificationEventType;
  billingCycle: "monthly" | "annual";
  currency: string;
};

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
  return value.split(",").reduce<string[]>((acc, id) => {
    const trimmed = id.trim();
    if (trimmed.length > 0) acc.push(trimmed);
    return acc;
  }, []);
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

const currencyFormatters = new Map<string, Intl.NumberFormat>();
function getCurrencyFormatter(currency: string) {
  const key = (currency || "SGD").toUpperCase();
  let fmt = currencyFormatters.get(key);
  if (!fmt) {
    fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: key });
    currencyFormatters.set(key, fmt);
  }
  return fmt;
}

function formatCurrencyFromCents(cents: number | null | undefined, currency: string) {
  if (typeof cents !== "number" || Number.isNaN(cents)) return null;
  return getCurrencyFormatter(currency).format(cents / 100);
}

const dateFormatter = new Intl.DateTimeFormat("en-SG", { dateStyle: "medium", timeStyle: "short" });
function formatDate(value: string | null) {
  if (!value) return "Not available";
  return dateFormatter.format(new Date(value));
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

async function getMemberProfile(
  adminClient: ReturnType<typeof createClient>,
  memberId?: string | null,
  customerId?: string | null
) {
  if (memberId) {
    const { data: byId } = await adminClient
      .from("members")
      .select("id, email, company_name, stripe_customer_id")
      .eq("id", memberId)
      .maybeSingle();

    if (byId) return byId as MembershipProfile;
  }

  if (!customerId) return null;

  const { data: byCustomer } = await adminClient
    .from("members")
    .select("id, email, company_name, stripe_customer_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  return byCustomer as MembershipProfile | null;
}

function buildCheckoutCompletedCustomerEmail({
  companyName,
  tier,
  billingCycle,
  amount,
  currency,
  startDate,
  endDate,
  dashboardUrl,
  subscriptionId,
}: {
  companyName: string;
  tier: SubscriptionTier;
  billingCycle: "monthly" | "annual";
  amount: string | null;
  currency: string;
  startDate: string;
  endDate: string;
  dashboardUrl: string;
  subscriptionId: string;
}) {
  return `
    <h2>Your TASA Trust subscription is active</h2>
    <p>Hi ${escapeHtml(companyName)},</p>
    <p>
      Your <strong>${PLAN_PRICING[tier].name}</strong> plan is now active on a <strong>${billingCycle}</strong> cycle.
    </p>
    <p><strong>Subscription ID:</strong> ${escapeHtml(subscriptionId)}</p>
    <p><strong>Amount paid:</strong> ${amount ? `${amount} (${currency})` : "N/A"}</p>
    <p><strong>Coverage:</strong> ${startDate} to ${endDate}</p>
    <p>
      <a href="${dashboardUrl}/member/billing">Go to your billing page</a>
    </p>
  `;
}

function buildCheckoutCompletedAdminEmail({
  companyName,
  email,
  tier,
  billingCycle,
  amount,
  currency,
  subscriptionId,
  customerEmail,
  startDate,
  endDate,
}: {
  companyName: string;
  email: string;
  tier: SubscriptionTier;
  billingCycle: "monthly" | "annual";
  amount: string | null;
  currency: string;
  subscriptionId: string;
  customerEmail: string;
  startDate: string;
  endDate: string;
}) {
  return `
    <h2>New paid subscription</h2>
    <p><strong>Company:</strong> ${escapeHtml(companyName)}</p>
    <p><strong>Contact:</strong> ${escapeHtml(customerEmail)}</p>
    <p><strong>Signup email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Plan:</strong> ${PLAN_PRICING[tier].name} (${billingCycle})</p>
    <p><strong>Subscription ID:</strong> ${escapeHtml(subscriptionId)}</p>
    <p><strong>Amount:</strong> ${amount ? `${amount} (${currency})` : "N/A"}</p>
    <p><strong>Period:</strong> ${startDate} to ${endDate}</p>
  `;
}

function buildSubscriptionUpdatedCustomerEmail({
  companyName,
  tier,
  status,
  periodEnd,
  cancelAtPeriodEnd,
  dashboardUrl,
  previousStatus,
  subscriptionId,
  eventName,
}: {
  companyName: string;
  tier: SubscriptionTier;
  status: DbSubscriptionStatus;
  periodEnd: string;
  cancelAtPeriodEnd: boolean;
  dashboardUrl: string;
  previousStatus: DbSubscriptionStatus | null;
  subscriptionId: string;
  eventName: "updated" | "cancelled";
}) {
  const statusMessage =
    eventName === "cancelled"
      ? "Your subscription has been cancelled."
      : `Your subscription status changed from ${
          previousStatus || "unknown"
        } to ${status}.`;

  return `
    <h2>Subscription status update</h2>
    <p>Hi ${escapeHtml(companyName)},</p>
    <p>${statusMessage}</p>
    <p><strong>Plan:</strong> ${PLAN_PRICING[tier].name}</p>
    <p><strong>Subscription ID:</strong> ${escapeHtml(subscriptionId)}</p>
    <p><strong>Current status:</strong> ${status}</p>
    <p><strong>Auto-renew:</strong> ${cancelAtPeriodEnd ? "Ends on period end" : "Enabled"}</p>
    <p><strong>Current period ends:</strong> ${periodEnd}</p>
    <p>
      <a href="${dashboardUrl}/member/billing">View subscription details</a>
    </p>
  `;
}

function buildSubscriptionUpdatedAdminEmail({
  companyName,
  email,
  tier,
  status,
  previousStatus,
  periodEnd,
  subscriptionId,
  eventName,
}: {
  companyName: string;
  email: string;
  tier: SubscriptionTier;
  status: DbSubscriptionStatus;
  previousStatus: DbSubscriptionStatus | null;
  periodEnd: string;
  subscriptionId: string;
  eventName: "updated" | "cancelled";
}) {
  return `
    <h2>Subscription ${eventName}</h2>
    <p><strong>Company:</strong> ${escapeHtml(companyName)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Plan:</strong> ${PLAN_PRICING[tier].name}</p>
    <p><strong>Subscription ID:</strong> ${escapeHtml(subscriptionId)}</p>
    <p><strong>New status:</strong> ${status}</p>
    ${
      previousStatus
        ? `<p><strong>Previous status:</strong> ${previousStatus}</p>`
        : ""
    }
    <p><strong>Period end:</strong> ${periodEnd}</p>
  `;
}

async function notifySubscriptionEvent({
  eventType,
  siteUrl,
  customerEmail,
  summary,
  sourceCustomerEmail,
  billingCycle,
  amountChargedCents,
  currency,
}: {
  eventType: "checkout.session.completed" | "customer.subscription.updated" | "customer.subscription.deleted";
  siteUrl: string;
  customerEmail: string | null;
  summary: CheckoutSummary | SubscriptionSummary;
  sourceCustomerEmail?: string | null;
  billingCycle?: "monthly" | "annual";
  amountChargedCents?: number | null;
  currency?: string;
}) {
  const companyName = summary.member?.company_name?.trim() || "Member";
  const memberEmail = summary.member?.email || customerEmail || sourceCustomerEmail || null;
  const emailToMember = memberEmail ? normalizeEmail(memberEmail) : null;
  const dashboardUrl = siteUrl;
  const startDate = formatDate(summary.currentPeriodStart);
  const endDate = formatDate(summary.currentPeriodEnd);
  const adminEmails = getAdminNotificationEmails();
  const planAmount = formatCurrencyFromCents(
    eventType === "checkout.session.completed" ? summary.amountChargedCents : null,
    currency || summary.currency || "SGD",
  );

  const userSubject =
    eventType === "checkout.session.completed"
      ? "Your TASA Trust subscription is active"
      : eventType === "customer.subscription.deleted"
        ? "Your TASA Trust subscription has ended"
        : "Your TASA Trust subscription was updated";

  const adminSubject =
    eventType === "checkout.session.completed"
      ? "New paid subscription created"
      : eventType === "customer.subscription.deleted"
        ? "Subscription cancelled"
        : "Subscription updated";

  const userTasks: Promise<ResendSendResult>[] = [];

  if (emailToMember) {
    userTasks.push(
      sendResendEmail({
        to: emailToMember,
        subject: userSubject,
        replyTo: adminEmails[0] || undefined,
        html:
          eventType === "checkout.session.completed"
            ? buildCheckoutCompletedCustomerEmail({
                companyName,
                tier: summary.tier,
                billingCycle: eventType === "checkout.session.completed"
                  ? (summary.billingCycle || billingCycle || "monthly")
                  : "monthly",
                amount: planAmount,
                currency: (currency || summary.currency || "SGD").toUpperCase(),
                startDate: startDate,
                endDate: endDate,
                dashboardUrl,
                subscriptionId: summary.subscriptionId || "N/A",
              })
            : buildSubscriptionUpdatedCustomerEmail({
                companyName,
                tier: summary.tier,
                status: summary.subscriptionStatus,
                previousStatus: eventType === "customer.subscription.updated" ? summary.previousStatus : null,
                periodEnd: endDate,
                cancelAtPeriodEnd: summary.cancelAtPeriodEnd,
                dashboardUrl,
                subscriptionId: summary.subscriptionId || "N/A",
                eventName: eventType === "customer.subscription.deleted" ? "cancelled" : "updated",
              }),
      }),
    );
  }

  userTasks.push(
    sendResendEmail({
      to: adminEmails,
      subject: adminSubject,
      replyTo: emailToMember || sourceCustomerEmail || undefined,
      html:
        eventType === "checkout.session.completed"
          ? buildCheckoutCompletedAdminEmail({
              companyName,
              email: summary.member?.email || emailToMember || "Unavailable",
              tier: summary.tier,
              billingCycle: eventType === "checkout.session.completed"
                ? (summary.billingCycle || billingCycle || "monthly")
                : billingCycle || "monthly",
              amount: planAmount,
              currency: (currency || summary.currency || "SGD").toUpperCase(),
              subscriptionId: summary.subscriptionId || "N/A",
              customerEmail: summary.member?.email || emailToMember || sourceCustomerEmail || "Unavailable",
              startDate: startDate,
              endDate: endDate,
            })
          : buildSubscriptionUpdatedAdminEmail({
              companyName,
              email: summary.member?.email || emailToMember || "Unavailable",
              tier: summary.tier,
              status: summary.subscriptionStatus,
              previousStatus: eventType === "customer.subscription.updated" ? summary.previousStatus : null,
              periodEnd: endDate,
              subscriptionId: summary.subscriptionId || "N/A",
              eventName: eventType === "customer.subscription.deleted" ? "cancelled" : "updated",
            }),
    }),
  );

  const settled = await Promise.allSettled(userTasks);
  const failed = settled.some((result) => {
    if (result.status === "rejected") return true;
    return !result.value.ok;
  });
  if (failed) {
    const reasons: unknown[] = [];
    const failedResponses: unknown[] = [];
    for (const result of settled) {
      if (result.status === "rejected") {
        reasons.push(result.reason);
      } else if (!result.value.ok && result.value.error) {
        failedResponses.push(result.value.error);
      }
    }

    console.error("Failed to send subscription notification email(s).", {
      reasonErrors: reasons,
      responseErrors: failedResponses,
    });
  }
}

async function handleCheckoutCompleted(
  stripe: Stripe,
  adminClient: ReturnType<typeof createClient>,
  session: Stripe.Checkout.Session
): Promise<CheckoutSummary | null> {
  const memberId = session.metadata?.member_id || session.client_reference_id;
  const tier = isTier(session.metadata?.tier) ? session.metadata.tier : undefined;
  if (!memberId || !tier) return null;

  const selectedAddonIds = parseSelectedAddonIds(session.metadata?.selected_addon_ids);
  const billingCycle = session.metadata?.billing_cycle === "annual" ? "annual" : "monthly";
  const stripeCustomerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id || null;
  const stripeSubscriptionId =
    typeof session.subscription === "string" ? session.subscription : session.subscription?.id || null;
  const sourceCustomerEmail = session.customer_details?.email || null;

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
      (billingCycle === "annual" ? PLAN_PRICING[tier].annual * 12 : PLAN_PRICING[tier].monthly),
  );

  await ensureOrder(adminClient, {
    memberId,
    serviceId: null,
    type: "subscription",
    amount: basePlanAmount,
    dedupeKey: `checkout:${session.id}:plan`,
  });

  if (selectedAddonIds.length === 0) {
    const memberProfile = await getMemberProfile(adminClient, memberId, stripeCustomerId);
    return {
      member: memberProfile,
      tier,
      billingCycle,
      subscriptionStatus,
      subscriptionId: stripeSubscriptionId,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd,
      amountChargedCents: session.amount_total ?? null,
      currency: session.currency || "sgd",
      customerEmail: sourceCustomerEmail,
    };
  }

  const { data: addOnPricingRows } = await adminClient
    .from("service_pricing")
    .select("service_id, is_included, one_time_price, recurring_price, recurring_interval")
    .eq("tier", tier)
    .in("service_id", selectedAddonIds);

  // Process pricing rows in parallel — each row's writes are independent of the others.
  await Promise.all((addOnPricingRows || []).map(async (pricing) => {
    if (!pricing.service_id || pricing.is_included) return;

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
  }));

  const memberProfile = await getMemberProfile(adminClient, memberId, stripeCustomerId);
  return {
    member: memberProfile,
    tier,
    billingCycle,
    subscriptionStatus,
    subscriptionId: stripeSubscriptionId,
    currentPeriodStart,
    currentPeriodEnd,
    cancelAtPeriodEnd,
    amountChargedCents: session.amount_total ?? null,
    currency: session.currency || "sgd",
    customerEmail: sourceCustomerEmail,
  };
}

async function handleSubscriptionUpdated(
  adminClient: ReturnType<typeof createClient>,
  eventType: "customer.subscription.updated" | "customer.subscription.deleted",
  subscription: Stripe.Subscription,
  previousAttributes?: Partial<Stripe.Subscription>,
): Promise<SubscriptionSummary | null> {
  const memberId = subscription.metadata?.member_id || undefined;
  const tier = isTier(subscription.metadata?.tier) ? subscription.metadata.tier : null;
  if (!memberId || !tier) return null;

  const memberProfile = await getMemberProfile(
    adminClient,
    memberId,
    typeof subscription.customer === "string" ? subscription.customer : null,
  );

  const mappedCurrentStatus = mapStripeStatus(subscription.status);
  const mappedPreviousStatus = typeof previousAttributes?.status === "string"
    ? mapStripeStatus(previousAttributes.status)
    : null;
  const hasStatusChange = Boolean(mappedPreviousStatus && mappedPreviousStatus !== mappedCurrentStatus);
  const hasCancelWindowChange =
    typeof previousAttributes?.cancel_at_period_end === "boolean" &&
    previousAttributes.cancel_at_period_end !== subscription.cancel_at_period_end;

  await upsertMemberSubscription(adminClient, {
    memberId,
    tier,
    status: mappedCurrentStatus,
    stripeSubscriptionId: subscription.id,
    currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  });

  const shouldNotify = eventType === "customer.subscription.deleted" || hasStatusChange || hasCancelWindowChange;

  return {
    member: memberProfile,
    tier,
    subscriptionStatus: mappedCurrentStatus,
    subscriptionId: subscription.id,
    currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    shouldNotify,
    previousStatus: mappedPreviousStatus,
    eventType,
    billingCycle: "monthly",
    currency: "SGD",
  };
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
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

  const siteUrl = (Deno.env.get("SITE_URL") || req.headers.get("origin") || "https://tasatrust.com").replace(
    /\/+$/,
    "",
  );

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const summary = await handleCheckoutCompleted(
          stripe,
          adminClient,
          event.data.object as Stripe.Checkout.Session,
        );

        if (summary) {
          await notifySubscriptionEvent({
            eventType: "checkout.session.completed",
            siteUrl,
            summary,
            customerEmail: summary.customerEmail,
          });
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const previousAttributes = event.data.previous_attributes as
          | Partial<Stripe.Subscription>
          | undefined;
        const summary = await handleSubscriptionUpdated(
          adminClient,
          event.type,
          subscription,
          previousAttributes,
        );
        if (summary && summary.shouldNotify) {
          await notifySubscriptionEvent({
            eventType: event.type,
            siteUrl,
            summary,
          });
        }
        break;
      }
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
