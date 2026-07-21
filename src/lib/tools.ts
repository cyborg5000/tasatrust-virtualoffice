import { Calculator, Receipt, Search, Landmark, Percent, Wallet, FileText, FileSpreadsheet, ReceiptText, QrCode, FileCheck, Building2, Briefcase, FileSignature, Home, type LucideIcon } from "lucide-react";

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
  {
    slug: "cpf-calculator", path: "/tools/cpf-calculator",
    title: "CPF Contribution Calculator 2026 — Employer & Employee",
    navLabel: "CPF Calculator", primaryKeyword: "cpf calculator",
    description: "Free CPF contribution calculator with the 2026 rates and S$8,000 Ordinary Wage ceiling. See employer, employee and total CPF plus take-home pay by age band.",
    blurb: "2026 CPF rates by age band, with the S$8,000 OW ceiling and bonus (AW) treatment applied.",
    icon: Calculator,
  },
  {
    slug: "salary-calculator", path: "/tools/salary-calculator",
    title: "Salary Calculator Singapore — Take-Home Pay After CPF (2026)",
    navLabel: "Salary Calculator", primaryKeyword: "salary calculator singapore",
    description: "Calculate Singapore take-home pay after employee CPF at 2026 rates, full employer cost, and pro-rated salary for incomplete months.",
    blurb: "Net take-home after CPF, employer cost, and MOM-style pro-rata for incomplete months.",
    icon: Wallet,
  },
  {
    slug: "sdl-calculator", path: "/tools/sdl-calculator",
    title: "SDL Calculator Singapore — Skills Development Levy",
    navLabel: "SDL Calculator", primaryKeyword: "sdl calculator",
    description: "Free Skills Development Levy calculator: 0.25% per employee per month, minimum S$2, capped at S$11.25. Paste your payroll and get the total SDL payable.",
    blurb: "Whole-payroll SDL in one paste: 0.25% per employee, min S$2, max S$11.25.",
    icon: Percent,
  },
  {
    slug: "stamp-duty-calculator", path: "/tools/stamp-duty-calculator",
    title: "Stamp Duty Calculator Singapore — BSD, ABSD & Share Transfer",
    navLabel: "Stamp Duty Calculator", primaryKeyword: "stamp duty calculator",
    description: "Compute Buyer's Stamp Duty (residential & non-residential bands), ABSD by buyer profile, and 0.2% share-transfer duty — with the current IRAS rates.",
    blurb: "BSD bands, ABSD by profile (SC/PR/foreigner/entity) and share-transfer duty at 0.2%.",
    icon: Landmark,
  },
  {
    slug: "corporate-tax-calculator", path: "/tools/corporate-tax-calculator",
    title: "Corporate Tax Calculator Singapore (17% with Exemptions)",
    navLabel: "Corporate Tax Calculator", primaryKeyword: "corporate tax calculator singapore",
    description: "Estimate Singapore corporate income tax at 17% with the Partial Tax Exemption or Start-Up Tax Exemption applied automatically.",
    blurb: "17% headline rate with PTE or SUTE exemptions — see your effective rate instantly.",
    icon: Briefcase,
  },
  {
    slug: "invoice-generator", path: "/tools/invoice-generator",
    title: "Free Invoice Generator Singapore — GST & PayNow QR",
    navLabel: "Invoice Generator", primaryKeyword: "invoice generator",
    description: "Create professional Singapore invoices free: 9% GST handling, your logo, and a scan-to-pay PayNow QR embedded on the PDF.",
    blurb: "Professional invoices with 9% GST and a PayNow QR your customers scan to pay.",
    icon: FileText,
  },
  {
    slug: "quotation-generator", path: "/tools/quotation-generator",
    title: "Free Quotation Generator Singapore",
    navLabel: "Quotation Generator", primaryKeyword: "quotation template",
    description: "Build professional quotations with itemised pricing, validity terms and your logo — download as PDF free.",
    blurb: "Itemised quotes with your branding, ready to send as PDF.",
    icon: FileSpreadsheet,
  },
  {
    slug: "receipt-generator", path: "/tools/receipt-generator",
    title: "Free Receipt Generator Singapore",
    navLabel: "Receipt Generator", primaryKeyword: "receipt generator",
    description: "Issue numbered payment receipts with your logo in seconds — itemised and downloadable as PDF, free.",
    blurb: "Numbered, itemised payment receipts — download as PDF in seconds.",
    icon: ReceiptText,
  },
  {
    slug: "paynow-qr-generator", path: "/tools/paynow-qr-generator",
    title: "PayNow QR Code Generator — Free SGQR for UEN & Mobile",
    navLabel: "PayNow QR Generator", primaryKeyword: "paynow qr code generator",
    description: "Generate a PayNow QR code for your UEN or mobile with optional fixed amount and reference — download as PNG, free.",
    blurb: "Scan-to-pay PayNow QR for your UEN or mobile, with fixed amount and reference.",
    icon: QrCode,
  },
  {
    slug: "payslip-generator", path: "/tools/payslip-generator",
    title: "Payslip Generator Singapore — MOM-Compliant Itemised Payslips",
    navLabel: "Payslip Generator", primaryKeyword: "payslip generator",
    description: "Generate MOM-compliant itemised payslips with the 2026 employee CPF deduction computed automatically. Download as PDF.",
    blurb: "Itemised payslips with 2026 CPF computed automatically — PDF download.",
    icon: FileCheck,
  },
  {
    slug: "uen-lookup", path: "/tools/uen-lookup",
    title: "UEN Number Check & Company Name Search Singapore (ACRA)",
    navLabel: "UEN / Name Check", primaryKeyword: "uen number check",
    description: "Check any Singapore UEN or search whether a company name is already registered — from ACRA's public records.",
    blurb: "Search ACRA records by company name or UEN — check availability before you register.",
    icon: Building2,
  },
  {
    slug: "employment-contract-template", path: "/tools/employment-contract-template",
    title: "Employment Contract Template Singapore — Free Builder",
    navLabel: "Employment Contract", primaryKeyword: "employment contract template singapore",
    description: "Fill in the key employment terms and download a Singapore employment contract template as PDF — free.",
    blurb: "KET-aligned employment contract, filled from a short form.",
    icon: FileSignature,
  },
  {
    slug: "tenancy-agreement-template", path: "/tools/tenancy-agreement-template",
    title: "Tenancy Agreement Template Singapore — Free Builder",
    navLabel: "Tenancy Agreement", primaryKeyword: "tenancy agreement template singapore",
    description: "Generate a straightforward Singapore tenancy agreement and download it as PDF — free.",
    blurb: "Basic residential/office tenancy agreement from a short form.",
    icon: Home,
  },
];

export const findTool = (slug: string) => tools.find((t) => t.slug === slug);
