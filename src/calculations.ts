// https://www.gesetze-im-internet.de/estg/__9a.html
const pauschBetrag = 1230;

import polynomes from "./polynomes.json";

// from https://www.imacc.de/sozialabgaben-rechner-sozialversicherung/#/base-data
export function socialDeductionsEmployeeShare(grossIncome: number): number {
  // https://www.bundesregierung.de/breg-de/suche/beitragsbemessungsgrenzen-2023-2133570
  const healthCap = 4987.5 * 12;
  const careCap = 4987.5 * 12;
  const pensionCap = 7300 * 12;
  const unemploymentCap = 7300 * 12;

  const health = Math.min(grossIncome, healthCap) * (0.073 + 0.0065);
  const care = Math.min(grossIncome, careCap) * (0.01525 + 0.0035);
  const pension = Math.min(grossIncome, pensionCap) * 0.093;
  const unemployment = Math.min(grossIncome, unemploymentCap) * 0.012;
  return health + care + pension + unemployment;
}

export function taxableIncomeFromYearlyGrossIncome(grossIncome: number) {
  return Math.max(
    grossIncome - socialDeductionsEmployeeShare(grossIncome) - pauschBetrag,
    0
  );
}

// https://www.gesetze-im-internet.de/estg/__32a.html
// Grundfreibetrag
export const grundFreiBetrag = 10908;
// Calculation barriers
const firstBarrier = 15999;
const secondBarrier = 62809;
const thirdBarrier = 277825;

export function incomeTaxFromTaxableIncome(taxableIncome: number): number {
  // Grundfreibetrag
  let tax = 0;
  if (taxableIncome <= grundFreiBetrag) {
    tax = 0;
  } else if (taxableIncome <= firstBarrier) {
    const y = (taxableIncome - grundFreiBetrag) / 10000.0;
    tax = (979.18 * y + 1400) * y;
  } else if (taxableIncome <= secondBarrier) {
    const z = (taxableIncome - firstBarrier) / 10000.0;
    tax = (192.59 * z + 2397) * z + 966.53;
  } else if (taxableIncome <= thirdBarrier) {
    const x = taxableIncome;
    tax = 0.42 * x - 9972.98;
  } else {
    const x = taxableIncome;
    tax = 0.45 * x - 18307.73;
  }
  return Math.floor(tax);
}

export function taxEstimationFromYearlyGrossIncome(
  grossIncome: number
): number {
  const taxableIncome = Math.floor(
    taxableIncomeFromYearlyGrossIncome(grossIncome)
  );
  return Math.floor(incomeTaxFromTaxableIncome(taxableIncome));
}

export function taxEstimationFromMonthlyGrossIncome(
  monthlyGrossIncome: number
): number {
  const yearlyGrossIncome = monthlyGrossIncome * 12.0;
  const yearlyTaxEstimation =
    taxEstimationFromYearlyGrossIncome(yearlyGrossIncome);
  if (yearlyTaxEstimation > 0) {
    return yearlyTaxEstimation / 12.0;
  } else {
    return 0;
  }
}

// source: https://www.smart-rechner.de/soli/rechner.php#:~:text=1.816%2C98%20Euro.-,Berechnung%20Soli%202023,5%20Prozent%20seiner%20ESt%20zahlen.
export function soliFromYearlyTaxes(tax: number): number {
  if (tax <= 17543) {
    return 0;
  } else {
    return tax * 0.055;
  }
}

export function totalMonthlyTaxes(monthlyGrossIncome: number) {
  const yearlyGrossIncome = monthlyGrossIncome * 12;
  const incomeTax = taxEstimationFromYearlyGrossIncome(yearlyGrossIncome);
  const soli = soliFromYearlyTaxes(incomeTax);
  return (incomeTax + soli) / 12;
}

function evalPolynome(polynome: number[], x: number): number {
  return polynome.reduce((acc, coeff, i) => acc + coeff * x ** i, 0);
}

export function taxEstimationFromMonthlyNetIncome(netto: number): number {
  for (var estimationRange of polynomes.netToTax) {
    if (netto < estimationRange.to) {
      return evalPolynome(estimationRange.polynome, netto);
    }
  }
  return evalPolynome(
    polynomes.netToTax[polynomes.netToTax.length - 1].polynome,
    netto
  );
}
