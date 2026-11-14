import type { Quote, RateKey } from "./instruments";

export type Rates = Record<RateKey, number>;

export const FOREX_LOT_STEP = 0.01;

export function riskAmount(balance: number, riskPct: number): number {
  return (balance * riskPct) / 100;
}

/** Size of one pip in price units. */
export function pipSize(quote: Quote): number {
  return quote === "JPY" ? 0.01 : 0.0001;
}

export function priceToPips(atrPrice: number, quote: Quote): number {
  return atrPrice / pipSize(quote);
}

export function pipsToPrice(pips: number, quote: Quote): number {
  return pips * pipSize(quote);
}

/** Value of one pip on a 1.00 lot, in USD, with a short note on how it was derived. */
export function pipValuePerLot(quote: Quote, rates: Rates): { value: number; note: string } {
  switch (quote) {
    case "USD":
      return { value: 10, note: "10 USD, no conversion" };
    case "JPY":
      return { value: 1000 / rates.USDJPY, note: "1,000 JPY ÷ USDJPY" };
    case "CAD":
      return { value: 10 / rates.USDCAD, note: "10 CAD ÷ USDCAD" };
    case "CHF":
      return { value: 10 / rates.USDCHF, note: "10 CHF ÷ USDCHF" };
    case "GBP":
      return { value: 10 * rates.GBPUSD, note: "10 GBP × GBPUSD" };
    case "NZD":
      return { value: 10 * rates.NZDUSD, note: "10 NZD × NZDUSD" };
  }
}

/** Number of decimals needed to show a lot step (0.01 -> 2, 0.1 -> 1, 1 -> 0). */
export function stepDigits(step: number): number {
  if (!(step > 0)) return 2;
  return Math.min(6, Math.max(0, Math.ceil(-Math.log10(step) - 1e-9)));
}

export type Sizing =
  | { status: "invalid" }
  | {
      /** "ok": lot size found. "under": even one lot step risks more than the limit. */
      status: "ok" | "under";
      stop: number;
      lossPerLot: number;
      rawLots: number;
      lots: number;
      /** Risk at the rounded lot size, or at one lot step when status is "under". */
      actualRisk: number;
      actualRiskPct: number;
    };

interface SizeInput {
  balance: number;
  /** Amount in USD the trade may lose. */
  risk: number;
  /** Stop distance in the instrument's own unit (pips or price units). */
  stop: number;
  /** USD gained or lost per 1.00 lot for one unit of stop distance. */
  valuePerUnit: number;
  lotStep: number;
}

const positive = (n: number | null | undefined): n is number =>
  typeof n === "number" && Number.isFinite(n) && n > 0;

export function sizePosition({ balance, risk, stop, valuePerUnit, lotStep }: SizeInput): Sizing {
  if (![balance, risk, stop, valuePerUnit, lotStep].every(positive)) return { status: "invalid" };

  const lossPerLot = stop * valuePerUnit;
  const rawLots = risk / lossPerLot;
  const steps = Math.floor(rawLots / lotStep + 1e-9);
  const digits = stepDigits(lotStep);

  if (steps >= 1) {
    const lots = Number((steps * lotStep).toFixed(digits));
    const actualRisk = lots * lossPerLot;
    return { status: "ok", stop, lossPerLot, rawLots, lots, actualRisk, actualRiskPct: (actualRisk / balance) * 100 };
  }

  const minRisk = lotStep * lossPerLot;
  return { status: "under", stop, lossPerLot, rawLots, lots: 0, actualRisk: minRisk, actualRiskPct: (minRisk / balance) * 100 };
}

export function forexSizing(args: {
  balance: number | null;
  riskPct: number | null;
  mult: number | null;
  atrPips: number | null;
  quote: Quote;
  rates: Rates;
}): Sizing {
  const { balance, riskPct, mult, atrPips, quote, rates } = args;
  if (!positive(balance) || !positive(riskPct) || !positive(atrPips) || !positive(mult)) return { status: "invalid" };
  return sizePosition({
    balance,
    risk: riskAmount(balance, riskPct),
    stop: mult * atrPips,
    valuePerUnit: pipValuePerLot(quote, rates).value,
    lotStep: FOREX_LOT_STEP,
  });
}

export function commoditySizing(args: {
  balance: number | null;
  riskPct: number | null;
  mult: number | null;
  atr: number | null;
  contractValue: number | null;
  lotStep: number | null;
}): Sizing {
  const { balance, riskPct, mult, atr, contractValue, lotStep } = args;
  if (!positive(balance) || !positive(riskPct) || !positive(atr) || !positive(mult) || !positive(contractValue) || !positive(lotStep)) {
    return { status: "invalid" };
  }
  return sizePosition({
    balance,
    risk: riskAmount(balance, riskPct),
    stop: mult * atr,
    valuePerUnit: contractValue,
    lotStep,
  });
}
