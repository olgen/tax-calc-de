import { assert } from "chai";
import { describe } from "mocha";
import { taxFromBrutto } from "../src/calculations";

describe("Tax tests", () => {
  it("should return 0 tax for brutto < 10800", () => {
    assert.equal(taxFromBrutto(10000), 0);
  });
});
