import { assert } from "chai";
import { describe } from "mocha";
import {
  soliFromTax,
  taxAndSoliEstimationFromBrutto,
  taxEstimationFromBrutto,
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
  const examples = [
    // [brutto, taxesInclSoli, soli]
    [10000, 0, 0],
    [15999, 66.96, 0],
    [20000, 729.96, 0],
    [30000, 2757.96, 0],
    [70000, 13818.0, 0],
    [100000, 25653.0, 965.04],
    [280000, 101253.0, 5568.84],
    [500000, 199863.96, 10992.48],
  ];

  examples.forEach((example) => {
    const [brutto, trueTaxes, trueSoli] = example;
    const taxesEstimation = taxEstimationFromBrutto(brutto);
    const soliEstimation = soliFromTax(taxesEstimation);
    const tolerance = 0.01;

    it(`should return ${trueTaxes} tax for brutto of ${brutto} with tolerance of ${tolerance} `, () => {
      const deltaInPercent = (trueTaxes - taxesEstimation) / brutto;
      assert.isAtMost(Math.abs(deltaInPercent), tolerance);
    });

    it(`should return ${trueSoli} soli for brutto of ${brutto} with tolerance of ${tolerance} `, () => {
      const deltaInPercent = (trueSoli - soliEstimation) / brutto;
      assert.isAtMost(Math.abs(deltaInPercent), tolerance);
    });
  });
});
