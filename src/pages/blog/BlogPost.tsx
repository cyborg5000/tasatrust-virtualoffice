import { useMemo } from "react";
import { format } from "date-fns";
import { ArrowLeft, Clock3 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import workspaceProfessional from "@/assets/workspace-professional.jpg";
import { BlogSidebar } from "@/components/blog/BlogSidebar";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { Layout } from "@/components/layout/Layout";
import { PageSeo } from "@/components/seo/PageSeo";
import { Button } from "@/components/ui/button";
import { useArticleBySlug, useArticleList } from "@/hooks/useBlog";
import {
  buildAuthorPath,
  buildCategoryPath,
  type CmsArticle,
} from "@/lib/blog-api";
import {
  buildArticleJsonLd,
  buildArticleMeta,
  collectCategories,
  decorateArticleHtml,
} from "@/lib/blog-content";

export default function BlogPost() {
  const params = useParams();
  const slug = decodeURIComponent(params.slug || "");
  const articleQuery = useArticleBySlug(slug, Boolean(slug));
  const sidebarQuery = useArticleList({ limit: 60 });

  const article = articleQuery.data?.article || null;

  const decorated = useMemo(
    () => decorateArticleHtml(article?.content || ""),
    [article?.content],
  );

  const categories = useMemo(
    () => collectCategories(sidebarQuery.data?.articles || []),
    [sidebarQuery.data?.articles],
  );

  const recentPosts = useMemo(
    () =>
      (sidebarQuery.data?.articles || [])
        .filter((entry) => entry.slug !== article?.slug)
        .slice(0, 4),
    [article?.slug, sidebarQuery.data?.articles],
  );

  const siteName = articleQuery.data?.site?.name || "TASA Trust";
  const articleMeta = article ? buildArticleMeta(article) : null;
  const jsonLd =
    article && articleMeta
      ? buildArticleJsonLd(
          article,
          articleMeta.canonical.startsWith("http")
            ? articleMeta.canonical
            : `${window.location.origin}${articleMeta.canonical}`,
          siteName,
        )
      : [];

  return (
    <Layout>
      {article && articleMeta ? (
        <PageSeo
          title={articleMeta.title}
          description={articleMeta.description}
          canonical={articleMeta.canonical}
          image={articleMeta.image}
          type="article"
          jsonLd={jsonLd}
        />
      ) : (
        <PageSeo
          title="Blog Article"
          description="Read the latest article from TASA Trust."
          canonical={`/blog/${encodeURIComponent(slug)}`}
        />
      )}

      <section className="relative overflow-hidden bg-secondary py-10 md:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.22),transparent_34%)]" aria-hidden="true" />
        <div className="container relative mx-auto px-4">
          <Button asChild variant="ghost" className="mb-5 gap-2 text-white hover:bg-white/10 hover:text-white">
            <Link to="/blog">
              <ArrowLeft className="h-4 w-4" />
              Back to blog
            </Link>
          </Button>

          {articleQuery.isLoading ? (
            <div className="space-y-4">
              <div className="h-4 w-24 animate-pulse rounded bg-white/20" />
              <div className="h-14 max-w-3xl animate-pulse rounded bg-white/20" />
              <div className="h-5 max-w-xl animate-pulse rounded bg-white/15" />
            </div>
          ) : !article ? (
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Blog</p>
              <h1 className="mt-4 text-4xl font-bold text-secondary-foreground">Article not found</h1>
              <p className="mt-4 text-white/75">
                This article could not be found or has not been published yet.
              </p>
            </div>
          ) : (
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                {article.category && article.category_slug ? (
                  <Link to={buildCategoryPath(article.category_slug)}>{article.category}</Link>
                ) : (
                  <span>Blog</span>
                )}
              </div>

              <h1 className="mt-3 text-3xl font-bold leading-tight text-secondary-foreground md:text-4xl lg:text-[2.8rem]">
                {article.title}
              </h1>

              {article.excerpt ? (
                <p className="mt-4 max-w-2xl text-sm text-white/75 md:text-base">
                  {article.excerpt}
                </p>
              ) : null}

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/75">
                {article.author_name && article.author_slug ? (
                  <Link to={buildAuthorPath(article.author_slug)} className="font-medium text-white">
                    {article.author_name}
                  </Link>
                ) : (
                  <span className="font-medium text-white">TASA Trust Team</span>
                )}
                <span className="hidden h-1 w-1 rounded-full bg-white/40 sm:inline-block" />
                <time dateTime={article.published_at}>
                  {format(new Date(article.published_at), "dd MMM yyyy")}
                </time>
                <span className="hidden h-1 w-1 rounded-full bg-white/40 sm:inline-block" />
                <span className="inline-flex items-center gap-2">
                  <Clock3 className="h-4 w-4" />
                  {getReadingTime(article)} min read
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {article ? (
        <>
          <section className="py-6 md:py-8">
            <div className="container mx-auto px-4">
              <div className="overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_24px_60px_-38px_hsl(var(--secondary)/0.75)]">
                <img
                  src={article.featured_image || workspaceProfessional}
                  alt={article.og_image_alt || article.title}
                  className="h-[220px] w-full object-cover md:h-[320px] lg:h-[360px]"
                />
              </div>
            </div>
          </section>

          <section className="pb-20">
            <div className="container mx-auto px-4">
              <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_300px]">
                <TableOfContents headings={decorated.headings} />

                <article className="surface-panel min-w-0 border-white/80 bg-white/92 p-6 md:p-8">
                  <div
                    className="blog-prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: decorated.html }}
                  />
                </article>

                <BlogSidebar categories={categories} recentPosts={recentPosts} />
              </div>
            </div>
          </section>
        </>
      ) : null}
    </Layout>
  );
}

function getReadingTime(article: CmsArticle) {
  const content = article.content || article.excerpt || "";
  const wordCount = content
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean).length;

  return Math.max(1, Math.ceil(wordCount / 220));
}
