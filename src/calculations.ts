const grundFreibetrag = 10908;
const firstBarrier = 15999;
const secondBarrier = 62809;
const thirdBarrier = 277825;

const pauschBetrag = 1200;

// from https://www.imacc.de/sozialabgaben-rechner-sozialversicherung/#/base-data
function sozialAbgabenArbeitnehmer(brutto: number): number {
  const KV = Math.min(brutto * (0.073 + 0.0065), 4987.5);
  const PV = Math.min(brutto * (0.01525 + 0.0035), 4837.5);
  const RV = Math.min(brutto * 0.093, 7300);
  const AV = Math.min(brutto * 0.012, 7300);
  return KV + PV + RV + AV;
}

export function taxEstimationFromBrutto(brutto: number): number {
  // this is probably very wrong
  const zVE = brutto - sozialAbgabenArbeitnehmer(brutto) - pauschBetrag;

  // calc based on:
  // https://www.finanz-tools.de/einkommensteuer/berechnung-formeln/2023
  if (zVE <= grundFreibetrag) {
    return 0;
  } else if (zVE <= firstBarrier) {
    const y = (zVE - grundFreibetrag) / 10000;
    return (979.18 * y + 1400) * y;
  } else if (zVE <= secondBarrier) {
    const y = (zVE - firstBarrier) / 10000;
    return (192.59 * y + 2397) * y + 966.53;
  } else if (zVE <= thirdBarrier) {
    return 0.42 * zVE - 9972.98;
  } else {
    return 0.45 * zVE - 18307.73;
  }

  return zVE;
}

/*
function lohnsteuer_brutto_to_netto(brutto_monat) {

		let brutto = brutto_monat * 12;
		let lohnsteuer;
		let netto;

		if(brutto <= 10908)
			netto = brutto;
		else
			if(brutto <= 15999)
				netto = brutto - Math.round((979.18*(brutto-10909)/10000+1400)*(brutto-10909)/10000);
			else
				if(brutto <= 62809)
					netto = brutto - Math.round((192.59*(brutto-15999)/10000+2397)*(brutto-15999)/10000+966.53);
				else
					if(brutto <= 277825)
						netto = brutto - Math.round(brutto*0.42-9972.98);
					else
						netto = brutto - Math.round(brutto*0.45-18307.73);

		netto = netto/12;

		return netto;
	}
*/
