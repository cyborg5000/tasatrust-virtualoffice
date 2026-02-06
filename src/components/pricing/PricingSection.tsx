import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingTier {
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  popular?: boolean;
  freeGift?: string;
  features: string[];
}

const pricingTiers: PricingTier[] = [
  {
    name: "Basic",
    description: "Essential virtual office services",
    monthlyPrice: 17.99,
    annualPrice: 15.99,
    features: [
      "Business Address",
      "Mail Alerts",
      "Digital Mail Scans",
      "Business Registration Use",
      "0 hrs Meeting Room",
    ],
  },
  {
    name: "Essential",
    description: "Everything you need with meeting room access",
    monthlyPrice: 18.99,
    annualPrice: 16.99,
    popular: true,
    features: [
      "Everything in Basic",
      "Mail Forwarding",
      "4 hrs Meeting Room/month",
      "Professional Meeting Space",
    ],
  },
  {
    name: "Professional",
    description: "Complete solution with exclusive benefits",
    monthlyPrice: 26.90,
    annualPrice: 24.90,
    freeGift: "FREE Website",
    features: [
      "Everything in Essential",
      "8 hrs Meeting Room/month",
      "**FREE Website**",
      "Priority Support",
    ],
  },
];

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true); // Default to annual

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
            core virtual office features with no hidden fees.
          </p>
        </div>
      </section>

      {/* Billing Toggle */}
      <section className="pb-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-4">
            <span
              className={cn(
                "text-sm font-medium cursor-pointer",
                isAnnual ? "text-muted-foreground" : "text-primary"
              )}
              onClick={() => setIsAnnual(false)}
            >
              Monthly
            </span>
            <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
            <span
              className={cn(
                "text-sm font-medium cursor-pointer",
                isAnnual ? "text-primary" : "text-muted-foreground"
              )}
              onClick={() => setIsAnnual(true)}
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
                {tier.freeGift && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 mt-6">
                    🎁 {tier.freeGift}
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  {/* Dynamic Price Display */}
                  <div className="mb-4 text-center">
                    <span className="text-4xl font-bold text-primary">
                      ${isAnnual ? tier.annualPrice : tier.monthlyPrice}
                    </span>
                    <span className="text-muted-foreground">/mo</span>
                    {isAnnual && (
                      <p className="text-sm text-muted-foreground mt-1">
                        billed annually
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="h-5 w-5 flex-shrink-0 text-primary mt-0.5" />
                        <span 
                          className="text-sm text-foreground"
                          dangerouslySetInnerHTML={{
                            __html: feature.replace(/\*\*(.*?)\*\*/g, '<strong class="text-amber-500 font-semibold">$1</strong>')
                          }}
                        />
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
    </>
  );
}
