import { format } from "date-fns";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import workspaceProfessional from "@/assets/workspace-professional.jpg";
import {
  buildArticlePath,
  buildAuthorPath,
  buildCategoryPath,
  type CmsArticle,
} from "@/lib/blog-api";

type BlogCardProps = {
  article: CmsArticle;
};

export function BlogCard({ article }: BlogCardProps) {
  const articleHref = buildArticlePath(article.slug);
  const categoryHref = article.category_slug
    ? buildCategoryPath(article.category_slug)
    : null;
  const authorHref = article.author_slug
    ? buildAuthorPath(article.author_slug)
    : null;

  return (
    <article className="surface-panel overflow-hidden border-white/80 bg-white/90">
      <Link to={articleHref} className="block overflow-hidden">
        <img
          src={article.featured_image || workspaceProfessional}
          alt={article.og_image_alt || article.title}
          className="h-56 w-full object-cover transition-transform duration-500 hover:scale-[1.04]"
          loading="lazy"
        />
      </Link>

      <div className="space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {article.category && categoryHref ? (
            <Link to={categoryHref} className="text-primary transition-colors hover:text-secondary">
              {article.category}
            </Link>
          ) : null}
          <time dateTime={article.published_at}>
            {format(new Date(article.published_at), "dd MMM yyyy")}
          </time>
        </div>

        <div className="space-y-3">
          <Link to={articleHref} className="group inline-flex items-start gap-2">
            <h3 className="text-2xl font-bold text-secondary transition-colors group-hover:text-primary">
              {article.title}
            </h3>
            <ArrowUpRight className="mt-1 h-4 w-4 flex-shrink-0 text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>

          <p className="text-sm leading-7 text-muted-foreground">
            {article.excerpt || "Explore the latest guidance and practical insights from the TASA Trust team."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          {article.author_name && authorHref ? (
            <Link to={authorHref} className="font-medium text-secondary transition-colors hover:text-primary">
              {article.author_name}
            </Link>
          ) : (
            <span className="font-medium text-secondary">TASA Trust Team</span>
          )}
        </div>
      </div>
    </article>
  );
}
