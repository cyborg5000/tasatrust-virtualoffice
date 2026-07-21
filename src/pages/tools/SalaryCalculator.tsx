import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { findTool } from "@/lib/tools";
import { ToolShell, type Faq } from "@/components/tools/ToolShell";
import { CPF_BANDS, cpfForMonth, fmtSGD } from "@/lib/sgcalc";

const FAQS: Faq[] = [
  {
    q: "How is take-home pay calculated in Singapore?",
    a: "Take-home pay is your gross monthly salary minus your employee CPF contribution (20% for those 55 and below in 2026, on wages up to the S$8,000 Ordinary Wage ceiling). Income tax is not deducted monthly in Singapore — it is assessed annually.",
  },
  {
    q: "How do I pro-rate salary for an incomplete month?",
    a: "The common MOM-aligned formula: monthly gross salary × (working days actually worked ÷ total working days in the month). This calculator uses that formula — set the working days for the month and the days worked.",
  },
  {
    q: "Does CPF apply to the pro-rated amount?",
    a: "Yes. CPF is computed on the actual wages payable for the month, so a pro-rated salary attracts CPF on the pro-rated amount.",
  },
];

export default function SalaryCalculator() {
  const tool = findTool("salary-calculator")!;
  const [gross, setGross] = useState("5000");
  const [band, setBand] = useState(0);
  const [workDays, setWorkDays] = useState("22");
  const [daysWorked, setDaysWorked] = useState("10");

  const full = useMemo(() => cpfForMonth(Number(gross) || 0, band), [gross, band]);
  const prorate = useMemo(() => {
    const g = Number(gross) || 0;
    const wd = Math.max(1, Number(workDays) || 1);
    const dw = Math.min(wd, Math.max(0, Number(daysWorked) || 0));
    const pro = (g * dw) / wd;
    return { pro, cpf: cpfForMonth(pro, band), wd, dw };
  }, [gross, band, workDays, daysWorked]);

  const bandPicker = (
    <div>
      <Label>Age band</Label>
      <div className="mt-2 flex flex-wrap gap-2">
        {CPF_BANDS.map((b, i) => (
          <button
            key={b.label}
            type="button"
            onClick={() => setBand(i)}
            className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${
              band === i ? "border-primary bg-primary/10 font-semibold" : "border-border hover:border-primary/40"
            }`}
          >
            {b.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <ToolShell
      tool={tool}
      heading="Salary Calculator Singapore — Take-Home Pay (2026)"
      intro="See your net take-home pay after employee CPF at the 2026 rates, the full employer cost, and pro-rated salary for incomplete months."
      faqs={FAQS}
    >
      <Tabs defaultValue="takehome">
        <TabsList className="mb-4">
          <TabsTrigger value="takehome">Take-home pay</TabsTrigger>
          <TabsTrigger value="prorate">Pro-rata salary</TabsTrigger>
        </TabsList>

        <TabsContent value="takehome">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="surface-panel">
              <CardHeader><CardTitle className="text-lg">Inputs</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="gross">Gross monthly salary (S$)</Label>
                  <Input id="gross" type="number" min="0" value={gross} onChange={(e) => setGross(e.target.value)} />
                </div>
                {bandPicker}
              </CardContent>
            </Card>
            <Card className="surface-panel">
              <CardHeader><CardTitle className="text-lg">Result</CardTitle></CardHeader>
              <CardContent>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between"><dt>Employee CPF</dt><dd className="font-semibold">− {fmtSGD(full.employee)}</dd></div>
                  <div className="flex justify-between border-t border-border pt-3 text-base"><dt className="font-semibold">Take-home pay</dt><dd className="font-bold text-primary">{fmtSGD(full.takeHome)}</dd></div>
                  <div className="flex justify-between"><dt>Employer CPF</dt><dd>{fmtSGD(full.employer)}</dd></div>
                  <div className="flex justify-between"><dt>Total cost to employer</dt><dd>{fmtSGD(full.employerCost)}</dd></div>
                </dl>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="prorate">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="surface-panel">
              <CardHeader><CardTitle className="text-lg">Inputs</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="gross2">Gross monthly salary (S$)</Label>
                  <Input id="gross2" type="number" min="0" value={gross} onChange={(e) => setGross(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="wd">Working days in month</Label>
                    <Input id="wd" type="number" min="1" max="31" value={workDays} onChange={(e) => setWorkDays(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="dw">Days worked</Label>
                    <Input id="dw" type="number" min="0" max="31" value={daysWorked} onChange={(e) => setDaysWorked(e.target.value)} />
                  </div>
                </div>
                {bandPicker}
              </CardContent>
            </Card>
            <Card className="surface-panel">
              <CardHeader><CardTitle className="text-lg">Pro-rated result</CardTitle></CardHeader>
              <CardContent>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between"><dt>Pro-rated gross ({prorate.dw}/{prorate.wd} days)</dt><dd className="font-semibold">{fmtSGD(prorate.pro)}</dd></div>
                  <div className="flex justify-between"><dt>Employee CPF</dt><dd>− {fmtSGD(prorate.cpf.employee)}</dd></div>
                  <div className="flex justify-between border-t border-border pt-3 text-base"><dt className="font-semibold">Take-home</dt><dd className="font-bold text-primary">{fmtSGD(prorate.cpf.takeHome)}</dd></div>
                </dl>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </ToolShell>
  );
}
