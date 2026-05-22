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
import { ChevronRight, Receipt, ArrowRight } from "lucide-react";
import { findTool } from "@/lib/tools";

const GST_RATE = 0.09;

const fmt = (n: number) =>
  n.toLocaleString("en-SG", { style: "currency", currency: "SGD", maximumFractionDigits: 2 });

const FAQS = [
  {
    q: "What is the current GST rate in Singapore?",
    a: "The Singapore Goods and Services Tax (GST) rate is 9%, effective from 1 January 2024. It was raised in two steps: from 7% to 8% on 1 Jan 2023, then from 8% to 9% on 1 Jan 2024.",
  },
  {
    q: "When must a Singapore company register for GST?",
    a: "Compulsory GST registration applies when your taxable turnover exceeds S$1 million in a calendar year, or you reasonably expect it to. Voluntary registration is also allowed if you make taxable supplies but are below the threshold.",
  },
  {
    q: "How do I extract GST from a GST-inclusive price?",
    a: "Divide the GST-inclusive amount by 1.09 to get the net amount. The GST is then the difference (net × 9%). This calculator does both — toggle to 'Remove GST' to extract.",
  },
  {
    q: "Does GST apply to all sales?",
    a: "No. Exports of goods and international services are zero-rated (0%). Financial services, the sale and lease of residential property, and the supply of investment precious metals are exempt. Standard-rated supplies (most local sales) are charged at 9%.",
  },
];

export default function GstCalculator() {
  const tool = findTool("gst-calculator")!;
  const [amount, setAmount] = useState<string>("1000");
  const [mode, setMode] = useState<"add" | "remove">("add");

  const result = useMemo(() => {
    const n = Math.max(0, Number(amount) || 0);
    if (mode === "add") {
      const gst = n * GST_RATE;
      return { net: n, gst, gross: n + gst };
    }
    const net = n / (1 + GST_RATE);
    const gst = n - net;
    return { net, gst, gross: n };
  }, [amount, mode]);

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
              <Receipt className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold leading-tight md:text-4xl">
                Singapore GST Calculator (9%)
              </h1>
              <p className="mt-3 text-white/75">
                Add 9% GST to a net price, or extract GST from a GST-inclusive amount. Reflects the
                current Singapore rate effective 1 January 2024.
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
                <CardTitle className="text-secondary">Your amount</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs value={mode} onValueChange={(v) => setMode(v as "add" | "remove")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="add">Add GST (net → gross)</TabsTrigger>
                    <TabsTrigger value="remove">Remove GST (gross → net)</TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="space-y-2">
                  <Label htmlFor="amount">
                    {mode === "add" ? "Net amount (SGD)" : "GST-inclusive amount (SGD)"}
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {[100, 500, 1000, 5000, 10000].map((preset) => (
                    <Button
                      key={preset}
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount(String(preset))}
                    >
                      ${preset.toLocaleString()}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="surface-panel border-primary/40">
              <CardHeader>
                <CardTitle className="text-secondary">Result</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-border bg-muted/40 p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Net (before GST)</span>
                    <span className="font-medium text-secondary">{fmt(result.net)}</span>
                  </div>
                  <div className="mt-2 flex justify-between text-sm">
                    <span className="text-muted-foreground">GST @ 9%</span>
                    <span className="font-medium text-primary">{fmt(result.gst)}</span>
                  </div>
                  <div className="mt-3 flex justify-between border-t border-border pt-3 text-base">
                    <span className="font-semibold text-secondary">Total (incl. GST)</span>
                    <span className="text-xl font-bold text-secondary">{fmt(result.gross)}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Rate updated to 9% effective 1 January 2024. Display GST separately on tax invoices
                  to remain IRAS-compliant.
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
              How GST works in Singapore
            </h2>
            <div className="prose mt-5 max-w-none text-muted-foreground">
              <p>
                Singapore's <strong>Goods and Services Tax (GST)</strong> is a broad-based
                consumption tax on the supply of goods and services. It's similar to VAT in other
                countries. The current rate is <strong>9%</strong> after two staged increases (7% →
                8% in 2023, 8% → 9% in 2024).
              </p>
              <p>
                Businesses must register for GST when their taxable turnover exceeds{" "}
                <strong>S$1 million</strong> in a calendar year, or when they reasonably expect to
                cross that threshold. Once registered, you charge 9% on standard-rated supplies, can
                claim input tax credits, and file GST returns quarterly via myTax Portal.
              </p>
              <p>
                Use this calculator for quote-building, invoice preparation, and quick checks. For
                actual filing, work from your accounting system's GST report and reconcile against
                your bank.
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
                Need GST registration or filing?
              </p>
              <p className="mt-2 text-secondary">
                TASA Trust handles GST registration, quarterly returns, and IRAS correspondence for
                Singapore companies.
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="gap-2">
                  <Link to="/startup-kit/accounting-tax">
                    See accounting & tax <ArrowRight className="size-4" />
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
