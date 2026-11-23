const DEFAULT_SITE_URL = "https://www.tasatrust.com";
const CONTENT_API_ENDPOINT_DEFAULT = "https://loom.qweaver.com/api/content";
const BLOG_PAGE_SIZE = 100;
type SitemapKind = "index" | "static" | "blog";

const SITE_URL =
  process.env.SITE_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  DEFAULT_SITE_URL;
const CONTENT_API_ENDPOINT =
  process.env.CONTENT_API_ENDPOINT ||
  process.env.VITE_CONTENT_API_ENDPOINT ||
  CONTENT_API_ENDPOINT_DEFAULT;
const CONTENT_API_KEY_RAW =
  process.env.CONTENT_API_KEY || process.env.VITE_CONTENT_API_KEY;

const CONTENT_API_KEY = CONTENT_API_KEY_RAW
  ? CONTENT_API_KEY_RAW.trim().replace(/^["']|["']$/g, "")
  : undefined;
const CONTENT_SITE_ID = process.env.CONTENT_SITE_ID?.trim();

const staticRoutes = [
  { path: "/tools", priority: "0.9", changefreq: "weekly" },
  { path: "/tools/income-tax-calculator", priority: "0.8", changefreq: "monthly" },
  { path: "/tools/gst-calculator", priority: "0.8", changefreq: "monthly" },
  { path: "/tools/ssic-code-lookup", priority: "0.8", changefreq: "monthly" },
  { path: "/tools/cpf-calculator", priority: "0.8", changefreq: "monthly" },
  { path: "/tools/salary-calculator", priority: "0.8", changefreq: "monthly" },
  { path: "/tools/sdl-calculator", priority: "0.8", changefreq: "monthly" },
  { path: "/tools/stamp-duty-calculator", priority: "0.8", changefreq: "monthly" },
  { path: "/tools/corporate-tax-calculator", priority: "0.8", changefreq: "monthly" },
  { path: "/tools/invoice-generator", priority: "0.8", changefreq: "monthly" },
  { path: "/tools/quotation-generator", priority: "0.8", changefreq: "monthly" },
  { path: "/tools/receipt-generator", priority: "0.8", changefreq: "monthly" },
  { path: "/tools/paynow-qr-generator", priority: "0.8", changefreq: "monthly" },
  { path: "/tools/payslip-generator", priority: "0.8", changefreq: "monthly" },
  { path: "/tools/uen-lookup", priority: "0.8", changefreq: "monthly" },
  { path: "/tools/employment-contract-template", priority: "0.8", changefreq: "monthly" },
  { path: "/tools/tenancy-agreement-template", priority: "0.8", changefreq: "monthly" },
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
  { path: "/startup-kit", priority: "0.95", changefreq: "weekly" },
  { path: "/startup-kit/register-company-singapore", priority: "0.9", changefreq: "weekly" },
  { path: "/startup-kit/foreigner-guide", priority: "0.85", changefreq: "weekly" },
  { path: "/startup-kit/corporate-secretary", priority: "0.85", changefreq: "weekly" },
  { path: "/startup-kit/registered-address", priority: "0.85", changefreq: "weekly" },
  { path: "/startup-kit/accounting-tax", priority: "0.85", changefreq: "weekly" },
  { path: "/startup-kit/website-branding", priority: "0.8", changefreq: "weekly" },
];

type CmsRequestOptions = {
  headers: Record<string, string>;
};

function normalizeContentApiToken(raw: string) {
  return raw
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/^Bearer\s+/i, "")
    .trim();
}

function buildContentApiAuthHeaders(contentApiToken: string): CmsRequestOptions[] {
  const normalizedToken = normalizeContentApiToken(contentApiToken);
  const siteHeader: Record<string, string> = {};
  if (CONTENT_SITE_ID) {
    siteHeader["x-content-site-id"] = CONTENT_SITE_ID;
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

async function postToContentEndpoint(body: Record<string, unknown>) {
  if (!CONTENT_API_KEY) {
    return null;
  }

  const bodyText = JSON.stringify(body);
  const attempts = buildContentApiAuthHeaders(CONTENT_API_KEY);
  let lastResponse: Response | null = null;

  for (const attempt of attempts) {
    const response = await fetch(CONTENT_API_ENDPOINT, {
      method: "POST",
      headers: attempt.headers,
      body: bodyText,
    });

    if (response.status !== 401 && response.status !== 403) {
      return response;
    }

    lastResponse = response;
  }

  return lastResponse;
}

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

    // Loom on Neon only (CONTENT_API_ENDPOINT). The old fallback to this site's get-blog-content Supabase
    // function is gone: its upstream was the retired Loom Supabase project (23 Nov 2026).
    const response = await postToContentEndpoint(body);
    if (!response) {
      throw new Error("Blog sitemap needs CONTENT_API_KEY to read the content API.");
    }

    if (!response.ok) {
      const errorText = await response.text();
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
