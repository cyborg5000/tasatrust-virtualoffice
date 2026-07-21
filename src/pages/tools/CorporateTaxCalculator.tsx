import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { findTool } from "@/lib/tools";
import { ToolShell, type Faq } from "@/components/tools/ToolShell";
import { corporateTax, fmtSGD } from "@/lib/sgcalc";

const FAQS: Faq[] = [
  { q: "What is the corporate tax rate in Singapore?", a: "A flat 17% on chargeable income — before exemptions. With the Partial Tax Exemption, the first S$200,000 is partially exempt (75% of the first S$10,000 and 50% of the next S$190,000), so effective rates are well below 17% for SMEs." },
  { q: "What is the Start-Up Tax Exemption (SUTE)?", a: "Qualifying new companies get 75% exemption on the first S$100,000 and 50% on the next S$100,000 of chargeable income for their first three Years of Assessment. Investment-holding and property-development companies do not qualify." },
  { q: "Does this calculator include YA rebates?", a: "No. Budget-announced Corporate Income Tax rebates change year to year, so this calculator shows the standard position (17% with PTE or SUTE). Any rebate for a specific YA would reduce the figure further." },
  { q: "When are corporate taxes filed?", a: "Estimated Chargeable Income (ECI) is due within 3 months of financial year end (unless waived), and Form C-S/C by 30 November each year." },
];

export default function CorporateTaxCalculator() {
  const tool = findTool("corporate-tax-calculator")!;
  const [ci, setCi] = useState("200000");
  const [sute, setSute] = useState(false);
  const r = useMemo(() => corporateTax(Number(ci) || 0, sute), [ci, sute]);

  return (
    <ToolShell tool={tool}
      heading="Corporate Tax Calculator Singapore (17% with Exemptions)"
      intro="Estimate your company's Singapore income tax with the Partial Tax Exemption or Start-Up Exemption applied automatically."
      faqs={FAQS}
      ctaTitle="Tax filing without the headache"
      ctaBody="TASA Trust prepares your ECI and Form C-S, unaudited financial statements and keeps your books IRAS-ready all year."
      ctaHref="/services" ctaLabel="See tax & accounting services">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="surface-panel">
          <CardHeader><CardTitle className="text-lg">Inputs</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Chargeable income (S$)</Label><Input type="number" min="0" value={ci} onChange={(e) => setCi(e.target.value)} /></div>
            <div className="flex items-center gap-2">
              <input id="sute" type="checkbox" checked={sute} onChange={(e) => setSute(e.target.checked)} />
              <Label htmlFor="sute">Qualifying start-up (first 3 YAs — SUTE)</Label>
            </div>
          </CardContent>
        </Card>
        <Card className="surface-panel">
          <CardHeader><CardTitle className="text-lg">Estimated tax</CardTitle></CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              {r.lines.map((l, i) => (
                <div key={i} className="flex justify-between text-muted-foreground"><dt>{l.label}</dt><dd>− {fmtSGD(l.amount)}</dd></div>
              ))}
              <div className="flex justify-between border-t border-border pt-2"><dt>Taxable after exemption</dt><dd className="font-semibold">{fmtSGD(r.taxable)}</dd></div>
              <div className="flex justify-between text-base"><dt className="font-bold">Tax @ 17%</dt><dd className="font-bold text-primary">{fmtSGD(r.tax)}</dd></div>
              <div className="flex justify-between"><dt>Effective rate</dt><dd>{(r.effectiveRate * 100).toFixed(2)}%</dd></div>
            </dl>
            <p className="mt-3 text-xs text-muted-foreground">Excludes YA-specific CIT rebates. For planning only — confirm with your tax agent.</p>
          </CardContent>
        </Card>
      </div>
    </ToolShell>
  );
}
