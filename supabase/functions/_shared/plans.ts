export type SubscriptionTier = "basic" | "essential" | "professional";

interface PlanPricing {
  name: string;
  monthly: number;
}

export const PLAN_PRICING: Record<SubscriptionTier, PlanPricing> = {
  basic: { name: "Basic", monthly: 15.99 },
  essential: { name: "Essential", monthly: 16.99 },
  professional: { name: "Premium", monthly: 24.9 },
};
