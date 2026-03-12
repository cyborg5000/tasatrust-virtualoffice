const DEFAULT_SITE_URL = "https://www.tasatrust.com";
const DEFAULT_SUPABASE_URL = "https://wktusutjeoyokptqbdeu.supabase.co";
const DEFAULT_SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrdHVzdXRqZW95b2twdHFiZGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNjg3NTEsImV4cCI6MjA4NTk0NDc1MX0.FawtlFEp-pV5ZALskrHoTcX870nc1bz4t3XugLam7XY";
const BLOG_PAGE_SIZE = 100;

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
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  DEFAULT_SUPABASE_PUBLISHABLE_KEY;

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

function normalizeSiteUrl(value: string) {
  if (!value) return DEFAULT_SITE_URL;
  return value.startsWith("http") ? value.replace(/\/+$/, "") : `https://${value.replace(/\/+$/, "")}`;
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

async function fetchAllArticles() {
  const articles: Record<string, unknown>[] = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/get-blog-content`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        action: "list_articles",
        limit: BLOG_PAGE_SIZE,
        offset,
        sort: "published_at_desc",
      }),
    });

    if (!response.ok) {
      throw new Error(`Blog proxy failed with status ${response.status}`);
    }

    const payload = (await response.json()) as {
      articles?: Record<string, unknown>[];
      pagination?: { has_more?: boolean };
    };

    const pageArticles = payload.articles || [];
    articles.push(...pageArticles);
    hasMore = Boolean(payload.pagination?.has_more);
    offset += BLOG_PAGE_SIZE;
  }

  return articles;
}

function renderUrlNode(entry: {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}) {
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

export default async function handler(
  _req: { method?: string },
  res: {
    setHeader: (name: string, value: string) => void;
    status: (code: number) => { send: (body: string) => void };
  },
) {
  const baseUrl = normalizeSiteUrl(SITE_URL);

  try {
    const articles = await fetchAllArticles();
    const categories = new Map<string, { slug: string; updatedAt?: string }>();
    const authors = new Map<string, { slug: string; updatedAt?: string }>();

    const entries = [
      ...staticRoutes.map((route) => ({
        loc: buildUrl(baseUrl, route.path),
        changefreq: route.changefreq,
        priority: route.priority,
      })),
      ...articles.map((article) => {
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
      }),
      ...Array.from(categories.values()).map((category) => ({
        loc: buildUrl(baseUrl, `/blog/category/${encodeURIComponent(category.slug)}`),
        lastmod: category.updatedAt,
        changefreq: "weekly",
        priority: "0.7",
      })),
      ...Array.from(authors.values()).map((author) => ({
        loc: buildUrl(baseUrl, `/blog/author/${encodeURIComponent(author.slug)}`),
        lastmod: author.updatedAt,
        changefreq: "weekly",
        priority: "0.6",
      })),
    ];

    const uniqueEntries = Array.from(
      new Map(entries.map((entry) => [entry.loc, entry])).values(),
    );

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...uniqueEntries.map(renderUrlNode),
      "</urlset>",
    ].join("\n");

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    res.status(200).send(xml);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to generate sitemap";
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.status(500).send(
      [
        '<?xml version="1.0" encoding="UTF-8"?>',
        `<error>${escapeXml(message)}</error>`,
      ].join("\n"),
    );
  }
}
