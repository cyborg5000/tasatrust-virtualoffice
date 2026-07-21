import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { findTool } from "@/lib/tools";
import { ToolShell, type Faq } from "@/components/tools/ToolShell";
import { sdlForEmployee, fmtSGD } from "@/lib/sgcalc";

const FAQS: Faq[] = [
  {
    q: "What is the Skills Development Levy (SDL)?",
    a: "SDL is a statutory levy every Singapore employer pays on all employees — local and foreign, full-time, part-time or casual — on top of CPF contributions. It funds the Skills Development Fund that supports workforce training subsidies.",
  },
  {
    q: "How is SDL calculated?",
    a: "SDL is 0.25% of each employee's total monthly wages, subject to a minimum of S$2 (for wages of S$800 or less) and a maximum of S$11.25 (for wages of S$4,500 or more), per employee per month.",
  },
  {
    q: "Who must pay SDL and how?",
    a: "All employers must pay SDL monthly for every employee. It is normally paid together with CPF contributions through CPF EZPay; for employees not on CPF (e.g. foreigners), employers pay via the SSG portal.",
  },
];

export default function SdlCalculator() {
  const tool = findTool("sdl-calculator")!;
  const [wagesText, setWagesText] = useState("3000\n5000\n800");

  const rows = useMemo(() => {
    const wages = wagesText
      .split(/[\n,]+/)
      .map((s) => Number(s.trim()))
      .filter((n) => n > 0);
    const items = wages.map((w) => ({ wage: w, sdl: sdlForEmployee(w) }));
    return { items, total: items.reduce((s, i) => s + i.sdl, 0) };
  }, [wagesText]);

  return (
    <ToolShell
      tool={tool}
      heading="SDL Calculator — Skills Development Levy"
      intro="Enter each employee's monthly wage (one per line) and get the exact SDL payable: 0.25% per employee, minimum S$2, capped at S$11.25."
      faqs={FAQS}
      ctaTitle="Payroll, CPF and SDL — done for you monthly"
      ctaBody="TASA Trust handles payroll runs, CPF EZPay submissions and SDL so you never miss a statutory payment."
      ctaHref="/services"
      ctaLabel="See payroll services"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="surface-panel">
          <CardHeader><CardTitle className="text-lg">Employee monthly wages</CardTitle></CardHeader>
          <CardContent>
            <Label htmlFor="wages">One wage per line (S$)</Label>
            <Textarea id="wages" rows={8} value={wagesText} onChange={(e) => setWagesText(e.target.value)} />
          </CardContent>
        </Card>
        <Card className="surface-panel">
          <CardHeader><CardTitle className="text-lg">SDL payable</CardTitle></CardHeader>
          <CardContent>
            <div className="max-h-56 space-y-1 overflow-auto text-sm">
              {rows.items.map((r, i) => (
                <div key={i} className="flex justify-between border-b border-border/60 py-1">
                  <span>Employee {i + 1} — {fmtSGD(r.wage)}</span>
                  <span className="font-semibold">{fmtSGD(r.sdl)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between text-base">
              <span className="font-semibold">Total SDL this month ({rows.items.length} employees)</span>
              <span className="font-bold text-primary">{fmtSGD(rows.total)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolShell>
  );
}
