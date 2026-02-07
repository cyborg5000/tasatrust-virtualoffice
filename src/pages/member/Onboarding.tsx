import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePricingCatalog } from "@/hooks/usePricingCatalog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  calculateAddonTotals,
  formatCurrency,
  getAddonCheckoutLabel,
  getTierIncludedAddons,
  getTierIncludedFeature,
  getTierOptionalLineItems,
  getTierSelectableAddons,
} from "@/lib/pricingCatalog";
import {
  isEmphasizedFeatureLabel,
  SUBSCRIPTION_PLAN_BY_TIER,
  SUBSCRIPTION_PLANS,
  type SubscriptionTier,
} from "@/lib/subscriptionPlans";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Step = "plan" | "addons";

function isTier(value: string | null): value is SubscriptionTier {
  return value === "basic" || value === "essential" || value === "professional";
}

export default function MemberOnboarding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signOut } = useAuth();
  const { addons, loading: catalogLoading } = usePricingCatalog();

  const initialTier = isTier(searchParams.get("tier")) ? searchParams.get("tier") : null;
  const initialStep = searchParams.get("step") === "addons" ? "addons" : "plan";

  const [step, setStep] = useState<Step>(initialStep);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(initialTier);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [isRedirecting, setIsRedirecting] = useState(false);
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
      basic: addons
        .map((addon) => getTierIncludedFeature(addon, "basic"))
        .filter(Boolean) as string[],
      essential: addons
        .map((addon) => getTierIncludedFeature(addon, "essential"))
        .filter(Boolean) as string[],
      professional: addons
        .map((addon) => getTierIncludedFeature(addon, "professional"))
        .filter(Boolean) as string[],
    };
  }, [addons]);

  const selectableAddons = useMemo(() => {
    if (!selectedTier) return [];
    return getTierSelectableAddons(addons, selectedTier);
  }, [addons, selectedTier]);

  const includedAddons = useMemo(() => {
    if (!selectedTier) return [];
    return getTierIncludedAddons(addons, selectedTier);
  }, [addons, selectedTier]);

  useEffect(() => {
    if (!selectedTier) return;
    const validIds = new Set(selectableAddons.map((addon) => addon.id));
    setSelectedAddonIds((prev) => prev.filter((id) => validIds.has(id)));
  }, [selectedTier, selectableAddons]);

  const plan = selectedTier ? SUBSCRIPTION_PLAN_BY_TIER[selectedTier] : null;
  const hasSelectedPlan = Boolean(selectedTier);

  const addonTotals = useMemo(() => {
    if (!selectedTier) return { oneTime: 0, recurring: 0 };
    return calculateAddonTotals(addons, selectedAddonIds, selectedTier);
  }, [addons, selectedAddonIds, selectedTier]);

  const recurringTotal = (plan?.checkoutMonthlyPrice || 0) + addonTotals.recurring;

  const toggleAddon = (addonId: string, checked: boolean) => {
    setSelectedAddonIds((prev) => {
      if (checked) return [...prev, addonId];
      return prev.filter((id) => id !== addonId);
    });
  };

  const handleContinueToAddons = () => {
    if (!selectedTier) {
      toast.error("Select a plan to continue");
      return;
    }
    setStep("addons");
  };

  const handleCheckout = async () => {
    if (!selectedTier) return;
    setIsRedirecting(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: {
          tier: selectedTier,
          addonIds: selectedAddonIds,
        },
      });

      if (error) throw error;
      if (!data?.url) {
        throw new Error("Unable to start checkout session.");
      }

      window.location.assign(data.url);
    } catch (error: unknown) {
      console.error("Checkout start failed:", error);
      toast.error(error instanceof Error ? error.message : "Unable to start checkout. Please try again.");
    } finally {
      setIsRedirecting(false);
    }
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
            Choose your base plan and any optional services you want right away. Your setup remains flexible, and you
            can add more services later from your member portal.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs sm:gap-3 sm:text-sm">
            <div
              className={`rounded-full px-2.5 py-1.5 sm:px-3 sm:py-1 ${
                step === "plan" ? "bg-primary text-primary-foreground" : "bg-white/10 text-white/80"
              }`}
            >
              1. Plan
            </div>
            <ArrowRight className="h-4 w-4 text-white/60" />
            <div
              className={`rounded-full px-2.5 py-1.5 sm:px-3 sm:py-1 ${
                step === "addons" ? "bg-primary text-primary-foreground" : "bg-white/10 text-white/80"
              }`}
            >
              2. Add-ons & Checkout
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-6 pb-28 sm:py-10 sm:pb-10">
        {step === "plan" && (
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
                          {formatCurrency(subscriptionPlan.checkoutMonthlyPrice)}
                          <span className="ml-1 text-sm font-medium text-muted-foreground">/month</span>
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                          Onboarding rate
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
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          Add-On
                        </p>
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
                                key={`${subscriptionPlan.tier}-${item}`}
                                className="text-sm leading-relaxed text-muted-foreground"
                              >
                                {item}
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
        )}

        {step === "addons" && plan && (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-secondary sm:text-2xl">Choose Optional Add-ons</h2>
                <p className="text-sm text-muted-foreground">
                  Select services you want to activate now. You can leave them unchecked and purchase later anytime.
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-secondary">{plan.name} Plan Add-ons</CardTitle>
                  <CardDescription>
                    Only services marked as <strong>Pricing page</strong> or <strong>Both</strong> in admin are shown
                    here.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {catalogLoading ? (
                    <>
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </>
                  ) : selectableAddons.length > 0 ? (
                    selectableAddons.map((addon) => {
                      const checked = selectedAddonIds.includes(addon.id);
                      return (
                        <label
                          key={addon.id}
                          className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                            checked ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                          }`}
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(value) => toggleAddon(addon.id, Boolean(value))}
                            className="mt-0.5"
                          />
                          <div className="flex-1">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <p className="font-semibold text-foreground">{addon.name}</p>
                              <Badge variant="outline" className="w-fit">
                                {getAddonCheckoutLabel(addon, selectedTier)}
                              </Badge>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {addon.description || "Professional add-on service for your business setup."}
                            </p>
                          </div>
                        </label>
                      );
                    })
                  ) : (
                    <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                      No optional add-ons are available for this tier right now.
                    </p>
                  )}
                </CardContent>
              </Card>

              {includedAddons.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-secondary">Already Included in {plan.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {includedAddons.map((addon) => (
                      <div key={addon.id} className="flex items-center justify-between rounded-lg bg-muted/60 p-3">
                        <span className="text-sm font-medium text-foreground">{addon.name}</span>
                        <Badge className="bg-primary/15 text-primary">FREE in your plan</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <Button variant="outline" onClick={() => setStep("plan")} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Plans
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <Card className="border-primary/30 bg-white/95 lg:sticky lg:top-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl text-secondary">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Order Summary
                  </CardTitle>
                  <CardDescription>Review your total before secure checkout.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{plan.name} plan</span>
                      <span className="font-semibold text-foreground">{formatCurrency(plan.checkoutMonthlyPrice)}/mo</span>
                    </div>
                    {selectedAddonIds.map((addonId) => {
                      const addon = selectableAddons.find((item) => item.id === addonId);
                      if (!addon) return null;
                      return (
                        <div key={addonId} className="flex items-center justify-between gap-4 text-sm">
                          <span className="text-muted-foreground">{addon.name}</span>
                          <span className="text-right font-semibold text-foreground">
                            {getAddonCheckoutLabel(addon, selectedTier)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">One-time due today</span>
                      <span className="font-semibold text-foreground">{formatCurrency(addonTotals.oneTime)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold text-secondary">Monthly recurring</span>
                      <span className="text-2xl font-bold text-secondary">
                        {formatCurrency(recurringTotal)}
                        <span className="ml-1 text-sm font-medium text-muted-foreground">/mo</span>
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(plan.checkoutMonthlyPrice)}/mo
                      {addonTotals.oneTime > 0 && ` + ${formatCurrency(addonTotals.oneTime)} one-time`}
                      {addonTotals.recurring > 0 && ` + ${formatCurrency(addonTotals.recurring)}/mo`}
                    </p>
                  </div>

                  <Button
                    onClick={handleCheckout}
                    className="hidden w-full lg:flex"
                    size="lg"
                    disabled={isRedirecting}
                  >
                    {isRedirecting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Redirecting to Stripe...
                      </>
                    ) : (
                      "Proceed to Secure Checkout"
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground">
                    You will be redirected to Stripe to complete payment securely. Once payment succeeds, your
                    subscription appears automatically in your account.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </section>

      {step === "plan" && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 p-4 shadow-[0_-8px_24px_-18px_hsl(var(--secondary)/0.7)] backdrop-blur sm:hidden">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {selectedTier ? `Selected: ${SUBSCRIPTION_PLAN_BY_TIER[selectedTier].name}` : "Select a plan to continue"}
            </p>
            <Button onClick={handleContinueToAddons} className="h-11 gap-2" disabled={!hasSelectedPlan}>
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {step === "addons" && plan && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 p-4 shadow-[0_-8px_24px_-18px_hsl(var(--secondary)/0.7)] backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Monthly recurring</p>
              <p className="text-base font-bold text-secondary">{formatCurrency(recurringTotal)}/mo</p>
            </div>
            <Button onClick={handleCheckout} className="h-11" disabled={isRedirecting}>
              {isRedirecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirecting...
                </>
              ) : (
                "Checkout"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
