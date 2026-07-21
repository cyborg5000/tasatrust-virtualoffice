// One builder, two tools: employment-contract-template and tenancy-agreement-template.
// Form -> generated document -> save-gated PDF download. Reference templates, not legal advice.
import { useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { findTool } from "@/lib/tools";
import { ToolShell, type Faq } from "@/components/tools/ToolShell";
import { SaveGate } from "@/components/tools/SaveGate";

export type TemplateMode = "employment" | "tenancy";

const META: Record<TemplateMode, { slug: string; heading: string; intro: string; faqs: Faq[] }> = {
  employment: {
    slug: "employment-contract-template",
    heading: "Employment Contract Template — Singapore (Free Builder)",
    intro: "Fill in the key employment terms (KETs) and download a clean Singapore employment contract template as PDF.",
    faqs: [
      { q: "What are Key Employment Terms (KETs)?", a: "MOM requires employers to issue written KETs to employees covered by the Employment Act within 14 days of start: job title and duties, start date, working hours, salary and payment period, CPF, leave entitlements, notice period and more. This template covers the standard KETs." },
      { q: "Is this template legally binding?", a: "A signed contract based on this template creates binding obligations, but it is a general reference — it is not legal advice. Have unusual arrangements (commissions, restraints, equity) reviewed professionally." },
      { q: "What is the minimum annual leave in Singapore?", a: "Employees covered by the Employment Act get at least 7 days of paid annual leave in the first year, rising by one day per year of service up to 14 days. Most employers offer 14 or more contractually." },
    ],
  },
  tenancy: {
    slug: "tenancy-agreement-template",
    heading: "Tenancy Agreement Template — Singapore (Free Builder)",
    intro: "Generate a straightforward Singapore tenancy agreement for residential or office premises and download it as PDF.",
    faqs: [
      { q: "Does a tenancy agreement need to be stamped?", a: "Yes — tenancy agreements must be stamped with IRAS within 14 days of signing (in Singapore). Lease duty is computed on the rent; e-stamping is done via the IRAS portal." },
      { q: "What deposit is standard?", a: "Commonly one month's rent per year of lease (e.g. two months for a two-year lease), refundable at the end less any damages beyond fair wear and tear." },
      { q: "Is this suitable for commercial premises?", a: "It covers standard office/shop lets at a basic level. Complex commercial leases (fit-out, service charges, assignment rights) should be reviewed by a lawyer." },
    ],
  },
};

export default function TemplateBuilder({ mode }: { mode: TemplateMode }) {
  const meta = META[mode];
  const tool = findTool(meta.slug)!;
  const [a, setA] = useState(""); // employer / landlord
  const [b, setB] = useState(""); // employee / tenant
  const [role, setRole] = useState(""); // job title / premises address
  const [amount, setAmount] = useState(""); // salary / rent
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [termOrNotice, setTermOrNotice] = useState(mode === "employment" ? "1 month" : "12 months");

  const doc = useMemo(() => {
    if (mode === "employment") {
      return [
        `EMPLOYMENT AGREEMENT`,
        ``,
        `This Employment Agreement is made between ${a || "[Employer]"} ("the Employer") and ${b || "[Employee]"} ("the Employee").`,
        ``,
        `1. POSITION — The Employee is employed as ${role || "[Job Title]"}, commencing ${startDate}.`,
        `2. SALARY — The Employee's gross monthly salary is S$${amount || "[amount]"}, payable monthly, subject to CPF contributions as required by law.`,
        `3. HOURS OF WORK — Standard working hours as communicated by the Employer, in compliance with the Employment Act.`,
        `4. LEAVE — The Employee is entitled to annual leave, sick leave and public holidays in accordance with the Employment Act and company policy.`,
        `5. PROBATION — The first 3 months of employment are probationary unless otherwise stated.`,
        `6. TERMINATION — Either party may terminate with ${termOrNotice} written notice, or salary in lieu of notice.`,
        `7. CONFIDENTIALITY — The Employee shall keep the Employer's business information confidential during and after employment.`,
        `8. GOVERNING LAW — This Agreement is governed by the laws of Singapore.`,
        ``,
        `Signed:`,
        ``,
        `______________________          ______________________`,
        `${a || "[Employer]"}                     ${b || "[Employee]"}`,
      ].join("\n");
    }
    return [
      `TENANCY AGREEMENT`,
      ``,
      `This Tenancy Agreement is made between ${a || "[Landlord]"} ("the Landlord") and ${b || "[Tenant]"} ("the Tenant").`,
      ``,
      `1. PREMISES — The Landlord lets to the Tenant the premises at ${role || "[Premises Address]"}.`,
      `2. TERM — The tenancy is for ${termOrNotice}, commencing ${startDate}.`,
      `3. RENT — Monthly rent of S$${amount || "[amount]"}, payable in advance on the first day of each month.`,
      `4. DEPOSIT — A security deposit equal to one month's rent per year of term, refundable less lawful deductions.`,
      `5. USE — The premises shall be used only for the permitted purpose and kept in good condition, fair wear and tear excepted.`,
      `6. STAMPING — This agreement shall be stamped with IRAS within 14 days of signing.`,
      `7. GOVERNING LAW — This Agreement is governed by the laws of Singapore.`,
      ``,
      `Signed:`,
      ``,
      `______________________          ______________________`,
      `${a || "[Landlord]"}                     ${b || "[Tenant]"}`,
    ].join("\n");
  }, [mode, a, b, role, amount, startDate, termOrNotice]);

  const downloadPdf = () => {
    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    pdf.setFont("times", "normal").setFontSize(11);
    const lines = pdf.splitTextToSize(doc, 175);
    let y = 20;
    for (const line of lines) {
      if (y > 275) { pdf.addPage(); y = 20; }
      pdf.text(line, 18, y); y += 6;
    }
    pdf.setFontSize(8).setTextColor(150).text("Template generated at tasatrust.com/tools — reference only, not legal advice", 18, 288);
    pdf.save(`${meta.slug}.pdf`);
  };

  const labels = mode === "employment"
    ? { a: "Employer (company name)", b: "Employee name", role: "Job title", amount: "Monthly salary (S$)", term: "Notice period" }
    : { a: "Landlord", b: "Tenant", role: "Premises address", amount: "Monthly rent (S$)", term: "Lease term" };

  return (
    <ToolShell tool={tool} heading={meta.heading} intro={meta.intro} faqs={meta.faqs}
      ctaTitle="Documents, filings and compliance — handled"
      ctaBody="TASA Trust prepares resolutions, agreements and statutory filings as part of corporate secretarial service."
      ctaHref="/services" ctaLabel="See corp-sec services">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="surface-panel">
          <CardHeader><CardTitle className="text-lg">Details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>{labels.a}</Label><Input value={a} onChange={(e) => setA(e.target.value)} /></div>
            <div><Label>{labels.b}</Label><Input value={b} onChange={(e) => setB(e.target.value)} /></div>
            <div><Label>{labels.role}</Label><Input value={role} onChange={(e) => setRole(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>{labels.amount}</Label><Input type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
              <div><Label>Start date</Label><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
            </div>
            <div><Label>{labels.term}</Label><Input value={termOrNotice} onChange={(e) => setTermOrNotice(e.target.value)} /></div>
          </CardContent>
        </Card>
        <Card className="surface-panel">
          <CardHeader><CardTitle className="text-lg">Preview</CardTitle></CardHeader>
          <CardContent>
            <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-md border border-border bg-white p-4 font-serif text-xs text-gray-900">{doc}</pre>
            <div className="mt-4"><SaveGate toolSlug={meta.slug} onUnlocked={downloadPdf} label="Download PDF" /></div>
            <p className="mt-2 text-xs text-muted-foreground">Reference template — not legal advice.</p>
          </CardContent>
        </Card>
      </div>
    </ToolShell>
  );
}
