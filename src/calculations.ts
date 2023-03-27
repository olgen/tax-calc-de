const basicAllowence = 10908;
const firstBarrier = 15999;
const secondBarrier = 62809;
const thirdBarrier = 277825;

const pauschBetrag = 1200;

// from https://www.imacc.de/sozialabgaben-rechner-sozialversicherung/#/base-data
function socialDeductionsEmployeeShare(grossIncome: number): number {
  // https://www.bundesregierung.de/breg-de/suche/beitragsbemessungsgrenzen-2023-2133570
  const healthCap = 4987.5 * 12;
  const careCap = 4987.5 * 12;
  const pensionCap = 7300 * 12;
  const unemploymentCap = 7300 * 12;

  const health = Math.min(grossIncome, healthCap) * (0.073 + 0.0065);
  const care = Math.min(grossIncome, careCap) * (0.01525 + 0.0035);
  const pension = Math.min(grossIncome, pensionCap) * 0.093;
  const unemployment = Math.min(grossIncome, unemploymentCap * 12) * 0.012;
  return health + care + pension + unemployment;
}

function taxableIncomeFromYearlyGrossIncome(grossIncome: number) {
  return Math.max(
    grossIncome - socialDeductionsEmployeeShare(grossIncome) - pauschBetrag,
    0
  );
}

function taxEstimationFromYearlyGrossIncome(grossIncome: number): number {
  const taxableIncome = taxableIncomeFromYearlyGrossIncome(grossIncome);

  // calc based on:
  // https://www.finanz-tools.de/einkommensteuer/berechnung-formeln/2023
  if (taxableIncome <= basicAllowence) {
    return 0;
  } else if (taxableIncome <= firstBarrier) {
    const y = (taxableIncome - basicAllowence) / 10000.0;
    return (979.18 * y + 1400) * y;
  } else if (taxableIncome <= secondBarrier) {
    const y = (taxableIncome - firstBarrier) / 10000.0;
    return (192.59 * y + 2397) * y + 966.53;
  } else if (taxableIncome <= thirdBarrier) {
    return 0.42 * taxableIncome - 9972.98;
  } else {
    return 0.45 * taxableIncome - 18307.73;
  }
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
  } else if (x <= 4115) {
    return -164 + 0.0828 * x + 8.98e-5 * x ** 2;
  } else {
    return (
      -1606 +
      0.793 * x +
      -1.46e-6 * x ** 2 +
      2.33e-10 * x ** 3 +
      -3.83e-15 * x ** 4
    );
  }
}

export function totalMonthlyTaxes(monthlyGrossIncome: number) {
  const yearlyGrossIncome = monthlyGrossIncome * 12;
  const incomeTax = taxEstimationFromYearlyGrossIncome(yearlyGrossIncome);
  const soli = soliFromYearlyTaxes(incomeTax);
  return (incomeTax + soli) / 12;
}
