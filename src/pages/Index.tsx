import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Users, Briefcase, CheckCircle, ArrowRight } from "lucide-react";

const valueProps = [
  {
    icon: MapPin,
    title: "Virtual Business Address",
    description:
      "Establish your business presence with a prestigious address in prime locations. Perfect for startups and remote teams.",
  },
  {
    icon: Users,
    title: "Meeting Rooms",
    description:
      "Book professional meeting rooms on-demand. Impress clients with fully-equipped spaces when you need them.",
  },
  {
    icon: Briefcase,
    title: "Professional Image",
    description:
      "Project credibility with dedicated phone answering, mail handling, and a registered business address.",
  },
];

const clientLogos = [
  "TechCorp",
  "Innovate Inc",
  "StartupXYZ",
  "Global Solutions",
  "FutureTech",
  "Nexus Labs",
];

const features = [
  "Professional business address",
  "Mail handling & forwarding",
  "Phone answering service",
  "Meeting room access",
  "Registered agent service",
  "24/7 support",
];

export default function Index() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary via-secondary to-primary/20 py-20 lg:py-32">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-secondary-foreground md:text-5xl lg:text-6xl">
              Elevate Your{" "}
              <span className="text-primary">Business Presence</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              Establish credibility with a professional virtual office. Get a
              prestigious business address, meeting rooms, and dedicated support
              — without the overhead of traditional office space.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild className="gap-2">
                <Link to="/pricing">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/contact">Contact Sales</Link>
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
              Everything You Need to Succeed
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Our virtual office solutions give you the tools and services to
              project a professional image while keeping costs low.
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

      {/* Features Grid */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-bold text-foreground md:text-4xl">
                Professional Services for Modern Businesses
              </h2>
              <p className="mb-8 text-muted-foreground">
                Whether you're a startup, freelancer, or established business,
                our virtual office solutions scale with your needs.
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
                <Link to="/pricing">
                  View Pricing
                  <ArrowRight className="h-4 w-4" />
                </Link>
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

      {/* Social Proof Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Trusted by Leading Companies
            </p>
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">
              Join Thousands of Successful Businesses
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
            {clientLogos.map((logo) => (
              <div
                key={logo}
                className="flex items-center justify-center rounded-lg bg-muted/50 p-6"
              >
                <span className="text-lg font-semibold text-muted-foreground">
                  {logo}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-primary-foreground md:text-4xl">
            Ready to Get Started?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-primary-foreground/80">
            Join thousands of businesses that trust TasaTrust Virtual for their
            professional presence. Start your journey today.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              variant="secondary"
              asChild
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              <Link to="/pricing">View Plans</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Link to="/contact">Talk to Sales</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
