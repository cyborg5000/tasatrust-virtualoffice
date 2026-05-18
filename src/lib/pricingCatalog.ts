import type { Database } from "@/integrations/supabase/types";
import type { SubscriptionTier } from "@/lib/subscriptionPlans";

type ServiceType = Database["public"]["Enums"]["service_type"];
type ServiceVisibility = Database["public"]["Enums"]["service_visibility"];
export type BillingCycle = "monthly" | "annual";

interface TierPricing {
  isIncluded: boolean;
  oneTimePrice: number;
  recurringPrice: number;
  recurringInterval: string;
}

export interface OptionalLinePricePart {
  current: number;
  baseline: number;
  suffix: "" | "/mo";
}

export interface TierOptionalLineItem {
  serviceName: string;
  parts: OptionalLinePricePart[];
  optional: boolean;
}

export interface PricingAddon {
  id: string;
  name: string;
  description: string | null;
  type: ServiceType;
  visibility: ServiceVisibility;
  displayOrder: number;
  pricing: Record<SubscriptionTier, TierPricing>;
}

const TIERS: SubscriptionTier[] = ["basic", "essential", "professional"];

export function createEmptyTierPricing(): Record<SubscriptionTier, TierPricing> {
  return {
    basic: { isIncluded: false, oneTimePrice: 0, recurringPrice: 0, recurringInterval: "month" },
    essential: { isIncluded: false, oneTimePrice: 0, recurringPrice: 0, recurringInterval: "month" },
    professional: { isIncluded: false, oneTimePrice: 0, recurringPrice: 0, recurringInterval: "month" },
  };
}

export function formatCurrency(value: number) {
  return `S$${value.toFixed(2)}`;
}

export function normalizeInterval(interval?: string | null) {
  if (!interval) return "month";
  const lower = interval.toLowerCase();
  if (lower === "monthly") return "month";
  if (lower === "yearly" || lower === "annual" || lower === "annually") return "year";
  return lower;
}

function toAnnualAmount(price: number, interval?: string | null) {
  const normalized = normalizeInterval(interval);
  if (normalized === "year") return price;
  if (normalized === "week") return price * 52;
  if (normalized === "day") return price * 365;
  return price * 12;
}

function toMonthlyAmount(price: number, interval?: string | null) {
  const normalized = normalizeInterval(interval);
  if (normalized === "year") return price / 12;
  if (normalized === "week") return (price * 52) / 12;
  if (normalized === "day") return (price * 365) / 12;
  return price;
}

function formatTierPriceRange(
  current: number,
  baseline: number,
  suffix: "" | "/mo"
) : OptionalLinePricePart {
  return {
    current,
    baseline,
    suffix,
  };
}

function formatTierPriceRangeText(
  part: OptionalLinePricePart
) {
  const { current, baseline, suffix } = part;
  if (baseline > 0 && current > 0 && current < baseline) {
    return `${formatCurrency(baseline)}${suffix} -> ${formatCurrency(current)}${suffix}`;
  }

  return `${formatCurrency(current)}${suffix}`;
}

function getReferenceValue(addon: PricingAddon) {
  const basic = addon.pricing.basic;
  if (basic.oneTimePrice > 0) return `${formatCurrency(basic.oneTimePrice)}`;
  if (basic.recurringPrice > 0) return `${formatCurrency(basic.recurringPrice)}/mo`;

  for (const tier of TIERS) {
    const pricing = addon.pricing[tier];
    if (pricing.oneTimePrice > 0) return `${formatCurrency(pricing.oneTimePrice)}`;
    if (pricing.recurringPrice > 0) return `${formatCurrency(pricing.recurringPrice)}/mo`;
  }

  return null;
}

export function getTierLineItem(addon: PricingAddon, tier: SubscriptionTier) {
  const current = addon.pricing[tier];
  const baseline = addon.pricing.basic;

  if (current.isIncluded) {
    const reference = getReferenceValue(addon);
    if (reference) {
      return `Included: ${addon.name} (valued at ${reference}, FREE)`;
    }
    return `Included: ${addon.name} (FREE)`;
  }

  const parts: OptionalLinePricePart[] = [];

  if (current.oneTimePrice > 0) {
    parts.push(formatTierPriceRange(current.oneTimePrice, baseline.oneTimePrice, ""));
  }

  if (current.recurringPrice > 0) {
    parts.push(formatTierPriceRange(current.recurringPrice, baseline.recurringPrice, "/mo"));
  }

  if (parts.length === 0) return null;

  return {
    serviceName: addon.name,
    parts,
    optional: tier !== "basic",
  } satisfies TierOptionalLineItem;
}

export function getTierIncludedFeature(addon: PricingAddon, tier: SubscriptionTier) {
  const current = addon.pricing[tier];
  if (!current.isIncluded) return null;
  return addon.name;
}

export function getTierOptionalLineItems(addons: PricingAddon[], tier: SubscriptionTier) {
  return addons
    .map((addon) => {
      const pricing = addon.pricing[tier];
      if (pricing.isIncluded) return null;
      return getTierLineItem(addon, tier);
    })
    .filter(Boolean) as TierOptionalLineItem[];
}

export function getTierOptionalLineItemText(item: TierOptionalLineItem) {
  const suffix = item.optional ? " - optional" : "";
  return `${item.serviceName} (${item.parts.map(formatTierPriceRangeText).join(" + ")})${suffix}`;
}

export function getTierSelectableAddons(addons: PricingAddon[], tier: SubscriptionTier) {
  return addons.filter((addon) => {
    const pricing = addon.pricing[tier];
    if (pricing.isIncluded) return false;
    return pricing.oneTimePrice > 0 || pricing.recurringPrice > 0;
  });
}

export function getTierIncludedAddons(addons: PricingAddon[], tier: SubscriptionTier) {
  return addons.filter((addon) => addon.pricing[tier].isIncluded);
}

export function getAddonCheckoutLabel(addon: PricingAddon, tier: SubscriptionTier) {
  const pricing = addon.pricing[tier];
  const parts: string[] = [];

  if (pricing.oneTimePrice > 0) {
    parts.push(`${formatCurrency(pricing.oneTimePrice)} one-time`);
  }

  if (pricing.recurringPrice > 0) {
    parts.push(`${formatCurrency(pricing.recurringPrice)}/mo`);
  }

  return parts.join(" + ");
}

export function getAddonCheckoutLabelForBillingCycle(
  addon: PricingAddon,
  tier: SubscriptionTier,
  billingCycle: BillingCycle
) {
  const pricing = addon.pricing[tier];
  const parts: string[] = [];

  if (pricing.oneTimePrice > 0) {
    parts.push(`${formatCurrency(pricing.oneTimePrice)} one-time`);
  }

  if (pricing.recurringPrice > 0) {
    const recurring = billingCycle === "annual"
      ? toAnnualAmount(pricing.recurringPrice, pricing.recurringInterval)
      : toMonthlyAmount(pricing.recurringPrice, pricing.recurringInterval);
    parts.push(`${formatCurrency(recurring)}/${billingCycle === "annual" ? "year" : "mo"}`);
  }

  return parts.join(" + ");
}

export function calculateAddonTotals(
  addons: PricingAddon[],
  selectedAddonIds: string[],
  tier: SubscriptionTier
) {
  const selectedSet = new Set(selectedAddonIds);

  return addons.reduce(
    (totals, addon) => {
      if (!selectedSet.has(addon.id)) return totals;
      const pricing = addon.pricing[tier];
      if (pricing.isIncluded) return totals;

      return {
        oneTime: totals.oneTime + (pricing.oneTimePrice || 0),
        recurring: totals.recurring + (pricing.recurringPrice || 0),
      };
    },
    { oneTime: 0, recurring: 0 }
  );
}

export function calculateAddonTotalsForBillingCycle(
  addons: PricingAddon[],
  selectedAddonIds: string[],
  tier: SubscriptionTier,
  billingCycle: BillingCycle
) {
  const selectedSet = new Set(selectedAddonIds);

  return addons.reduce(
    (totals, addon) => {
      if (!selectedSet.has(addon.id)) return totals;
      const pricing = addon.pricing[tier];
      if (pricing.isIncluded) return totals;

      const recurring = billingCycle === "annual"
        ? toAnnualAmount(pricing.recurringPrice || 0, pricing.recurringInterval)
        : toMonthlyAmount(pricing.recurringPrice || 0, pricing.recurringInterval);

      return {
        oneTime: totals.oneTime + (pricing.oneTimePrice || 0),
        recurring: totals.recurring + recurring,
      };
    },
    { oneTime: 0, recurring: 0 }
  );
}
