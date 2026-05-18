import type { Tables } from "@/integrations/supabase/types";
import {
  getSubscriptionTierLabel,
  SUBSCRIPTION_PLAN_BY_TIER,
  type SubscriptionTier,
} from "@/lib/subscriptionPlans";

export type BillingCycle = "monthly" | "annual";
export type InferredBillingCycle = BillingCycle | "unknown";

export type BillingOrder = Tables<"orders"> & {
  services?: {
    name: string | null;
    description: string | null;
  } | null;
};

export type BillingMember = Pick<
  Tables<"members">,
  "company_name" | "contact_name" | "email" | "phone"
>;

type Subscription = Tables<"subscriptions"> | null;

export interface InvoiceLineItem {
  description: string;
  periodLabel: string;
  amountLabel: string;
  amount: number;
}

export interface InvoiceDetails {
  invoiceNumber: string;
  issuedAt: Date | null;
  status: string;
  paymentReference: string | null;
  billedTo: {
    name: string;
    contactName: string | null;
    email: string | null;
    phone: string | null;
  };
  lineItems: InvoiceLineItem[];
  subtotal: number;
  totalPaid: number;
  billingCycle: InferredBillingCycle;
}

export const TASA_TRUST_INVOICE_ISSUER = {
  displayName: "TASA Trust Pte. Ltd.",
  legalName: "TASA TRUST PRIVATE LIMITED",
  uen: "201810611C",
  address: ["101 Cecil Street, #15-06", "Tong Eng Building", "Singapore 069533"],
  website: "www.tasatrust.com",
};

const PLAN_AMOUNT_TOLERANCE = 0.05;

export function formatCurrency(value: number) {
  return `S$${Number(value || 0).toFixed(2)}`;
}

export function getInvoiceNumber(orderId: string) {
  return `INV-${orderId.slice(0, 8).toUpperCase()}`;
}

function getReferenceSuffix(value: string) {
  return value.slice(-6);
}

export function getCustomerPaymentReference(reference: string | null) {
  if (!reference) return null;

  const checkoutMatch = reference.match(/^checkout:(cs_(?:live|test)_[^:]+):/);
  if (checkoutMatch?.[1]) {
    return `Stripe Checkout Ref - ${getReferenceSuffix(checkoutMatch[1])}`;
  }

  return getReferenceSuffix(reference);
}

function isSubscriptionTier(value: string | null | undefined): value is SubscriptionTier {
  return value === "basic" || value === "essential" || value === "professional";
}

function getPlanForSubscription(subscription: Subscription) {
  if (!subscription || !isSubscriptionTier(subscription.tier)) return null;
  return SUBSCRIPTION_PLAN_BY_TIER[subscription.tier];
}

function getAnnualPlanAmount(tier: SubscriptionTier) {
  return SUBSCRIPTION_PLAN_BY_TIER[tier].annualPrice * 12;
}

function getMonthlyPlanAmount(tier: SubscriptionTier) {
  return SUBSCRIPTION_PLAN_BY_TIER[tier].monthlyPrice;
}

function amountsMatch(left: number, right: number) {
  return Math.abs(Number(left || 0) - Number(right || 0)) <= PLAN_AMOUNT_TOLERANCE;
}

function inferBillingCycleFromPeriod(subscription: Subscription): InferredBillingCycle {
  if (!subscription?.current_period_start || !subscription.current_period_end) {
    return "unknown";
  }

  const start = new Date(subscription.current_period_start).getTime();
  const end = new Date(subscription.current_period_end).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return "unknown";
  }

  const days = (end - start) / (1000 * 60 * 60 * 24);
  if (days >= 300) return "annual";
  if (days <= 45) return "monthly";
  return "unknown";
}

function inferBillingCycleFromSubscriptionOrder(
  subscription: NonNullable<Subscription>,
  orders: BillingOrder[],
): InferredBillingCycle {
  if (!isSubscriptionTier(subscription.tier)) return "unknown";

  const subscriptionOrders = orders
    .filter((order) => order.type === "subscription" && order.status === "completed")
    .sort((a, b) => {
      const left = a.created_at ? new Date(a.created_at).getTime() : 0;
      const right = b.created_at ? new Date(b.created_at).getTime() : 0;
      return right - left;
    });

  const latestSubscriptionOrder = subscriptionOrders[0];
  if (!latestSubscriptionOrder) return "unknown";

  if (amountsMatch(latestSubscriptionOrder.amount, getAnnualPlanAmount(subscription.tier))) {
    return "annual";
  }

  if (amountsMatch(latestSubscriptionOrder.amount, getMonthlyPlanAmount(subscription.tier))) {
    return "monthly";
  }

  return "unknown";
}

export function inferSubscriptionBillingCycle(
  subscription: Subscription,
  orders: BillingOrder[],
): InferredBillingCycle {
  if (!subscription) return "unknown";

  const periodCycle = inferBillingCycleFromPeriod(subscription);
  if (periodCycle !== "unknown") return periodCycle;

  return inferBillingCycleFromSubscriptionOrder(subscription, orders);
}

export function inferOrderBillingCycle(
  order: BillingOrder,
  subscription: Subscription,
  subscriptionBillingCycle: InferredBillingCycle,
): InferredBillingCycle {
  if (order.type === "one_time") return "unknown";
  if (order.type !== "subscription") return subscriptionBillingCycle;
  if (!subscription || !isSubscriptionTier(subscription.tier)) return subscriptionBillingCycle;

  if (amountsMatch(order.amount, getAnnualPlanAmount(subscription.tier))) {
    return "annual";
  }

  if (amountsMatch(order.amount, getMonthlyPlanAmount(subscription.tier))) {
    return "monthly";
  }

  return subscriptionBillingCycle;
}

export function getCurrentPlanRateText(
  subscription: Subscription,
  billingCycle: InferredBillingCycle,
) {
  const plan = getPlanForSubscription(subscription);
  if (!plan) return "Plan pricing unavailable";

  if (billingCycle === "annual") {
    return `${formatCurrency(plan.annualPrice * 12)}/year`;
  }

  if (billingCycle === "monthly") {
    return `${formatCurrency(plan.monthlyPrice)}/month`;
  }

  return "Billing cycle pending";
}

export function getCurrentPlanBillingNote(billingCycle: InferredBillingCycle) {
  if (billingCycle === "annual") return "Billed annually";
  if (billingCycle === "monthly") return "Billed monthly";
  return "Billing cycle will appear after the first paid invoice";
}

export function getOrderTypeLabel(type: string) {
  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getOrderDescription(
  order: BillingOrder,
  subscription: Subscription,
  billingCycle: InferredBillingCycle,
) {
  if (order.type === "subscription" && subscription && isSubscriptionTier(subscription.tier)) {
    return `${getSubscriptionTierLabel(subscription.tier)} Plan`;
  }

  if (order.services?.name) {
    return order.type === "one_time" ? order.services.name : `Add-on: ${order.services.name}`;
  }

  if (order.type === "recurring") return "Recurring add-on";
  if (order.type === "one_time") return "One-time service";
  if (billingCycle === "annual") return "Annual service";
  if (billingCycle === "monthly") return "Monthly service";
  return getOrderTypeLabel(order.type);
}

function getPeriodLabel(order: BillingOrder, billingCycle: InferredBillingCycle) {
  if (order.type === "one_time") return "One-time charge";
  if (billingCycle === "annual") return "Annual billing";
  if (billingCycle === "monthly") return "Monthly billing";
  return "Recurring billing";
}

function getAmountLabel(order: BillingOrder, billingCycle: InferredBillingCycle) {
  if (order.type === "one_time") return `${formatCurrency(order.amount)} one-time`;
  if (billingCycle === "annual") return `${formatCurrency(order.amount)}/year`;
  if (billingCycle === "monthly") return `${formatCurrency(order.amount)}/month`;
  return formatCurrency(order.amount);
}

export function buildInvoiceDetails({
  order,
  member,
  subscription,
  subscriptionBillingCycle,
}: {
  order: BillingOrder;
  member: BillingMember | null;
  subscription: Subscription;
  subscriptionBillingCycle: InferredBillingCycle;
}): InvoiceDetails {
  const billingCycle = inferOrderBillingCycle(order, subscription, subscriptionBillingCycle);
  const amount = Number(order.amount || 0);

  return {
    invoiceNumber: getInvoiceNumber(order.id),
    issuedAt: order.created_at ? new Date(order.created_at) : null,
    status: order.status || "pending",
    paymentReference: getCustomerPaymentReference(order.stripe_payment_intent_id),
    billedTo: {
      name: member?.company_name || "Member",
      contactName: member?.contact_name || null,
      email: member?.email || null,
      phone: member?.phone || null,
    },
    lineItems: [
      {
        description: getOrderDescription(order, subscription, billingCycle),
        periodLabel: getPeriodLabel(order, billingCycle),
        amountLabel: getAmountLabel(order, billingCycle),
        amount,
      },
    ],
    subtotal: amount,
    totalPaid: amount,
    billingCycle,
  };
}
