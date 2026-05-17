import {
  Building2,
  FileSignature,
  MapPin,
  Calculator,
  Globe,
  Megaphone,
  type LucideIcon,
} from "lucide-react";

export type StartupKitPillar = {
  slug: string;
  path: string;
  navLabel: string;
  hubLabel: string;
  hubBlurb: string;
  icon: LucideIcon;
  // SEO + spoke page
  title: string;
  metaDescription: string;
  h1: string;
  intro: string;
  primaryKeyword: string;
};

export const STARTUP_KIT_BASE = "/startup-kit";

export const startupKitPillars: StartupKitPillar[] = [
  {
    slug: "register-company-singapore",
    path: `${STARTUP_KIT_BASE}/register-company-singapore`,
    navLabel: "Register a Company",
    hubLabel: "1. Register your Singapore company",
    hubBlurb:
      "Incorporate a Pte Ltd with ACRA in as little as 24 hours — name reservation, constitution, and first-board paperwork handled end-to-end.",
    icon: Building2,
    title: "Company Registration Singapore — Incorporate a Pte Ltd",
    metaDescription:
      "Register a company in Singapore with TASA Trust. ACRA Pte Ltd incorporation, name reservation, constitution, and first-board documents done for you — usually within 24 hours.",
    h1: "Company Registration in Singapore",
    intro:
      "Register a Pte Ltd with ACRA, get your UEN, and start operating in Singapore in as little as 24 hours. TASA Trust handles name reservation, constitution drafting, first-board resolutions, and your registered office address in one bundled flow.",
    primaryKeyword: "company registration singapore",
  },
  {
    slug: "foreigner-guide",
    path: `${STARTUP_KIT_BASE}/foreigner-guide`,
    navLabel: "Foreigner Setup Guide",
    hubLabel: "Setting up from overseas?",
    hubBlurb:
      "Foreigners can fully own a Singapore Pte Ltd. We provide the nominee director, registered office, and corp sec required to incorporate without relocating.",
    icon: Globe,
    title: "How to Register a Company in Singapore as a Foreigner",
    metaDescription:
      "Foreigner guide to registering a Singapore company: 100% ownership, nominee director, registered address, and ongoing compliance — without needing an EP or relocating.",
    h1: "How to Register a Company in Singapore as a Foreigner",
    intro:
      "Foreigners can own 100% of a Singapore Pte Ltd, but ACRA requires at least one locally-resident director and a Singapore registered office. TASA Trust provides the nominee director, registered address, and corporate secretary so you can incorporate from anywhere in the world.",
    primaryKeyword: "register a company in singapore as foreigner",
  },
  {
    slug: "corporate-secretary",
    path: `${STARTUP_KIT_BASE}/corporate-secretary`,
    navLabel: "Corporate Secretary",
    hubLabel: "2. Appoint a corporate secretary",
    hubBlurb:
      "Every Singapore Pte Ltd must appoint a qualified corporate secretary within 6 months. We file annual returns, maintain registers, and keep you ACRA-compliant.",
    icon: FileSignature,
    title: "Corporate Secretarial Services Singapore",
    metaDescription:
      "Qualified Singapore corporate secretary service. Annual returns, statutory registers, AGM resolutions, and ACRA filings handled for your Pte Ltd — flat annual fee.",
    h1: "Corporate Secretarial Services in Singapore",
    intro:
      "Singapore law requires every Pte Ltd to appoint a qualified corporate secretary within 6 months of incorporation. TASA Trust acts as your named corporate secretary, files your annual return, maintains your statutory registers, and prepares AGM and board resolutions — for a flat annual fee.",
    primaryKeyword: "corporate secretarial services singapore",
  },
  {
    slug: "registered-address",
    path: `${STARTUP_KIT_BASE}/registered-address`,
    navLabel: "Registered Address",
    hubLabel: "3. Get a registered business address",
    hubBlurb:
      "An ACRA-ready Singapore business address with mail handling, scanning, and forwarding — use it the moment you incorporate.",
    icon: MapPin,
    title: "Registered Address Service Singapore — Virtual Office",
    metaDescription:
      "ACRA-accepted Singapore registered office address with mail receipt, scanning, and forwarding. Use it for company registration, on invoices, and on your website.",
    h1: "Registered Address Service in Singapore",
    intro:
      "Every Singapore company needs a registered office address that's open to the public during business hours. TASA Trust's virtual office gives you a prestigious Singapore address that satisfies ACRA, plus mail handling, scanning, and call answering — without leasing physical space.",
    primaryKeyword: "registered address service singapore",
  },
  {
    slug: "accounting-tax",
    path: `${STARTUP_KIT_BASE}/accounting-tax`,
    navLabel: "Accounting, Tax & GST",
    hubLabel: "4. Stay compliant with accounting & tax",
    hubBlurb:
      "Cloud bookkeeping, un-audited financial statements, GST filings, and Form C-S — built around your first year of trading.",
    icon: Calculator,
    title: "Accounting, Tax & GST Filing for Singapore Startups",
    metaDescription:
      "Cloud bookkeeping, un-audited financial statements, XBRL, GST registration and quarterly filing, and corporate tax (Form C-S) — designed for Singapore startups.",
    h1: "Accounting, Tax & GST Filing for Singapore Startups",
    intro:
      "From your very first invoice, TASA Trust keeps your books in cloud accounting, prepares un-audited financial statements, handles XBRL, registers and files GST, and submits your corporate tax return (Form C-S). One partner, one fee, full IRAS and ACRA compliance.",
    primaryKeyword: "corporate tax filing singapore",
  },
  {
    slug: "website-branding",
    path: `${STARTUP_KIT_BASE}/website-branding`,
    navLabel: "Website & Branding",
    hubLabel: "5. Launch your website & brand",
    hubBlurb:
      "Logo, brand kit, and a launch-ready marketing site so you can start selling the moment your UEN is issued.",
    icon: Megaphone,
    title: "Startup Website & Branding — Singapore",
    metaDescription:
      "Logo, brand kit, and a launch-ready marketing website for Singapore startups. Bundled with your incorporation so you can start selling on day one.",
    h1: "Website & Branding for Singapore Startups",
    intro:
      "A registered company isn't a business until customers can find and trust you. TASA Trust delivers a logo, brand kit, and a launch-ready marketing website as part of the Startup Kit — so the moment your UEN is issued, you're ready to take orders.",
    primaryKeyword: "startup website singapore",
  },
];

export const startupKitFaqs = [
  {
    q: "How do I start a business in Singapore?",
    a: "Reserve a company name with ACRA, prepare your constitution, appoint at least one locally-resident director, set a registered office address, and submit incorporation via BizFile. TASA Trust's Startup Kit bundles every step plus your corporate secretary, accounting, and website so you can go from idea to operating in under a week.",
  },
  {
    q: "How much does it cost to register a company in Singapore?",
    a: "ACRA charges S$15 for name reservation and S$300 for Pte Ltd incorporation. On top of that you'll need a corporate secretary, a registered office address, and (for foreigners) a nominee director. TASA Trust's Startup Kit bundles all of this into a single transparent monthly fee.",
  },
  {
    q: "Can a foreigner register a company in Singapore?",
    a: "Yes. Foreigners can own 100% of a Singapore Pte Ltd. ACRA requires at least one locally-resident director, which TASA Trust provides via our nominee director service — so you can incorporate from anywhere in the world without an Employment Pass.",
  },
  {
    q: "How long does it take to register a company in Singapore?",
    a: "Most Pte Ltd incorporations are approved by ACRA within 1–3 hours of submission, provided KYC and supporting documents are in order. TASA Trust typically delivers a fully-formed company — including registered address and corporate secretary appointment — within 24 hours.",
  },
  {
    q: "Is a corporate secretary compulsory in Singapore?",
    a: "Yes. Section 171 of the Companies Act requires every Singapore company to appoint a qualified corporate secretary within 6 months of incorporation. TASA Trust acts as your named corporate secretary and handles every ACRA filing for a flat annual fee.",
  },
  {
    q: "Do I need a physical office to register a company in Singapore?",
    a: "No. You only need a registered office address that's open to the public during business hours. A virtual office like TASA Trust's satisfies ACRA's requirement and is accepted on BizFile, invoices, and your website.",
  },
  {
    q: "Can I register a startup in Singapore without capital?",
    a: "Yes. The minimum paid-up capital for a Singapore Pte Ltd is just S$1. You can incorporate now and increase capital later as you raise funding.",
  },
  {
    q: "What's included in the TASA Trust Startup Kit?",
    a: "Company incorporation with ACRA, corporate secretary for the first year, a Singapore registered office address, mail handling, cloud bookkeeping setup, GST and tax registration, plus a logo, brand kit, and launch-ready marketing website.",
  },
];
