import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePricingCatalog } from "@/hooks/usePricingCatalog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { formatCurrency, getTierIncludedFeature, getTierOptionalLineItems } from "@/lib/pricingCatalog";
import {
  isEmphasizedFeatureLabel,
  SUBSCRIPTION_PLAN_BY_TIER,
  SUBSCRIPTION_PLANS,
  type SubscriptionTier,
} from "@/lib/subscriptionPlans";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type BillingCycle = "annual" | "monthly";

function isTier(value: string | null): value is SubscriptionTier {
  return value === "basic" || value === "essential" || value === "professional";
}

export default function MemberOnboarding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signOut } = useAuth();
  const { addons, loading: catalogLoading } = usePricingCatalog();

  const initialTier = isTier(searchParams.get("tier")) ? searchParams.get("tier") : null;
  const initialBillingCycle: BillingCycle =
    searchParams.get("billing") === "monthly" ? "monthly" : "annual";

  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(initialTier);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(initialBillingCycle);
  const [companyName, setCompanyName] = useState<string>("");

  useEffect(() => {
    async function loadCompanyName() {
      if (!user) return;
      const { data } = await supabase
        .from("members")
        .select("company_name")
        .eq("id", user.id)
        .maybeSingle();

      if (data?.company_name) {
        setCompanyName(data.company_name);
      }
    }

    void loadCompanyName();
  }, [user]);

  const optionalLineItemsByTier = useMemo(() => {
    return {
      basic: getTierOptionalLineItems(addons, "basic"),
      essential: getTierOptionalLineItems(addons, "essential"),
      professional: getTierOptionalLineItems(addons, "professional"),
    };
  }, [addons]);

  const includedFeaturesByTier = useMemo(() => {
    return {
      basic: addons.map((addon) => getTierIncludedFeature(addon, "basic")).filter(Boolean) as string[],
      essential: addons.map((addon) => getTierIncludedFeature(addon, "essential")).filter(Boolean) as string[],
      professional: addons.map((addon) => getTierIncludedFeature(addon, "professional")).filter(Boolean) as string[],
    };
  }, [addons]);

  const isAnnual = billingCycle === "annual";
  const hasSelectedPlan = Boolean(selectedTier);

  const handleContinueToAddons = () => {
    if (!selectedTier) {
      toast.error("Select a plan to continue");
      return;
    }

    navigate(`/member/onboarding/addons?tier=${selectedTier}&billing=${billingCycle}`);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <section className="relative overflow-hidden border-b border-border bg-secondary text-secondary-foreground">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,hsl(var(--primary)/0.24),transparent_44%)]" />
        <div className="container relative mx-auto px-4 py-8 sm:py-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Badge className="border border-white/20 bg-white/10 text-white">Member Onboarding</Badge>
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="h-9 text-white hover:bg-white/10 hover:text-white"
            >
              Sign Out
            </Button>
          </div>
          <h1 className="mt-4 max-w-3xl text-2xl font-bold sm:text-3xl md:text-4xl">
            {companyName ? `${companyName}, let's activate your account.` : "Let's activate your account."}
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-white/80 md:text-base">
            Choose your base plan and any optional services. You can adjust add-ons on the next page.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs sm:gap-3 sm:text-sm">
            <div className="rounded-full bg-primary px-2.5 py-1.5 text-primary-foreground sm:px-3 sm:py-1">1. Plan</div>
            <ArrowRight className="h-4 w-4 text-white/60" />
            <div className="rounded-full bg-white/10 px-2.5 py-1.5 text-white/80 sm:px-3 sm:py-1">2. Add-ons & Checkout</div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-6 pb-28 sm:py-10 sm:pb-10">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-secondary sm:text-2xl">Pick Your Base Plan</h2>
              <p className="text-sm text-muted-foreground">
                Built for practical setup speed, compliance readiness, and smooth day-to-day operations.
              </p>
            </div>
            <Badge className="bg-primary/10 text-primary max-sm:w-full max-sm:justify-center">
              <ShieldCheck className="mr-1 h-3.5 w-3.5" />
              Secure checkout powered by Stripe
            </Badge>
          </div>

          <div className="surface-panel inline-flex w-full flex-wrap items-center justify-center gap-3 px-4 py-3 sm:w-auto sm:gap-4 sm:px-5">
            <button
              type="button"
              className={cn("text-sm font-semibold", isAnnual ? "text-muted-foreground" : "text-secondary")}
              onClick={() => setBillingCycle("monthly")}
            >
              Monthly
            </button>
            <Switch
              checked={isAnnual}
              onCheckedChange={(checked) => setBillingCycle(checked ? "annual" : "monthly")}
            />
            <button
              type="button"
              className={cn("text-sm font-semibold", isAnnual ? "text-secondary" : "text-muted-foreground")}
              onClick={() => setBillingCycle("annual")}
            >
              Annual
            </button>
            <Badge className="bg-primary/15 text-primary">Default annual rate</Badge>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {SUBSCRIPTION_PLANS.map((subscriptionPlan) => {
              const isSelected = selectedTier === subscriptionPlan.tier;
              return (
                <Card
                  key={subscriptionPlan.tier}
                  className={`flex h-full flex-col border bg-white/90 ${
                    isSelected
                      ? "border-primary shadow-[0_20px_44px_-32px_hsl(var(--secondary)/0.9)]"
                      : "border-border/70"
                  }`}
                >
                  <CardHeader className="space-y-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl text-secondary">{subscriptionPlan.name}</CardTitle>
                      {isSelected ? (
                        <Badge className="bg-primary text-primary-foreground">Selected</Badge>
                      ) : subscriptionPlan.popular ? (
                        <Badge className="bg-secondary text-secondary-foreground">Most Popular</Badge>
                      ) : null}
                    </div>
                    <CardDescription>{subscriptionPlan.description}</CardDescription>
                    <div className="rounded-xl bg-muted/70 p-4">
                      <p className="text-3xl font-bold text-secondary sm:text-4xl">
                        {formatCurrency(isAnnual ? subscriptionPlan.annualPrice : subscriptionPlan.monthlyPrice)}
                        <span className="ml-1 text-sm font-medium text-muted-foreground">/month</span>
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                        {isAnnual ? "Annual rate" : "Monthly rate"}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Included Core Features
                      </p>
                      <ul className="mt-3 space-y-2">
                        {[...subscriptionPlan.baseFeatures, ...includedFeaturesByTier[subscriptionPlan.tier]].map(
                          (feature) => (
                            <li key={feature} className="flex items-start gap-2 text-sm text-foreground">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                              <span className={cn(isEmphasizedFeatureLabel(feature) && "font-semibold")}>{feature}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Add-On</p>
                      {catalogLoading ? (
                        <div className="mt-3 space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-11/12" />
                          <Skeleton className="h-4 w-10/12" />
                        </div>
                      ) : optionalLineItemsByTier[subscriptionPlan.tier].length > 0 ? (
                        <ul className="mt-3 space-y-2">
                          {optionalLineItemsByTier[subscriptionPlan.tier].map((item) => (
                            <li
                              key={`${subscriptionPlan.tier}-${item.serviceName}`}
                              className="text-sm leading-relaxed text-muted-foreground"
                            >
                              <span>{item.serviceName} (</span>
                              {item.parts.map((part, partIndex) => (
                                <span key={`${item.serviceName}-${part.suffix}-${partIndex}`}>
                                  {part.baseline > 0 && part.current > 0 && part.current < part.baseline && (
                                    <span className="mr-1 text-muted-foreground/80 line-through">
                                      {formatCurrency(part.baseline)}
                                      {part.suffix}
                                    </span>
                                  )}
                                  <span>
                                    {formatCurrency(part.current)}
                                    {part.suffix}
                                  </span>
                                  {partIndex < item.parts.length - 1 && <span> + </span>}
                                </span>
                              ))}
                              <span>)</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-3 text-sm text-muted-foreground">No extra line items currently configured.</p>
                      )}
                    </div>
                  </CardContent>
                  <div className="p-6 pt-0">
                    <Button
                      className="h-11 w-full"
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => setSelectedTier(subscriptionPlan.tier)}
                    >
                      {isSelected ? "Selected" : `Select ${subscriptionPlan.name}`}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="hidden items-center justify-end sm:flex">
            <Button onClick={handleContinueToAddons} size="lg" className="gap-2" disabled={!hasSelectedPlan}>
              Continue to Add-ons
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 p-4 shadow-[0_-8px_24px_-18px_hsl(var(--secondary)/0.7)] backdrop-blur sm:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {selectedTier
              ? `Selected: ${SUBSCRIPTION_PLAN_BY_TIER[selectedTier].name} (${isAnnual ? "annual" : "monthly"})`
              : "Select a plan to continue"}
          </p>
          <Button onClick={handleContinueToAddons} className="h-11 gap-2" disabled={!hasSelectedPlan}>
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
