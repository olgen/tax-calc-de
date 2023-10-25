import { assert } from "chai";
import { describe } from "mocha";
import {
  soliFromYearlyTaxes,
  taxEstimationFromMonthlyGrossIncome,
  taxEstimationFromMonthlyNetIncome,
} from "../src/calculations";

describe("Tax tests", () => {
  /*
    from https://www.brutto-netto-rechner.info/
    using settings:
    - yearly brutto
    - year = 2023
    - steuerfreibetrag = 0
    - steuerkl = 1
    - Bundesland = Berlin
    - Alter = 25
    - Kinder = nein
    - Kinderfreibetrag = 0
    - Gesetzlich versichert
    - KV= gesetzl
    - KV Zusatzbeitrag = 1.6
    - RV= gesetzl
    - AV = gesetzl

    */
  const grossIncomeAndTaxes = [
    // [grossIncome, taxesInclSoli, soli]
    [10000, 0, 0],
    [15999, 66.96, 0],
    [20000, 729.96, 0],
    [30000, 2757.96, 0],
    [70000, 13818.0, 0],
    [100000, 25653.0, 965.04],
    [280000, 101253.0, 5568.84],
    [500000, 199863.96, 10992.48],
  ];

  grossIncomeAndTaxes.forEach((example) => {
    const [grossIncome, trueTaxes, trueSoli] = example;
    const monthlyTaxEstimation = taxEstimationFromMonthlyGrossIncome(
      grossIncome / 12.0
    );
    const taxesEstimation = monthlyTaxEstimation * 12.0;
    const soliEstimation = soliFromYearlyTaxes(taxesEstimation);
    const tolerance = 0.006;

    it(`should return ${trueTaxes} tax for grossIncome of ${grossIncome} with tolerance of ${tolerance} `, () => {
      const deltaInPercent = (trueTaxes - taxesEstimation) / grossIncome;
      assert.isAtMost(Math.abs(deltaInPercent), tolerance);
    });

    it(`should return ${trueSoli} soli for grossIncome of ${grossIncome} with tolerance of ${tolerance} `, () => {
      const deltaInPercent = (trueSoli - soliEstimation) / grossIncome;
      assert.isAtMost(Math.abs(deltaInPercent), tolerance);
    });
  });

  // netto,tax
  const nettoToTaxExamples = [
    [0.0, 0.0],
    [79.44, 0.0],
    [158.85, 0.0],
    [238.27, 0.0],
    [317.7, 0.0],
    [400.0, 0.0],
    [480.0, 0.0],
    [560.0, 0.0],
    [640.0, 0.0],
    [720.0, 0.0],
    [800.0, 0.0],
    [880.0, 0.0],
    [953.1, 0.0],
    [1030.89, 1.63],
    [1096.95, 15.0],
    [1160.54, 30.83],
    [1222.22, 48.58],
    [1283.39, 66.83],
    [1343.82, 85.83],
    [1403.57, 105.5],
    [1463.09, 125.41],
    [1522.17, 145.75],
    [1581.1, 166.25],
    [1639.61, 187.16],
    [1697.87, 208.33],
    [1755.79, 229.83],
    [1813.47, 251.58],
    [1870.81, 273.66],
    [1927.82, 296.08],
    [1984.57, 318.75],
    [2041.0, 341.75],
    [2097.17, 365.0],
    [2152.94, 388.66],
    [2208.52, 412.5],
    [2263.7, 436.75],
    [2318.62, 461.25],
    [2373.22, 486.08],
    [2427.56, 511.16],
    [2481.57, 536.58],
    [2535.24, 562.33],
    [2588.59, 588.41],
    [2641.76, 614.66],
    [2694.52, 641.33],
    [2747.02, 668.25],
    [2799.2, 695.5],
    [2851.04, 723.08],
    [2902.64, 750.91],
    [2953.89, 779.08],
    [3004.9, 807.5],
    [3055.75, 836.25],
    [3107.25, 865.75],
    [3163.24, 898.66],
    [3219.3, 932.0],
    [3275.42, 965.58],
    [3330.44, 999.66],
    [3385.42, 1034.08],
    [3440.17, 1068.83],
    [3494.22, 1104.08],
    [3548.11, 1139.59],
    [3601.52, 1175.58],
    [3654.67, 1211.83],
    [3707.32, 1248.58],
    [3759.64, 1285.66],
    [3812.0, 1323.0],
    [3864.0, 1361.0],
    [3915.0, 1399.0],
    [3966.0, 1437.0],
    [4015.5, 1476.8],
    [4062.26, 1519.44],
    [4109.1, 1562.0],
    [4155.82, 1604.68],
    [4688, 2061],
    [5218, 2531],
    [5756, 2994],
    [6313, 3437],
    [6870, 3880],
    [7427, 4323],
    [7984, 4766],
    [8541, 5209],
    [11325, 7425],
    [14091, 9659],
    [16717, 12033],
    [21970, 16780],
    [27222, 21528],
    [32475, 26275],
    [37727, 31023],
  ];

  nettoToTaxExamples.forEach((example) => {
    const [netIncome, trueTaxes] = example;
    const taxesEstimation = taxEstimationFromMonthlyNetIncome(netIncome, false);
    const tolerance = 0.0011;

    it(`should return ${trueTaxes} tax for netIncome of ${netIncome} with tolerance of ${tolerance} `, () => {
      if (netIncome > 0) {
        const deltaInPercent = (trueTaxes - taxesEstimation) / netIncome;
        assert.isAtMost(Math.abs(deltaInPercent), tolerance);
      } else {
        assert.equal(trueTaxes, taxesEstimation);
      }
    });
  });
});
