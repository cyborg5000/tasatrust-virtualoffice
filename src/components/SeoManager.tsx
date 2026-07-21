import { useEffect } from "react";
import { useLocation } from "react-router-dom";

type SeoConfig = {
  title: string;
  description: string;
  noindex?: boolean;
};

const siteTitle = "TASA Trust";
const defaultSeo: SeoConfig = {
  title: "Trusted Accountants",
  description:
    "TASA Trust provides Singapore virtual office and corporate services, including business address, bookkeeping, tax, and compliance support.",
};

const routeSeoMap: Record<string, SeoConfig> = {
  "/": {
    title: "Virtual Office Singapore — Business Address & Mail Handling",
    description:
      "Set up a virtual office in Singapore: ACRA-ready registered business address, mail scanning and forwarding, call answering, and meeting rooms. Instant setup, no lock-in.",
  },
  "/pricing": {
    title: "Virtual Office Singapore Pricing — Plans from S$15.99/month",
    description:
      "Compare Singapore virtual office plans: registered business address, mail handling, call answering, and meeting room credits. Monthly or annual, no lock-in.",
  },
  "/contact": {
    title: "Contact TASA Trust",
    description: "Reach TASA Trust for corporate services, support, and custom virtual office solutions.",
  },
  "/services": {
    title: "Services",
    description: "Explore TASA Trust corporate services including bookkeeping, secretarial support, tax, payroll, and more.",
  },
  "/about": {
    title: "About TASA Trust",
    description: "Learn how TASA Trust supports Singapore businesses with trusted compliance and accounting solutions.",
  },
  "/startup-kit": {
    title: "Startup Kit — Register a Singapore Company End-to-End",
    description:
      "Everything a Singapore startup needs: ACRA company registration, corporate secretary, registered office, accounting, tax & GST, plus website and branding. One partner, one kit.",
  },
  "/startup-kit/register-company-singapore": {
    title: "Company Registration Singapore — Incorporate a Pte Ltd",
    description:
      "Register a company in Singapore with TASA Trust. ACRA Pte Ltd incorporation, name reservation, constitution, and first-board documents done for you — usually within 24 hours.",
  },
  "/startup-kit/foreigner-guide": {
    title: "How to Register a Company in Singapore as a Foreigner",
    description:
      "Foreigner guide to registering a Singapore company: 100% ownership, nominee director, registered address, and ongoing compliance — without an EP or relocating.",
  },
  "/startup-kit/corporate-secretary": {
    title: "Corporate Secretarial Services Singapore",
    description:
      "Qualified Singapore corporate secretary service. Annual returns, statutory registers, AGM resolutions, and ACRA filings handled for your Pte Ltd — flat annual fee.",
  },
  "/startup-kit/registered-address": {
    title: "Registered Address Service Singapore — Virtual Office",
    description:
      "ACRA-accepted Singapore registered office address with mail receipt, scanning, and forwarding. Use it for company registration, on invoices, and on your website.",
  },
  "/startup-kit/accounting-tax": {
    title: "Accounting, Tax & GST Filing for Singapore Startups",
    description:
      "Cloud bookkeeping, un-audited financial statements, XBRL, GST registration and quarterly filing, and corporate tax (Form C-S) for Singapore startups.",
  },
  "/startup-kit/website-branding": {
    title: "Startup Website & Branding — Singapore",
    description:
      "Logo, brand kit, and a launch-ready marketing website for Singapore startups. Bundled with your incorporation so you can start selling on day one.",
  },
  "/tools": {
    title: "Free Singapore Business Tools — Tax, GST, SSIC",
    description:
      "Free calculators and lookups for Singapore businesses: personal income tax calculator (IRAS rates), GST calculator at 9%, and SSIC code lookup for ACRA incorporation.",
  },
  "/tools/income-tax-calculator": {
    title: "Singapore Personal Income Tax Calculator (YA 2024+)",
    description:
      "Free Singapore personal income tax calculator using the latest IRAS resident and non-resident rates. See tax payable, effective rate, and take-home pay in seconds.",
  },
  "/tools/gst-calculator": {
    title: "Singapore GST Calculator (9%) — Add or Remove GST",
    description:
      "Free Singapore GST calculator at the current 9% rate. Add GST to a net amount or extract GST from a GST-inclusive price for invoicing.",
  },
  "/tools/ssic-code-lookup": {
    title: "SSIC Code Lookup — Singapore Industrial Classification",
    description:
      "Search ACRA's Singapore Standard Industrial Classification (SSIC 2020) codes for company registration. Find the right primary or secondary business activity code instantly.",
  },
  "/privacy": {
    title: "Privacy Policy",
    description: "Read how TASA Trust collects and protects your personal and business information.",
  },
  "/terms": {
    title: "Terms of Service",
    description: "Review the terms and conditions for using TASA Trust services.",
  },
  "/cookies": {
    title: "Cookie Policy",
    description: "Understand how TASA Trust uses cookies and tracking technologies.",
  },
  "/faq": {
    title: "Frequently Asked Questions",
    description:
      "Find answers to common questions about Singapore virtual offices, pricing, and corporate service setup.",
  },
  "/help": {
    title: "Help Center",
    description: "Get help and support for TASA Trust services and account management.",
  },
  "/blog": {
    title: "Blog",
    description:
      "Read TASA Trust articles on virtual offices, accounting, compliance, and running a business in Singapore.",
  },
  "/login": {
    title: "Member Login",
    description: "Sign in to access your TASA Trust dashboard and service management tools.",
    noindex: true,
  },
  "/signup": {
    title: "Member Sign Up",
    description: "Create a TASA Trust account to access corporate services and member benefits.",
    noindex: true,
  },
  "/forgot-password": {
    title: "Forgot Password",
    description: "Recover your TASA Trust account password securely.",
    noindex: true,
  },
  "/reset-password": {
    title: "Reset Password",
    description: "Set a new password for your TASA Trust account.",
    noindex: true,
  },
  "/member": {
    title: "Member Dashboard",
    description: "Manage your virtual office subscriptions, bookings, and service requests from your TASA Trust portal.",
    noindex: true,
  },
  "/member/onboarding": {
    title: "Onboarding",
    description: "Complete your TASA Trust onboarding and select account setup options.",
    noindex: true,
  },
  "/member/onboarding/addons": {
    title: "Onboarding Add-ons",
    description: "Choose additional services during your TASA Trust onboarding process.",
    noindex: true,
  },
  "/member/checkout/success": {
    title: "Checkout Success",
    description: "Your TASA Trust checkout and payment was completed successfully.",
    noindex: true,
  },
  "/member/services": {
    title: "Member Services",
    description: "Browse and manage your available TASA Trust services.",
    noindex: true,
  },
  "/member/bookings": {
    title: "Member Bookings",
    description: "View and manage your booking history for meeting rooms and business services.",
    noindex: true,
  },
  "/member/billing": {
    title: "Member Billing",
    description: "Review invoices, subscription details, and payment history.",
    noindex: true,
  },
  "/member/settings": {
    title: "Account Settings",
    description: "Update your TASA Trust profile and account preferences.",
    noindex: true,
  },
  "/admin": {
    title: "Admin Dashboard",
    description: "Manage users, services, and orders from the TASA Trust admin console.",
    noindex: true,
  },
  "/admin/members": {
    title: "Admin Members",
    description: "Manage member accounts and support operations for TASA Trust.",
    noindex: true,
  },
  "/admin/services": {
    title: "Admin Services",
    description: "Manage service catalog and configuration in the TASA Trust admin area.",
    noindex: true,
  },
  "/admin/orders": {
    title: "Admin Orders",
    description: "Track and manage member order activity from the admin dashboard.",
    noindex: true,
  },
  "/admin/website-builds": {
    title: "Admin Website Builds",
    description: "Review and process website build requests from members.",
    noindex: true,
  },
  "/admin/settings": {
    title: "Admin Settings",
    description: "Configure account-level platform settings.",
    noindex: true,
  },
  "404": {
    title: "Page Not Found",
    description: "This page could not be found.",
  },
};

const noIndexPrefixes = ["/member", "/admin"];

const setMeta = (
  selector: string,
  attribute: string,
  value: string,
  isProperty = false,
) => {
  const attrName = isProperty ? "property" : "name";
  let element = document.querySelector(selector) as HTMLMetaElement | null;

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attrName, attribute);
    document.head.appendChild(element);
  } else if (element.getAttribute(attrName) !== attribute) {
    element.setAttribute(attrName, attribute);
  }

  element.setAttribute("content", value);
};

const setCanonical = (href: string) => {
  let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;

  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }

  canonical.setAttribute("href", href);
};

const normalizePath = (pathname: string) => {
  if (!pathname || pathname === "/") {
    return "/";
  }
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed || "/";
};

const pickRouteSeo = (pathname: string): SeoConfig => {
  const normalized = normalizePath(pathname);
  const matchedSeo = routeSeoMap[normalized];

  if (normalized === "/blog" || normalized.startsWith("/blog/")) {
    return matchedSeo || routeSeoMap["/blog"];
  }

  if (normalized.startsWith("/startup-kit")) {
    return matchedSeo || routeSeoMap["/startup-kit"];
  }

  if (normalized.startsWith("/tools")) {
    return matchedSeo || routeSeoMap["/tools"];
  }

  if (
    !matchedSeo &&
    noIndexPrefixes.every((prefix) => normalized !== prefix && !normalized.startsWith(`${prefix}/`))
  ) {
    const isKnownPublicRoute =
      ["/", "/pricing", "/contact", "/services", "/about", "/privacy", "/terms", "/cookies", "/faq", "/help", "/blog", "/startup-kit", "/tools"].includes(
        normalized,
      );
    if (!isKnownPublicRoute) {
      return {
        title: "Page Not Found",
        description: "This page could not be found.",
        noindex: true,
      };
    }
  }

  if (matchedSeo) {
    return matchedSeo;
  }

  if (noIndexPrefixes.some((prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`))) {
    return { ...defaultSeo, noindex: true };
  }

  return defaultSeo;
};

export function SeoManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    const seo = pickRouteSeo(pathname);
    const normalizedPath = normalizePath(pathname);
    // Fixed canonical host: apex/www both resolve, www is canonical (301'd in vercel.json).
    const canonical = `https://www.tasatrust.com${normalizedPath === "/" ? "/" : normalizedPath}`;
    const fullTitle = `${seo.title} | ${siteTitle}`;

    document.title = fullTitle;
    setMeta("meta[name='description']", "description", seo.description);
    setMeta("meta[name='keywords']", "keywords", `${defaultSeo.title}, ${siteTitle}, Singapore virtual office, corporate secretary`);
    setMeta("meta[name='robots']", "robots", seo.noindex ? "noindex, nofollow" : "index, follow");

    setMeta("meta[property='og:title']", "og:title", seo.title, true);
    setMeta("meta[property='og:description']", "og:description", seo.description, true);
    setMeta("meta[property='og:url']", "og:url", canonical, true);
    setMeta("meta[name='twitter:title']", "twitter:title", seo.title);
    setMeta("meta[name='twitter:description']", "twitter:description", seo.description);

    setCanonical(canonical);
  }, [pathname]);

  return null;
}
