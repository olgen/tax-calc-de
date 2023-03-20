const basicAllowence = 10908;
const firstBarrier = 15999;
const secondBarrier = 62809;
const thirdBarrier = 277825;

const pauschBetrag = 1200;

// from https://www.imacc.de/sozialabgaben-rechner-sozialversicherung/#/base-data
function socialDeductionsEmployeeSHare(grossIncome: number): number {
  const healthInsurance = Math.min(grossIncome * (0.073 + 0.0065), 4987.5);
  const careInsurance = Math.min(grossIncome * (0.01525 + 0.0035), 4837.5);
  const pensionInsurance = Math.min(grossIncome * 0.093, 7300);
  const unemploymentInsurance = Math.min(grossIncome * 0.012, 7300);
  return (
    healthInsurance + careInsurance + pensionInsurance + unemploymentInsurance
  );
}

export function taxEstimationFromGrossIncome(grossIncome: number): number {
  const zVE =
    grossIncome - socialDeductionsEmployeeSHare(grossIncome) - pauschBetrag;

  // calc based on:
  // https://www.finanz-tools.de/einkommensteuer/berechnung-formeln/2023
  if (zVE <= basicAllowence) {
    return 0;
  } else if (zVE <= firstBarrier) {
    const y = (zVE - basicAllowence) / 10000.0;
    return (979.18 * y + 1400) * y;
  } else if (zVE <= secondBarrier) {
    const y = (zVE - firstBarrier) / 10000.0;
    return (192.59 * y + 2397) * y + 966.53;
  } else if (zVE <= thirdBarrier) {
    return 0.42 * zVE - 9972.98;
  } else {
    return 0.45 * zVE - 18307.73;
  }
}

// source: https://www.smart-rechner.de/soli/rechner.php#:~:text=1.816%2C98%20Euro.-,Berechnung%20Soli%202023,5%20Prozent%20seiner%20ESt%20zahlen.
export function soliFromTax(tax: number): number {
  if (tax <= 17543) {
    return 0;
  } else {
    return tax * 0.055;
  }
}
