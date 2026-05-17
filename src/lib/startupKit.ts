import {
  Building2,
  FileSignature,
  MapPin,
  Calculator,
  Globe,
  Megaphone,
  type LucideIcon,
} from "lucide-react";

import registerCompanyImg from "@/assets/startup-kit/register-company.jpg";
import foreignerGuideImg from "@/assets/startup-kit/foreigner-guide.jpg";
import corporateSecretaryImg from "@/assets/startup-kit/corporate-secretary.jpg";
import registeredAddressImg from "@/assets/startup-kit/registered-address.jpg";
import accountingTaxImg from "@/assets/startup-kit/accounting-tax.jpg";
import websiteBrandingImg from "@/assets/startup-kit/website-branding.jpg";

export type StartupKitSection = {
  heading: string;
  body: string;
  bullets?: string[];
};

export type StartupKitFaq = { q: string; a: string };

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
  /** Long-tail / sub-keywords surfaced from Semrush research for on-page SEO + internal anchor variety. */
  subKeywords: string[];
  /** Hero / OG image. */
  image: string;
  imageAlt: string;
  /** Long-form content sections. */
  sections: StartupKitSection[];
  /** Page-specific FAQs (rendered + emitted as FAQPage JSON-LD). */
  faqs: StartupKitFaq[];
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
    title: "Company Registration Singapore — Incorporate a Pte Ltd (2026)",
    metaDescription:
      "Register a company in Singapore with TASA Trust. ACRA Pte Ltd incorporation via BizFile, name reservation, constitution, UEN, and corporate secretary — usually within 24 hours.",
    h1: "Company Registration in Singapore",
    intro:
      "Register a Pte Ltd with ACRA, get your UEN, and start operating in Singapore in as little as 24 hours. TASA Trust handles name reservation, constitution drafting, first-board resolutions, BizFile submission, and your registered office address in one bundled flow.",
    primaryKeyword: "company registration singapore",
    subKeywords: [
      "incorporate a company in singapore",
      "pte ltd registration",
      "acra company registration",
      "bizfile incorporation",
      "uen number singapore",
      "how to register a company in singapore",
    ],
    image: registerCompanyImg,
    imageAlt: "Singapore Marina Bay skyline representing company registration with ACRA",
    sections: [
      {
        heading: "What you need to register a company in Singapore",
        body:
          "ACRA only approves a Pte Ltd incorporation when six conditions are in place. We prepare every one of them for you before the BizFile submission so the application clears on the first try.",
        bullets: [
          "An approved company name (reserved with ACRA for S$15)",
          "At least one shareholder — individual or corporate, 100% foreign ownership allowed",
          "At least one locally-resident director (Singapore citizen, PR, or EP holder)",
          "A qualified corporate secretary appointed within 6 months",
          "A Singapore registered office address open during business hours",
          "Minimum paid-up capital of just S$1",
        ],
      },
      {
        heading: "The 5-step incorporation process",
        body:
          "Most clients are operating with a live UEN inside 24 hours from KYC to ACRA approval. Here is exactly what happens on our side.",
        bullets: [
          "Step 1 — Name reservation on BizFile (approved within 15 minutes for non-regulated names)",
          "Step 2 — KYC, beneficial ownership, and shareholder ID collection",
          "Step 3 — Constitution and first-board resolutions drafted and e-signed",
          "Step 4 — BizFile incorporation submitted — ACRA usually approves in 1–3 hours",
          "Step 5 — UEN issued, business profile delivered, bank account introduction made",
        ],
      },
      {
        heading: "Costs: ACRA fees vs. total setup",
        body:
          "ACRA itself charges S$15 for name reservation and S$300 for incorporation. The real cost of a Singapore company comes from the ongoing essentials: a corporate secretary, registered address, accounting, and (for foreigners) a nominee director. The TASA Trust Startup Kit bundles all of these into a single transparent monthly fee instead of separate invoices from four different vendors.",
      },
      {
        heading: "Why a Pte Ltd is the right structure for most founders",
        body:
          "A Private Limited company is the only Singapore entity that gives you limited liability, separate legal personality, full access to startup tax incentives like Start-Up Tax Exemption (SUTE), and credibility with banks and investors. Sole proprietorships and LLPs save a few hundred dollars upfront but cost founders far more the moment they raise money, hire, or sign their first enterprise contract.",
      },
    ],
    faqs: [
      {
        q: "How long does company registration in Singapore take?",
        a: "ACRA usually approves a complete BizFile submission within 1–3 hours. With TASA Trust handling KYC, constitution drafting, and submission, most founders have a fully-formed Pte Ltd with UEN inside 24 hours.",
      },
      {
        q: "How much does it cost to register a company in Singapore?",
        a: "ACRA charges S$15 for name reservation and S$300 for Pte Ltd incorporation. Total first-year cost — including corporate secretary, registered address, and (for foreigners) nominee director — is bundled in our Startup Kit at a single transparent monthly fee.",
      },
      {
        q: "What's the minimum paid-up capital?",
        a: "S$1. You can incorporate with the minimum and increase paid-up capital later as you raise funding or sign enterprise contracts.",
      },
      {
        q: "Do I need to be in Singapore to register a company?",
        a: "No. The entire incorporation, KYC, and signing process is fully remote. ACRA does require at least one locally-resident director, which we provide via our nominee director service.",
      },
    ],
  },
  {
    slug: "foreigner-guide",
    path: `${STARTUP_KIT_BASE}/foreigner-guide`,
    navLabel: "Foreigner Setup Guide",
    hubLabel: "Setting up from overseas?",
    hubBlurb:
      "Foreigners can fully own a Singapore Pte Ltd. We provide the nominee director, registered office, and corp sec required to incorporate without relocating.",
    icon: Globe,
    title: "How to Register a Company in Singapore as a Foreigner (2026 Guide)",
    metaDescription:
      "Foreigner guide to registering a Singapore company: 100% ownership, nominee director, registered address, bank account, and ongoing compliance — without an EP or relocating.",
    h1: "How to Register a Company in Singapore as a Foreigner",
    intro:
      "Foreigners can own 100% of a Singapore Pte Ltd, but ACRA requires at least one locally-resident director and a Singapore registered office. TASA Trust provides the nominee director, registered address, and corporate secretary so you can incorporate from anywhere in the world.",
    primaryKeyword: "register a company in singapore as a foreigner",
    subKeywords: [
      "singapore company nominee director",
      "100% foreign owned singapore company",
      "set up singapore company from overseas",
      "singapore pte ltd for non-residents",
      "employment pass after incorporation",
      "open bank account singapore foreigner",
    ],
    image: foreignerGuideImg,
    imageAlt: "Foreign founder with passport and laptop incorporating a Singapore company",
    sections: [
      {
        heading: "Yes — foreigners can own 100% of a Singapore company",
        body:
          "Singapore is one of the few top-10 economies that allows full foreign ownership of a private limited company with no minimum local shareholding. You don't need to live here, hold an Employment Pass, or have a local business partner. You only need one locally-resident director on paper, which TASA Trust supplies via our nominee director service.",
      },
      {
        heading: "What you need as a foreign founder",
        body:
          "The setup is nearly identical to a local incorporation, with three extras specifically for non-residents:",
        bullets: [
          "Nominee resident director (legally required — TASA Trust provides this)",
          "Singapore registered office address (we provide an ACRA-accepted address)",
          "Corporate secretary appointed within 6 months",
          "Certified passport copy and proof of residential address for KYC",
          "Optional: Employment Pass application later if you want to relocate and run the company yourself",
          "Bank account — we introduce you to DBS, OCBC, UOB, Aspire, and Wise Business",
        ],
      },
      {
        heading: "Timeline: from overseas to operating UEN",
        body:
          "Most foreign founders go from first KYC email to live UEN in 3–5 business days. The bottleneck is almost never ACRA — it's bank KYC. We pre-package your incorporation documents in the format DBS and OCBC expect so the bank account opens within 1–2 weeks of UEN issuance instead of the typical 4–6.",
      },
      {
        heading: "Do you need an Employment Pass?",
        body:
          "No — not to incorporate, not to own shares, and not to receive dividends. You only need an EP if you want to physically work in Singapore as an employee of your own company. Many of our clients run their Singapore Pte Ltd from London, Dubai, San Francisco, or Sydney for years before applying for an EP or EntrePass.",
      },
    ],
    faqs: [
      {
        q: "Can a foreigner own 100% of a Singapore Pte Ltd?",
        a: "Yes. There is no local shareholding requirement in Singapore. A single foreign individual or foreign corporate entity can hold 100% of the shares.",
      },
      {
        q: "Do I need a nominee director?",
        a: "Yes, if none of your directors are Singapore citizens, PRs, or EP holders. The Companies Act requires at least one ordinarily-resident director. Our nominee director service satisfies this requirement at a fixed annual fee with full indemnity.",
      },
      {
        q: "Can I open a Singapore corporate bank account without flying in?",
        a: "Yes, with the right bank. DBS and OCBC often require a video call or short in-person visit, while neobanks like Aspire and Wise Business are fully remote. We make introductions to the bank most likely to approve your profile.",
      },
      {
        q: "Will I be taxed personally on my Singapore company's profits?",
        a: "No. Singapore Pte Ltd profits are taxed at the corporate rate (effective 0–17% depending on incentives). Dividends paid to shareholders are tax-exempt in Singapore. Your personal tax treatment depends on your country of tax residence.",
      },
    ],
  },
  {
    slug: "corporate-secretary",
    path: `${STARTUP_KIT_BASE}/corporate-secretary`,
    navLabel: "Corporate Secretary",
    hubLabel: "2. Appoint a corporate secretary",
    hubBlurb:
      "Every Singapore Pte Ltd must appoint a qualified corporate secretary within 6 months. We file annual returns, maintain registers, and keep you ACRA-compliant.",
    icon: FileSignature,
    title: "Corporate Secretarial Services Singapore — Flat Annual Fee",
    metaDescription:
      "Qualified Singapore corporate secretary service. Annual returns, statutory registers, AGM resolutions, share allotments, and ACRA filings handled for your Pte Ltd at a flat annual fee.",
    h1: "Corporate Secretarial Services in Singapore",
    intro:
      "Singapore law requires every Pte Ltd to appoint a qualified corporate secretary within 6 months of incorporation. TASA Trust acts as your named corporate secretary, files your annual return, maintains your statutory registers, and prepares AGM and board resolutions — for a flat annual fee.",
    primaryKeyword: "corporate secretarial services singapore",
    subKeywords: [
      "company secretary singapore",
      "corporate secretary provider singapore",
      "corp sec services",
      "cosec singapore",
      "best corporate secretarial services singapore",
      "secretarial services singapore",
      "annual return filing singapore",
    ],
    image: corporateSecretaryImg,
    imageAlt: "Corporate boardroom with statutory registers and fountain pen on legal documents",
    sections: [
      {
        heading: "What a Singapore corporate secretary actually does",
        body:
          "The corporate secretary is the named officer ACRA holds responsible for your company's statutory compliance. It is not a personal assistant — it is a regulated role under Section 171 of the Companies Act. Our cosec team handles every recurring filing and event-driven resolution your Pte Ltd will encounter.",
        bullets: [
          "Files your Annual Return (AR) with ACRA within 7 months of year-end",
          "Calls your AGM and drafts the resolutions (or dispenses with AGM where eligible)",
          "Maintains the registers of members, directors, controllers (RORC), nominees, and charges",
          "Drafts board and shareholder resolutions for share allotments, transfers, director changes, and dividends",
          "Files BizFile changes for any director, shareholder, address, or constitution update",
          "Sends you compliance reminders well before every deadline",
        ],
      },
      {
        heading: "When you must appoint one — and the penalties for not",
        body:
          "ACRA gives you 6 months from incorporation to appoint a qualified corporate secretary. Miss it and your directors face fines of up to S$1,000 and a default record against the company. Late annual returns cost a further S$300 per filing and can trigger ACRA striking off the company. We've onboarded companies still in their 6-month window and rescued companies already in default — both are routine.",
      },
      {
        heading: "Why founders switch corp sec providers",
        body:
          "Most startups outgrow their first corporate secretary within 18 months. The two recurring complaints are slow turnaround on share issuances (critical when you're closing a SAFE or convertible note) and surprise per-resolution fees. TASA Trust offers a flat annual fee that includes unlimited standard resolutions, named partner accountability, and 48-hour turnaround on share allotments.",
      },
    ],
    faqs: [
      {
        q: "Is a corporate secretary compulsory in Singapore?",
        a: "Yes. Section 171 of the Companies Act requires every Singapore company to appoint a qualified corporate secretary within 6 months of incorporation. The sole director cannot also be the company secretary.",
      },
      {
        q: "What's included in your flat annual fee?",
        a: "Named corporate secretary, annual return filing, AGM/dispensation paperwork, unlimited standard board and shareholder resolutions, statutory register maintenance, and unlimited BizFile lodgments for routine changes.",
      },
      {
        q: "How quickly can you take over from my current corp sec?",
        a: "Usually within 5 business days. We handle the resignation notice, BizFile change of officer, and register handover so there's no gap in your statutory cover.",
      },
      {
        q: "Do you handle share issuances and convertible note closings?",
        a: "Yes — including SAFEs, convertible notes, ESOP grants, and equity rounds. Standard share allotment resolutions are turned around within 48 hours of receiving signed term sheets.",
      },
    ],
  },
  {
    slug: "registered-address",
    path: `${STARTUP_KIT_BASE}/registered-address`,
    navLabel: "Registered Address",
    hubLabel: "3. Get a registered business address",
    hubBlurb:
      "An ACRA-ready Singapore business address with mail handling, scanning, and forwarding — use it the moment you incorporate.",
    icon: MapPin,
    title: "Registered Address Singapore — ACRA-Accepted Virtual Office",
    metaDescription:
      "ACRA-accepted Singapore registered office address with mail receipt, scanning, and forwarding. Use it for company registration, on invoices, and on your website.",
    h1: "Registered Address Service in Singapore",
    intro:
      "Every Singapore company needs a registered office address that's open to the public during business hours. TASA Trust's virtual office gives you a prestigious Singapore address that satisfies ACRA, plus mail handling, scanning, and call answering — without leasing physical space.",
    primaryKeyword: "registered address service singapore",
    subKeywords: [
      "virtual office singapore",
      "acra registered office address",
      "business address singapore",
      "mail handling singapore",
      "company registered address",
      "use home address as registered office singapore",
    ],
    image: registeredAddressImg,
    imageAlt: "Prestigious Singapore CBD building with brass plaque for registered business address",
    sections: [
      {
        heading: "What ACRA actually requires of a registered office",
        body:
          "Your registered office is the official address ACRA, IRAS, banks, and courts will use to serve documents on your company. It must be a physical address in Singapore (not a PO Box), open to the public for at least 3 hours per business day, and capable of receiving registered mail. Our address satisfies every condition out of the box.",
      },
      {
        heading: "Why founders avoid using their HDB or home address",
        body:
          "You can use a residential address under the Home Office Scheme, but it has real downsides — your home address ends up on your business profile, on every customer invoice, and in any ACRA search competitors run. A professional CBD address protects your privacy, signals credibility to enterprise clients, and is required by most banks during account opening.",
      },
      {
        heading: "What's included with our virtual office",
        body:
          "Our registered address is more than a line on BizFile — it's a working mail and reception operation.",
        bullets: [
          "Prestigious Singapore CBD address you can put on ACRA, your website, and invoices",
          "Receipt and signature for all registered mail, including IRAS and ACRA correspondence",
          "Same-day scanning and email forwarding of statutory mail",
          "Optional physical forwarding to your home country at cost",
          "Meeting room access in our office for client and bank meetings",
          "Reception greeting for visitors and couriers in your company name",
        ],
      },
    ],
    faqs: [
      {
        q: "Is a virtual office accepted by ACRA?",
        a: "Yes — as long as the address is a physical Singapore premises open to the public during business hours and capable of receiving registered mail. Ours meets all three conditions and is used as the registered office for hundreds of Pte Ltds.",
      },
      {
        q: "Can I use my home address instead?",
        a: "Technically yes, under the Home Office Scheme, but your residential address will appear on every public ACRA search, on customer invoices, and on bank KYC forms. Most founders move to a professional address by year two.",
      },
      {
        q: "How fast is mail scanned and forwarded?",
        a: "Statutory mail (ACRA, IRAS, MOM) is scanned and emailed the same business day it arrives. General mail is scanned within 24 hours.",
      },
      {
        q: "Can I use the address on my website and Google Business Profile?",
        a: "Yes. The address is yours to use for ACRA, banks, invoices, contracts, your website, and Google Business Profile for the duration of your subscription.",
      },
    ],
  },
  {
    slug: "accounting-tax",
    path: `${STARTUP_KIT_BASE}/accounting-tax`,
    navLabel: "Accounting, Tax & GST",
    hubLabel: "4. Stay compliant with accounting & tax",
    hubBlurb:
      "Cloud bookkeeping, un-audited financial statements, GST filings, and Form C-S — built around your first year of trading.",
    icon: Calculator,
    title: "Accounting, Tax & GST Filing Singapore — Startup Pricing",
    metaDescription:
      "Cloud bookkeeping, un-audited financial statements, XBRL, GST registration and quarterly filing, ECI, and Form C-S corporate tax filing — designed for Singapore startups.",
    h1: "Accounting, Tax & GST Filing for Singapore Startups",
    intro:
      "From your very first invoice, TASA Trust keeps your books in cloud accounting, prepares un-audited financial statements, handles XBRL, registers and files GST, and submits your corporate tax return (Form C-S). One partner, one fee, full IRAS and ACRA compliance.",
    primaryKeyword: "corporate tax filing singapore",
    subKeywords: [
      "form c-s singapore",
      "iras corporate tax",
      "singapore corporate tax rate",
      "eci filing singapore",
      "gst registration singapore",
      "xbrl filing singapore",
      "annual return filing deadline singapore",
      "start-up tax exemption",
    ],
    image: accountingTaxImg,
    imageAlt: "Cloud accounting dashboard, calculator and Singapore tax filings on a desk",
    sections: [
      {
        heading: "The full compliance calendar for a Singapore startup",
        body:
          "A Pte Ltd has more recurring filings than founders expect — and IRAS and ACRA penalties stack quickly. Here is the full annual rhythm we manage for you.",
        bullets: [
          "Monthly — cloud bookkeeping in Xero or QuickBooks",
          "Quarterly — GST F5 filing (if GST-registered)",
          "Within 3 months of year-end — ECI (Estimated Chargeable Income) to IRAS",
          "Within 6 months of year-end — un-audited financial statements + AGM",
          "Within 7 months of year-end — Annual Return + XBRL to ACRA",
          "By 30 November — Corporate tax return (Form C-S or Form C) to IRAS",
        ],
      },
      {
        heading: "Singapore corporate tax: the rate every founder should know",
        body:
          "Singapore's headline corporate tax rate is 17%, but new startups pay effectively far less thanks to the Start-Up Tax Exemption (SUTE): 75% exemption on the first S$100,000 of chargeable income and 50% on the next S$100,000 for the first 3 YAs. Combined with partial exemption, most startups pay an effective rate under 10% in their early years. We file Form C-S — the simplified return for companies with revenue under S$5M — to claim every exemption you're entitled to.",
      },
      {
        heading: "GST: when to register and when to wait",
        body:
          "GST registration is compulsory once your taxable turnover crosses S$1M in any 12-month period. Voluntary registration before that threshold can make sense if your customers are mostly GST-registered businesses or if your input GST regularly exceeds your output GST. We model both scenarios with your real numbers before recommending registration.",
      },
      {
        heading: "Why bundled beats stitched-together",
        body:
          "Most founders start with a freelance bookkeeper, add a separate tax agent in year one, and a third firm for ACRA filings. By year two they've paid for the same chart of accounts to be re-keyed three times and missed at least one deadline in the handoffs. The Startup Kit puts bookkeeping, tax, GST, ECI, XBRL, AR, and corp sec under one roof with one calendar and one point of contact.",
      },
    ],
    faqs: [
      {
        q: "What is Form C-S and do I need to file it?",
        a: "Form C-S is the simplified corporate income tax return for Singapore companies with annual revenue of S$5M or less. It must be filed with IRAS by 30 November each year. We prepare and file it as part of the Startup Kit.",
      },
      {
        q: "When do I need to register for GST?",
        a: "Registration is compulsory once your taxable turnover exceeds S$1M in any rolling 12-month period. Below that, voluntary registration may be worthwhile if you sell mostly to GST-registered businesses or carry significant input GST.",
      },
      {
        q: "Do I need an audit?",
        a: "Most Singapore startups qualify as 'small companies' and are exempt from audit if they meet two of three thresholds: revenue ≤ S$10M, assets ≤ S$10M, and ≤ 50 employees. We prepare un-audited financial statements that satisfy ACRA for exempt private companies.",
      },
      {
        q: "What's ECI and is it mandatory?",
        a: "ECI is the Estimated Chargeable Income you must declare to IRAS within 3 months of your financial year-end. Companies with revenue under S$5M and nil ECI are exempt from filing. We assess and file it for you each year.",
      },
    ],
  },
  {
    slug: "website-branding",
    path: `${STARTUP_KIT_BASE}/website-branding`,
    navLabel: "Website & Branding",
    hubLabel: "5. Launch your website & brand",
    hubBlurb:
      "Logo, brand kit, and a launch-ready marketing site so you can start selling the moment your UEN is issued.",
    icon: Megaphone,
    title: "Startup Website & Branding Singapore — Launch in 2 Weeks",
    metaDescription:
      "Logo, brand kit, and a launch-ready marketing website for Singapore startups. SEO-ready, mobile-first, bundled with your incorporation so you can sell from day one.",
    h1: "Website & Branding for Singapore Startups",
    intro:
      "A registered company isn't a business until customers can find and trust you. TASA Trust delivers a logo, brand kit, and a launch-ready marketing website as part of the Startup Kit — so the moment your UEN is issued, you're ready to take orders.",
    primaryKeyword: "startup website singapore",
    subKeywords: [
      "web design singapore startup",
      "branding agency singapore",
      "logo design singapore",
      "startup brand identity",
      "marketing website for new business",
      "seo for singapore startups",
    ],
    image: websiteBrandingImg,
    imageAlt: "Creative studio workspace with brand mockups and launch-ready startup website",
    sections: [
      {
        heading: "What you get with the launch bundle",
        body:
          "Most incorporation providers stop the day your UEN is issued. We keep going so your first customer can find you on Google and trust what they land on.",
        bullets: [
          "Primary logo, monochrome variant, and favicon",
          "Brand kit — colour system, typography pair, and usage guidelines",
          "5-page marketing website (Home, About, Services, Pricing, Contact)",
          "Mobile-first responsive build, Lighthouse 90+ across the board",
          "On-page SEO — title tags, meta descriptions, schema markup, sitemap",
          "Google Business Profile setup tied to your registered address",
          "Contact form wired to your inbox + WhatsApp",
        ],
      },
      {
        heading: "Built for Singapore startup SEO from day one",
        body:
          "Most freelancer-built startup sites rank for nothing because they ship with no structured data, generic meta tags, and slow LCP. Our launch site ships with Organization and LocalBusiness JSON-LD, proper canonicals, fast image delivery, and copy tuned to the keywords your customers actually search. You start collecting organic impressions in week one instead of month six.",
      },
      {
        heading: "Two-week timeline from kickoff to live",
        body:
          "We compress what most agencies stretch to 8–12 weeks. Brand directions in week one, finalised logo and one round of website revisions in week two, live on your domain by day 14. Your incorporation, corp sec, and accounting are running in parallel — so the entire business is operational in the same fortnight.",
      },
    ],
    faqs: [
      {
        q: "Can I bring my own logo or designer?",
        a: "Yes. We can build the website around an existing brand kit — pricing adjusts down accordingly. If you only have a sketch or a name, our design team can take it from there.",
      },
      {
        q: "What tech stack does the website use?",
        a: "We build on a fast static-first stack (React + Vite or a headless CMS depending on content needs), deployed on a global CDN. You own the code, the domain, and the hosting account.",
      },
      {
        q: "Can you add e-commerce or booking?",
        a: "Yes — Stripe checkout, Shopify integration, and meeting/booking flows are common add-ons. We scope these after the core 5-page site is live.",
      },
      {
        q: "Do you do ongoing SEO and content?",
        a: "Yes, on a separate monthly retainer. The launch site is SEO-ready out of the box; ongoing content and link-building is optional for founders who want to compound organic growth.",
      },
    ],
  },
];

export const startupKitFaqs: StartupKitFaq[] = [
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
