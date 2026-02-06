import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { PricingSection } from "@/components/pricing/PricingSection";
import { FileText, Calculator, Receipt, CheckCircle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const valueProps = [
  {
    icon: FileText,
    title: "Corporate Secretary",
    description:
      "Every company must appoint a company secretary within 6 months of its incorporation. We handle all administrative and reporting responsibilities.",
  },
  {
    icon: Calculator,
    title: "Accounting Services",
    description:
      "Cloud accounting based system to help business owners keep proper records. Check your company's financial health wherever, whenever.",
  },
  {
    icon: Receipt,
    title: "GST & Tax Submissions",
    description:
      "Expert team familiar with Singapore tax regulations. We help maximise your tax savings while abiding to statutory requirements.",
  },
];

const features = [
  "Corporate secretary services",
  "Bookkeeping & accounting",
  "Un-audited reports",
  "Taxation services",
  "XBRL submissions",
  "Payroll management",
  "GST submissions",
  "AIS submissions",
];

export default function Index() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-secondary py-20 lg:py-32">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-secondary-foreground md:text-5xl lg:text-6xl">
              Trusted{" "}
              <span className="text-primary">Accountants</span>
            </h1>
            <p className="mb-4 text-lg font-medium text-primary md:text-xl">
              PROFESSIONAL SERVICE OF THE HIGHEST QUALITY
            </p>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              A Team of Accountability, Skilled and Agility ("TASA"). 
              Your trusted partner for all corporate, accounting, and compliance needs in Singapore.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild className="gap-2">
                <a href="#pricing">
                  View Pricing
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              All-in-1 Services
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Complete corporate solutions for your business. From incorporation to 
              accounting, we handle it all so you can focus on growing your business.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {valueProps.map((prop) => (
              <Card
                key={prop.title}
                className="border-border bg-card transition-shadow hover:shadow-lg"
              >
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <prop.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{prop.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {prop.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-bold text-foreground md:text-4xl">
                Comprehensive Business Services
              </h2>
              <p className="mb-8 text-muted-foreground">
                Whether you're a startup or established business, our comprehensive 
                services are tailored to Trading, Service, Catering, Retail, and Healthcare industries.
              </p>
              <ul className="grid gap-4 sm:grid-cols-2">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 flex-shrink-0 text-primary" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="mt-8 gap-2" asChild>
                <a href="#pricing">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-8">
                <div className="h-full w-full rounded-xl bg-card shadow-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-secondary py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-secondary-foreground md:text-4xl">
            Ready to Get Started?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
            Join hundreds of businesses that trust TASA Trust for their 
            corporate and accounting needs. Let us handle the paperwork.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              asChild
            >
              <a href="#pricing">View Plans</a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-primary text-primary hover:bg-primary/10"
            >
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
