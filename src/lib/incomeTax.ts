// Singapore IRAS personal income tax brackets — YA 2024 onwards
// Source: https://www.iras.gov.sg/taxes/individual-income-tax/basics-of-individual-income-tax/tax-rates

export type Bracket = {
  upTo: number | null; // null = no upper limit
  rate: number; // marginal rate in %
};

export const RESIDENT_BRACKETS: Bracket[] = [
  { upTo: 20000, rate: 0 },
  { upTo: 30000, rate: 2 },
  { upTo: 40000, rate: 3.5 },
  { upTo: 80000, rate: 7 },
  { upTo: 120000, rate: 11.5 },
  { upTo: 160000, rate: 15 },
  { upTo: 200000, rate: 18 },
  { upTo: 240000, rate: 19 },
  { upTo: 280000, rate: 19.5 },
  { upTo: 320000, rate: 20 },
  { upTo: 500000, rate: 22 },
  { upTo: 1000000, rate: 23 },
  { upTo: null, rate: 24 },
];

export const NON_RESIDENT_FLAT_RATE = 24; // employment income taxed at 15% OR resident rates, whichever higher; other income 24%

export type TaxResult = {
  chargeable: number;
  tax: number;
  effectiveRate: number;
  marginalRate: number;
  takeHome: number;
  breakdown: { band: string; rate: number; taxed: number; tax: number }[];
};

export function calculateResidentTax(chargeableIncome: number): TaxResult {
  const chargeable = Math.max(0, chargeableIncome);
  let remaining = chargeable;
  let prevCap = 0;
  let totalTax = 0;
  let marginalRate = 0;
  const breakdown: TaxResult["breakdown"] = [];

  for (const bracket of RESIDENT_BRACKETS) {
    if (remaining <= 0) break;
    const capInBand = bracket.upTo === null ? remaining : bracket.upTo - prevCap;
    const taxedInBand = Math.min(remaining, capInBand);
    const taxInBand = (taxedInBand * bracket.rate) / 100;

    if (taxedInBand > 0) {
      breakdown.push({
        band:
          bracket.upTo === null
            ? `Above $${prevCap.toLocaleString()}`
            : `$${prevCap.toLocaleString()}–$${bracket.upTo.toLocaleString()}`,
        rate: bracket.rate,
        taxed: taxedInBand,
        tax: taxInBand,
      });
    }

    totalTax += taxInBand;
    remaining -= taxedInBand;
    marginalRate = bracket.rate;
    prevCap = bracket.upTo ?? prevCap;
  }

  return {
    chargeable,
    tax: Math.round(totalTax * 100) / 100,
    effectiveRate: chargeable > 0 ? (totalTax / chargeable) * 100 : 0,
    marginalRate,
    takeHome: chargeable - totalTax,
    breakdown,
  };
}

export function calculateNonResidentTax(chargeableIncome: number, employmentIncome = true): TaxResult {
  const chargeable = Math.max(0, chargeableIncome);
  if (employmentIncome) {
    // Higher of: flat 15% on employment income OR resident rates
    const fifteen = chargeable * 0.15;
    const resident = calculateResidentTax(chargeable);
    if (resident.tax >= fifteen) return resident;
    return {
      chargeable,
      tax: Math.round(fifteen * 100) / 100,
      effectiveRate: 15,
      marginalRate: 15,
      takeHome: chargeable - fifteen,
      breakdown: [{ band: "Flat 15% on employment income", rate: 15, taxed: chargeable, tax: fifteen }],
    };
  }
  const tax = (chargeable * NON_RESIDENT_FLAT_RATE) / 100;
  return {
    chargeable,
    tax: Math.round(tax * 100) / 100,
    effectiveRate: NON_RESIDENT_FLAT_RATE,
    marginalRate: NON_RESIDENT_FLAT_RATE,
    takeHome: chargeable - tax,
    breakdown: [
      { band: `Flat ${NON_RESIDENT_FLAT_RATE}% on non-employment income`, rate: NON_RESIDENT_FLAT_RATE, taxed: chargeable, tax },
    ],
  };
}
