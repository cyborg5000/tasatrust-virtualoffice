import { ReactNode, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight } from "lucide-react";
import { tools, type ToolMeta } from "@/lib/tools";

export type Faq = { q: string; a: string };

type ToolShellProps = {
  tool: ToolMeta;
  heading: string;
  intro: string;
  faqs: Faq[];
  children: ReactNode;
  ctaTitle?: string;
  ctaBody?: string;
  ctaHref?: string;
  ctaLabel?: string;
};

export function ToolShell({ tool, heading, intro, faqs, children, ctaTitle, ctaBody, ctaHref, ctaLabel }: ToolShellProps) {
  useEffect(() => {
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.dataset.toolSeo = tool.slug;
    s.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebApplication",
          name: tool.title,
          url: `https://www.tasatrust.com${tool.path}`,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          offers: { "@type": "Offer", price: "0", priceCurrency: "SGD" },
        },
        {
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        },
      ],
    });
    document.head.appendChild(s);
    return () => s.remove();
  }, [tool, faqs]);

  const related = tools.filter((t) => t.slug !== tool.slug).slice(0, 3);

  return (
    <Layout>
      <section className="bg-secondary py-14 text-secondary-foreground">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Free Singapore Business Tool
            </p>
            <h1 className="text-3xl font-bold leading-tight md:text-4xl">{heading}</h1>
            <p className="mt-4 text-white/75">{intro}</p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">{children}</div>
        </div>
      </section>

      <section className="bg-muted/50 py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 text-center text-2xl font-bold">
              Frequently Asked <span className="text-primary">Questions</span>
            </h2>
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((f, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="rounded-lg border border-border bg-card px-5">
                  <AccordionTrigger className="text-left font-semibold">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <Card className="surface-panel border-primary/30 bg-secondary text-secondary-foreground">
              <CardHeader>
                <CardTitle className="text-xl">
                  {ctaTitle || "Running a Singapore business? We handle the boring parts."}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-white/80">
                  {ctaBody ||
                    "TASA Trust provides ACRA-registered business addresses, corporate secretary, accounting and tax — from S$15.99/month, no lock-in."}
                </p>
                <Link
                  to={ctaHref || "/pricing"}
                  className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  {ctaLabel || "See plans & pricing"} <ArrowRight className="size-4" />
                </Link>
              </CardContent>
            </Card>

            <div className="mt-10">
              <h3 className="mb-4 text-lg font-semibold">More free tools</h3>
              <div className="grid gap-4 md:grid-cols-3">
                {related.map((t) => (
                  <Link
                    key={t.slug}
                    to={t.path}
                    className="rounded-lg border border-border bg-card p-4 text-sm font-medium transition-colors hover:border-primary/40"
                  >
                    {t.navLabel}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
