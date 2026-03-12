import { format } from "date-fns";
import { Link } from "react-router-dom";
import {
  buildArticlePath,
  buildCategoryPath,
  type CmsArticle,
} from "@/lib/blog-api";

type CategorySummary = {
  slug: string;
  name: string;
  count: number;
};

type BlogSidebarProps = {
  categories: CategorySummary[];
  recentPosts: CmsArticle[];
};

export function BlogSidebar({ categories, recentPosts }: BlogSidebarProps) {
  return (
    <aside className="space-y-6 xl:sticky xl:top-28">
      <section className="surface-panel border-white/70 bg-white/88 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Categories
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.length > 0 ? (
            categories.map((category) => (
              <Link
                key={category.slug}
                to={buildCategoryPath(category.slug)}
                className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-medium text-secondary transition-colors hover:border-primary/40 hover:bg-primary/15"
              >
                {category.name} ({category.count})
              </Link>
            ))
          ) : (
            <p className="text-sm leading-6 text-muted-foreground">
              Categories will appear once published articles are available.
            </p>
          )}
        </div>
      </section>

      <section className="surface-panel border-white/70 bg-white/88 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Recent Posts
        </p>
        <div className="mt-4 space-y-4">
          {recentPosts.length > 0 ? (
            recentPosts.map((article) => (
              <article key={article.id} className="border-b border-border/60 pb-4 last:border-b-0 last:pb-0">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  {article.category || "Insights"}
                </p>
                <Link
                  to={buildArticlePath(article.slug)}
                  className="mt-2 block text-base font-semibold leading-6 text-secondary transition-colors hover:text-primary"
                >
                  {article.title}
                </Link>
                <time
                  dateTime={article.published_at}
                  className="mt-2 block text-xs text-muted-foreground"
                >
                  {format(new Date(article.published_at), "dd MMM yyyy")}
                </time>
              </article>
            ))
          ) : (
            <p className="text-sm leading-6 text-muted-foreground">
              Recent articles will appear here automatically.
            </p>
          )}
        </div>
      </section>
    </aside>
  );
}
