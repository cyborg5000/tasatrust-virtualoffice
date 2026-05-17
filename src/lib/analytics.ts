// Lightweight Google Analytics 4 wrapper.
// Excludes /admin/* paths from all tracking.

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const GA_MEASUREMENT_ID = "G-NXNVPLYEBM";

export function isExcludedPath(path: string): boolean {
  return path.startsWith("/admin");
}

function gtag(...args: unknown[]) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag === "function") {
    window.gtag(...args);
  } else {
    window.dataLayer.push(args);
  }
}

export function trackPageView(path: string, title?: string) {
  if (isExcludedPath(path)) return;
  gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: title ?? document.title,
    send_to: GA_MEASUREMENT_ID,
  });
}

type EventParams = Record<string, string | number | boolean | undefined>;

export function trackEvent(eventName: string, params: EventParams = {}) {
  if (typeof window === "undefined") return;
  if (isExcludedPath(window.location.pathname)) return;
  gtag("event", eventName, { send_to: GA_MEASUREMENT_ID, ...params });
}

// --- Conversion helpers (GA4 recommended event names) ---

export function trackSignUp(method = "email") {
  trackEvent("sign_up", { method });
}

export function trackContactSubmit(inquiryType?: string) {
  trackEvent("generate_lead", {
    form: "contact",
    inquiry_type: inquiryType,
  });
}

export function trackAddToCart(item: {
  id: string;
  name: string;
  price: number;
  priceType?: string;
}) {
  trackEvent("add_to_cart", {
    currency: "SGD",
    value: item.price,
    item_id: item.id,
    item_name: item.name,
    price_type: item.priceType,
  });
}

export function trackBeginCheckout(params: {
  tier?: string;
  billingCycle?: string;
  value?: number;
  addonCount?: number;
}) {
  trackEvent("begin_checkout", {
    currency: "SGD",
    value: params.value,
    tier: params.tier,
    billing_cycle: params.billingCycle,
    addon_count: params.addonCount,
  });
}

export function trackPurchase(params: {
  transactionId?: string;
  value?: number;
}) {
  trackEvent("purchase", {
    currency: "SGD",
    transaction_id: params.transactionId,
    value: params.value,
  });
}
