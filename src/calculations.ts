// https://www.gesetze-im-internet.de/estg/__9a.html
const pauschBetrag = 1230;

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

export function taxEstimationFromMonthlyNetIncome(x: number): number {
  if (x <= 1021) {
    return 0;
  } else if (x <= 3999.61) {
    return (
      -115 - 0.0649 * x + 2.1e-4 * x ** 2 - 4.36e-8 * x ** 3 + 5.01e-12 * x ** 4
    );
  } else {
    return (
      -3304 +
      1.56 * x +
      -1.27e-4 * x ** 2 +
      9.84e-9 * x ** 3 +
      -3.73e-13 * x ** 4 +
      6.92e-18 * x ** 5 +
      -5.04e-23 * x ** 6
    );
  }
}

export function totalMonthlyTaxes(monthlyGrossIncome: number) {
  const yearlyGrossIncome = monthlyGrossIncome * 12;
  const incomeTax = taxEstimationFromYearlyGrossIncome(yearlyGrossIncome);
  const soli = soliFromYearlyTaxes(incomeTax);
  return (incomeTax + soli) / 12;
}
