import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "@/lib/analytics";

/**
 * Sends a GA4 page_view on every route change.
 * Skips /admin/* paths (handled inside trackPageView).
 */
export function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    // Defer slightly so document.title (set by PageSeo) is up to date.
    const id = window.setTimeout(() => {
      trackPageView(location.pathname + location.search);
    }, 50);
    return () => window.clearTimeout(id);
  }, [location.pathname, location.search]);

  return null;
}
