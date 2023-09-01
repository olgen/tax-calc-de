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

export function totalMonthlyTaxes(monthlyGrossIncome: number) {
  const yearlyGrossIncome = monthlyGrossIncome * 12;
  const incomeTax = taxEstimationFromYearlyGrossIncome(yearlyGrossIncome);
  const soli = soliFromYearlyTaxes(incomeTax);
  return (incomeTax + soli) / 12;
}

function evalPolynome(polynome: number[], x: number): number {
  console.log(polynome);
  return polynome.reduce((acc, coeff, i) => acc + coeff * x ** i, 0);
}

const estimationRanges = [
  { from: 0, to: 1021, polynome: [-0.0] },
  {
    from: 1021,
    to: 4000,
    polynome: [
      1224.4865068275183, -4.494551586587648, 0.00631676838552744,
      -4.638990197807369e-6, 2.0747386480835356e-9, -5.729907062763124e-13,
      9.539072623148743e-17, -8.727718418243321e-21, 3.3457515781258825e-25,
    ],
  },
  {
    from: 4000,
    to: 5700,
    polynome: [
      -68109885.9162739, 110830.40452052116, -78.78572926336273,
      0.03195969238024829, -8.092505241180312e-6, 1.3098808176528328e-9,
      -1.32370319156251e-13, 7.636272141946083e-18, -1.925565966182529e-22,
    ],
  },
  {
    from: 5700,
    to: 22000,
    polynome: [
      -1681197.5646438038, 1824.7129753627903, -0.8884166023721691,
      0.0002566258969481694, -4.895864728766341e-8, 6.4996355938781395e-12,
      -6.158707380216953e-16, 4.1985556275070146e-20, -2.044998422110167e-24,
      6.9452189782007e-29, -1.5624009378472232e-33, 2.0921786764255328e-38,
      -1.262284223778199e-43,
    ],
  },
  {
    from: 22000,
    to: 100000,
    polynome: [-3079.657924797718, 0.9038553069966684],
  },
];

export function taxEstimationFromMonthlyNetIncome(netto: number): number {
  for (var estimationRange of estimationRanges) {
    if (netto < estimationRange.to) {
      return evalPolynome(estimationRange.polynome, netto);
    }
  }
  return evalPolynome(
    estimationRanges[estimationRanges.length - 1].polynome,
    netto
  );
}
