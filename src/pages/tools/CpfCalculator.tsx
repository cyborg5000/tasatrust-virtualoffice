import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { findTool } from "@/lib/tools";
import { ToolShell, type Faq } from "@/components/tools/ToolShell";
import { CPF_BANDS, CPF_OW_CEILING, cpfForMonth, fmtSGD } from "@/lib/sgcalc";

const FAQS: Faq[] = [
  {
    q: "What are the CPF contribution rates in 2026?",
    a: "From 1 January 2026, for Singapore Citizens and PRs (3rd year onwards): 55 and below — 17% employer + 20% employee (37% total); above 55 to 60 — 16% + 18% (34%); above 60 to 65 — 12.5% + 12.5% (25%); above 65 to 70 — 9% + 7.5% (16.5%); above 70 — 7.5% + 5% (12.5%).",
  },
  {
    q: "What is the CPF Ordinary Wage ceiling in 2026?",
    a: "The monthly Ordinary Wage ceiling is S$8,000 from 1 January 2026. CPF is only payable on the first S$8,000 of your monthly ordinary wages.",
  },
  {
    q: "How is CPF on bonus (Additional Wage) calculated?",
    a: "Additional Wages such as bonuses are subject to CPF up to the annual Additional Wage ceiling: S$102,000 minus your annual Ordinary Wages subject to CPF. This calculator applies that ceiling automatically.",
  },
  {
    q: "Do these rates apply to new Permanent Residents?",
    a: "First- and second-year PRs contribute at graduated (lower) rates unless they and their employer jointly opt for full rates. This calculator shows the full rates that apply to citizens and 3rd-year-onwards PRs.",
  },
];

export default function CpfCalculator() {
  const tool = findTool("cpf-calculator")!;
  const [wage, setWage] = useState("5000");
  const [bonus, setBonus] = useState("0");
  const [band, setBand] = useState(0);

  const r = useMemo(
    () => cpfForMonth(Number(wage) || 0, band, Number(bonus) || 0),
    [wage, bonus, band]
  );

  return (
    <ToolShell
      tool={tool}
      heading="CPF Contribution Calculator (2026 Rates)"
      intro="Work out employer and employee CPF contributions with the 2026 rates and the S$8,000 Ordinary Wage ceiling — including bonus (Additional Wage) treatment."
      faqs={FAQS}
      ctaTitle="Payroll and CPF submissions handled for you"
      ctaBody="TASA Trust runs payroll, CPF submissions and statutory filings for Singapore SMEs — so every contribution is right, every month."
      ctaHref="/services"
      ctaLabel="See payroll & accounting services"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="surface-panel">
          <CardHeader><CardTitle className="text-lg">Your inputs</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="wage">Monthly ordinary wage (S$)</Label>
              <Input id="wage" type="number" min="0" value={wage} onChange={(e) => setWage(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="bonus">Bonus / Additional Wage this month (S$)</Label>
              <Input id="bonus" type="number" min="0" value={bonus} onChange={(e) => setBonus(e.target.value)} />
            </div>
            <div>
              <Label>Employee age band</Label>
              <div className="mt-2 grid gap-2">
                {CPF_BANDS.map((b, i) => (
                  <button
                    key={b.label}
                    type="button"
                    onClick={() => setBand(i)}
                    className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                      band === i ? "border-primary bg-primary/10 font-semibold" : "border-border hover:border-primary/40"
                    }`}
                  >
                    {b.label} — {Math.round(b.employer * 1000) / 10}% + {Math.round(b.employee * 1000) / 10}%
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="surface-panel">
          <CardHeader><CardTitle className="text-lg">Monthly contribution</CardTitle></CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt>Wages subject to CPF</dt><dd className="font-semibold">{fmtSGD(r.owSubject + r.awSubject)}</dd></div>
              {Number(wage) > CPF_OW_CEILING && (
                <p className="rounded-md bg-primary/10 p-2 text-xs">
                  Ordinary Wage capped at {fmtSGD(CPF_OW_CEILING)} (2026 ceiling).
                </p>
              )}
              <div className="flex justify-between"><dt>Employer contribution ({Math.round(r.band.employer * 1000) / 10}%)</dt><dd className="font-semibold">{fmtSGD(r.employer)}</dd></div>
              <div className="flex justify-between"><dt>Employee contribution ({Math.round(r.band.employee * 1000) / 10}%)</dt><dd className="font-semibold">{fmtSGD(r.employee)}</dd></div>
              <div className="flex justify-between border-t border-border pt-3 text-base"><dt className="font-semibold">Total to CPF</dt><dd className="font-bold text-primary">{fmtSGD(r.total)}</dd></div>
              <div className="flex justify-between"><dt>Employee take-home</dt><dd className="font-semibold">{fmtSGD(r.takeHome)}</dd></div>
              <div className="flex justify-between"><dt>Total employer cost</dt><dd className="font-semibold">{fmtSGD(r.employerCost)}</dd></div>
            </dl>
            <p className="mt-4 text-xs text-muted-foreground">
              2026 rates for Singapore Citizens / SPRs (3rd year+), private sector. Additional Wage ceiling applied assuming this ordinary wage all year.
            </p>
          </CardContent>
        </Card>
      </div>
    </ToolShell>
  );
}
