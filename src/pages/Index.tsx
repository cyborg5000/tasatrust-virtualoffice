import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { BlogPreviewSection } from "@/components/blog/BlogPreviewSection";
import { Button } from "@/components/ui/button";
import { PricingSection } from "@/components/pricing/PricingSection";
import { MapPin, Mail, Phone, Building, CheckCircle2, ArrowRight, Shield, Clock3, Globe2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import heroOffice from "@/assets/hero-office.jpg";
import workspaceProfessional from "@/assets/workspace-professional.jpg";
import businessHandshake from "@/assets/business-handshake.jpg";

const virtualOfficeFeatures = [
  {
    icon: MapPin,
    title: "Prestigious Business Address",
    description:
      "Establish your business presence with a professional Singapore address for registration and market credibility.",
  },
  {
    icon: Mail,
    title: "Mail Handling & Forwarding",
    description:
      "We receive, scan, and forward your official correspondence so your business stays responsive wherever you are.",
  },
  {
    icon: Phone,
    title: "Professional Call Handling",
    description:
      "Dedicated business call support with your company name and clear forwarding workflows.",
  },
];

const benefits = [
  "Use for ACRA company registration",
  "Professional correspondence address",
  "Mail scanning and forwarding",
  "Call answering in your company name",
  "Meeting room access when needed",
  "No long-term lease commitments",
  "Flexible monthly plans",
  "Instant setup and onboarding",
];

const trustedBy = ["Startups", "Freelancers", "SMEs", "Remote Teams", "Overseas Companies", "E-Commerce"];

const trustHighlights = [
  { icon: Building, title: "Professional Image", description: "Build credibility with a premium Singapore address." },
  { icon: Shield, title: "Privacy Protection", description: "Keep your personal residential address private." },
  { icon: Clock3, title: "Fast Setup", description: "Get started in as little as 24 hours." },
  { icon: Globe2, title: "Work Anywhere", description: "Operate remotely while maintaining local presence." },
];

export default function Index() {
  return (
    <Layout>
      <section className="relative isolate overflow-hidden py-16 lg:py-28">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroOffice})` }} aria-hidden="true" />
        <div className="hero-overlay absolute inset-0" aria-hidden="true" />

        <div className="container relative mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="animate-fade-up">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                Singapore's Trusted Virtual Office Provider
              </p>
              <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
                Your Professional <span className="text-primary">Business Address</span> in Singapore
              </h1>
              <p className="mt-6 max-w-2xl text-base text-white/80 md:text-lg">
                Build a reliable business presence without traditional office overhead. Get a premium address, secure
                mail handling, and professional call support in one package.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild className="gap-2">
                  <a href="#pricing">
                    Get Your Address Today
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-white/45 bg-white/10 text-white hover:bg-white/20">
                  <Link to="/contact">Book a Consultation</Link>
                </Button>
              </div>

              <div className="mt-7 grid gap-2 text-sm text-white/75 sm:grid-cols-3">
                <p>Instant setup</p>
                <p>No lock-in contracts</p>
                <p>Cancel anytime</p>
              </div>
            </div>

            <div className="animate-fade-up lg:justify-self-end">
              <div className="surface-panel overflow-hidden border-white/30 bg-white/15 p-3 backdrop-blur-md">
                <img src={heroOffice} alt="Professional office space" className="h-full w-full rounded-xl object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <BlogPreviewSection />

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-secondary md:text-4xl">Everything Your Business Needs</h2>
            <p className="mt-4 text-muted-foreground">
              A complete virtual office stack designed for founders, remote operators, and companies entering
              Singapore.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {virtualOfficeFeatures.map((feature) => (
              <Card key={feature.title} className="surface-panel border-white/70 bg-white/90">
                <CardHeader>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/15">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl text-secondary">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-muted-foreground">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold text-secondary md:text-4xl">Why Choose Our Virtual Office?</h2>
              <p className="mt-5 text-muted-foreground">
                Join businesses that trust TASA Trust for credible market entry and daily operations support.
              </p>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-2.5 rounded-lg bg-muted/60 px-3 py-2">
                    <CheckCircle2 className="h-4.5 w-4.5 flex-shrink-0 text-primary" />
                    <span className="text-sm text-secondary">{benefit}</span>
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
              <img src={workspaceProfessional} alt="Professional workspace" className="rounded-2xl shadow-xl" />
              <div className="surface-panel absolute -bottom-6 -right-1 hidden max-w-sm p-5 xl:block">
                <div className="space-y-4">
                  {trustHighlights.map((item) => (
                    <div key={item.title} className="flex items-start gap-3">
                      <div className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/15">
                        <item.icon className="h-4.5 w-4.5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-secondary">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PricingSection />

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Trusted by Businesses Across Industries
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {trustedBy.map((industry) => (
              <div key={industry} className="surface-panel flex items-center justify-center p-4">
                <span className="text-sm font-semibold text-secondary/80">{industry}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${businessHandshake})` }} aria-hidden="true" />
        <div className="absolute inset-0 bg-secondary/85" aria-hidden="true" />

        <div className="container relative mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">Need More Than a Virtual Address?</h2>
          <p className="mx-auto mt-5 max-w-2xl text-white/80">
            We also support incorporation, accounting, taxation, and corporate secretarial services so you can run the
            full back-office from one trusted partner.
          </p>
          <Button size="lg" variant="outline" asChild className="mt-8 border-white/50 bg-white/10 text-white hover:bg-white/20">
            <Link to="/services" className="gap-2">
              Explore All Services
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl rounded-2xl border border-secondary/20 bg-secondary px-6 py-14 text-center text-secondary-foreground shadow-[0_24px_44px_-30px_hsl(var(--secondary)/0.95)] md:px-12">
            <h2 className="text-3xl font-bold md:text-4xl">Ready to Secure Your Singapore Address?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-white/75 md:text-base">
              Setup takes less than 24 hours. Start building your professional business presence today.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <a href="#pricing">Get Started Now</a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-white/60 bg-white text-secondary hover:bg-white/90"
              >
                <Link to="/contact">Schedule a Call</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
