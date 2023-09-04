const request = require("request-promise");
const cheerio = require("cheerio");
const fs = require("fs");

const yearOfAssessment = "2023.5"; // the latest is 2023.5
const taxDataPath = `data/tax-data-${yearOfAssessment}-mit-werbungskosten.csv`;

const incomeTaxSelector = "tbody tr:nth-child(11) td:nth-child(3)";
const socialSecuritySelector = "tbody tr:nth-child(20) td:nth-child(3)";
const currencyRegex = /[. €]/gi;
const spaceRegex = /\s+/gi;

async function getTaxEstimation(monthlyGrossIncome) {
  return request
    .post("https://www.brutto-netto-rechner.info/", {
      form: {
        f_start: 1,
        ok: 1,
        f_bruttolohn: monthlyGrossIncome,
        f_abrechnungszeitraum: "monat",
        f_geld_werter_vorteil: 0,
        f_abrechnungsjahr: yearOfAssessment,
        f_steuerfreibetrag: 0,
        f_steuerklasse: 1,
        f_kirche: "nein",
        f_bundesland: "berlin",
        f_alter: 35,
        f_kinder: "nein",
        f_kinderfreibetrag: 0,
        f_krankenversicherung: "pflichtversichert",
        f_private_kv: "",
        f_arbeitgeberzuschuss_pkv: "ja",
        f_KVZ: 1.6,
        f_rentenversicherung: "pflichtversichert",
        f_arbeitslosenversicherung: "pflichtversichert",
      },
    })
    .then((body) => {
      const $ = cheerio.load(body);
      var netIncomes = $(".right_column.orange.big b")
        .text()
        .replace(currencyRegex, "")
        .replace(spaceRegex, " ")
        .replace(",", ".")
        .trim()
        .split(" ");
      const incomeTax = $(incomeTaxSelector)
        .text()
        .replace(currencyRegex, "")
        .replace(spaceRegex, " ")
        .replace(",", ".")
        .trim();
      const socialSecurity = $(socialSecuritySelector)
        .text()
        .replace(currencyRegex, "")
        .replace(spaceRegex, " ")
        .replace(",", ".")
        .trim();
      return {
        grossIncome: monthlyGrossIncome,
        netIncome: parseFloat(netIncomes[0]),
        steuern: parseFloat(incomeTax),
        socialSecurity: parseFloat(socialSecurity),
      };
    });
}

function toFixed(n) {
  return (Math.round(n * 100) / 100).toFixed(2);
}

const grossIncomeRange = [0, 100000];
const incomeStep = 100;
async function main() {
  var rows = [
    [
      "monthly gross income",
      "net income",
      "social security payments",
      "income tax",
    ],
  ];

  for (
    var grossIncome = grossIncomeRange[0];
    grossIncome <= grossIncomeRange[1];
    grossIncome += incomeStep
  ) {
    console.log("Estimating taxes for gross income: " + grossIncome);

    const result = await getTaxEstimation(grossIncome);
    var netIncome = toFixed(result.netIncome);
    var socialSecurity = toFixed(result.socialSecurity);
    var incomeTax = toFixed(result.steuern);
    rows.push([grossIncome, netIncome, socialSecurity, incomeTax]);
  }

  console.log("done");
  const csv = rows
    .map(function (row) {
      return row.join(",");
    })
    .join("\n");
  console.log("writing csv to file: " + taxDataPath);
  fs.writeFileSync(taxDataPath, csv);
}

main();
