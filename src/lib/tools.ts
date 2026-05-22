import { Calculator, Receipt, Search, type LucideIcon } from "lucide-react";

export type ToolMeta = {
  slug: string;
  path: string;
  title: string;
  navLabel: string;
  primaryKeyword: string;
  description: string;
  blurb: string;
  icon: LucideIcon;
};

export const TOOLS_BASE = "/tools";

export const tools: ToolMeta[] = [
  {
    slug: "income-tax-calculator",
    path: "/tools/income-tax-calculator",
    title: "Singapore Personal Income Tax Calculator (YA 2025)",
    navLabel: "Income Tax Calculator",
    primaryKeyword: "singapore personal income tax calculator",
    description:
      "Free Singapore personal income tax calculator using the latest IRAS resident and non-resident rates. See your tax payable, effective rate, and take-home pay in seconds.",
    blurb:
      "Calculate your Singapore personal income tax using current IRAS rates — for residents and non-residents.",
    icon: Calculator,
  },
  {
    slug: "gst-calculator",
    path: "/tools/gst-calculator",
    title: "Singapore GST Calculator (9%) — Add or Remove GST",
    navLabel: "GST Calculator",
    primaryKeyword: "gst calculator singapore",
    description:
      "Free Singapore GST calculator at the current 9% rate. Instantly add GST to a net amount or extract GST from a GST-inclusive price.",
    blurb:
      "Add or remove 9% GST from any amount, with the GST component shown separately for invoicing.",
    icon: Receipt,
  },
  {
    slug: "ssic-code-lookup",
    path: "/tools/ssic-code-lookup",
    title: "SSIC Code Lookup — Singapore Standard Industrial Classification",
    navLabel: "SSIC Code Lookup",
    primaryKeyword: "ssic code",
    description:
      "Search the Singapore Standard Industrial Classification (SSIC) codes used by ACRA for company registration. Find the right primary and secondary activity code in seconds.",
    blurb:
      "Search ACRA's SSIC codes by keyword to pick the right business activity for your Pte Ltd.",
    icon: Search,
  },
];

export const findTool = (slug: string) => tools.find((t) => t.slug === slug);
