import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { findTool } from "@/lib/tools";
import { ToolShell, type Faq } from "@/components/tools/ToolShell";

const FAQS: Faq[] = [
  { q: "How do I check if a company name is taken in Singapore?", a: "Search the name here — results come from ACRA's public corporate entity records on data.gov.sg. If an identical or near-identical name exists and is live, ACRA will typically reject your application. The authoritative check is ACRA's BizFile name search at application time." },
  { q: "What is a UEN?", a: "The Unique Entity Number is the standard identifier issued to every entity registered in Singapore — companies, sole proprietorships, partnerships and societies. It appears on invoices, contracts, PayNow registrations and government filings." },
  { q: "How current is this data?", a: "The tool queries ACRA's dataset published on data.gov.sg, which is refreshed regularly but can lag live BizFile records slightly. Treat it as a fast first check, not the final word." },
  { q: "My name looks available — what next?", a: "Reserve it fast: name applications are approved in minutes for most cases. TASA Trust can reserve your name and incorporate your Pte Ltd the same day, with registered address and corp sec included." },
];

type Rec = { uen: string | null; name: string | null; status: string | null; type: string | null; registered: string | null };

export default function UenLookup() {
  const tool = findTool("uen-lookup")!;
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<Rec[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const search = async () => {
    if (!q.trim()) return;
    setBusy(true); setErr(null);
    try {
      const r = await fetch(`/api/uen?q=${encodeURIComponent(q.trim())}`);
      const j = await r.json();
      if (j.error) throw new Error(j.error);
      setResults(j.records || []);
    } catch {
      setErr("Search is unavailable right now — try again shortly.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolShell tool={tool}
      heading="UEN Check & Company Name Search (ACRA Records)"
      intro="Look up any Singapore UEN or check whether a company name is already registered — straight from ACRA's public records."
      faqs={FAQS}
      ctaTitle="Name available? Incorporate it today."
      ctaBody="TASA Trust reserves your name and registers your Pte Ltd — with ACRA-registered address, corporate secretary and compliance from day one."
      ctaHref="/startup-kit" ctaLabel="See the Startup Kit">
      <Card className="surface-panel">
        <CardHeader><CardTitle className="text-lg">Search ACRA records</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input placeholder="Company name or UEN e.g. 201912345K" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && search()} />
            <Button onClick={search} disabled={busy} className="gap-1"><Search className="size-4" /> {busy ? "Searching…" : "Search"}</Button>
          </div>
          {err && <p className="mt-3 text-sm text-destructive">{err}</p>}
          {results && (
            <div className="mt-4 space-y-2">
              {results.length === 0 && (
                <div className="rounded-md border border-primary/40 bg-primary/10 p-4 text-sm">
                  No exact matches found — the name may be available.{" "}
                  <Link to="/startup-kit/register-company-singapore" className="font-semibold underline">Reserve and incorporate it →</Link>
                </div>
              )}
              {results.map((r, i) => (
                <div key={i} className="rounded-md border border-border p-3 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold">{r.name || "—"}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${String(r.status || "").toLowerCase().includes("live") ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground"}`}>
                      {r.status || "status n/a"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">UEN: {r.uen || "—"}{r.type ? ` · ${r.type}` : ""}{r.registered ? ` · Registered ${r.registered}` : ""}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </ToolShell>
  );
}
