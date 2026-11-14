import { describe, expect, it } from "vitest";
import { defaultState, mergeState } from "./state";

describe("mergeState", () => {
  it("returns defaults for junk input", () => {
    expect(mergeState(undefined)).toEqual(defaultState());
    expect(mergeState("nope")).toEqual(defaultState());
    expect(mergeState([1, 2, 3])).toEqual(defaultState());
  });

  it("keeps valid stored values", () => {
    const s = mergeState({
      balance: 25000,
      tab: "cm",
      fx: { riskPct: 1, atrMode: "pips", rates: { USDJPY: 155 }, atrPips: { EURUSD: 40 } },
      cm: { riskPct: 0.7, mult: 1.25, items: { XAUUSD: { atr: 42, contractValue: 100, lotStep: 0.01 } } },
    });
    expect(s.balance).toBe(25000);
    expect(s.tab).toBe("cm");
    expect(s.fx.riskPct).toBe(1);
    expect(s.fx.atrMode).toBe("pips");
    expect(s.fx.rates.USDJPY).toBe(155);
    expect(s.fx.atrPips.EURUSD).toBe(40);
    expect(s.cm.items.XAUUSD.atr).toBe(42);
  });

  it("ignores wrong types and negatives, field by field", () => {
    const s = mergeState({ balance: "lots", tab: "other", fx: { riskPct: -1, mult: 2, atrMode: "x" } });
    expect(s.balance).toBe(10000);
    expect(s.tab).toBe("fx");
    expect(s.fx.riskPct).toBe(0.5);
    expect(s.fx.mult).toBe(2);
    expect(s.fx.atrMode).toBe("mt5");
  });

  it("keeps an emptied field empty", () => {
    expect(mergeState({ balance: null }).balance).toBeNull();
  });
});
