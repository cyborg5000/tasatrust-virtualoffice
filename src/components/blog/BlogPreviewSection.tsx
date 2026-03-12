import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { BlogCard } from "@/components/blog/BlogCard";
import { Button } from "@/components/ui/button";
import { useArticleList } from "@/hooks/useBlog";

export function BlogPreviewSection() {
  const { data, isLoading, isError } = useArticleList({ limit: 3 });
  const articles = data?.articles || [];

  return (
    <section className="relative py-20">
      <div className="absolute inset-0 section-grid-bg opacity-40" aria-hidden="true" />
      <div className="container relative mx-auto px-4">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Blog
            </p>
            <h2 className="mt-3 text-3xl font-bold text-secondary md:text-4xl">
              Guidance for founders building a credible Singapore presence
            </h2>
            <p className="mt-4 text-muted-foreground">
              Fresh articles on virtual office setup, compliance, accounting, and practical operating advice.
            </p>
          </div>

          <Button asChild variant="outline" className="w-fit">
            <Link to="/blog" className="gap-2">
              View all articles
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-6 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="surface-panel overflow-hidden border-white/70 bg-white/80">
                <div className="h-56 animate-pulse bg-muted" />
                <div className="space-y-4 p-6">
                  <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                  <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="h-16 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : isError || articles.length === 0 ? (
          <div className="surface-panel border-white/70 bg-white/88 p-8">
            <p className="text-lg font-semibold text-secondary">The blog archive is being prepared.</p>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              The section is live and ready for content. Once the CMS is connected, new articles will flow into this
              area automatically.
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
  );
}
