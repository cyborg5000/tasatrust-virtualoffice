import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Wrench } from "lucide-react";
import { tools, TOOLS_BASE } from "@/lib/tools";

export default function Tools() {
  useEffect(() => {
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.dataset.toolsHubSeo = "true";
    s.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Free Singapore Business Tools",
      description:
        "Free calculators and lookup tools for Singapore businesses — income tax calculator, GST calculator, SSIC code lookup.",
      url: "https://www.tasatrust.com/tools",
      hasPart: tools.map((t) => ({
        "@type": "WebApplication",
        name: t.title,
        url: `https://www.tasatrust.com${t.path}`,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "SGD" },
      })),
    });
    document.head.appendChild(s);
    return () => s.remove();
  }, []);

  return (
    <Layout>
      <section className="bg-secondary py-16 text-secondary-foreground">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-5 inline-flex size-12 items-center justify-center rounded-lg bg-primary/15">
              <Wrench className="size-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold leading-tight md:text-5xl">
              Free Singapore Business Tools
            </h1>
            <p className="mt-5 text-white/75 md:text-lg">
              Fast, IRAS- and ACRA-aligned calculators and lookups for Singapore founders, finance
              teams, and corporate secretaries. No sign-up required.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 md:grid-cols-3">
            {tools.map((tool) => (
              <Card key={tool.slug} className="surface-panel group flex h-full flex-col">
                <CardHeader>
                  <div className="mb-3 inline-flex size-10 items-center justify-center rounded-lg bg-primary/15">
                    <tool.icon className="size-4 text-primary" />
                  </div>
                  <CardTitle className="text-lg text-secondary">{tool.navLabel}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-between gap-4">
                  <p className="text-sm text-muted-foreground">{tool.blurb}</p>
                  <Link
                    to={tool.path}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2"
                  >
                    Open tool <ArrowRight className="size-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mx-auto mt-12 max-w-3xl rounded-xl border border-primary/30 bg-primary/5 p-6 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
              Setting up a Singapore company?
            </p>
            <p className="mt-2 text-secondary">
              TASA Trust handles incorporation, corporate secretary, registered address, and
              ongoing accounting — start with the Startup Kit.
            </p>
            <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild>
                <Link to="/startup-kit">Explore Startup Kit</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/contact">Talk to a Specialist</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export { TOOLS_BASE };
