import { useEffect } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight, ArrowLeft, ChevronRight, Check } from "lucide-react";
import { startupKitPillars, STARTUP_KIT_BASE } from "@/lib/startupKit";

export default function StartupKitSpoke() {
  const { slug } = useParams<{ slug: string }>();
  const pillar = startupKitPillars.find((p) => p.slug === slug);

  useEffect(() => {
    if (!pillar) return;
    const url = `https://www.tasatrust.com${pillar.path}`;
    const add = (data: Record<string, unknown>) => {
      const s = document.createElement("script");
      s.type = "application/ld+json";
      s.dataset.startupKitSpokeSeo = "true";
      s.textContent = JSON.stringify(data);
      document.head.appendChild(s);
      return s;
    };
    const scripts = [
      add({
        "@context": "https://schema.org",
        "@type": "Article",
        headline: pillar.h1,
        description: pillar.metaDescription,
        image: `https://www.tasatrust.com${pillar.image}`,
        url,
        about: pillar.primaryKeyword,
        keywords: [pillar.primaryKeyword, ...pillar.subKeywords].join(", "),
        author: { "@type": "Organization", name: "TASA Trust Pte. Ltd." },
        publisher: { "@type": "Organization", name: "TASA Trust Pte. Ltd." },
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
          { "@type": "ListItem", position: 3, name: pillar.navLabel, item: url },
        ],
      }),
      add({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: pillar.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }),
    ];
    return () => scripts.forEach((s) => s.remove());
  }, [pillar]);

  if (!pillar) {
    return <Navigate to={STARTUP_KIT_BASE} replace />;
  }

  const otherPillars = startupKitPillars.filter((p) => p.slug !== pillar.slug).slice(0, 3);

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-secondary py-16 text-secondary-foreground">
        <div className="container mx-auto px-4">
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex flex-wrap items-center gap-2 text-xs text-white/65"
          >
            <Link to="/" className="hover:text-white">Home</Link>
            <ChevronRight className="size-3" />
            <Link to={STARTUP_KIT_BASE} className="hover:text-white">Startup Kit</Link>
            <ChevronRight className="size-3" />
            <span className="text-white/90">{pillar.navLabel}</span>
          </nav>
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <div className="mb-5 inline-flex size-12 items-center justify-center rounded-lg bg-primary/15">
                <pillar.icon className="size-5 text-primary" />
              </div>
              <h1 className="text-3xl font-bold leading-tight md:text-5xl">{pillar.h1}</h1>
              <p className="mt-5 text-white/75 md:text-lg">{pillar.intro}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild className="gap-2">
                  <Link to="/contact">
                    Talk to a Specialist
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-white/50 bg-white/10 text-white hover:bg-white/20"
                >
                  <Link to="/pricing?bundle=startup">See Startup Kit Pricing</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
                <img
                  src={pillar.image}
                  alt={pillar.imageAlt}
                  width={1280}
                  height={720}
                  className="aspect-[16/9] w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 hidden rounded-xl bg-primary px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground shadow-lg lg:block">
                TASA Trust · Singapore
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Long-form content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1fr_260px]">
            <article className="space-y-10">
              {pillar.sections.map((section) => (
                <div key={section.heading}>
                  <h2 className="text-2xl font-bold text-secondary md:text-3xl">
                    {section.heading}
                  </h2>
                  <p className="mt-4 text-muted-foreground md:text-lg">{section.body}</p>
                  {section.bullets && (
                    <ul className="mt-5 space-y-3">
                      {section.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-3">
                          <span className="mt-1 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                            <Check className="size-3" />
                          </span>
                          <span className="text-secondary">{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}

              <div className="rounded-xl border border-primary/30 bg-primary/5 p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                  Ready to start?
                </p>
                <p className="mt-2 text-secondary">
                  Get the entire Startup Kit — incorporation, corporate secretary, registered
                  address, accounting, and a launch-ready website — under one fee.
                </p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <Button asChild className="gap-2">
                    <Link to="/contact">Book a Call</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to={STARTUP_KIT_BASE} className="gap-2">
                      <ArrowLeft className="size-4" /> Back to Startup Kit
                    </Link>
                  </Button>
                </div>
              </div>
            </article>

            {/* Sidebar: related search topics for SEO + UX */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-xl border border-border bg-muted/30 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Also searched
                </p>
                <ul className="mt-3 space-y-2 text-sm">
                  {pillar.subKeywords.map((kw) => (
                    <li key={kw}>
                      <Link
                        to={STARTUP_KIT_BASE}
                        className="text-secondary hover:text-primary"
                      >
                        {kw}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="bg-muted/40 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-2xl font-bold text-secondary md:text-3xl">
              Frequently asked questions
            </h2>
            <Accordion type="single" collapsible className="mt-8">
              {pillar.faqs.map((f, i) => (
                <AccordionItem key={f.q} value={`faq-${i}`}>
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

      {/* Other pillars */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-secondary md:text-3xl">
              Continue the founder journey
            </h2>
            <p className="mt-3 text-muted-foreground">
              Each pillar of the Startup Kit connects to the next.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {otherPillars.map((p) => (
              <Card key={p.slug} className="surface-panel group border-white/70 bg-white/90">
                <CardHeader>
                  <div className="mb-3 inline-flex size-10 items-center justify-center rounded-lg bg-primary/15">
                    <p.icon className="size-4 text-primary" />
                  </div>
                  <CardTitle className="text-lg text-secondary">{p.navLabel}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{p.hubBlurb}</p>
                  <Link
                    to={p.path}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2"
                  >
                    {p.navLabel} <ArrowRight className="size-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
