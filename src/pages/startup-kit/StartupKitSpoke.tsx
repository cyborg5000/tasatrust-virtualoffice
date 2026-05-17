import { useEffect } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, ChevronRight } from "lucide-react";
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
        url,
        about: pillar.primaryKeyword,
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
    ];
    return () => scripts.forEach((s) => s.remove());
  }, [pillar]);

  if (!pillar) {
    return <Navigate to={STARTUP_KIT_BASE} replace />;
  }

  const otherPillars = startupKitPillars.filter((p) => p.slug !== pillar.slug).slice(0, 3);

  return (
    <Layout>
      <section className="bg-secondary py-16 text-secondary-foreground">
        <div className="container mx-auto px-4">
          <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-xs text-white/65">
            <Link to="/" className="hover:text-white">Home</Link>
            <ChevronRight className="size-3" />
            <Link to={STARTUP_KIT_BASE} className="hover:text-white">Startup Kit</Link>
            <ChevronRight className="size-3" />
            <span className="text-white/90">{pillar.navLabel}</span>
          </nav>
          <div className="mx-auto max-w-3xl">
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
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl space-y-6 text-muted-foreground">
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                Deep-dive guide coming soon
              </p>
              <p className="mt-2 text-secondary">
                We're publishing a full step-by-step guide for <strong>{pillar.primaryKeyword}</strong>. In the
                meantime, our team can walk you through every step on a 30-minute call — no obligation.
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
          </div>
        </div>
      </section>

      <section className="bg-muted/40 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-secondary md:text-3xl">Continue the founder journey</h2>
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
                <CardContent>
                  <p className="text-sm text-muted-foreground">{p.hubBlurb}</p>
                  <Link
                    to={p.path}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2"
                  >
                    Learn more <ArrowRight className="size-4" />
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
