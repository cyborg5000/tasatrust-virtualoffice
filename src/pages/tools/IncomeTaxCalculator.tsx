import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChevronRight, Calculator, ArrowRight } from "lucide-react";
import { calculateResidentTax, calculateNonResidentTax } from "@/lib/incomeTax";
import { findTool } from "@/lib/tools";

const fmt = (n: number) =>
  n.toLocaleString("en-SG", { style: "currency", currency: "SGD", maximumFractionDigits: 2 });

const FAQS = [
  {
    q: "What tax year do these rates apply to?",
    a: "These are the IRAS personal income tax rates effective from Year of Assessment 2024 onwards. They apply to income earned in 2024 (filed in 2025) and remain in force until IRAS revises them.",
  },
  {
    q: "What counts as chargeable income?",
    a: "Chargeable income = total assessable income (employment, trade, rental, etc.) minus personal reliefs (Earned Income Relief, CPF, Spouse Relief, Qualifying Child Relief, course fees, etc.). Enter your chargeable income, not your gross salary, for an accurate figure.",
  },
  {
    q: "How is non-resident income taxed?",
    a: "Employment income earned by a non-resident is taxed at the higher of 15% flat OR the resident progressive rates. Director's fees, consultation fees, and most other income are taxed at a flat 24%.",
  },
  {
    q: "Are these the same rates used by IRAS?",
    a: "Yes — this calculator uses the official IRAS resident brackets (0% to 24%) and the standard non-resident rules. For complex cases (foreign-sourced income, reliefs, rebates), consult a tax professional.",
  },
];

export default function IncomeTaxCalculator() {
  const tool = findTool("income-tax-calculator")!;
  const [income, setIncome] = useState<string>("80000");
  const [mode, setMode] = useState<"resident" | "non-resident">("resident");

  const result = useMemo(() => {
    const n = Number(income) || 0;
    return mode === "resident" ? calculateResidentTax(n) : calculateNonResidentTax(n, true);
  }, [income, mode]);

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
        applicationCategory: "FinanceApplication",
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
              <Calculator className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold leading-tight md:text-4xl">
                Singapore Personal Income Tax Calculator
              </h1>
              <p className="mt-3 text-white/75">
                Calculate your Singapore personal income tax using the official IRAS rates for YA 2024
                onwards. Toggle between resident and non-resident.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_1.1fr]">
            <Card className="surface-panel">
              <CardHeader>
                <CardTitle className="text-secondary">Your income</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs value={mode} onValueChange={(v) => setMode(v as "resident" | "non-resident")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="resident">Tax resident</TabsTrigger>
                    <TabsTrigger value="non-resident">Non-resident</TabsTrigger>
                  </TabsList>
                  <TabsContent value="resident" className="pt-2 text-xs text-muted-foreground">
                    Tax residents are taxed on chargeable income at progressive rates from 0% to 24%.
                  </TabsContent>
                  <TabsContent value="non-resident" className="pt-2 text-xs text-muted-foreground">
                    Non-residents pay the higher of 15% flat or resident rates on employment income.
                  </TabsContent>
                </Tabs>

                <div className="space-y-2">
                  <Label htmlFor="income">Annual chargeable income (SGD)</Label>
                  <Input
                    id="income"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={1000}
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    placeholder="e.g. 80000"
                  />
                  <p className="text-xs text-muted-foreground">
                    Chargeable income = total income minus personal reliefs.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[40000, 80000, 120000, 200000, 320000].map((preset) => (
                    <Button
                      key={preset}
                      variant="outline"
                      size="sm"
                      onClick={() => setIncome(String(preset))}
                    >
                      ${preset.toLocaleString()}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="surface-panel border-primary/40">
              <CardHeader>
                <CardTitle className="text-secondary">Your tax</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Tax payable</p>
                    <p className="mt-1 text-2xl font-bold text-primary">{fmt(result.tax)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Take-home</p>
                    <p className="mt-1 text-2xl font-bold text-secondary">{fmt(result.takeHome)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Effective rate</p>
                    <p className="mt-1 text-lg font-semibold text-secondary">
                      {result.effectiveRate.toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Marginal rate</p>
                    <p className="mt-1 text-lg font-semibold text-secondary">{result.marginalRate}%</p>
                  </div>
                </div>

                {result.breakdown.length > 0 && (
                  <div className="rounded-lg border border-border bg-muted/40 p-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Bracket breakdown
                    </p>
                    <div className="space-y-1.5 text-sm">
                      {result.breakdown.map((b) => (
                        <div key={b.band} className="flex justify-between gap-4">
                          <span className="text-secondary">
                            {b.band} <span className="text-muted-foreground">@ {b.rate}%</span>
                          </span>
                          <span className="font-medium text-secondary">{fmt(b.tax)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Estimate only. Excludes reliefs already deducted (CPF, Earned Income, NSman, etc.) and
                  any parenthood/CPF top-up rebates. Always confirm with IRAS for your final assessment.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-muted/40 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold text-secondary md:text-3xl">
              How Singapore personal income tax works
            </h2>
            <div className="prose mt-5 max-w-none text-muted-foreground">
              <p>
                Singapore uses a progressive personal income tax system. Tax residents are taxed on
                their <strong>chargeable income</strong> — that's total income from employment,
                trade, rental, and other sources, minus personal reliefs such as Earned Income
                Relief, CPF Relief, Spouse Relief, Qualifying Child Relief, and course fees.
              </p>
              <p>
                The first <strong>S$20,000</strong> of chargeable income is tax-free. After that,
                rates step up through 13 bands, peaking at <strong>24%</strong> on income above
                S$1,000,000 (effective YA 2024). Most working professionals fall in the 7%–15%
                marginal range.
              </p>
              <p>
                <strong>Non-residents</strong> (less than 183 days in Singapore) are taxed
                differently: employment income at the higher of 15% or resident rates, and most
                other income at a flat 24%.
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
                Need help filing?
              </p>
              <p className="mt-2 text-secondary">
                TASA Trust handles personal and corporate tax filing for Singapore directors and
                their companies. Flat fees, no surprises.
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="gap-2">
                  <Link to="/contact">
                    Talk to a tax specialist <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/startup-kit/accounting-tax">Accounting, Tax & GST</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
