const DEFAULT_SITE_URL = "https://www.tasatrust.com";
const DEFAULT_SUPABASE_URL = "https://wktusutjeoyokptqbdeu.supabase.co";
const DEFAULT_SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrdHVzdXRqZW95b2twdHFiZGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNjg3NTEsImV5cCI6MjA4NTk0NDc1MX0.FawtlFEp-pV5ZALskrHoTcX870nc1bz4t3XugLam7XY";
const CONTENT_API_ENDPOINT_DEFAULT =
  "https://vleqfcpewvdgezensisj.supabase.co/functions/v1/get-client-content";
const BLOG_PAGE_SIZE = 100;
const BLOG_FUNCTION_NAME_DEFAULT = "get-blog-content";
type SitemapKind = "index" | "static" | "blog";

const SITE_URL =
  process.env.SITE_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  DEFAULT_SITE_URL;
const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  DEFAULT_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  DEFAULT_SUPABASE_PUBLISHABLE_KEY;
const BLOG_FUNCTION_NAME =
  process.env.VITE_CONTENT_FUNCTION_NAME || BLOG_FUNCTION_NAME_DEFAULT;
const CONTENT_API_ENDPOINT =
  process.env.CONTENT_API_ENDPOINT ||
  process.env.VITE_CONTENT_API_ENDPOINT ||
  CONTENT_API_ENDPOINT_DEFAULT;
const CONTENT_API_KEY_RAW =
  process.env.CONTENT_API_KEY || process.env.VITE_CONTENT_API_KEY;

const CONTENT_API_KEY = CONTENT_API_KEY_RAW
  ? CONTENT_API_KEY_RAW.trim().replace(/^["']|["']$/g, "")
  : undefined;
const isLikelyJwt = (value: string) => value.split(".").length === 3;

const staticRoutes = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/about", priority: "0.8", changefreq: "monthly" },
  { path: "/pricing", priority: "0.9", changefreq: "weekly" },
  { path: "/services", priority: "0.9", changefreq: "weekly" },
  { path: "/contact", priority: "0.7", changefreq: "monthly" },
  { path: "/faq", priority: "0.7", changefreq: "monthly" },
  { path: "/help", priority: "0.6", changefreq: "monthly" },
  { path: "/privacy", priority: "0.3", changefreq: "yearly" },
  { path: "/terms", priority: "0.3", changefreq: "yearly" },
  { path: "/cookies", priority: "0.3", changefreq: "yearly" },
  { path: "/blog", priority: "0.9", changefreq: "daily" },
];

type SitemapArticle = {
  slug?: string;
  canonical_path?: string | null;
  category_slug?: string | null;
  author_slug?: string | null;
  updated_at?: string | null;
};

type SitemapUrlEntry = {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
};

function normalizeSiteUrl(value: string) {
  if (!value) return DEFAULT_SITE_URL;
  return value.startsWith("http")
    ? value.replace(/\/+$/, "")
    : `https://${value.replace(/\/+$/, "")}`;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildUrl(baseUrl: string, path: string) {
  return new URL(path, `${baseUrl}/`).toString();
}

function getKind(url: string | undefined, queryKind?: string): SitemapKind {
  if (queryKind === "static" || queryKind === "blog" || queryKind === "index") {
    return queryKind;
  }

  if (!url) return "index";
  const pathname = new URL(url, "https://www.tasatrust.com").pathname.toLowerCase();
  if (pathname.endsWith("/api/sitemap/blog")) return "blog";
  if (pathname.endsWith("/api/sitemap/static")) return "static";
  if (pathname.endsWith("/api/sitemap/index")) return "index";
  if (pathname.endsWith("/sitemap-blog.xml")) return "blog";
  if (pathname.endsWith("/sitemap-static.xml")) return "static";
  return "index";
}

async function fetchAllArticles() {
  const articles: SitemapArticle[] = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const body = {
      action: "list_articles",
      limit: BLOG_PAGE_SIZE,
      offset,
      sort: "published_at_desc",
    };

    let response:
      | {
          ok: boolean;
          status: number;
          statusText: string;
          json: () => Promise<unknown>;
          text: () => Promise<string>;
        };
    let responseText: string | undefined;

    if (CONTENT_API_KEY && isLikelyJwt(CONTENT_API_KEY)) {
      const directResponse = await fetch(CONTENT_API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${CONTENT_API_KEY}`,
        },
        body: JSON.stringify(body),
      });

      if (directResponse.status !== 401 && directResponse.status !== 403) {
        response = directResponse;
      } else {
        responseText = await directResponse.text();
        response = await fetch(`${SUPABASE_URL}/functions/v1/${BLOG_FUNCTION_NAME}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(SUPABASE_PUBLISHABLE_KEY
              ? {
                  apikey: SUPABASE_PUBLISHABLE_KEY,
                  Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
                }
              : {}),
            ...(CONTENT_API_KEY ? { "x-content-api-key": CONTENT_API_KEY } : {}),
          },
          body: JSON.stringify(body),
        });
      }
    } else {
      response = await fetch(`${SUPABASE_URL}/functions/v1/${BLOG_FUNCTION_NAME}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(SUPABASE_PUBLISHABLE_KEY
            ? {
                apikey: SUPABASE_PUBLISHABLE_KEY,
                Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
              }
            : {}),
        },
        body: JSON.stringify(body),
      });
    }

    if (!response.ok) {
      const errorText = responseText ?? (await response.text());
      throw new Error(
        `Blog proxy failed with status ${response.status}: ${errorText || response.statusText}`,
      );
    }

    const payload = (await response.json()) as {
      articles?: SitemapArticle[];
      pagination?: { has_more?: boolean };
    };

    const pageArticles = payload.articles || [];
    articles.push(...pageArticles);
    hasMore = Boolean(payload.pagination?.has_more);
    offset += BLOG_PAGE_SIZE;
  }

  return articles;
}

function renderUrlNode(entry: SitemapUrlEntry) {
  return [
    "  <url>",
    `    <loc>${escapeXml(entry.loc)}</loc>`,
    entry.lastmod ? `    <lastmod>${escapeXml(entry.lastmod)}</lastmod>` : "",
    entry.changefreq ? `    <changefreq>${escapeXml(entry.changefreq)}</changefreq>` : "",
    entry.priority ? `    <priority>${escapeXml(entry.priority)}</priority>` : "",
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");
}

function renderSitemapIndexNode(entry: SitemapUrlEntry) {
  return [
    "  <sitemap>",
    `    <loc>${escapeXml(entry.loc)}</loc>`,
    entry.lastmod ? `    <lastmod>${escapeXml(entry.lastmod)}</lastmod>` : "",
    "  </sitemap>",
  ]
    .filter(Boolean)
    .join("\n");
}

function renderSitemapXml(entries: SitemapUrlEntry[]) {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(renderUrlNode),
    "</urlset>",
  ].join("\n");
}

function renderSitemapIndexXml(entries: SitemapUrlEntry[]) {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(renderSitemapIndexNode),
    "</sitemapindex>",
  ].join("\n");
}

async function buildStaticEntries() {
  return staticRoutes.map((route) => ({
    loc: route.path ? route.path : "/",
    changefreq: route.changefreq,
    priority: route.priority,
  }));
}

async function buildBlogEntries(baseUrl: string) {
  const articles = await fetchAllArticles();
  const categories = new Map<string, { slug: string; updatedAt?: string }>();
  const authors = new Map<string, { slug: string; updatedAt?: string }>();

  const articleEntries = articles.map((article) => {
    const slug = String(article.slug || "").trim();
    const canonicalPath = article.canonical_path
      ? String(article.canonical_path)
      : slug
        ? `/blog/${encodeURIComponent(slug)}`
        : "/blog";

    const categorySlug = article.category_slug ? String(article.category_slug) : "";
    const authorSlug = article.author_slug ? String(article.author_slug) : "";
    const updatedAt = article.updated_at ? String(article.updated_at) : undefined;

    if (categorySlug) {
      const current = categories.get(categorySlug);
      if (!current || (updatedAt && updatedAt > (current.updatedAt || ""))) {
        categories.set(categorySlug, { slug: categorySlug, updatedAt });
      }
    }

    if (authorSlug) {
      const current = authors.get(authorSlug);
      if (!current || (updatedAt && updatedAt > (current.updatedAt || ""))) {
        authors.set(authorSlug, { slug: authorSlug, updatedAt });
      }
    }

    return {
      loc: buildUrl(baseUrl, canonicalPath),
      lastmod: updatedAt,
      changefreq: "monthly",
      priority: "0.8",
    };
  });

  const categoryEntries = Array.from(categories.values()).map((category) => ({
    loc: buildUrl(baseUrl, `/blog/category/${encodeURIComponent(category.slug)}`),
    lastmod: category.updatedAt,
    changefreq: "weekly",
    priority: "0.7",
  }));

  const authorEntries = Array.from(authors.values()).map((author) => ({
    loc: buildUrl(baseUrl, `/blog/author/${encodeURIComponent(author.slug)}`),
    lastmod: author.updatedAt,
    changefreq: "weekly",
    priority: "0.6",
  }));

  return [...articleEntries, ...categoryEntries, ...authorEntries];
}

export default async function handler(
  req: {
    method?: string;
    url?: string;
    query?: Record<string, string | string[] | undefined>;
  },
  res: {
    setHeader: (name: string, value: string) => void;
    status: (code: number) => { send: (body: string) => void };
  },
) {
  const baseUrl = normalizeSiteUrl(SITE_URL);
  const queryKind = Array.isArray(req.query?.kind) ? req.query.kind[0] : req.query?.kind;
  const kind = getKind(req.url, queryKind);

  try {
    let xml = "";

    if (kind === "index") {
      const indexEntries: SitemapUrlEntry[] = [
        { loc: buildUrl(baseUrl, "/sitemap-static.xml") },
        { loc: buildUrl(baseUrl, "/sitemap-blog.xml") },
      ];
      xml = renderSitemapIndexXml(indexEntries);
    } else {
      const entries =
        kind === "static" ? await buildStaticEntries() : await buildBlogEntries(baseUrl);

      const uniqueEntries = Array.from(
        new Map(entries.map((entry) => [entry.loc, entry])).values(),
      );

      const normalizedEntries = uniqueEntries.map((entry) => ({
        ...entry,
        loc: entry.loc.startsWith("http") ? entry.loc : buildUrl(baseUrl, entry.loc),
      }));

      xml = renderSitemapXml(normalizedEntries);
    }

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    res.status(200).send(xml);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to generate sitemap";
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.status(500).send(
      [
        '<?xml version="1.0" encoding="UTF-8"?>',
        `<error>${escapeXml(String(message))}</error>`,
      ].join("\n"),
    );
  }
}
