import { useQuery } from "@tanstack/react-query";
import {
  getArticleBySlug,
  getArticleList,
  getArticleListRequestKey,
  type ArticleListRequest,
} from "@/lib/blog-api";

const FIVE_MINUTES = 5 * 60 * 1000;
const THIRTY_MINUTES = 30 * 60 * 1000;

export function useArticleList(request: ArticleListRequest = {}) {
  return useQuery({
    queryKey: ["blog", "list", getArticleListRequestKey(request)],
    queryFn: () => getArticleList(request),
    staleTime: FIVE_MINUTES,
    gcTime: THIRTY_MINUTES,
    retry: 1,
  });
}

export function useArticleBySlug(slug: string, enabled = true) {
  return useQuery({
    queryKey: ["blog", "detail", slug],
    queryFn: () => getArticleBySlug(slug),
    staleTime: FIVE_MINUTES,
    gcTime: THIRTY_MINUTES,
    retry: 1,
    enabled: enabled && Boolean(slug),
  });
}
