import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { PricingSection } from "@/components/pricing/PricingSection";
import { Building, Calculator, FileText, Users, ArrowRight, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import heroOffice from "@/assets/hero-office.jpg";
import workspaceProfessional from "@/assets/workspace-professional.jpg";

const coreServices = [
  {
    icon: Building,
    title: "Corporate Services",
    description: "Company incorporation, registered office address, and corporate secretary services.",
  },
  {
    icon: Calculator,
    title: "Accounting & Bookkeeping",
    description: "Cloud-based accounting, financial statements, and XBRL filing.",
  },
  {
    icon: FileText,
    title: "Taxation Services",
    description: "Corporate tax filing, GST registration, and compliance.",
  },
  {
    icon: Users,
    title: "Payroll Services",
    description: "Monthly payroll processing and HR functions for your team.",
  },
];

const whyChooseUs = [
  "Expert team familiar with Singapore regulations",
  "Competitive pricing with no hidden fees",
  "Dedicated account manager for personalized service",
  "Timely compliance and deadline reminders",
  "Cloud-based systems for real-time access",
  "Comprehensive corporate services under one roof",
];

const industries = [
  "Trading",
  "Service",
  "Catering",
  "Retail",
  "Healthcare",
];

export default function Index() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-secondary py-20 lg:py-32">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${heroOffice})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/90 via-secondary/70 to-secondary/50" />
        <div className="container relative mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary">
                Singapore's Trusted Corporate Services Provider
              </p>
              <h1 className="mb-6 text-4xl font-bold tracking-tight text-secondary-foreground md:text-5xl lg:text-6xl">
                Your Trusted{" "}
                <span className="text-primary">Corporate Partner</span>{" "}
                in Singapore
              </h1>
              <p className="mb-8 text-lg text-muted-foreground md:text-xl">
                From company incorporation to ongoing compliance, TASA Trust provides 
                comprehensive corporate services. We handle the paperwork so you 
                can focus on growing your business.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button size="lg" asChild className="gap-2">
                  <Link to="/contact">
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-primary text-primary hover:bg-primary/10">
                  <Link to="/services">View Services</Link>
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-4 rounded-2xl bg-primary/20 blur-2xl" />
                <img 
                  src={heroOffice} 
                  alt="Professional office space" 
                  className="relative rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Services Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              Our Core Services
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Comprehensive corporate services designed for businesses in Singapore.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {coreServices.map((service) => (
              <Card
                key={service.title}
                className="border-border bg-card transition-shadow hover:shadow-lg"
              >
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <service.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-bold text-foreground md:text-4xl">
                Why Choose TASA Trust?
              </h2>
              <p className="mb-8 text-muted-foreground">
                We are a team of Accountability, Skilled and Agility (TASA) — committed 
                to providing professional services of the highest quality for your business needs.
              </p>
              <ul className="grid gap-3 sm:grid-cols-2">
                {whyChooseUs.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 flex-shrink-0 text-primary" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <img 
                src={workspaceProfessional} 
                alt="Professional workspace" 
                className="rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Industries We Serve */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Industries We Serve
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {industries.map((industry) => (
              <div
                key={industry}
                className="rounded-full bg-secondary px-6 py-3 text-sm font-medium text-secondary-foreground"
              >
                {industry}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* CTA Section */}
      <section className="bg-secondary py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-secondary-foreground md:text-4xl">
            Ready to Get Started?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
            Contact us today for a free consultation. We'll help you find the right 
            services for your business needs.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link to="/contact">
                Contact Us
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-primary text-primary hover:bg-primary/10"
            >
              <a href="tel:+6584463191">Call +65 8446 3191</a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
