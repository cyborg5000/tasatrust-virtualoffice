import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { PricingSection } from "@/components/pricing/PricingSection";
import { MapPin, Mail, Phone, Building, CheckCircle, ArrowRight, Shield, Clock, Globe } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import heroOffice from "@/assets/hero-office.jpg";
import workspaceProfessional from "@/assets/workspace-professional.jpg";
import businessHandshake from "@/assets/business-handshake.jpg";

const virtualOfficeFeatures = [
  {
    icon: MapPin,
    title: "Prestigious Business Address",
    description:
      "Establish your business presence with a professional Singapore address. Perfect for company registration and building credibility.",
  },
  {
    icon: Mail,
    title: "Mail Handling & Forwarding",
    description:
      "We receive, scan, and forward your business mail. Never miss important correspondence wherever you are.",
  },
  {
    icon: Phone,
    title: "Professional Call Handling",
    description:
      "Dedicated phone answering with your company name. Calls forwarded directly to you or take messages professionally.",
  },
];

const benefits = [
  "Use for ACRA company registration",
  "Professional business correspondence address",
  "Mail scanning and forwarding service",
  "Call answering in your company name",
  "Meeting room access when needed",
  "No long-term lease commitments",
  "Flexible monthly plans",
  "Instant setup — start today",
];

const trustedBy = [
  "Startups",
  "Freelancers",
  "SMEs",
  "Remote Teams",
  "Overseas Companies",
  "E-Commerce",
];

export default function Index() {
  return (
    <Layout>
      {/* Hero Section - Virtual Office Focus */}
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
                Singapore's Trusted Virtual Office Provider
              </p>
              <h1 className="mb-6 text-4xl font-bold tracking-tight text-secondary-foreground md:text-5xl lg:text-6xl">
                Your Professional{" "}
                <span className="text-primary">Business Address</span>{" "}
                in Singapore
              </h1>
              <p className="mb-8 text-lg text-muted-foreground md:text-xl">
                Establish your business presence without the overhead. Get a prestigious 
                Singapore address, mail handling, and professional call answering — 
                everything you need to build credibility and grow.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button size="lg" asChild className="gap-2">
                  <a href="#pricing">
                    Get Your Address Today
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-primary text-primary hover:bg-primary/10">
                  <Link to="/contact">Talk to Us</Link>
                </Button>
              </div>
              <p className="mt-6 text-sm text-muted-foreground">
                ✓ Instant setup &nbsp; ✓ No long-term contracts &nbsp; ✓ Cancel anytime
              </p>
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

      {/* Why Virtual Office Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              Everything Your Business Needs
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              A virtual office gives you the professional presence of a physical office 
              without the costs. Perfect for startups, remote teams, and businesses expanding to Singapore.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {virtualOfficeFeatures.map((feature) => (
              <Card
                key={feature.title}
                className="border-border bg-card transition-shadow hover:shadow-lg"
              >
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-bold text-foreground md:text-4xl">
                Why Choose Our Virtual Office?
              </h2>
              <p className="mb-8 text-muted-foreground">
                Join hundreds of businesses that trust TASA Trust for their professional 
                presence in Singapore. We make it easy to start and grow your business.
              </p>
              <ul className="grid gap-3 sm:grid-cols-2">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 flex-shrink-0 text-primary" />
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
              <Button className="mt-8 gap-2" asChild>
                <a href="#pricing">
                  View Plans & Pricing
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
            <div className="relative">
              <img 
                src={workspaceProfessional} 
                alt="Professional workspace" 
                className="rounded-2xl shadow-xl"
              />
              <div className="absolute -bottom-6 -right-6 rounded-2xl bg-secondary p-6 shadow-xl">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Building className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-secondary-foreground">Professional Image</h4>
                      <p className="text-sm text-muted-foreground">
                        Project credibility with a real Singapore business address
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-secondary-foreground">Privacy Protection</h4>
                      <p className="text-sm text-muted-foreground">
                        Keep your home address private on public registers
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-secondary-foreground">Instant Setup</h4>
                      <p className="text-sm text-muted-foreground">
                        Start using your address within 24 hours
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Globe className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-secondary-foreground">Work From Anywhere</h4>
                      <p className="text-sm text-muted-foreground">
                        Manage your business remotely with full flexibility
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* Trusted By Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Trusted by Businesses Across Industries
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
            {trustedBy.map((industry) => (
              <div
                key={industry}
                className="flex items-center justify-center rounded-lg bg-muted/50 p-6"
              >
                <span className="text-sm font-medium text-muted-foreground">
                  {industry}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* More Services Teaser */}
      <section className="relative overflow-hidden py-20">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${businessHandshake})` }}
        />
        <div className="absolute inset-0 bg-background/90" />
        <div className="container relative mx-auto px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl">
            Need More Than a Virtual Address?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
            TASA Trust offers comprehensive corporate services including company incorporation, 
            accounting, taxation, and more. Let us handle the paperwork while you focus on growing your business.
          </p>
          <Button size="lg" variant="outline" asChild>
            <Link to="/services" className="gap-2">
              Explore All Services
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-secondary py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-secondary-foreground md:text-4xl">
            Ready to Get Your Singapore Address?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
            Join hundreds of businesses using TASA Trust Virtual Office. 
            Setup takes less than 24 hours — start building your professional presence today.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <a href="#pricing">Get Started Now</a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-primary text-primary hover:bg-primary/10"
            >
              <Link to="/contact">Schedule a Call</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
