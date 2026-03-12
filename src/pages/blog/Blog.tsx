import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { BlogCard } from "@/components/blog/BlogCard";
import { PageSeo } from "@/components/seo/PageSeo";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useArticleList } from "@/hooks/useBlog";
import { buildCategoryPath } from "@/lib/blog-api";
import { collectCategories } from "@/lib/blog-content";

export default function Blog() {
  const { data, isLoading, isError, error } = useArticleList();
  const articles = data?.articles || [];
  const categories = collectCategories(articles);
  const errorMessage =
    error instanceof Error ? error.message : "Please check the CMS proxy configuration and try again.";

  return (
    <Layout>
      <PageSeo
        title="Blog"
        description="Read TASA Trust articles on virtual offices, compliance, accounting, and business operations in Singapore."
        canonical="/blog"
      />

      <section className="relative overflow-hidden bg-secondary py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.22),transparent_32%)]" aria-hidden="true" />
        <div className="container relative mx-auto px-4">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Blog</p>
            <h1 className="mt-4 text-4xl font-bold text-secondary-foreground md:text-5xl">
              Practical insights for operating with confidence in Singapore
            </h1>
            <p className="mt-5 max-w-2xl text-base text-white/75 md:text-lg">
              Explore articles on virtual office setup, business credibility, compliance, bookkeeping, and the small
              operational details that help companies run smoothly.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Latest Articles
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {data?.pagination.total
                  ? `${data.pagination.total} published article${data.pagination.total === 1 ? "" : "s"}`
                  : "Fresh content from the TASA Trust team"}
              </p>
            </div>

            <Button asChild variant="ghost" className="gap-2">
              <Link to="/">
                <ArrowLeft className="h-4 w-4" />
                Back to home
              </Link>
            </Button>
          </div>

          {categories.length > 0 ? (
            <div className="mb-10 flex flex-wrap gap-3">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  to={buildCategoryPath(category.slug)}
                  className="rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-secondary transition-colors hover:border-primary/40 hover:bg-primary/15"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          ) : null}

          {isLoading ? (
            <div className="grid gap-6 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="surface-panel overflow-hidden border-white/70 bg-white/85">
                  <div className="h-56 animate-pulse bg-muted" />
                  <div className="space-y-4 p-6">
                    <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                    <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
                    <div className="h-16 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="surface-panel border-white/70 bg-white/88 p-8">
              <p className="text-lg font-semibold text-secondary">Unable to load the blog right now.</p>
              <p className="mt-3 text-muted-foreground">
                The archive routes are in place, but the content service is not responding yet.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{errorMessage}</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="surface-panel border-white/70 bg-white/88 p-8">
              <p className="text-lg font-semibold text-secondary">No articles published yet.</p>
              <p className="mt-3 text-muted-foreground">
                This archive is ready to display posts as soon as content is available from the CMS.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              {articles.map((article) => (
                <BlogCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
