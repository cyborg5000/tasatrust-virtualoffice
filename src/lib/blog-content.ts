import DOMPurify from "dompurify";
import type { CmsArticle } from "@/lib/blog-api";

export type FaqItem = { question: string; answer: string };

export type HeadingItem = {
  id: string;
  text: string;
  level: number;
};

// The only embeds allowed through the article sanitizer: a YouTube player, by exact URL shape.
const YOUTUBE_EMBED_SRC =
  /^https:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com)\/embed\/[A-Za-z0-9_-]{11}(\?[^"'<>\s]*)?$/;

const IFRAME_ALLOWED_ATTRS = new Set([
  "src",
  "width",
  "height",
  "title",
  "allow",
  "allowfullscreen",
  "frameborder",
  "referrerpolicy",
  "loading",
]);

function isYoutubeEmbed(node: Element) {
  return (
    !node.hasAttribute("srcdoc") &&
    YOUTUBE_EMBED_SRC.test(node.getAttribute("src") || "")
  );
}

let articlePurifier: ReturnType<typeof DOMPurify> | null = null;

// DOMPurify hooks are global to an instance, so the iframe rule lives on its own
// instance and never touches the shared default export.
function getArticlePurifier() {
  if (articlePurifier) return articlePurifier;

  const purifier = DOMPurify(window);

  purifier.addHook("uponSanitizeElement", (node, data) => {
    if (data.tagName !== "iframe") return;
    const iframe = node as Element;

    if (!isYoutubeEmbed(iframe)) {
      iframe.parentNode?.removeChild(iframe);
      return;
    }

    for (const attr of Array.from(iframe.attributes)) {
      if (!IFRAME_ALLOWED_ATTRS.has(attr.name.toLowerCase())) {
        iframe.removeAttribute(attr.name);
      }
    }
    iframe.textContent = "";
  });

  // Re-check the src that actually survived attribute sanitizing.
  purifier.addHook("afterSanitizeAttributes", (node) => {
    if (node.nodeName?.toLowerCase() !== "iframe") return;
    if (!isYoutubeEmbed(node)) {
      node.parentNode?.removeChild(node);
    }
  });

  articlePurifier = purifier;
  return purifier;
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function slugifyHeading(value: string, usedIds: Set<string>) {
  const baseSlug =
    value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-") || "section";

  let candidate = baseSlug;
  let counter = 1;

  while (usedIds.has(candidate)) {
    candidate = `${baseSlug}-${counter}`;
    counter += 1;
  }

  usedIds.add(candidate);
  return candidate;
}

export function decorateArticleHtml(html: string) {
  if (!html) {
    return { html: "", headings: [] as HeadingItem[] };
  }

  const sanitized =
    typeof window !== "undefined"
      ? getArticlePurifier().sanitize(html, {
          USE_PROFILES: { html: true },
          ADD_TAGS: ["details", "summary", "iframe"],
          ADD_ATTR: (attributeName, tagName) =>
            tagName === "iframe" && IFRAME_ALLOWED_ATTRS.has(attributeName),
        })
      : html.replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, "")
            .replace(/\son[a-z]+\s*=\s*'[^']*'/gi, "")
            .replace(/javascript:/gi, "");

  if (typeof DOMParser === "undefined") {
    const headings = Array.from(
      sanitized.matchAll(/<(h[2-4])\b[^>]*>([\s\S]*?)<\/\1>/gi),
    ).map((match) => {
      const level = Number(match[1].replace("h", ""));
      const text = stripHtml(match[2] || "");
      return {
        id: text
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .trim()
          .replace(/\s+/g, "-"),
        text,
        level,
      };
    });

    return { html: sanitized, headings };
  }

  const parser = new DOMParser();
  const documentNode = parser.parseFromString(sanitized, "text/html");
  const usedIds = new Set<string>();
  const headings: HeadingItem[] = [];

  Array.from(documentNode.querySelectorAll("h2, h3, h4")).forEach((node) => {
    const text = node.textContent?.replace(/\s+/g, " ").trim() || "";
    if (!text) return;

    const level = Number(node.tagName.replace("H", ""));
    const existingId = node.getAttribute("id");
    const id = existingId || slugifyHeading(text, usedIds);
    node.setAttribute("id", id);

    headings.push({ id, text, level });
  });

  return {
    html: documentNode.body.innerHTML,
    headings,
  };
}

export function extractFaqItemsFromHtml(html: string): FaqItem[] {
  if (typeof DOMParser === "undefined") {
    const detailBlockRegex = /<details\b[^>]*>([\s\S]*?)<\/details>/gi;
    const tableBlockRegex =
      /<table\b[^>]*class=["'][^"']*\bfaq-block-table\b[^"']*["'][^>]*>([\s\S]*?)<\/table>/gi;
    const summaryRegex = /<summary\b[^>]*>([\s\S]*?)<\/summary>/i;
    const rowRegex = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
    const cellRegex = /<t[dh]\b[^>]*>([\s\S]*?)<\/t[hd]>/gi;

    const detailsFaqs = Array.from(html.matchAll(detailBlockRegex))
      .map((match) => {
        const rawBlock = match[1] || "";
        const question = stripHtml(rawBlock.match(summaryRegex)?.[1] || "");
        const answer = stripHtml(rawBlock.replace(summaryRegex, ""));
        return { question, answer };
      })
      .filter((faq) => faq.question.length > 0 && faq.answer.length > 0);

    const tableFaqs = Array.from(html.matchAll(tableBlockRegex))
      .map((match) => {
        const rawTable = match[1] || "";
        const rows = Array.from(rawTable.matchAll(rowRegex)).map(
          (rowMatch) => rowMatch[1] || "",
        );

        const question = rows[0]
          ? Array.from(rows[0].matchAll(cellRegex))
              .map((cellMatch) => cellMatch[1] || "")
              .filter((_, index) => index > 0)
              .join(" ")
          : "";

        const answer = rows[1]
          ? Array.from(rows[1].matchAll(cellRegex))
              .map((cellMatch) => cellMatch[1] || "")
              .filter((_, index) => index > 0)
              .join(" ")
          : "";

        return {
          question: stripHtml(question),
          answer: stripHtml(answer),
        };
      })
      .filter((faq) => faq.question.length > 0 && faq.answer.length > 0);

    return [...detailsFaqs, ...tableFaqs];
  }

  const parser = new DOMParser();
  const documentNode = parser.parseFromString(html || "", "text/html");

  const detailFaqs = Array.from(documentNode.querySelectorAll("details"))
    .filter((node) => {
      const summary = node.querySelector("summary");
      return Boolean(summary?.textContent?.trim());
    })
    .map((node) => {
      const summary = node.querySelector("summary");
      const clone = node.cloneNode(true) as HTMLElement;
      clone.querySelectorAll("summary").forEach((summaryNode) => summaryNode.remove());

      return {
        question: summary?.textContent?.trim() || "",
        answer: clone.textContent?.trim() || "",
      };
    })
    .filter((faq) => faq.question.length > 0 && faq.answer.length > 0);

  const tableFaqs = Array.from(
    documentNode.querySelectorAll("table.faq-block-table, table[data-faq-block]"),
  )
    .filter((node) => node.querySelectorAll("tr").length >= 2)
    .map((node) => {
      const rows = Array.from(node.querySelectorAll("tr"));
      const questionCell =
        rows[0]?.querySelectorAll("td")[0] || rows[0]?.querySelector("td");
      const answerCell =
        rows[1]?.querySelectorAll("td")[0] || rows[1]?.querySelector("td");

      return {
        question: questionCell?.textContent?.trim() || "",
        answer: answerCell?.textContent?.trim() || "",
      };
    })
    .filter((faq) => faq.question.length > 0 && faq.answer.length > 0);

  return [...detailFaqs, ...tableFaqs];
}

export function buildFaqSchemaJsonLd(items: FaqItem[], pageUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
    url: pageUrl,
  };
}

export function buildArticleJsonLd(
  article: CmsArticle,
  pageUrl: string,
  siteName = "TASA Trust",
) {
  const faqItems = article.content ? extractFaqItemsFromHtml(article.content) : [];

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    mainEntityOfPage: pageUrl,
    headline: article.seo_title || article.title,
    description: article.meta_description || article.excerpt || "",
    image: article.featured_image || undefined,
    author: article.author_name
      ? {
          "@type": "Person",
          name: article.author_name,
        }
      : undefined,
    datePublished: article.published_at,
    dateModified: article.updated_at,
    publisher: {
      "@type": "Organization",
      name: siteName,
    },
    url: pageUrl,
  } as Record<string, unknown>;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: window.location.origin,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${window.location.origin}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: pageUrl,
      },
    ],
  } as Record<string, unknown>;

  const scripts = [articleJsonLd, breadcrumbJsonLd];

  if (faqItems.length > 0) {
    scripts.push(buildFaqSchemaJsonLd(faqItems, pageUrl));
  }

  return scripts;
}

export function buildArticleMeta(article: CmsArticle) {
  return {
    title: article.seo_title || article.title,
    description: article.meta_description || article.excerpt || "",
    image: article.featured_image || undefined,
    canonical: article.canonical_url || article.canonical_path || `/blog/${article.slug}`,
  };
}

export function collectCategories(articles: CmsArticle[]) {
  const categoryMap = new Map<
    string,
    { slug: string; name: string; count: number }
  >();

  for (const article of articles) {
    if (!article.category || !article.category_slug) continue;

    const existing = categoryMap.get(article.category_slug);
    if (existing) {
      existing.count += 1;
    } else {
      categoryMap.set(article.category_slug, {
        slug: article.category_slug,
        name: article.category,
        count: 1,
      });
    }
  }

  return Array.from(categoryMap.values()).sort((left, right) =>
    left.name.localeCompare(right.name),
  );
}
