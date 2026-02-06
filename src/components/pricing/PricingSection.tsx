import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingTier {
  name: string;
  description: string;
  monthlyPrice: number;
  popular?: boolean;
  features: string[];
}

const pricingTiers: PricingTier[] = [
  {
    name: "Basic",
    description: "Essential services for startups",
    monthlyPrice: 17.99,
    features: [
      "Corporate Secretary*",
      "Bookkeeping*",
      "Un-Audited Report*",
      "Taxation*",
      "Online Dashboard Access",
    ],
  },
  {
    name: "Essential",
    description: "Everything for professional presence",
    monthlyPrice: 18.99,
    popular: true,
    features: [
      "Everything in Basic",
      "Payroll for 5 Staffs",
      "XBRL*",
      "GST Submission",
      "AIS Submission",
      "Priority Support",
    ],
  },
  {
    name: "Professional",
    description: "Complete solution for growing businesses",
    monthlyPrice: 26.90,
    features: [
      "Everything in Essential",
      "Registered Agent Service",
      "Multiple Entity Support",
      "Dedicated Account Manager",
      "Premium Support",
      "Custom Reporting",
    ],
  },
];

const featureMatrix = [
  { feature: "Corporate Secretary", basic: true, essential: true, professional: true },
  { feature: "Bookkeeping", basic: true, essential: true, professional: true },
  { feature: "Un-Audited Report", basic: true, essential: true, professional: true },
  { feature: "Taxation", basic: true, essential: true, professional: true },
  { feature: "Payroll Management", basic: false, essential: "5 Staffs", professional: "Unlimited" },
  { feature: "XBRL Submission", basic: false, essential: true, professional: true },
  { feature: "GST Submission", basic: false, essential: true, professional: true },
  { feature: "AIS Submission", basic: false, essential: true, professional: true },
  { feature: "Dedicated Manager", basic: false, essential: false, professional: true },
  { feature: "Priority Support", basic: false, essential: true, professional: true },
];

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);
  const discount = 0.12;

  const calculatePrice = (monthlyPrice: number) => {
    if (isAnnual) {
      return (monthlyPrice * (1 - discount)).toFixed(2);
    }
    return monthlyPrice.toFixed(2);
  };

  const calculateAnnualTotal = (monthlyPrice: number) => {
    return (monthlyPrice * 12 * (1 - discount)).toFixed(2);
  };

  return (
    <>
      {/* Pricing Header */}
      <section className="py-16" id="pricing">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            Simple, Transparent <span className="text-primary">Pricing</span>
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Choose the plan that fits your business needs. All plans include our
            core corporate services with no hidden fees.
          </p>
          <p className="mx-auto mt-2 max-w-xl text-xs text-muted-foreground">
            * Nominee corporate secretary service for the year. Price inclusive of all systems for bookkeeping. 
            Un-audited report, taxation & XBRL for single entity only.
          </p>
        </div>
      </section>

      {/* Billing Toggle */}
      <section className="pb-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-4">
            <span
              className={cn(
                "text-sm font-medium",
                !isAnnual ? "text-foreground" : "text-muted-foreground"
              )}
            >
              Monthly
            </span>
            <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
            <span
              className={cn(
                "text-sm font-medium",
                isAnnual ? "text-foreground" : "text-muted-foreground"
              )}
            >
              Annual
            </span>
            {isAnnual && (
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Save 12%
              </Badge>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            {pricingTiers.map((tier) => (
              <Card
                key={tier.name}
                className={cn(
                  "relative flex flex-col",
                  tier.popular && "border-primary shadow-lg md:scale-105"
                )}
              >
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="mb-6 text-center">
                    <span className="text-4xl font-bold text-foreground">
                      ${calculatePrice(tier.monthlyPrice)}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                    {isAnnual && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        ${calculateAnnualTotal(tier.monthlyPrice)} billed annually
                      </p>
                    )}
                  </div>
                  <ul className="space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <Check className="h-5 w-5 flex-shrink-0 text-primary" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={tier.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link to="/signup">Get Started</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Matrix */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <h3 className="mb-8 text-center text-2xl font-bold text-foreground">
            Feature Comparison
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-4 text-left font-medium text-foreground">
                    Feature
                  </th>
                  <th className="py-4 text-center font-medium text-foreground">
                    Basic
                  </th>
                  <th className="py-4 text-center font-medium text-primary">
                    Essential
                  </th>
                  <th className="py-4 text-center font-medium text-foreground">
                    Professional
                  </th>
                </tr>
              </thead>
              <tbody>
                {featureMatrix.map((row, index) => (
                  <tr
                    key={row.feature}
                    className={cn(
                      "border-b border-border",
                      index % 2 === 0 && "bg-background"
                    )}
                  >
                    <td className="py-4 text-foreground">{row.feature}</td>
                    <td className="py-4 text-center">
                      {typeof row.basic === "boolean" ? (
                        row.basic ? (
                          <Check className="mx-auto h-5 w-5 text-primary" />
                        ) : (
                          <X className="mx-auto h-5 w-5 text-muted-foreground" />
                        )
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {row.basic}
                        </span>
                      )}
                    </td>
                    <td className="py-4 text-center">
                      {typeof row.essential === "boolean" ? (
                        row.essential ? (
                          <Check className="mx-auto h-5 w-5 text-primary" />
                        ) : (
                          <X className="mx-auto h-5 w-5 text-muted-foreground" />
                        )
                      ) : (
                        <span className="text-sm font-medium text-primary">
                          {row.essential}
                        </span>
                      )}
                    </td>
                    <td className="py-4 text-center">
                      {typeof row.professional === "boolean" ? (
                        row.professional ? (
                          <Check className="mx-auto h-5 w-5 text-primary" />
                        ) : (
                          <X className="mx-auto h-5 w-5 text-muted-foreground" />
                        )
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {row.professional}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
