import { assert } from "chai";
import { describe } from "mocha";
import { taxEstimationFromBrutto } from "../src/calculations";

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
  const bruttosAndTaxes = [
    [10000, 0],
    [15999, 66.96],
    [20000, 729.96],
    [30000, 2757.96],
    [70000, 13818.0],
    [280000, 101253.0],
  ];

  bruttosAndTaxes.forEach((rate) => {
    it(`should return ${rate[1]} tax for brutto of ${rate[0]} `, () => {
      const estimation = taxEstimationFromBrutto(rate[0]);
      const deltaInPercent = (rate[1] - estimation) / 100.0;
      console.log(deltaInPercent);
      //   assert.isAtMost(deltaInPercent, 1);
      assert.equal(estimation, rate[1]);
    });
  });
});
