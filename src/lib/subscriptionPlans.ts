import type { Database } from "@/integrations/supabase/types";

export type SubscriptionTier = Database["public"]["Enums"]["subscription_tier"];

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  checkoutMonthlyPrice: number;
  popular?: boolean;
  baseFeatures: string[];
}

const EMPHASIZED_FEATURE_LABELS = new Set([
  "Virtual Business Address",
  "Everything in Basic",
  "Everything in Essential",
]);

export function isEmphasizedFeatureLabel(label: string) {
  return EMPHASIZED_FEATURE_LABELS.has(label);
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    tier: "basic",
    name: "Basic",
    description: "Essential virtual office services",
    monthlyPrice: 17.99,
    annualPrice: 15.99,
    checkoutMonthlyPrice: 15.99,
    baseFeatures: [],
  },
  {
    tier: "essential",
    name: "Essential",
    description: "Everything you need with meeting room access",
    monthlyPrice: 18.99,
    annualPrice: 16.99,
    checkoutMonthlyPrice: 16.99,
    popular: true,
    baseFeatures: [
      "Everything in Basic",
    ],
  },
  {
    tier: "professional",
    name: "Premium",
    description: "Complete solution with premium benefits",
    monthlyPrice: 26.9,
    annualPrice: 24.9,
    checkoutMonthlyPrice: 24.9,
    baseFeatures: [
      "Everything in Essential",
    ],
  },
];

export const SUBSCRIPTION_PLAN_BY_TIER: Record<SubscriptionTier, SubscriptionPlan> = {
  basic: SUBSCRIPTION_PLANS[0],
  essential: SUBSCRIPTION_PLANS[1],
  professional: SUBSCRIPTION_PLANS[2],
};
