import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
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
    description: "Essential virtual office services for startups",
    monthlyPrice: 17.99,
    features: [
      "Virtual Business Address",
      "Mail Handling",
      "Digital Mail Scans",
      "Business Registration Use",
      "Online Dashboard Access",
    ],
  },
  {
    name: "Essential",
    description: "Everything you need for a professional presence",
    monthlyPrice: 18.99,
    popular: true,
    features: [
      "Everything in Basic",
      "Phone Answering Service",
      "Personalized Greeting",
      "Call Forwarding",
      "Message Taking",
      "2 Hours Meeting Room/month",
    ],
  },
  {
    name: "Professional",
    description: "Complete solution for growing businesses",
    monthlyPrice: 26.90,
    features: [
      "Everything in Essential",
      "Registered Agent Service",
      "5 Hours Meeting Room/month",
      "Priority Mail Handling",
      "Dedicated Account Manager",
      "Premium Support",
    ],
  },
];

const featureMatrix = [
  { feature: "Virtual Business Address", basic: true, essential: true, professional: true },
  { feature: "Mail Handling", basic: true, essential: true, professional: true },
  { feature: "Digital Mail Scans", basic: true, essential: true, professional: true },
  { feature: "Phone Answering", basic: false, essential: true, professional: true },
  { feature: "Call Forwarding", basic: false, essential: true, professional: true },
  { feature: "Meeting Room Hours", basic: "—", essential: "2 hrs/mo", professional: "5 hrs/mo" },
  { feature: "Registered Agent", basic: false, essential: false, professional: true },
  { feature: "Dedicated Manager", basic: false, essential: false, professional: true },
  { feature: "Priority Support", basic: false, essential: false, professional: true },
];

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);
  const discount = 0.12; // 12% savings for annual

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
    <Layout>
      {/* Header Section */}
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold text-secondary-foreground md:text-5xl">
            Simple, Transparent <span className="text-primary">Pricing</span>
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Choose the plan that fits your business needs. All plans include our
            core virtual office features with no hidden fees.
          </p>
        </div>
      </section>

      {/* Billing Toggle */}
      <section className="py-8">
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
                  tier.popular && "border-primary shadow-lg scale-105"
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
          <h2 className="mb-8 text-center text-3xl font-bold text-foreground">
            Feature Comparison
          </h2>
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

      {/* FAQ CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold text-foreground">
            Have Questions?
          </h2>
          <p className="mb-6 text-muted-foreground">
            Our team is here to help you find the right plan for your business.
          </p>
          <Button variant="outline" asChild>
            <Link to="/contact">Contact Sales</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
