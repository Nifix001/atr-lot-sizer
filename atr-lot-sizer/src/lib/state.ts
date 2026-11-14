import { CM_INSTRUMENTS, FX_PAIRS, RATE_KEYS, type RateKey } from "./instruments";

export type Tab = "fx" | "cm";
export type AtrMode = "mt5" | "pips";
/** A number field's value. null means the field is empty. */
export type Num = number | null;

export interface CmItem {
  /** ATR in price units, as the MT5 indicator shows it. */
  atr: Num;
  /** USD per 1.00 price move on a 1.00 lot. */
  contractValue: Num;
  lotStep: Num;
}

export interface AppState {
  balance: Num;
  tab: Tab;
  fx: {
    riskPct: Num;
    mult: Num;
    atrMode: AtrMode;
    rates: Record<RateKey, Num>;
    /** ATR is stored in pips whichever way it is typed in. */
    atrPips: Record<string, Num>;
  };
  cm: {
    riskPct: Num;
    mult: Num;
    items: Record<string, CmItem>;
  };
}

export function defaultFxInputs(): Pick<AppState["fx"], "rates" | "atrPips"> {
  return {
    rates: Object.fromEntries(RATE_KEYS.map((r) => [r.key, r.example])) as Record<RateKey, Num>,
    atrPips: Object.fromEntries(FX_PAIRS.map((p) => [p.symbol, p.exampleAtrPips])),
  };
}

export function defaultCmInputs(): AppState["cm"]["items"] {
  return Object.fromEntries(
    CM_INSTRUMENTS.map((c) => [c.symbol, { atr: c.exampleAtr, contractValue: c.contractValue, lotStep: c.lotStep }]),
  );
}

export function defaultState(): AppState {
  return {
    balance: 10000,
    tab: "fx",
    fx: { riskPct: 0.5, mult: 1.5, atrMode: "mt5", ...defaultFxInputs() },
    cm: { riskPct: 0.7, mult: 1.25, items: defaultCmInputs() },
  };
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function num(v: unknown, fallback: Num): Num {
  if (v === null) return null;
  return typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : fallback;
}

/** Builds a valid state from whatever was stored, falling back to defaults field by field. */
export function mergeState(raw: unknown): AppState {
  const state = defaultState();
  if (!isObject(raw)) return state;

  state.balance = num(raw.balance, state.balance);
  if (raw.tab === "fx" || raw.tab === "cm") state.tab = raw.tab;

  if (isObject(raw.fx)) {
    const fx = raw.fx;
    state.fx.riskPct = num(fx.riskPct, state.fx.riskPct);
    state.fx.mult = num(fx.mult, state.fx.mult);
    if (fx.atrMode === "mt5" || fx.atrMode === "pips") state.fx.atrMode = fx.atrMode;
    if (isObject(fx.rates)) {
      for (const { key } of RATE_KEYS) state.fx.rates[key] = num(fx.rates[key], state.fx.rates[key]);
    }
    if (isObject(fx.atrPips)) {
      for (const { symbol } of FX_PAIRS) state.fx.atrPips[symbol] = num(fx.atrPips[symbol], state.fx.atrPips[symbol]);
    }
  }

  if (isObject(raw.cm)) {
    const cm = raw.cm;
    state.cm.riskPct = num(cm.riskPct, state.cm.riskPct);
    state.cm.mult = num(cm.mult, state.cm.mult);
    if (isObject(cm.items)) {
      for (const { symbol } of CM_INSTRUMENTS) {
        const stored = cm.items[symbol];
        if (!isObject(stored)) continue;
        const current = state.cm.items[symbol];
        state.cm.items[symbol] = {
          atr: num(stored.atr, current.atr),
          contractValue: num(stored.contractValue, current.contractValue),
          lotStep: num(stored.lotStep, current.lotStep),
        };
      }
    }
  }

  return state;
}
