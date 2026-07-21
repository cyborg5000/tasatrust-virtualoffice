// Singapore statutory calculation library — single source of truth for the free tools.
// Rates verified 2026-07-21 against CPF Board / IRAS published tables.

// ---------- CPF (effective 1 Jan 2026; private sector, SC & PR year 3+) ----------
export const CPF_OW_CEILING = 8000; // monthly Ordinary Wage ceiling
export const CPF_ANNUAL_TW_CEILING = 102000; // Additional Wage ceiling = 102,000 - annual OW subject to CPF

export type CpfBand = { label: string; min: number; max: number | null; employer: number; employee: number };
export const CPF_BANDS: CpfBand[] = [
  { label: "55 and below", min: 0, max: 55, employer: 0.17, employee: 0.2 },
  { label: "Above 55 to 60", min: 55, max: 60, employer: 0.16, employee: 0.18 },
  { label: "Above 60 to 65", min: 60, max: 65, employer: 0.125, employee: 0.125 },
  { label: "Above 65 to 70", min: 65, max: 70, employer: 0.09, employee: 0.075 },
  { label: "Above 70", min: 70, max: null, employer: 0.075, employee: 0.05 },
];

export function cpfForMonth(ordinaryWage: number, bandIndex: number, additionalWage = 0, annualOwSoFar = 0) {
  const band = CPF_BANDS[bandIndex] ?? CPF_BANDS[0];
  const owSubject = Math.min(Math.max(0, ordinaryWage), CPF_OW_CEILING);
  const awCeiling = Math.max(0, CPF_ANNUAL_TW_CEILING - Math.min(annualOwSoFar || owSubject * 12, CPF_ANNUAL_TW_CEILING));
  const awSubject = Math.min(Math.max(0, additionalWage), awCeiling);
  const base = owSubject + awSubject;
  const employer = base * band.employer;
  const employee = base * band.employee;
  return {
    band,
    owSubject,
    awSubject,
    awCeiling,
    employer,
    employee,
    total: employer + employee,
    takeHome: ordinaryWage + additionalWage - employee,
    employerCost: ordinaryWage + additionalWage + employer,
  };
}

// ---------- SDL (Skills Development Levy) ----------
// 0.25% of monthly remuneration; min S$2 (wages <= S$800), max S$11.25 (wages >= S$4,500).
export function sdlForEmployee(monthlyWage: number) {
  if (monthlyWage <= 0) return 0;
  return Math.min(11.25, Math.max(2, monthlyWage * 0.0025));
}

// ---------- Buyer's Stamp Duty (on/after 15 Feb 2023) ----------
type Bracket = { upTo: number | null; rate: number };
const BSD_RESIDENTIAL: Bracket[] = [
  { upTo: 180000, rate: 0.01 },
  { upTo: 360000, rate: 0.02 },
  { upTo: 1000000, rate: 0.03 },
  { upTo: 1500000, rate: 0.04 },
  { upTo: 3000000, rate: 0.05 },
  { upTo: null, rate: 0.06 },
];
const BSD_NON_RESIDENTIAL: Bracket[] = [
  { upTo: 180000, rate: 0.01 },
  { upTo: 360000, rate: 0.02 },
  { upTo: 1000000, rate: 0.03 },
  { upTo: 1500000, rate: 0.04 },
  { upTo: null, rate: 0.05 },
];

function progressive(amount: number, brackets: Bracket[]) {
  let remaining = Math.max(0, amount);
  let prevCap = 0;
  let duty = 0;
  const lines: { band: string; amount: number; rate: number; duty: number }[] = [];
  for (const b of brackets) {
    const cap = b.upTo ?? Infinity;
    const slice = Math.max(0, Math.min(remaining, cap - prevCap));
    if (slice > 0) {
      const d = slice * b.rate;
      duty += d;
      lines.push({
        band: b.upTo ? `Up to S$${cap.toLocaleString("en-SG")}` : `Above S$${prevCap.toLocaleString("en-SG")}`,
        amount: slice,
        rate: b.rate,
        duty: d,
      });
      remaining -= slice;
    }
    prevCap = cap;
    if (remaining <= 0) break;
  }
  return { duty, lines };
}

export function bsd(amount: number, residential: boolean) {
  return progressive(amount, residential ? BSD_RESIDENTIAL : BSD_NON_RESIDENTIAL);
}

// ABSD (residential only, rates from 27 Apr 2023)
export type AbsdProfile = { label: string; rate: number };
export const ABSD_PROFILES: AbsdProfile[] = [
  { label: "Singapore Citizen — 1st residential property", rate: 0 },
  { label: "Singapore Citizen — 2nd residential property", rate: 0.2 },
  { label: "Singapore Citizen — 3rd and subsequent", rate: 0.3 },
  { label: "Permanent Resident — 1st residential property", rate: 0.05 },
  { label: "Permanent Resident — 2nd residential property", rate: 0.3 },
  { label: "Permanent Resident — 3rd and subsequent", rate: 0.35 },
  { label: "Foreigner — any residential property", rate: 0.6 },
  { label: "Entity / company", rate: 0.65 },
];

// Share transfer stamp duty: 0.2% of the higher of consideration or NAV.
export function shareTransferDuty(considerationOrNav: number) {
  return Math.max(0, considerationOrNav) * 0.002;
}

// ---------- Corporate Income Tax (17% flat with exemptions; excludes YA-specific rebates) ----------
export function corporateTax(chargeableIncome: number, startupExemption: boolean) {
  const ci = Math.max(0, chargeableIncome);
  let exempt = 0;
  const lines: { label: string; amount: number }[] = [];
  if (startupExemption) {
    // Start-Up Tax Exemption (first 3 YAs, qualifying companies): 75% of first S$100k, 50% of next S$100k
    const a = Math.min(ci, 100000) * 0.75;
    const b = Math.min(Math.max(ci - 100000, 0), 100000) * 0.5;
    exempt = a + b;
    if (a > 0) lines.push({ label: "75% exemption on first S$100,000", amount: a });
    if (b > 0) lines.push({ label: "50% exemption on next S$100,000", amount: b });
  } else {
    // Partial Tax Exemption: 75% of first S$10k, 50% of next S$190k
    const a = Math.min(ci, 10000) * 0.75;
    const b = Math.min(Math.max(ci - 10000, 0), 190000) * 0.5;
    exempt = a + b;
    if (a > 0) lines.push({ label: "75% exemption on first S$10,000", amount: a });
    if (b > 0) lines.push({ label: "50% exemption on next S$190,000", amount: b });
  }
  const taxable = Math.max(0, ci - exempt);
  const tax = taxable * 0.17;
  return { exempt, taxable, tax, effectiveRate: ci > 0 ? tax / ci : 0, lines };
}

export const fmtSGD = (n: number) =>
  n.toLocaleString("en-SG", { style: "currency", currency: "SGD", maximumFractionDigits: 2 });
