import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { findTool } from "@/lib/tools";
import { ToolShell, type Faq } from "@/components/tools/ToolShell";
import { SaveGate } from "@/components/tools/SaveGate";
import { buildPayNowPayload } from "@/lib/paynow";

const FAQS: Faq[] = [
  { q: "How do I generate a PayNow QR code for my business?", a: "Enter your company UEN (or mobile number for personal PayNow), an optional amount and reference, and this tool generates a standard SGQR/EMVCo PayNow QR that any Singapore banking app can scan." },
  { q: "Can I fix the payment amount in the QR?", a: "Yes — set an amount and the customer's banking app pre-fills it. Leave the amount blank for an open QR where the payer types the amount." },
  { q: "Does the QR expire?", a: "The QRs generated here have no expiry unless you set one. Print them on invoices, table stands or storefronts and they keep working as long as your PayNow registration stays active." },
  { q: "Is this the same as SGQR?", a: "PayNow QR uses the EMVCo standard that SGQR is built on. This generator produces the PayNow merchant-account payload, which resolves through your UEN or mobile PayNow registration." },
];

export default function PaynowQrGenerator() {
  const tool = findTool("paynow-qr-generator")!;
  const [type, setType] = useState<"uen" | "mobile">("uen");
  const [proxy, setProxy] = useState("");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [ref, setRef] = useState("");
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    if (proxy.trim()) {
      const payload = buildPayNowPayload({
        proxyType: type, proxyValue: proxy, merchantName: name || "PayNow",
        amount: Number(amount) > 0 ? Number(amount) : undefined,
        editableAmount: !(Number(amount) > 0), reference: ref || undefined,
      });
      QRCode.toDataURL(payload, { margin: 1, width: 320 }).then((u) => { if (alive) setQr(u); });
    } else setQr(null);
    return () => { alive = false; };
  }, [type, proxy, name, amount, ref]);

  const download = () => {
    if (!qr) return;
    const a = document.createElement("a");
    a.href = qr; a.download = `paynow-qr${ref ? `-${ref}` : ""}.png`; a.click();
  };

  return (
    <ToolShell tool={tool}
      heading="PayNow QR Code Generator — Free"
      intro="Generate a scan-to-pay PayNow QR for your UEN or mobile number — with optional fixed amount and reference. Download and print anywhere."
      faqs={FAQS}>
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="surface-panel">
          <CardHeader><CardTitle className="text-lg">QR details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>PayNow proxy</Label>
              <select className="mt-1 w-full rounded-md border border-border bg-background p-2 text-sm" value={type} onChange={(e) => setType(e.target.value as "uen" | "mobile")}>
                <option value="uen">Company UEN</option>
                <option value="mobile">Mobile number</option>
              </select>
            </div>
            <div><Label>{type === "uen" ? "UEN (e.g. 201912345K)" : "Mobile (8 digits)"}</Label><Input value={proxy} onChange={(e) => setProxy(e.target.value)} /></div>
            <div><Label>Display name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Pte Ltd" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Amount (optional)</Label><Input type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
              <div><Label>Reference (optional)</Label><Input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="INV-2026-001" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="surface-panel">
          <CardHeader><CardTitle className="text-lg">Your PayNow QR</CardTitle></CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {qr ? <img src={qr} alt="PayNow QR code" className="size-64 rounded-md border border-border" /> : <p className="text-sm text-muted-foreground">Enter your UEN or mobile to generate the QR.</p>}
            {qr && <SaveGate toolSlug="paynow-qr-generator" onUnlocked={download} label="Download PNG" />}
          </CardContent>
        </Card>
      </div>
    </ToolShell>
  );
}
