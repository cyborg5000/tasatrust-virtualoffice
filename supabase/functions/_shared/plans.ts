export type SubscriptionTier = "basic" | "essential" | "professional";
export type BillingCycle = "monthly" | "annual";

interface PlanPricing {
  name: string;
  monthly: number;
  annual: number;
}

export const PLAN_PRICING: Record<SubscriptionTier, PlanPricing> = {
  basic: { name: "Basic", monthly: 17.99, annual: 15.99 },
  essential: { name: "Essential", monthly: 18.99, annual: 16.99 },
  professional: { name: "Premium", monthly: 26.9, annual: 24.9 },
};
