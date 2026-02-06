import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
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
      "FREE Website Build",
      "Priority Support",
    ],
  },
];

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true); // Default to annual

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-secondary py-16 text-secondary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            Transparent <span className="text-primary">Pricing</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Choose the perfect virtual office solution for your business. 
            No hidden fees, no surprises.
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Billing Toggle */}
          <div className="mb-12 flex items-center justify-center gap-4">
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

          {/* Pricing Cards */}
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
                  {/* Pricing Display */}
                  <div className="mb-4 space-y-1 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm text-muted-foreground">Monthly:</span>
                      <span className={cn(
                        "text-lg font-bold",
                        !isAnnual ? "text-primary" : "text-muted-foreground"
                      )}>${tier.monthlyPrice}/mo</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm text-muted-foreground">Annual:</span>
                      <span className={cn(
                        "text-lg font-bold",
                        isAnnual ? "text-primary" : "text-muted-foreground"
                      )}>${tier.annualPrice}/mo</span>
                    </div>
                  </div>

                  {/* Meeting Hours */}
                  <div className="mb-3 text-center">
                    <span className="text-sm font-medium">
                      {tier.name === 'Basic' ? 'Meeting Hours: 0' : 
                       tier.name === 'Essential' ? 'Meeting Hours: 4 hrs/mo' : 
                       'Meeting Hours: 8 hrs/mo'}
                    </span>
                  </div>

                  {/* Gift */}
                  {tier.freeGift && (
                    <div className="mb-3 text-center">
                      <span className="text-sm font-medium text-amber-500">
                        Gift: {tier.freeGift}
                      </span>
                    </div>
                  )}

                  {/* Features */}
                  <ul className="space-y-3 mt-4">
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

      {/* FAQ Section */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-center text-3xl font-bold">
            Frequently Asked <span className="text-primary">Questions</span>
          </h2>
          <div className="mx-auto max-w-3xl space-y-4">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-2 font-semibold">Can I change plans later?</h3>
              <p className="text-sm text-muted-foreground">
                Yes! You can upgrade or downgrade your plan at any time. 
                Changes will be prorated accordingly.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-2 font-semibold">What payment methods do you accept?</h3>
              <p className="text-sm text-muted-foreground">
                We accept all major credit cards, bank transfers, and PayNow 
                for Singapore-based clients.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-2 font-semibold">Is there a contract?</h3>
              <p className="text-sm text-muted-foreground">
                Monthly plans are on a month-to-month basis. Annual plans 
                are billed annually but offer significant savings.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-2 font-semibold">What happens to unused meeting hours?</h3>
              <p className="text-sm text-muted-foreground">
                Unused meeting hours do not roll over to the next month. 
                Consider upgrading your plan if you need more hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to Get Started?</h2>
          <p className="mx-auto mb-8 max-w-xl text-muted-foreground">
            Choose your plan and start building your professional presence today.
          </p>
          <Button size="lg" asChild>
            <Link to="/signup">Start Your Free Trial</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
