import { useEffect } from "react";

type PageSeoProps = {
  title: string;
  description?: string;
  canonical?: string;
  image?: string;
  type?: "website" | "article";
  noindex?: boolean;
  jsonLd?: Record<string, unknown>[];
};

const SITE_TITLE = "TASA Trust";

function upsertMeta(
  selector: string,
  attribute: "name" | "property",
  key: string,
  value: string,
) {
  let element = document.head.querySelector(selector) as HTMLMetaElement | null;

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.setAttribute("content", value);
}

function upsertCanonical(href: string) {
  let element = document.head.querySelector(
    "link[rel='canonical']",
  ) as HTMLLinkElement | null;

  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }

  element.setAttribute("href", href);
}

export function PageSeo({
  title,
  description,
  canonical,
  image,
  type = "website",
  noindex = false,
  jsonLd = [],
}: PageSeoProps) {
  useEffect(() => {
    const resolvedCanonical = canonical
      ? canonical.startsWith("http")
        ? canonical
        : `${window.location.origin}${canonical.startsWith("/") ? canonical : `/${canonical}`}`
      : window.location.href;

    const fullTitle = title.includes(SITE_TITLE) ? title : `${title} | ${SITE_TITLE}`;

    document.title = fullTitle;

    if (description) {
      upsertMeta("meta[name='description']", "name", "description", description);
      upsertMeta(
        "meta[property='og:description']",
        "property",
        "og:description",
        description,
      );
      upsertMeta("meta[name='twitter:description']", "name", "twitter:description", description);
    }

    upsertMeta("meta[name='robots']", "name", "robots", noindex ? "noindex, nofollow" : "index, follow");
    upsertMeta("meta[property='og:title']", "property", "og:title", title);
    upsertMeta("meta[property='og:type']", "property", "og:type", type);
    upsertMeta("meta[property='og:url']", "property", "og:url", resolvedCanonical);
    upsertMeta("meta[name='twitter:title']", "name", "twitter:title", title);
    upsertMeta("meta[name='twitter:card']", "name", "twitter:card", image ? "summary_large_image" : "summary");

    if (image) {
      upsertMeta("meta[property='og:image']", "property", "og:image", image);
      upsertMeta("meta[name='twitter:image']", "name", "twitter:image", image);
    }

    upsertCanonical(resolvedCanonical);

    document.head
      .querySelectorAll("script[data-page-seo='true']")
      .forEach((element) => element.remove());

    jsonLd.forEach((entry) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.dataset.pageSeo = "true";
      script.textContent = JSON.stringify(entry);
      document.head.appendChild(script);
    });

    return () => {
      document.head
        .querySelectorAll("script[data-page-seo='true']")
        .forEach((element) => element.remove());
    };
  }, [canonical, description, image, jsonLd, noindex, title, type]);

  return null;
}
