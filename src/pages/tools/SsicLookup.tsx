import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronRight, Search, Copy, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { searchSsic } from "@/lib/ssicCodes";
import { findTool } from "@/lib/tools";

const FAQS = [
  {
    q: "What is an SSIC code?",
    a: "The Singapore Standard Industrial Classification (SSIC) is the national classification system used by ACRA, IRAS, and other government agencies to classify business activities. Every Singapore Pte Ltd must declare at least one (primary) SSIC code when registering, and may declare a secondary code.",
  },
  {
    q: "How many SSIC codes can I have for one company?",
    a: "ACRA allows up to two SSIC codes per company — one primary (your main activity) and one secondary (an optional related activity). You can update them anytime via BizFile by filing a change of business activity.",
  },
  {
    q: "What if my business doesn't fit neatly into one code?",
    a: "Pick the code that best describes your dominant revenue source as primary. Many founders use 'n.e.c.' (not elsewhere classified) categories like 74909 or 70201 when their activity is consultancy-flavoured but specialised. Generic e-commerce should use 47914.",
  },
  {
    q: "Does my SSIC code affect taxes or licensing?",
    a: "Yes. Some SSIC codes trigger licence requirements (food, finance, employment agencies, education, healthcare). The code also informs IRAS sector benchmarking and certain grant eligibility (e.g. PSG, EDG). Always check if your code requires a licence before incorporating.",
  },
];

export default function SsicLookup() {
  const tool = findTool("ssic-code-lookup")!;
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchSsic(query), [query]);

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(`Copied SSIC ${code}`);
    } catch {
      toast.error("Couldn't copy — long-press to copy manually.");
    }
  };

  useEffect(() => {
    const url = `https://www.tasatrust.com${tool.path}`;
    const add = (data: Record<string, unknown>) => {
      const s = document.createElement("script");
      s.type = "application/ld+json";
      s.dataset.toolSeo = "true";
      s.textContent = JSON.stringify(data);
      document.head.appendChild(s);
      return s;
    };
    const scripts = [
      add({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: tool.title,
        url,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "SGD" },
      }),
      add({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://www.tasatrust.com/" },
          { "@type": "ListItem", position: 2, name: "Tools", item: "https://www.tasatrust.com/tools" },
          { "@type": "ListItem", position: 3, name: tool.navLabel, item: url },
        ],
      }),
      add({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FAQS.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }),
    ];
    return () => scripts.forEach((s) => s.remove());
  }, [tool]);

  return (
    <Layout>
      <section className="bg-secondary py-12 text-secondary-foreground">
        <div className="container mx-auto px-4">
          <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-2 text-xs text-white/65">
            <Link to="/" className="hover:text-white">Home</Link>
            <ChevronRight className="size-3" />
            <Link to="/tools" className="hover:text-white">Tools</Link>
            <ChevronRight className="size-3" />
            <span className="text-white/90">{tool.navLabel}</span>
          </nav>
          <div className="flex items-start gap-4">
            <div className="hidden size-12 shrink-0 items-center justify-center rounded-lg bg-primary/15 sm:inline-flex">
              <Search className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold leading-tight md:text-4xl">
                SSIC Code Lookup
              </h1>
              <p className="mt-3 text-white/75">
                Search the Singapore Standard Industrial Classification (SSIC 2020) codes used by
                ACRA for company registration. Click any code to copy it.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <Card className="surface-panel">
              <CardHeader>
                <CardTitle className="text-secondary">Search by activity, keyword, or code</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ssic-search">Search</Label>
                  <Input
                    id="ssic-search"
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. software, ecommerce, consultancy, 62012"
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground">
                    Showing {results.length} of {searchSsic("").length} curated codes most commonly
                    used for incorporation.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 space-y-3">
              {results.length === 0 && (
                <p className="rounded-lg border border-dashed border-border p-6 text-center text-muted-foreground">
                  No matches. Try a broader term (e.g. "consult", "retail", "tech") or check the{" "}
                  <a
                    href="https://www.singstat.gov.sg/standards/standards-and-classifications/ssic"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    full SSIC catalogue
                  </a>
                  .
                </p>
              )}
              {results.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => copyCode(c.code)}
                  className="group flex w-full items-start justify-between gap-4 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-primary/50 hover:bg-muted/40"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-bold text-primary">{c.code}</span>
                      <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                        {c.section}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-secondary">{c.title}</p>
                  </div>
                  <Copy className="mt-0.5 size-4 shrink-0 text-muted-foreground group-hover:text-primary" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted/40 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold text-secondary md:text-3xl">
              How to pick the right SSIC code
            </h2>
            <div className="prose mt-5 max-w-none text-muted-foreground">
              <p>
                Your <strong>primary SSIC code</strong> should describe the activity that generates
                most of your revenue. A secondary code can be added for a related side-activity (for
                example, a software company that also offers IT consulting might pair 62012 +
                62021).
              </p>
              <p>
                A wrong SSIC code is fixable — you can update it through BizFile after incorporation
                — but picking the right one upfront saves licensing surprises. Codes for regulated
                sectors (financial services, employment agencies, F&B, healthcare, education) often
                require a separate licence from MAS, MOM, SFA, MOH, or CPE.
              </p>
              <p>
                If your activity isn't listed in this curated set, the{" "}
                <a
                  href="https://www.singstat.gov.sg/standards/standards-and-classifications/ssic"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  full SSIC 2020 catalogue
                </a>{" "}
                from SingStat has every code — or talk to us and we'll match the right one for your
                business model.
              </p>
            </div>

            <h2 className="mt-12 text-2xl font-bold text-secondary md:text-3xl">
              Frequently asked questions
            </h2>
            <Accordion type="single" collapsible className="mt-6">
              {FAQS.map((f, i) => (
                <AccordionItem key={f.q} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left text-base font-semibold text-secondary">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="mt-10 rounded-xl border border-primary/30 bg-primary/5 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                Incorporating with TASA Trust?
              </p>
              <p className="mt-2 text-secondary">
                We'll help you pick the right SSIC code, file the incorporation with ACRA, and set
                up your corporate secretary and registered address — usually within 24 hours.
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="gap-2">
                  <Link to="/startup-kit/register-company-singapore">
                    Register a Singapore company <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/contact">Talk to us</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
