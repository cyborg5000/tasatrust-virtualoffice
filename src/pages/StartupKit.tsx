import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight, CheckCircle2, Rocket } from "lucide-react";
import { startupKitPillars, startupKitFaqs, STARTUP_KIT_BASE } from "@/lib/startupKit";

const includedHighlights = [
  "ACRA Pte Ltd incorporation in under 24 hours",
  "Named corporate secretary for the first year",
  "Singapore registered office address",
  "Cloud bookkeeping setup + GST registration",
  "Logo, brand kit & launch-ready website",
  "Nominee director available for foreigners",
];

export default function StartupKit() {
  useEffect(() => {
    const add = (data: Record<string, unknown>) => {
      const s = document.createElement("script");
      s.type = "application/ld+json";
      s.dataset.startupKitSeo = "true";
      s.textContent = JSON.stringify(data);
      document.head.appendChild(s);
      return s;
    };
    const scripts = [
      add({
        "@context": "https://schema.org",
        "@type": "Service",
        serviceType: "Startup Incorporation & Compliance Bundle",
        name: "TASA Trust Startup Kit",
        areaServed: { "@type": "Country", name: "Singapore" },
        provider: {
          "@type": "Organization",
          name: "TASA Trust Pte. Ltd.",
          url: "https://www.tasatrust.com",
        },
        description:
          "Everything a Singapore startup needs to launch: company registration, corporate secretary, registered office address, accounting, tax & GST, plus website and branding.",
      }),
      add({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://www.tasatrust.com/" },
          {
            "@type": "ListItem",
            position: 2,
            name: "Startup Kit",
            item: `https://www.tasatrust.com${STARTUP_KIT_BASE}`,
          },
        ],
      }),
      add({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: startupKitFaqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }),
    ];
    return () => scripts.forEach((s) => s.remove());
  }, []);

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-secondary py-20 text-secondary-foreground">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              <Rocket className="size-3.5" /> Startup Kit
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight md:text-5xl">
              Everything a Singapore <span className="text-primary">startup</span> needs — in one kit
            </h1>
            <p className="mt-5 text-white/75 md:text-lg">
              From ACRA incorporation to your launch-ready website. Register a company, appoint a corporate
              secretary, secure your business address, stay tax-compliant, and ship your brand — all from one
              trusted Singapore partner.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild className="gap-2">
                <Link to="/pricing?bundle=startup">
                  Get the Startup Kit
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-white/50 bg-white/10 text-white hover:bg-white/20"
              >
                <Link to="/contact">Talk to a Specialist</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Founder journey — 6 pillars */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-secondary md:text-4xl">
              The founder journey, end-to-end
            </h2>
            <p className="mt-4 text-muted-foreground">
              Six pillars cover every step from "I have an idea" to "we're taking orders." Click any pillar to
              dive deeper.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {startupKitPillars.map((pillar) => (
              <Card
                key={pillar.slug}
                className="surface-panel group border-white/70 bg-white/90 transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <CardHeader>
                  <div className="mb-4 inline-flex size-12 items-center justify-center rounded-lg bg-primary/15">
                    <pillar.icon className="size-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl text-secondary">{pillar.hubLabel}</CardTitle>
                </CardHeader>
                <CardContent className="flex h-full flex-col justify-between gap-4">
                  <CardDescription className="text-base text-muted-foreground">
                    {pillar.hubBlurb}
                  </CardDescription>
                  <Link
                    to={pillar.path}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors group-hover:gap-2"
                  >
                    {pillar.navLabel}
                    <ArrowRight className="size-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What's included + pricing teaser */}
      <section className="bg-muted/40 py-20">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold text-secondary md:text-4xl">
                One bundle. One fee. Zero ACRA headaches.
              </h2>
              <p className="mt-4 text-muted-foreground">
                Pick the Startup Kit and skip the four-vendor circus. We coordinate ACRA, IRAS, your registered
                address, and your launch website so you can stay focused on customers.
              </p>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {includedHighlights.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 rounded-lg bg-white/70 px-3 py-2 text-sm text-secondary"
                  >
                    <CheckCircle2 className="mt-0.5 size-4 flex-shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="gap-2">
                  <Link to="/pricing?bundle=startup">
                    See Startup Kit Pricing
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/contact">Request a Quote</Link>
                </Button>
              </div>
            </div>

            <Card className="surface-panel border-primary/30 bg-white/95">
              <CardHeader>
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  For founders setting up from overseas
                </span>
                <CardTitle className="mt-2 text-2xl text-secondary">
                  Foreigner-friendly incorporation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  100% foreign ownership is allowed in Singapore. We provide the nominee director, registered
                  office, and corporate secretary so you can incorporate without an Employment Pass or
                  relocating.
                </p>
                <Button asChild variant="secondary" className="gap-2">
                  <Link to={`${STARTUP_KIT_BASE}/foreigner-guide`}>
                    Read the foreigner setup guide
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-secondary md:text-4xl">
                Starting a business in Singapore — FAQs
              </h2>
              <p className="mt-3 text-muted-foreground">
                The questions founders ask us most often when registering a Singapore company.
              </p>
            </div>
            <Accordion type="single" collapsible className="surface-panel divide-y divide-border/60 px-6">
              {startupKitFaqs.map((f, i) => (
                <AccordionItem key={f.q} value={`faq-${i}`} className="border-0">
                  <AccordionTrigger className="text-left text-base font-semibold text-secondary">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl rounded-2xl border border-secondary/20 bg-secondary px-6 py-14 text-center text-secondary-foreground md:px-12">
            <h2 className="text-3xl font-bold md:text-4xl">Ready to launch your Singapore startup?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/75">
              Tell us your stage — idea, registering, or already trading — and we'll map your Startup Kit in a
              30-minute call.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link to="/contact">Book a 30-min Call</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-white/60 bg-white text-secondary hover:bg-white/90"
              >
                <Link to="/pricing?bundle=startup">View Pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
