// Vercel serverless proxy for ACRA entity search (data.gov.sg) — avoids browser CORS issues
// and keeps a stable contract for the UEN lookup tool.
export const config = { runtime: "edge" };

const DATASET = "d_3f960c10fed6145404ca7b821f263b87"; // ACRA information on corporate entities ('other')
const SEARCH_URL = "https://data.gov.sg/api/action/datastore_search";

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim().slice(0, 80);
  if (!q) {
    return new Response(JSON.stringify({ error: "missing q" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  try {
    const upstream = await fetch(
      `${SEARCH_URL}?resource_id=${DATASET}&q=${encodeURIComponent(q)}&limit=10`,
      { headers: { Accept: "application/json" } }
    );
    const data = await upstream.json();
    const records = (data?.result?.records || []).map((r: Record<string, unknown>) => ({
      uen: r.uen ?? r.UEN ?? null,
      name: r.entity_name ?? r.company_name ?? null,
      status: r.entity_status_description ?? r.entity_status ?? null,
      type: r.entity_type_description ?? null,
      registered: r.registration_incorporation_date ?? r.uen_issue_date ?? null,
    }));
    return new Response(JSON.stringify({ q, count: records.length, records }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "s-maxage=3600" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "upstream unavailable" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
}
