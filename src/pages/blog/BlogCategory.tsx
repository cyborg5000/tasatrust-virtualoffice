import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { BlogCard } from "@/components/blog/BlogCard";
import { PageSeo } from "@/components/seo/PageSeo";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useArticleList } from "@/hooks/useBlog";
import { prettifySlug } from "@/lib/blog-api";

export default function BlogCategory() {
  const params = useParams();
  const categorySlug = decodeURIComponent(params.category || "");
  const { data, isLoading, isError, error } = useArticleList({ category_slug: categorySlug });

  const articles = data?.articles || [];
  const title = articles[0]?.category || prettifySlug(categorySlug);
  const errorMessage =
    error instanceof Error ? error.message : "Please check the CMS proxy configuration and try again.";

  return (
    <Layout>
      <PageSeo
        title={`${title} Articles`}
        description={`Browse TASA Trust blog posts filed under ${title}.`}
        canonical={`/blog/category/${encodeURIComponent(categorySlug)}`}
      />

      <section className="py-16">
        <div className="container mx-auto px-4">
          <Button asChild variant="ghost" className="mb-6 gap-2">
            <Link to="/blog">
              <ArrowLeft className="h-4 w-4" />
              Back to blog
            </Link>
          </Button>

          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Category</p>
            <h1 className="mt-3 text-4xl font-bold text-secondary md:text-5xl">{title}</h1>
            <p className="mt-4 text-muted-foreground">
              Curated articles and practical guidance focused on {title.toLowerCase()}.
            </p>
          </div>

          <div className="mt-10">
            {isLoading ? (
              <p className="text-muted-foreground">Loading articles...</p>
            ) : isError ? (
              <div className="space-y-2">
                <p className="text-muted-foreground">We could not load this category right now.</p>
                <p className="text-sm text-muted-foreground">{errorMessage}</p>
              </div>
            ) : articles.length === 0 ? (
              <p className="text-muted-foreground">No articles were found for this category.</p>
            ) : (
              <div className="grid gap-6 lg:grid-cols-3">
                {articles.map((article) => (
                  <BlogCard key={article.id} article={article} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
