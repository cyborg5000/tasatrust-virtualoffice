import { useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { findTool } from "@/lib/tools";
import { ToolShell, type Faq } from "@/components/tools/ToolShell";
import { SaveGate } from "@/components/tools/SaveGate";
import { CPF_BANDS, cpfForMonth, fmtSGD } from "@/lib/sgcalc";

const FAQS: Faq[] = [
  { q: "Are itemised payslips mandatory in Singapore?", a: "Yes. Under the Employment Act, employers must issue itemised payslips to all employees covered by the Act, together with payment or within three working days, showing items such as basic salary, allowances, deductions, overtime and net pay." },
  { q: "What must an itemised payslip include?", a: "MOM requires: employer and employee names, payment date(s), basic salary (with rate and hours for hourly/daily workers), salary period, allowances, other additional payments, deductions (including employee CPF), overtime hours and pay, and net salary." },
  { q: "Does this payslip calculate CPF automatically?", a: "Yes — the employee CPF deduction is computed at the 2026 rates for the selected age band, with the S$8,000 Ordinary Wage ceiling applied. Employer CPF is shown for record, though it is not a payslip deduction." },
];

export default function PayslipGenerator() {
  const tool = findTool("payslip-generator")!;
  const [employer, setEmployer] = useState("");
  const [employee, setEmployee] = useState("");
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7));
  const [payDate, setPayDate] = useState(new Date().toISOString().slice(0, 10));
  const [basic, setBasic] = useState("4000");
  const [allowances, setAllowances] = useState("0");
  const [overtime, setOvertime] = useState("0");
  const [otherDeductions, setOtherDeductions] = useState("0");
  const [band, setBand] = useState(0);

  const calc = useMemo(() => {
    const gross = (Number(basic) || 0) + (Number(allowances) || 0) + (Number(overtime) || 0);
    const cpf = cpfForMonth(gross, band);
    const net = gross - cpf.employee - (Number(otherDeductions) || 0);
    return { gross, cpf, net };
  }, [basic, allowances, overtime, otherDeductions, band]);

  const downloadPdf = () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    let y = 20;
    doc.setFont("helvetica", "bold").setFontSize(16).text("ITEMISED PAYSLIP", 105, y, { align: "center" });
    y += 12;
    doc.setFontSize(10).setFont("helvetica", "normal");
    const row = (label: string, value: string, bold = false) => {
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.text(label, 20, y); doc.text(value, 190, y, { align: "right" }); y += 7;
    };
    row("Employer", employer || "-"); row("Employee", employee || "-");
    row("Salary period", period); row("Date of payment", payDate);
    y += 3; doc.setDrawColor(180); doc.line(20, y, 190, y); y += 8;
    row("Basic salary", fmtSGD(Number(basic) || 0));
    row("Allowances", fmtSGD(Number(allowances) || 0));
    row("Overtime pay", fmtSGD(Number(overtime) || 0));
    row("Gross pay", fmtSGD(calc.gross), true);
    y += 2;
    row(`Employee CPF (${Math.round(calc.cpf.band.employee * 1000) / 10}%)`, `- ${fmtSGD(calc.cpf.employee)}`);
    row("Other deductions", `- ${fmtSGD(Number(otherDeductions) || 0)}`);
    y += 2; doc.line(20, y, 190, y); y += 8;
    doc.setFontSize(12); row("NET PAY", fmtSGD(calc.net), true);
    doc.setFontSize(9); y += 4;
    row(`Employer CPF contribution (${Math.round(calc.cpf.band.employer * 1000) / 10}%) — for record`, fmtSGD(calc.cpf.employer));
    doc.setFontSize(8).setTextColor(150).text("Generated free at tasatrust.com/tools — 2026 CPF rates", 20, 285);
    doc.save(`payslip-${period}-${(employee || "employee").replace(/\s+/g, "-")}.pdf`);
  };

  return (
    <ToolShell tool={tool}
      heading="Payslip Generator — MOM-Compliant Itemised Payslips"
      intro="Generate an itemised payslip with the 2026 CPF deduction computed automatically — download as PDF."
      faqs={FAQS}
      ctaTitle="Payroll run monthly, payslips included"
      ctaBody="TASA Trust runs payroll end-to-end: itemised payslips, CPF submissions, SDL and IR8A — from one flat monthly fee."
      ctaHref="/services" ctaLabel="See payroll services">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="surface-panel">
          <CardHeader><CardTitle className="text-lg">Payslip details</CardTitle></CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div><Label>Employer</Label><Input value={employer} onChange={(e) => setEmployer(e.target.value)} /></div>
            <div><Label>Employee</Label><Input value={employee} onChange={(e) => setEmployee(e.target.value)} /></div>
            <div><Label>Salary period</Label><Input type="month" value={period} onChange={(e) => setPeriod(e.target.value)} /></div>
            <div><Label>Payment date</Label><Input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} /></div>
            <div><Label>Basic salary (S$)</Label><Input type="number" min="0" value={basic} onChange={(e) => setBasic(e.target.value)} /></div>
            <div><Label>Allowances (S$)</Label><Input type="number" min="0" value={allowances} onChange={(e) => setAllowances(e.target.value)} /></div>
            <div><Label>Overtime pay (S$)</Label><Input type="number" min="0" value={overtime} onChange={(e) => setOvertime(e.target.value)} /></div>
            <div><Label>Other deductions (S$)</Label><Input type="number" min="0" value={otherDeductions} onChange={(e) => setOtherDeductions(e.target.value)} /></div>
            <div className="md:col-span-2">
              <Label>Age band (for CPF)</Label>
              <select className="mt-1 w-full rounded-md border border-border bg-background p-2 text-sm" value={band} onChange={(e) => setBand(Number(e.target.value))}>
                {CPF_BANDS.map((b, i) => <option key={b.label} value={i}>{b.label}</option>)}
              </select>
            </div>
          </CardContent>
        </Card>
        <Card className="surface-panel">
          <CardHeader><CardTitle className="text-lg">Summary</CardTitle></CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt>Gross pay</dt><dd className="font-semibold">{fmtSGD(calc.gross)}</dd></div>
              <div className="flex justify-between"><dt>Employee CPF</dt><dd>− {fmtSGD(calc.cpf.employee)}</dd></div>
              <div className="flex justify-between"><dt>Other deductions</dt><dd>− {fmtSGD(Number(otherDeductions) || 0)}</dd></div>
              <div className="flex justify-between border-t border-border pt-2 text-base"><dt className="font-bold">Net pay</dt><dd className="font-bold text-primary">{fmtSGD(calc.net)}</dd></div>
              <div className="flex justify-between text-muted-foreground"><dt>Employer CPF (record)</dt><dd>{fmtSGD(calc.cpf.employer)}</dd></div>
            </dl>
            <div className="mt-4"><SaveGate toolSlug="payslip-generator" onUnlocked={downloadPdf} label="Download payslip PDF" /></div>
          </CardContent>
        </Card>
      </div>
    </ToolShell>
  );
}
