// The blog's content, read server-side from Qweaver Loom (CONTENT_API_ENDPOINT, now Loom on Neon:
// https://loom.qweaver.com/api/content) with the site's CONTENT_API_KEY, which never reaches the browser.
// Replaces the browser call to the get-blog-content Supabase function, whose default upstream was the
// retired Loom Supabase project (21 Nov 2026). Same request body and the upstream response passed through.
export const config = { runtime: "edge" };

const ALLOWED_KEYS = new Set(["action", "slug", "limit", "offset", "sort", "category_slug", "author_slug", "search"]);
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });

export default async function handler(req: Request) {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const endpoint = process.env.CONTENT_API_ENDPOINT;
  const key = (process.env.CONTENT_API_KEY || "").trim().replace(/^["']|["']$/g, "").replace(/^Bearer\s+/i, "");
  if (!endpoint || !key) return json({ error: "Blog content API is not configured." }, 500);
  let payload: Record<string, unknown>;
  try {
    payload = (await req.json()) as Record<string, unknown>;
  } catch {
    return json({ error: "Invalid request payload." }, 400);
  }
  const body: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(payload ?? {})) if (ALLOWED_KEYS.has(k) && v !== undefined && v !== null && v !== "") body[k] = v;
  if (!body.slug && body.action !== "list_articles") return json({ error: "Either a slug or action=list_articles is required." }, 400);
  try {
    const upstream = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });
    return new Response(await upstream.text(), {
      status: upstream.status,
      headers: { "Content-Type": upstream.headers.get("Content-Type") || "application/json", "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch {
    return json({ error: "Unable to reach the content service right now." }, 502);
  }
}
