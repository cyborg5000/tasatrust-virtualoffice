import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const DEFAULT_CONTENT_API_ENDPOINT =
  "https://vleqfcpewvdgezensisj.supabase.co/functions/v1/get-client-content";

const ALLOWED_KEYS = new Set([
  "action",
  "slug",
  "limit",
  "offset",
  "sort",
  "category_slug",
  "author_slug",
  "search",
]);

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function sanitizePayload(payload: Record<string, unknown>) {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(payload)) {
    if (!ALLOWED_KEYS.has(key) || value === undefined || value === null || value === "") {
      continue;
    }

    sanitized[key] = value;
  }

  return sanitized;
}

function normalizeContentApiToken(raw: string) {
  return raw
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/^Bearer\s+/i, "")
    .trim();
}

type CmsRequestOptions = {
  headers: Record<string, string>;
};

function buildContentApiAuthHeaders(
  contentApiKey: string,
  contentSiteId?: string,
): CmsRequestOptions[] {
  const normalizedToken = normalizeContentApiToken(contentApiKey);
  const siteHeader: Record<string, string> = {};
  if (contentSiteId) {
    siteHeader["x-content-site-id"] = contentSiteId;
  }

  return [
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${normalizedToken}`,
        "x-content-api-key": normalizedToken,
        "x-blog-content-api-key": normalizedToken,
        ...siteHeader,
      },
    },
    {
      headers: {
        "Content-Type": "application/json",
        apikey: normalizedToken,
        "x-content-api-key": normalizedToken,
        "x-blog-content-api-key": normalizedToken,
        ...siteHeader,
      },
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: normalizedToken,
        "x-content-api-key": normalizedToken,
        "x-blog-content-api-key": normalizedToken,
        ...siteHeader,
      },
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${normalizedToken}`,
        apikey: normalizedToken,
        "x-content-api-key": normalizedToken,
        "x-blog-content-api-key": normalizedToken,
        ...siteHeader,
      },
    },
  ];
}

async function postToContentService(
  endpoint: string,
  payload: string,
  contentApiKey: string,
  contentSiteId?: string,
) {
  const attempts = buildContentApiAuthHeaders(contentApiKey, contentSiteId);
  let lastResponse: Response | null = null;

  for (const attempt of attempts) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: attempt.headers,
      body: payload,
    });

    if (response.status !== 401 && response.status !== 403) {
      return response;
    }

    lastResponse = response;
  }

  return lastResponse;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const contentApiKey =
    req.headers.get("x-content-api-key")?.trim() ??
    req.headers.get("x-blog-content-api-key")?.trim() ??
    Deno.env.get("CONTENT_API_KEY");
  const contentApiEndpoint =
    Deno.env.get("CONTENT_API_ENDPOINT") || DEFAULT_CONTENT_API_ENDPOINT;
  const contentSiteId =
    req.headers.get("x-content-site-id")?.trim() ||
    req.headers.get("x-blog-content-site-id")?.trim() ||
    Deno.env.get("CONTENT_SITE_ID")?.trim();

  if (!contentApiKey) {
    return jsonResponse(
      { error: "Blog content API key is not configured." },
      500,
    );
  }

  let payload: Record<string, unknown>;

  try {
    payload = (await req.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse({ error: "Invalid request payload." }, 400);
  }

  const sanitizedPayload = sanitizePayload(payload);

  if (!sanitizedPayload.slug && sanitizedPayload.action !== "list_articles") {
    return jsonResponse(
      { error: "Either a slug or action=list_articles is required." },
      400,
    );
  }

  try {
    const payload = JSON.stringify(sanitizedPayload);
    const upstreamResponse = await postToContentService(
      contentApiEndpoint,
      payload,
      contentApiKey,
      contentSiteId,
    );

    if (!upstreamResponse) {
      return jsonResponse(
        { error: "Unable to reach the content service right now." },
        502,
      );
    }

    const responseText = await upstreamResponse.text();

    return new Response(responseText, {
      status: upstreamResponse.status,
      headers: {
        ...corsHeaders,
        "Content-Type":
          upstreamResponse.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (error) {
    console.error("Blog content proxy failed:", error);
    return jsonResponse(
      { error: "Unable to reach the content service right now." },
      502,
    );
  }
});
