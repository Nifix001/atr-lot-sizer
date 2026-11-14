import { describe, expect, it } from "vitest";
import {
  commoditySizing,
  forexSizing,
  pipValuePerLot,
  priceToPips,
  pipsToPrice,
  riskAmount,
  stepDigits,
  type Rates,
} from "./calc";

const rates: Rates = { USDJPY: 150, USDCAD: 1.38, USDCHF: 0.88, GBPUSD: 1.3, NZDUSD: 0.58 };
const base = { balance: 10000 };

describe("riskAmount", () => {
  it("takes a percentage of the balance", () => {
    expect(riskAmount(10000, 0.5)).toBe(50);
    expect(riskAmount(10000, 0.7)).toBeCloseTo(70, 10);
  });
});

describe("pipValuePerLot", () => {
  it("is 10 USD on USD-quoted pairs", () => {
    expect(pipValuePerLot("USD", rates).value).toBe(10);
  });
  it("converts JPY, CAD, CHF with the USD-first rate", () => {
    expect(pipValuePerLot("JPY", rates).value).toBeCloseTo(6.6667, 4);
    expect(pipValuePerLot("CAD", rates).value).toBeCloseTo(7.2464, 4);
    expect(pipValuePerLot("CHF", rates).value).toBeCloseTo(11.3636, 4);
  });
  it("converts GBP and NZD with the USD-second rate", () => {
    expect(pipValuePerLot("GBP", rates).value).toBeCloseTo(13, 10);
    expect(pipValuePerLot("NZD", rates).value).toBeCloseTo(5.8, 10);
  });
});

describe("pip conversion", () => {
  it("uses 0.0001 for most pairs and 0.01 for JPY pairs", () => {
    expect(priceToPips(0.0035, "USD")).toBeCloseTo(35, 10);
    expect(priceToPips(0.5, "JPY")).toBeCloseTo(50, 10);
    expect(pipsToPrice(35, "USD")).toBeCloseTo(0.0035, 10);
    expect(pipsToPrice(50, "JPY")).toBeCloseTo(0.5, 10);
  });
});

describe("stepDigits", () => {
  it("counts decimals of the lot step", () => {
    expect(stepDigits(0.01)).toBe(2);
    expect(stepDigits(0.1)).toBe(1);
    expect(stepDigits(1)).toBe(0);
    expect(stepDigits(0.05)).toBe(2);
    expect(stepDigits(0.001)).toBe(3);
  });
});

describe("forexSizing", () => {
  it("EURUSD, 35 pip ATR, 1.5x, 0.5% of 10k -> 0.09 lots", () => {
    const r = forexSizing({ ...base, riskPct: 0.5, mult: 1.5, atrPips: 35, quote: "USD", rates });
    if (r.status !== "ok") throw new Error("expected ok");
    expect(r.stop).toBeCloseTo(52.5, 10);
    expect(r.lossPerLot).toBeCloseTo(525, 10);
    expect(r.rawLots).toBeCloseTo(0.0952, 4);
    expect(r.lots).toBe(0.09);
    expect(r.actualRisk).toBeCloseTo(47.25, 10);
  });

  it("matches the worked example: 80 pip ATR -> 0.04 lots, $48 risk", () => {
    const r = forexSizing({ ...base, riskPct: 0.5, mult: 1.5, atrPips: 80, quote: "USD", rates });
    if (r.status !== "ok") throw new Error("expected ok");
    expect(r.lots).toBe(0.04);
    expect(r.actualRisk).toBeCloseTo(48, 10);
  });

  it("USDJPY at 150, 100 pip ATR -> 0.05 lots", () => {
    const r = forexSizing({ ...base, riskPct: 0.5, mult: 1.5, atrPips: 100, quote: "JPY", rates });
    if (r.status !== "ok") throw new Error("expected ok");
    expect(r.lots).toBe(0.05);
  });

  it("EURGBP at GBPUSD 1.30, 50 pip ATR -> 0.05 lots", () => {
    const r = forexSizing({ ...base, riskPct: 0.5, mult: 1.5, atrPips: 50, quote: "GBP", rates });
    if (r.status !== "ok") throw new Error("expected ok");
    expect(r.lots).toBe(0.05);
  });

  it("does not lose a lot step to floating point error", () => {
    // 50 / (75 * 6.6667) is exactly 0.1 in theory but not in floating point
    const r = forexSizing({ ...base, riskPct: 0.5, mult: 1.5, atrPips: 50, quote: "JPY", rates });
    if (r.status !== "ok") throw new Error("expected ok");
    expect(r.lots).toBe(0.1);
  });

  it("reports under-minimum when 0.01 lot already risks too much", () => {
    const r = forexSizing({ balance: 1000, riskPct: 0.5, mult: 1.5, atrPips: 80, quote: "USD", rates });
    expect(r.status).toBe("under");
    if (r.status === "under") {
      expect(r.lots).toBe(0);
      expect(r.actualRisk).toBeCloseTo(12, 10);
    }
  });

  it("is invalid without a usable ATR", () => {
    expect(forexSizing({ ...base, riskPct: 0.5, mult: 1.5, atrPips: null, quote: "USD", rates }).status).toBe("invalid");
    expect(forexSizing({ ...base, riskPct: 0.5, mult: 1.5, atrPips: 0, quote: "USD", rates }).status).toBe("invalid");
  });
});

describe("commoditySizing", () => {
  const args = { ...base, riskPct: 0.7, mult: 1.25 };

  it("gold, ATR 30, $100 per 1.00 -> 0.01 lot, $37.50 risk", () => {
    const r = commoditySizing({ ...args, atr: 30, contractValue: 100, lotStep: 0.01 });
    if (r.status !== "ok") throw new Error("expected ok");
    expect(r.stop).toBeCloseTo(37.5, 10);
    expect(r.lots).toBe(0.01);
    expect(r.actualRisk).toBeCloseTo(37.5, 10);
  });

  it("oil, ATR 0.6, $1000 per 1.00 -> 0.09 lots", () => {
    const r = commoditySizing({ ...args, atr: 0.6, contractValue: 1000, lotStep: 0.01 });
    if (r.status !== "ok") throw new Error("expected ok");
    expect(r.lots).toBe(0.09);
    expect(r.actualRisk).toBeCloseTo(67.5, 10);
  });

  it("US500, ATR 25, $1 per point -> 2.24 lots, $70 risk", () => {
    const r = commoditySizing({ ...args, atr: 25, contractValue: 1, lotStep: 0.01 });
    if (r.status !== "ok") throw new Error("expected ok");
    expect(r.lots).toBe(2.24);
    expect(r.actualRisk).toBeCloseTo(70, 10);
  });

  it("respects a whole-lot step and reports under-minimum", () => {
    const r = commoditySizing({ ...args, atr: 100, contractValue: 1, lotStep: 1 });
    expect(r.status).toBe("under");
    if (r.status === "under") expect(r.actualRisk).toBeCloseTo(125, 10);
  });

  it("is invalid when contract value or lot step is missing", () => {
    expect(commoditySizing({ ...args, atr: 25, contractValue: null, lotStep: 0.01 }).status).toBe("invalid");
    expect(commoditySizing({ ...args, atr: 25, contractValue: 1, lotStep: null }).status).toBe("invalid");
  });
});
