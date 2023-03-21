import { assert } from "chai";
import { describe } from "mocha";
import {
  soliFromTax,
  taxEstimationFromYearlyGrossIncome,
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
    const taxesEstimation = taxEstimationFromYearlyGrossIncome(grossIncome);
    const soliEstimation = soliFromTax(taxesEstimation);
    const tolerance = 0.01;

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
    [0, 0],
    [80, 0],
    [160, 0],
    [240, 0],
    [320, 0],
    [400, 0],
    [480, 0],
    [560, 0],
    [640, 0],
    [720, 0],
    [800, 0],
    [880, 0],
    [960, 0],
    [1030, 11],
    [1094, 26],
    [1157, 44],
    [1216, 64],
    [1275, 86],
    [1334, 107],
    [1393, 127],
    [1452, 148],
    [1511, 169],
    [1570, 191],
    [1628, 213],
    [1686, 235],
    [1743, 258],
    [1800, 281],
    [1857, 304],
    [1913, 327],
    [1969, 351],
    [2025, 376],
    [2081, 400],
    [2136, 425],
    [2190, 450],
    [2245, 476],
    [2299, 502],
    [2353, 528],
    [2406, 555],
    [2459, 582],
    [2512, 609],
    [2564, 637],
    [2616, 665],
    [2668, 693],
    [2719, 722],
    [2770, 751],
    [2821, 780],
    [2871, 810],
    [2921, 840],
    [2971, 870],
    [3024, 903],
    [3079, 938],
    [3133, 973],
    [3188, 1008],
    [3241, 1044],
    [3295, 1080],
    [3347, 1117],
    [3400, 1154],
    [3452, 1191],
    [3504, 1229],
    [3555, 1267],
    [3606, 1306],
    [3656, 1345],
    [3708, 1383],
    [3758, 1422],
    [3810, 1460],
    [3860, 1499],
    [3912, 1537],
    [3962, 1576],
    [4013, 1615],
    [4064, 1653],
    [4115, 1692],
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
    const taxesEstimation = taxEstimationFromMonthlyNetIncome(netIncome);
    const tolerance = 0.01;

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
