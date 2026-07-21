import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { findTool } from "@/lib/tools";
import { ToolShell, type Faq } from "@/components/tools/ToolShell";
import { bsd, ABSD_PROFILES, shareTransferDuty, fmtSGD } from "@/lib/sgcalc";

const FAQS: Faq[] = [
  {
    q: "How is Buyer's Stamp Duty (BSD) calculated in Singapore?",
    a: "BSD is progressive on the higher of the purchase price or market value. Residential rates run 1% to 6% (the 6% band applies above S$3 million); non-residential rates run 1% to 5% (above S$1.5 million). These bands apply to purchases on or after 15 February 2023.",
  },
  {
    q: "Who pays Additional Buyer's Stamp Duty (ABSD)?",
    a: "ABSD applies to residential purchases: Singapore Citizens pay 0% on their first home, 20% on the second and 30% on the third onwards; PRs pay 5%/30%/35%; foreigners pay 60% on any residential purchase; entities pay 65% (rates from 27 April 2023). Some nationalities are treated as citizens under free trade agreements.",
  },
  {
    q: "What stamp duty applies when transferring company shares?",
    a: "Share transfers attract stamp duty of 0.2% on the higher of the consideration or the net asset value of the shares. It is payable within 14 days of execution in Singapore.",
  },
  {
    q: "When must stamp duty be paid?",
    a: "Within 14 days of signing (documents executed in Singapore) or within 30 days of receiving the document in Singapore if executed overseas.",
  },
];

export default function StampDutyCalculator() {
  const tool = findTool("stamp-duty-calculator")!;
  const [price, setPrice] = useState("1500000");
  const [profile, setProfile] = useState(0);
  const [shareAmt, setShareAmt] = useState("100000");

  const res = useMemo(() => bsd(Number(price) || 0, true), [price]);
  const nonRes = useMemo(() => bsd(Number(price) || 0, false), [price]);
  const absd = useMemo(() => (Number(price) || 0) * ABSD_PROFILES[profile].rate, [price, profile]);
  const shares = useMemo(() => shareTransferDuty(Number(shareAmt) || 0), [shareAmt]);

  const priceInput = (
    <div>
      <Label htmlFor="price">Purchase price / market value (S$)</Label>
      <Input id="price" type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} />
    </div>
  );

  return (
    <ToolShell
      tool={tool}
      heading="Stamp Duty Calculator Singapore — BSD, ABSD & Shares"
      intro="Compute Buyer's Stamp Duty for residential and non-residential property (current bands), Additional Buyer's Stamp Duty by buyer profile, and share-transfer duty."
      faqs={FAQS}
      ctaTitle="Transferring shares or restructuring? Get it filed right."
      ctaBody="TASA Trust prepares share-transfer documents, board resolutions and IRAS stamping as part of corporate secretarial service."
      ctaHref="/services"
      ctaLabel="See corp-sec services"
    >
      <Tabs defaultValue="residential">
        <TabsList className="mb-4">
          <TabsTrigger value="residential">Residential</TabsTrigger>
          <TabsTrigger value="nonres">Non-residential</TabsTrigger>
          <TabsTrigger value="shares">Share transfer</TabsTrigger>
        </TabsList>

        <TabsContent value="residential">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="surface-panel">
              <CardHeader><CardTitle className="text-lg">Inputs</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {priceInput}
                <div>
                  <Label>Buyer profile (for ABSD)</Label>
                  <select
                    className="mt-1 w-full rounded-md border border-border bg-background p-2 text-sm"
                    value={profile}
                    onChange={(e) => setProfile(Number(e.target.value))}
                  >
                    {ABSD_PROFILES.map((p, i) => (
                      <option key={p.label} value={i}>{p.label} — {Math.round(p.rate * 100)}%</option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>
            <Card className="surface-panel">
              <CardHeader><CardTitle className="text-lg">Duty payable</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-1 text-xs text-muted-foreground">
                  {res.lines.map((l, i) => (
                    <div key={i} className="flex justify-between">
                      <span>{l.band} @ {Math.round(l.rate * 100)}%</span><span>{fmtSGD(l.duty)}</span>
                    </div>
                  ))}
                </div>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between border-t border-border pt-2"><dt>BSD</dt><dd className="font-semibold">{fmtSGD(res.duty)}</dd></div>
                  <div className="flex justify-between"><dt>ABSD ({Math.round(ABSD_PROFILES[profile].rate * 100)}%)</dt><dd className="font-semibold">{fmtSGD(absd)}</dd></div>
                  <div className="flex justify-between border-t border-border pt-2 text-base"><dt className="font-bold">Total stamp duty</dt><dd className="font-bold text-primary">{fmtSGD(res.duty + absd)}</dd></div>
                </dl>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="nonres">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="surface-panel">
              <CardHeader><CardTitle className="text-lg">Inputs</CardTitle></CardHeader>
              <CardContent>{priceInput}</CardContent>
            </Card>
            <Card className="surface-panel">
              <CardHeader><CardTitle className="text-lg">BSD payable (no ABSD)</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-1 text-xs text-muted-foreground">
                  {nonRes.lines.map((l, i) => (
                    <div key={i} className="flex justify-between">
                      <span>{l.band} @ {Math.round(l.rate * 100)}%</span><span>{fmtSGD(l.duty)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex justify-between border-t border-border pt-2 text-base">
                  <span className="font-bold">Total BSD</span><span className="font-bold text-primary">{fmtSGD(nonRes.duty)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="shares">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="surface-panel">
              <CardHeader><CardTitle className="text-lg">Inputs</CardTitle></CardHeader>
              <CardContent>
                <Label htmlFor="shareAmt">Higher of consideration or NAV (S$)</Label>
                <Input id="shareAmt" type="number" min="0" value={shareAmt} onChange={(e) => setShareAmt(e.target.value)} />
              </CardContent>
            </Card>
            <Card className="surface-panel">
              <CardHeader><CardTitle className="text-lg">Duty payable (0.2%)</CardTitle></CardHeader>
              <CardContent>
                <div className="flex justify-between text-base">
                  <span className="font-bold">Share transfer stamp duty</span>
                  <span className="font-bold text-primary">{fmtSGD(shares)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </ToolShell>
  );
}
