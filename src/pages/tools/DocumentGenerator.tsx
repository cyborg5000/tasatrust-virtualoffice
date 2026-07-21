// One engine, three tools: invoice-generator, quotation-generator, receipt-generator.
// Free to build + preview; DOWNLOAD is save-gated behind a free account (lead capture).
import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { findTool } from "@/lib/tools";
import { ToolShell, type Faq } from "@/components/tools/ToolShell";
import { SaveGate } from "@/components/tools/SaveGate";
import { buildPayNowPayload } from "@/lib/paynow";
import { fmtSGD } from "@/lib/sgcalc";

export type DocMode = "invoice" | "quotation" | "receipt";

const COPY: Record<DocMode, { slug: string; heading: string; intro: string; docTitle: string; numberLabel: string; faqs: Faq[] }> = {
  invoice: {
    slug: "invoice-generator",
    heading: "Free Invoice Generator — Singapore (GST + PayNow QR)",
    intro: "Create a professional Singapore invoice in minutes: 9% GST handling, your logo, and a scan-to-pay PayNow QR embedded on the PDF.",
    docTitle: "TAX INVOICE",
    numberLabel: "Invoice no.",
    faqs: [
      { q: "What must a Singapore invoice include?", a: "Your business name and UEN, an identifying invoice number and date, the customer's name, a description of goods or services, the amount payable, and if you are GST-registered: the GST amount shown separately, your GST registration number, and the words 'Tax Invoice'." },
      { q: "Can I charge GST if I am not GST-registered?", a: "No. Only GST-registered businesses may charge GST. If you are not registered, leave the GST toggle off — the invoice will show no GST line." },
      { q: "How does the PayNow QR on the invoice work?", a: "The generator encodes your UEN or mobile number, the invoice amount and the invoice number into a standard PayNow QR (SGQR/EMVCo format). Your customer scans it with any Singapore banking app and the transfer is pre-filled." },
      { q: "Is this invoice generator really free?", a: "Yes. Building and previewing is free with no account. Downloading the PDF uses a free TASA Trust account so your business details and documents are saved for next time." },
    ],
  },
  quotation: {
    slug: "quotation-generator",
    heading: "Free Quotation Generator — Singapore",
    intro: "Build a clean, professional quotation with your logo, itemised pricing and validity terms — download as PDF and send.",
    docTitle: "QUOTATION",
    numberLabel: "Quotation no.",
    faqs: [
      { q: "What should a quotation include?", a: "Your business details and UEN, a quotation number and date, the prospect's name, itemised descriptions with quantities and unit prices, the total, validity period, and any terms such as deposit or delivery." },
      { q: "Quotation vs invoice — what is the difference?", a: "A quotation is an offer of price before work is confirmed; an invoice is a request for payment after goods or services are delivered (or per agreed milestones). Once your quote is accepted, convert it into an invoice — this generator does both." },
      { q: "Is GST shown on quotations?", a: "If you are GST-registered, it is good practice to show whether prices include or exclude 9% GST — toggle GST on and the quotation shows it separately." },
    ],
  },
  receipt: {
    slug: "receipt-generator",
    heading: "Free Receipt Generator — Singapore",
    intro: "Issue a payment receipt in seconds — itemised, numbered, with your logo, ready to download as PDF.",
    docTitle: "RECEIPT",
    numberLabel: "Receipt no.",
    faqs: [
      { q: "When should I issue a receipt?", a: "Whenever a customer pays you — especially for cash or PayNow transfers where there is no card statement. A numbered receipt is your record and the customer's proof of payment." },
      { q: "What details go on a receipt?", a: "Your business name and UEN, receipt number and date, what was paid for, the amount received, the payment method, and any balance outstanding." },
    ],
  },
};

type LineItem = { desc: string; qty: string; price: string };

export default function DocumentGenerator({ mode }: { mode: DocMode }) {
  const c = COPY[mode];
  const tool = findTool(c.slug)!;
  const [bizName, setBizName] = useState("");
  const [bizUen, setBizUen] = useState("");
  const [bizAddr, setBizAddr] = useState("");
  const [logo, setLogo] = useState<string | null>(null);
  const [client, setClient] = useState("");
  const [docNo, setDocNo] = useState(`${mode === "invoice" ? "INV" : mode === "quotation" ? "QT" : "RCP"}-${new Date().getFullYear()}-001`);
  const [docDate, setDocDate] = useState(new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState<LineItem[]>([{ desc: "", qty: "1", price: "0" }]);
  const [gstOn, setGstOn] = useState(false);
  const [notes, setNotes] = useState(mode === "quotation" ? "Quotation valid for 14 days." : "");
  const [paynowOn, setPaynowOn] = useState(mode === "invoice");
  const [paynowProxy, setPaynowProxy] = useState("");
  const [paynowType, setPaynowType] = useState<"uen" | "mobile">("uen");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const totals = useMemo(() => {
    const sub = items.reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.price) || 0), 0);
    const gst = gstOn ? sub * 0.09 : 0;
    return { sub, gst, total: sub + gst };
  }, [items, gstOn]);

  useEffect(() => {
    let alive = true;
    if (paynowOn && paynowProxy.trim() && totals.total > 0) {
      const payload = buildPayNowPayload({
        proxyType: paynowType,
        proxyValue: paynowProxy,
        merchantName: bizName || "Business",
        amount: Math.round(totals.total * 100) / 100,
        editableAmount: false,
        reference: docNo,
      });
      QRCode.toDataURL(payload, { margin: 1, width: 220 }).then((url) => { if (alive) setQrDataUrl(url); });
    } else setQrDataUrl(null);
    return () => { alive = false; };
  }, [paynowOn, paynowProxy, paynowType, totals.total, bizName, docNo]);

  const onLogo = (f: File | null) => {
    if (!f) return setLogo(null);
    const r = new FileReader();
    r.onload = () => setLogo(String(r.result));
    r.readAsDataURL(f);
  };

  const downloadPdf = () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const W = 210; let y = 18;
    if (logo) { try { doc.addImage(logo, "PNG", 14, y - 6, 24, 24, undefined, "FAST"); } catch { /* unsupported format */ } }
    doc.setFont("helvetica", "bold").setFontSize(16).text(bizName || "Your Business", logo ? 42 : 14, y);
    doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(90);
    if (bizUen) doc.text(`UEN: ${bizUen}`, logo ? 42 : 14, y + 5);
    if (bizAddr) doc.text(bizAddr, logo ? 42 : 14, y + 10, { maxWidth: 90 });
    doc.setTextColor(20).setFont("helvetica", "bold").setFontSize(20).text(c.docTitle, W - 14, y, { align: "right" });
    doc.setFont("helvetica", "normal").setFontSize(10);
    doc.text(`${c.numberLabel} ${docNo}`, W - 14, y + 7, { align: "right" });
    doc.text(`Date: ${docDate}`, W - 14, y + 12, { align: "right" });
    y += 30;
    doc.setFont("helvetica", "bold").text(mode === "receipt" ? "Received from:" : "Bill to:", 14, y);
    doc.setFont("helvetica", "normal").text(client || "-", 14, y + 5, { maxWidth: 120 });
    y += 16;
    doc.setFillColor(11, 26, 74).setTextColor(255).setFont("helvetica", "bold").setFontSize(9);
    doc.rect(14, y, W - 28, 8, "F");
    doc.text("Description", 16, y + 5.5); doc.text("Qty", 140, y + 5.5); doc.text("Unit", 155, y + 5.5); doc.text("Amount", W - 16, y + 5.5, { align: "right" });
    y += 8; doc.setTextColor(20).setFont("helvetica", "normal");
    for (const it of items) {
      const amt = (Number(it.qty) || 0) * (Number(it.price) || 0);
      doc.text(it.desc || "-", 16, y + 5.5, { maxWidth: 118 });
      doc.text(String(it.qty), 140, y + 5.5); doc.text(fmtSGD(Number(it.price) || 0).replace("SGD", "S$"), 155, y + 5.5);
      doc.text(fmtSGD(amt).replace("SGD", "S$"), W - 16, y + 5.5, { align: "right" });
      y += 8; doc.setDrawColor(230); doc.line(14, y, W - 14, y);
      if (y > 240) { doc.addPage(); y = 20; }
    }
    y += 4;
    doc.text("Subtotal", 150, y + 5); doc.text(fmtSGD(totals.sub).replace("SGD", "S$"), W - 16, y + 5, { align: "right" });
    if (gstOn) { y += 6; doc.text("GST (9%)", 150, y + 5); doc.text(fmtSGD(totals.gst).replace("SGD", "S$"), W - 16, y + 5, { align: "right" }); }
    y += 8; doc.setFont("helvetica", "bold").setFontSize(12);
    doc.text(mode === "receipt" ? "Amount received" : "Total", 150, y + 5);
    doc.text(fmtSGD(totals.total).replace("SGD", "S$"), W - 16, y + 5, { align: "right" });
    y += 14;
    if (qrDataUrl) {
      doc.addImage(qrDataUrl, "PNG", 14, y, 38, 38);
      doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(90);
      doc.text("Scan to pay with PayNow", 14, y + 43);
      doc.setTextColor(20);
    }
    if (notes) { doc.setFont("helvetica", "normal").setFontSize(9).text(notes, qrDataUrl ? 60 : 14, y + 6, { maxWidth: 130 }); }
    doc.setFontSize(8).setTextColor(150).text("Generated free at tasatrust.com/tools", 14, 288);
    doc.save(`${docNo}.pdf`);
  };

  return (
    <ToolShell tool={tool} heading={c.heading} intro={c.intro} faqs={c.faqs}
      ctaTitle="Want invoicing, bookkeeping and tax handled entirely?"
      ctaBody="TASA Trust keeps your books, files your GST and taxes, and can run your whole back office — while you keep selling."
      ctaHref="/services" ctaLabel="See accounting services">
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          <Card className="surface-panel">
            <CardHeader><CardTitle className="text-lg">Your business</CardTitle></CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <div><Label>Business name</Label><Input value={bizName} onChange={(e) => setBizName(e.target.value)} placeholder="Acme Pte Ltd" /></div>
              <div><Label>UEN</Label><Input value={bizUen} onChange={(e) => setBizUen(e.target.value)} placeholder="201912345K" /></div>
              <div className="md:col-span-2"><Label>Address</Label><Input value={bizAddr} onChange={(e) => setBizAddr(e.target.value)} placeholder="1 Business Rd, Singapore 123456" /></div>
              <div className="md:col-span-2"><Label>Logo (PNG/JPG)</Label><Input type="file" accept="image/*" onChange={(e) => onLogo(e.target.files?.[0] || null)} /></div>
            </CardContent>
          </Card>

          <Card className="surface-panel">
            <CardHeader><CardTitle className="text-lg">Document</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 md:grid-cols-3">
                <div><Label>{c.numberLabel}</Label><Input value={docNo} onChange={(e) => setDocNo(e.target.value)} /></div>
                <div><Label>Date</Label><Input type="date" value={docDate} onChange={(e) => setDocDate(e.target.value)} /></div>
                <div><Label>{mode === "receipt" ? "Received from" : "Bill to"}</Label><Input value={client} onChange={(e) => setClient(e.target.value)} placeholder="Customer name" /></div>
              </div>
              <div className="space-y-2">
                <Label>Line items</Label>
                {items.map((it, i) => (
                  <div key={i} className="flex gap-2">
                    <Input className="flex-1" placeholder="Description" value={it.desc} onChange={(e) => setItems(items.map((x, j) => j === i ? { ...x, desc: e.target.value } : x))} />
                    <Input className="w-16" type="number" min="0" value={it.qty} onChange={(e) => setItems(items.map((x, j) => j === i ? { ...x, qty: e.target.value } : x))} />
                    <Input className="w-24" type="number" min="0" value={it.price} onChange={(e) => setItems(items.map((x, j) => j === i ? { ...x, price: e.target.value } : x))} />
                    <Button variant="ghost" size="icon" onClick={() => setItems(items.filter((_, j) => j !== i))} disabled={items.length === 1}><Trash2 className="size-4" /></Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="gap-1" onClick={() => setItems([...items, { desc: "", qty: "1", price: "0" }])}><Plus className="size-4" /> Add item</Button>
              </div>
              <div className="flex items-center gap-2">
                <input id="gst" type="checkbox" checked={gstOn} onChange={(e) => setGstOn(e.target.checked)} />
                <Label htmlFor="gst">GST-registered — add 9% GST</Label>
              </div>
              <div><Label>Notes / terms</Label><Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
            </CardContent>
          </Card>

          {mode !== "quotation" && (
            <Card className="surface-panel">
              <CardHeader><CardTitle className="text-lg">PayNow QR (scan to pay)</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <input id="pn" type="checkbox" checked={paynowOn} onChange={(e) => setPaynowOn(e.target.checked)} />
                  <Label htmlFor="pn">Embed PayNow QR on the PDF</Label>
                </div>
                {paynowOn && (
                  <div className="grid gap-3 md:grid-cols-3">
                    <div>
                      <Label>Proxy type</Label>
                      <select className="mt-1 w-full rounded-md border border-border bg-background p-2 text-sm" value={paynowType} onChange={(e) => setPaynowType(e.target.value as "uen" | "mobile")}>
                        <option value="uen">UEN</option><option value="mobile">Mobile</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <Label>{paynowType === "uen" ? "UEN (e.g. 201912345K)" : "Mobile (8 digits)"}</Label>
                      <Input value={paynowProxy} onChange={(e) => setPaynowProxy(e.target.value)} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2">
          <Card className="surface-panel sticky top-28">
            <CardHeader><CardTitle className="text-lg">Preview</CardTitle></CardHeader>
            <CardContent>
              <div ref={previewRef} className="rounded-md border border-border bg-white p-4 text-xs text-gray-900">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {logo && <img src={logo} alt="logo" className="size-10 object-contain" />}
                    <div>
                      <p className="font-bold">{bizName || "Your Business"}</p>
                      {bizUen && <p className="text-[10px] text-gray-500">UEN: {bizUen}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{c.docTitle}</p>
                    <p className="text-[10px]">{docNo}</p>
                    <p className="text-[10px]">{docDate}</p>
                  </div>
                </div>
                <p className="mt-3 text-[10px] font-semibold">{mode === "receipt" ? "Received from" : "Bill to"}: {client || "—"}</p>
                <table className="mt-2 w-full text-[10px]">
                  <thead><tr className="border-b border-gray-300 text-left"><th>Item</th><th className="text-right">Qty</th><th className="text-right">Amount</th></tr></thead>
                  <tbody>
                    {items.map((it, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td>{it.desc || "—"}</td>
                        <td className="text-right">{it.qty}</td>
                        <td className="text-right">{fmtSGD((Number(it.qty) || 0) * (Number(it.price) || 0))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-2 text-right text-[10px]">
                  <p>Subtotal: {fmtSGD(totals.sub)}</p>
                  {gstOn && <p>GST 9%: {fmtSGD(totals.gst)}</p>}
                  <p className="text-sm font-bold">{mode === "receipt" ? "Received" : "Total"}: {fmtSGD(totals.total)}</p>
                </div>
                {qrDataUrl && (
                  <div className="mt-2 flex items-center gap-2">
                    <img src={qrDataUrl} alt="PayNow QR" className="size-16" />
                    <p className="text-[9px] text-gray-500">Scan to pay with PayNow</p>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <SaveGate toolSlug={c.slug} onUnlocked={downloadPdf} label="Download PDF" />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Free account keeps your details + documents for next time.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </ToolShell>
  );
}
