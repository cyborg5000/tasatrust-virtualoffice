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
      <section className="surface-panel border-primary/30 bg-secondary p-5 text-secondary-foreground">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          ACRA-Ready Business Address
        </p>
        <p className="mt-3 text-lg font-bold leading-snug">
          Your registered address, mail handling and compliance — one provider.
        </p>
        <ul className="mt-3 space-y-1.5 text-sm text-white/85">
          <li>• Registered address included in every plan</li>
          <li>• From S$15.99/month, no lock-in</li>
          <li>• Corp sec, accounting and tax under the same roof</li>
        </ul>
        <div className="mt-4 flex flex-col gap-2">
          <Link
            to="/pricing"
            className="rounded-md bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            View plans &amp; pricing
          </Link>
          <Link
            to="/signup"
            className="rounded-md border border-white/25 px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            Set up in minutes
          </Link>
        </div>
      </section>

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
