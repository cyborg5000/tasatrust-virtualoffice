export const BLOG_PAGE_SIZE = 24;

export interface CmsSite {
  id: string;
  name: string;
  domain: string;
}

export interface CmsArticle {
  id: string;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string | null;
  category?: string | null;
  author_name?: string | null;
  category_slug?: string | null;
  author_slug?: string | null;
  featured_image?: string | null;
  canonical_url?: string | null;
  canonical_path?: string | null;
  seo_title?: string | null;
  meta_description?: string | null;
  og_image_alt?: string | null;
  content_has_faq?: boolean;
  published_at: string;
  updated_at: string;
}

export interface CmsListPayload {
  articles: CmsArticle[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    has_more: boolean;
  };
  site?: CmsSite;
  generated_at?: string;
}

export interface CmsArticlePayload {
  article: CmsArticle | null;
  site?: CmsSite;
  generated_at?: string;
}

export type ArticleListRequest = {
  category_slug?: string;
  author_slug?: string;
  search?: string;
  limit?: number;
  offset?: number;
  sort?: "published_at_desc" | "published_at_asc";
};

function normalizeRequest(request: ArticleListRequest = {}) {
  return {
    action: "list_articles" as const,
    limit: request.limit ?? BLOG_PAGE_SIZE,
    offset: request.offset ?? 0,
    sort: request.sort ?? "published_at_desc",
    ...(request.category_slug ? { category_slug: request.category_slug } : {}),
    ...(request.author_slug ? { author_slug: request.author_slug } : {}),
    ...(request.search ? { search: request.search } : {}),
  };
}

// The blog reads its content through this site's own /api/blog (Loom on Neon), not a Supabase function.
async function invokeBlogFunction<T>(body: Record<string, unknown>): Promise<T> {
  const response = await fetch("/api/blog", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Blog content request failed (${response.status}): ${errorText || response.statusText}`,
    );
  }

  return (await response.json()) as T;
}

export function getArticleListRequestKey(request: ArticleListRequest = {}) {
  return JSON.stringify(normalizeRequest(request));
}

export async function getArticleList(request: ArticleListRequest = {}) {
  return invokeBlogFunction<CmsListPayload>(normalizeRequest(request));
}

export async function getArticleBySlug(slug: string) {
  return invokeBlogFunction<CmsArticlePayload>({ slug });
}

export function buildArticlePath(slug: string) {
  return `/blog/${encodeURIComponent(slug)}`;
}

export function buildCategoryPath(categorySlug: string) {
  return `/blog/category/${encodeURIComponent(categorySlug)}`;
}

export function buildAuthorPath(authorSlug: string) {
  return `/blog/author/${encodeURIComponent(authorSlug)}`;
}

export function prettifySlug(value: string) {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
