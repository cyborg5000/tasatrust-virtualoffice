import { Link, useSearchParams } from "react-router-dom";
import { useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const coreServices = [
  {
    category: "Corporate Services",
    icon: "🏢",
    services: [
      { name: "Corporate Secretary", description: "Nominee corporate secretary service for the year" },
      { name: "Company Incorporation", description: "Set up your new company in Singapore" },
      { name: "Registered Office Address", description: "Meet ACRA requirements with our address" },
    ],
  },
  {
    category: "Accounting & Bookkeeping",
    icon: "📊",
    services: [
      { name: "Bookkeeping", description: "Cloud-based accounting system for proper records" },
      { name: "Un-audited Financial Statements", description: "Annual financial statements preparation" },
      { name: "XBRL Filing", description: "Digital financial data submission to ACRA" },
    ],
  },
  {
    category: "Taxation Services",
    icon: "📋",
    services: [
      { name: "Corporate Tax Filing", description: "Tax computation and filing (Form C-S/ C)" },
      { name: "GST Registration & Filing", description: "GST registration and quarterly submissions" },
      { name: "AIS Submission", description: "Automated income statements to IRAS" },
    ],
  },
  {
    category: "Payroll Services",
    icon: "💼",
    services: [
      { name: "Payroll Processing", description: "Monthly payroll for your employees" },
      { name: "HR Functions", description: "Human resources management support" },
    ],
  },
  {
    category: "Virtual Office",
    icon: "🏠",
    services: [
      { name: "Business Address", description: "Prestigious address for your business" },
      { name: "Mail Handling", description: "Mail scanning and forwarding service" },
      { name: "Meeting Room", description: "Book our meeting room for client meetings" },
    ],
  },
];

export default function Services() {
  const [searchParams] = useSearchParams();
  const requestedCategory = (searchParams.get("cat") || "").toLowerCase();

  const categoryBySlug: Record<string, string> = {
    "virtual-office": "Virtual Office",
    accounting: "Accounting & Bookkeeping",
    tax: "Taxation Services",
    "corp-sec": "Corporate Services",
    payroll: "Payroll Services",
  };

  const filteredServices = useMemo(() => {
    if (!requestedCategory) return coreServices;
    const targetCategory = categoryBySlug[requestedCategory];
    if (!targetCategory) return coreServices;
    return coreServices.filter((item) => item.category === targetCategory);
  }, [requestedCategory]);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold text-secondary-foreground md:text-5xl">
            Our <span className="text-primary">Services</span>
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Comprehensive corporate services for businesses in Singapore. 
            From company incorporation to ongoing compliance, we've got you covered.
          </p>
        </div>
      </section>

      {/* Core Services Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="space-y-16">
            {filteredServices.map((category) => (
              <div key={category.category}>
                <div className="mb-6 flex items-center gap-3">
                  <span className="text-3xl">{category.icon}</span>
                  <h2 className="text-2xl font-bold text-foreground">
                    {category.category}
                  </h2>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {category.services.map((service) => (
                    <Card key={service.name} className="border-border bg-card">
                      <CardHeader>
                        <CardTitle className="text-lg">{service.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">
                          {service.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
            {filteredServices.length === 0 && (
              <div className="rounded-lg border border-dashed border-border p-8 text-center">
                <p className="text-muted-foreground">
                  No service category was found for this filter. Explore all available services below.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* All-in-1 Package CTA */}
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-secondary-foreground">
              All-in-1 Service Packages
            </h2>
            <p className="mb-6 text-muted-foreground">
              Get comprehensive coverage with our bundled packages. 
              Corporate Secretary, Bookkeeping, Taxation, XBRL, and more — all included.
            </p>
            <ul className="mb-8 inline-flex flex-wrap justify-center gap-4 text-sm">
              {[
                "Corporate Secretary*",
                "Bookkeeping*",
                "Un-Audited Report*",
                "Taxation*",
                "XBRL*",
                "GST Submission",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-primary">
                  <CheckCircle className="h-4 w-4" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mb-8 text-xs text-muted-foreground">
              * Subject to terms. Packages specially designed for Trading, Service, Catering, 
              Retail, and Healthcare industries.
            </p>
            <Button size="lg" asChild className="gap-2">
              <Link to="/contact">
                Contact Us for Pricing
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold text-foreground">
            Not Sure What You Need?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
            Our team is happy to discuss your requirements and recommend 
            the right services for your business.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild className="gap-2">
              <Link to="/contact">
                Schedule a Consultation
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="tel:+6584463191">Call +65 8446 3191</a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
