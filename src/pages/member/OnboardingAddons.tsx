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
  calculateAddonTotalsForBillingCycle,
  formatCurrency,
  getAddonCheckoutLabelForBillingCycle,
  getTierIncludedAddons,
  getTierSelectableAddons,
  type BillingCycle,
} from "@/lib/pricingCatalog";
import { SUBSCRIPTION_PLAN_BY_TIER, type SubscriptionTier } from "@/lib/subscriptionPlans";
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

type ValidTier = SubscriptionTier;

function isTier(value: string | null): value is ValidTier {
  return value === "basic" || value === "essential" || value === "professional";
}

function isBillingCycle(value: string | null): value is BillingCycle {
  return value === "monthly" || value === "annual";
}

export default function OnboardingAddons() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signOut } = useAuth();
  const { addons, loading: catalogLoading } = usePricingCatalog();

  const tierParam = searchParams.get("tier");
  const billingParam = searchParams.get("billing");

  const tier = isTier(tierParam) ? tierParam : null;
  const billingCycle: BillingCycle = isBillingCycle(billingParam) ? billingParam : "annual";

  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [companyName, setCompanyName] = useState<string>("");

  useEffect(() => {
    if (!tier) {
      navigate("/member/onboarding", { replace: true });
    }
  }, [tier, navigate]);

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

  const plan = tier ? SUBSCRIPTION_PLAN_BY_TIER[tier] : null;
  const isAnnual = billingCycle === "annual";

  const selectableAddons = useMemo(() => {
    if (!tier) return [];
    return getTierSelectableAddons(addons, tier);
  }, [addons, tier]);

  const includedAddons = useMemo(() => {
    if (!tier) return [];
    return getTierIncludedAddons(addons, tier);
  }, [addons, tier]);

  useEffect(() => {
    if (!tier) return;
    const validIds = new Set(selectableAddons.map((addon) => addon.id));
    setSelectedAddonIds((prev) => prev.filter((id) => validIds.has(id)));
  }, [tier, selectableAddons]);

  const addonTotals = useMemo(() => {
    if (!tier) return { oneTime: 0, recurring: 0 };
    return calculateAddonTotalsForBillingCycle(addons, selectedAddonIds, tier, billingCycle);
  }, [addons, selectedAddonIds, tier, billingCycle]);

  const planRecurringAmount = useMemo(() => {
    if (!plan) return 0;
    return isAnnual ? plan.annualPrice * 12 : plan.monthlyPrice;
  }, [plan, isAnnual]);

  const recurringTotal = planRecurringAmount + addonTotals.recurring;

  const recurringSuffix = isAnnual ? "/year" : "/mo";

  const toggleAddon = (addonId: string, checked: boolean) => {
    setSelectedAddonIds((prev) => {
      if (checked) return [...prev, addonId];
      return prev.filter((id) => id !== addonId);
    });
  };

  const handleCheckout = async () => {
    if (!tier) return;
    setIsRedirecting(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: {
          tier,
          addonIds: selectedAddonIds,
          billingCycle,
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

  if (!tier || !plan) return null;

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
            {companyName ? `${companyName}, choose your add-ons.` : "Choose your add-ons."}
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-white/80 md:text-base">
            Finalize your setup and proceed to secure checkout.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs sm:gap-3 sm:text-sm">
            <div className="rounded-full bg-white/10 px-2.5 py-1.5 text-white/80 sm:px-3 sm:py-1">1. Plan</div>
            <ArrowRight className="h-4 w-4 text-white/60" />
            <div className="rounded-full bg-primary px-2.5 py-1.5 text-primary-foreground sm:px-3 sm:py-1">2. Add-ons & Checkout</div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-6 pb-28 sm:py-10 sm:pb-10">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-secondary sm:text-2xl">Choose Optional Add-ons</h2>
              <p className="text-sm text-muted-foreground">
                Billing cycle: <span className="font-semibold capitalize">{billingCycle}</span>
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-secondary">{plan.name} Plan Add-ons</CardTitle>
                <CardDescription>
                  Only services marked as <strong>Pricing page</strong> or <strong>Both</strong> in admin are shown here.
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
                              {getAddonCheckoutLabelForBillingCycle(addon, tier, billingCycle)}
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
              <Button
                variant="outline"
                onClick={() => navigate(`/member/onboarding?tier=${tier}&billing=${billingCycle}`)}
                className="gap-2"
              >
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
                    <span className="text-muted-foreground">
                      {plan.name} plan ({isAnnual ? "annual" : "monthly"} billing)
                    </span>
                    <span className="font-semibold text-foreground">
                      {formatCurrency(planRecurringAmount)}{recurringSuffix}
                    </span>
                  </div>
                  {selectedAddonIds.map((addonId) => {
                    const addon = selectableAddons.find((item) => item.id === addonId);
                    if (!addon) return null;
                    return (
                      <div key={addonId} className="flex items-center justify-between gap-4 text-sm">
                        <span className="text-muted-foreground">{addon.name}</span>
                        <span className="text-right font-semibold text-foreground">
                          {getAddonCheckoutLabelForBillingCycle(addon, tier, billingCycle)}
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
                    <span className="text-base font-semibold text-secondary">
                      {isAnnual ? "Annual recurring" : "Monthly recurring"}
                    </span>
                    <span className="text-2xl font-bold text-secondary">
                      {formatCurrency(recurringTotal)}
                      <span className="ml-1 text-sm font-medium text-muted-foreground">{recurringSuffix}</span>
                    </span>
                  </div>
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
      </section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 p-4 shadow-[0_-8px_24px_-18px_hsl(var(--secondary)/0.7)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">{isAnnual ? "Annual recurring" : "Monthly recurring"}</p>
            <p className="text-base font-bold text-secondary">
              {formatCurrency(recurringTotal)}{recurringSuffix}
            </p>
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
    </div>
  );
}
