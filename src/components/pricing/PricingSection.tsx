import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePricingCatalog } from "@/hooks/usePricingCatalog";
import {
  formatCurrency,
  getTierIncludedFeature,
  getTierOptionalLineItems,
} from "@/lib/pricingCatalog";
import { isEmphasizedFeatureLabel, SUBSCRIPTION_PLANS } from "@/lib/subscriptionPlans";

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);
  const { addons, loading } = usePricingCatalog();

  const tierOptionalLineItems = useMemo(
    () => ({
      basic: getTierOptionalLineItems(addons, "basic"),
      essential: getTierOptionalLineItems(addons, "essential"),
      professional: getTierOptionalLineItems(addons, "professional"),
    }),
    [addons]
  );

  const tierIncludedFeatures = useMemo(
    () => ({
      basic: addons.flatMap((addon) => {
        const feature = getTierIncludedFeature(addon, "basic");
        return feature ? [feature] : [];
      }),
      essential: addons.flatMap((addon) => {
        const feature = getTierIncludedFeature(addon, "essential");
        return feature ? [feature] : [];
      }),
      professional: addons.flatMap((addon) => {
        const feature = getTierIncludedFeature(addon, "professional");
        return feature ? [feature] : [];
      }),
    }),
    [addons]
  );

  return (
    <section id="pricing" className="relative overflow-hidden py-14 sm:py-20">
      <div className="absolute inset-0 section-grid-bg opacity-40" aria-hidden="true" />
      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Plans & Pricing</p>
          <h2 className="mt-4 text-3xl font-bold text-foreground md:text-4xl">
            Simple, Transparent <span className="text-gradient">Pricing</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Choose the plan that fits your business stage. Every package includes a real Singapore address and the
            core virtual office essentials.
          </p>
        </div>

        <div className="mx-auto mt-8 inline-flex w-full justify-center">
          <div className="surface-panel flex flex-wrap items-center justify-center gap-3 px-4 py-3 sm:gap-4 sm:px-5">
            <button
              type="button"
              className={cn("text-sm font-semibold", isAnnual ? "text-muted-foreground" : "text-secondary")}
              onClick={() => setIsAnnual(false)}
            >
              Monthly
            </button>
            <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
            <button
              type="button"
              className={cn("text-sm font-semibold", isAnnual ? "text-secondary" : "text-muted-foreground")}
              onClick={() => setIsAnnual(true)}
            >
              Annual
            </button>
            <Badge className="bg-primary/15 text-primary">Save 12%</Badge>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {SUBSCRIPTION_PLANS.map((tier, index) => (
            <Card
              key={tier.tier}
              className={cn(
                "surface-panel flex flex-col border bg-white/90",
                tier.popular && "border-primary/60 shadow-[0_20px_40px_-32px_hsl(var(--secondary)/0.95)]"
              )}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl text-secondary">{tier.name}</CardTitle>
                  {tier.popular && <Badge className="bg-secondary text-secondary-foreground">Most Popular</Badge>}
                </div>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                <div className="mb-6 rounded-xl bg-muted/70 p-4">
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-secondary sm:text-4xl">
                      ${isAnnual ? tier.annualPrice.toFixed(2) : tier.monthlyPrice.toFixed(2)}
                    </span>
                    <span className="pb-1 text-sm text-muted-foreground">/month</span>
                  </div>
                  <p className="mt-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    {isAnnual ? "Billed annually" : "Billed monthly"}
                  </p>
                </div>

                {[...tier.baseFeatures, ...tierIncludedFeatures[tier.tier]].length > 0 ? (
                  <ul className="space-y-3">
                    {[...tier.baseFeatures, ...tierIncludedFeatures[tier.tier]].map((feature) => (
                      <li key={`${feature}-${index}`} className="flex items-start gap-3">
                        <span className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/20">
                          <Check className="h-3.5 w-3.5 text-primary" />
                        </span>
                        <span
                          className={cn(
                            "text-sm text-foreground",
                            isEmphasizedFeatureLabel(feature) && "font-semibold"
                          )}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Included features will appear here once configured in admin.
                  </p>
                )}

                <div className="mt-6 rounded-xl border border-border/70 bg-muted/40 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Add-On
                  </p>
                  {loading ? (
                    <div className="mt-3 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-11/12" />
                    </div>
                  ) : tierOptionalLineItems[tier.tier].length > 0 ? (
                    <ul className="mt-3 space-y-2">
                      {tierOptionalLineItems[tier.tier].map((line) => (
                        <li key={`${tier.tier}-${line.serviceName}`} className="text-sm text-muted-foreground">
                          <span>{line.serviceName} (</span>
                          {line.parts.map((part, partIndex) => (
                            <span key={`${line.serviceName}-${part.suffix}-${partIndex}`}>
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
                              {partIndex < line.parts.length - 1 && <span> + </span>}
                            </span>
                          ))}
                          <span>)</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm text-muted-foreground">
                      No add-on items configured for this tier.
                    </p>
                  )}
                </div>
              </CardContent>

              <CardFooter>
                <Button className="w-full" variant={tier.popular ? "default" : "outline"} asChild>
                  <Link to="/signup">Get Started</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
