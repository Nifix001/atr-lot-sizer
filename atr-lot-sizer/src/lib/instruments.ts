export type Quote = "USD" | "JPY" | "CAD" | "CHF" | "GBP" | "NZD";
export type RateKey = "USDJPY" | "USDCAD" | "USDCHF" | "GBPUSD" | "NZDUSD";

export interface FxPair {
  symbol: string;
  quote: Quote;
  /** Example H4 ATR in pips. Replace with the live value. */
  exampleAtrPips: number;
}

export const FX_PAIRS: FxPair[] = [
  { symbol: "EURUSD", quote: "USD", exampleAtrPips: 35 },
  { symbol: "GBPUSD", quote: "USD", exampleAtrPips: 45 },
  { symbol: "USDJPY", quote: "JPY", exampleAtrPips: 50 },
  { symbol: "AUDNZD", quote: "NZD", exampleAtrPips: 30 },
  { symbol: "EURGBP", quote: "GBP", exampleAtrPips: 20 },
  { symbol: "AUDCAD", quote: "CAD", exampleAtrPips: 35 },
  { symbol: "CHFJPY", quote: "JPY", exampleAtrPips: 60 },
  { symbol: "USDCAD", quote: "CAD", exampleAtrPips: 35 },
  { symbol: "AUDUSD", quote: "USD", exampleAtrPips: 30 },
  { symbol: "USDCHF", quote: "CHF", exampleAtrPips: 30 },
  { symbol: "NZDUSD", quote: "USD", exampleAtrPips: 30 },
];

/** Prices needed to convert each quote currency into USD. Examples only. */
export const RATE_KEYS: { key: RateKey; example: number; hint: string }[] = [
  { key: "USDJPY", example: 150, hint: "JPY pairs" },
  { key: "USDCAD", example: 1.38, hint: "CAD pairs" },
  { key: "USDCHF", example: 0.88, hint: "CHF pairs" },
  { key: "GBPUSD", example: 1.3, hint: "EURGBP" },
  { key: "NZDUSD", example: 0.58, hint: "AUDNZD" },
];

export interface CmInstrument {
  symbol: string;
  label: string;
  note: string;
  /** Example ATR in price units. */
  exampleAtr: number;
  /** Dollars gained or lost by 1.00 lot when the price moves by 1.00. Broker specific. */
  contractValue: number;
  lotStep: number;
  /** Decimals used when showing the stop distance. */
  decimals: number;
}

export const CM_INSTRUMENTS: CmInstrument[] = [
  { symbol: "XAUUSD", label: "XAUUSD", note: "Gold", exampleAtr: 30, contractValue: 100, lotStep: 0.01, decimals: 2 },
  { symbol: "XAGUSD", label: "XAGUSD", note: "Silver", exampleAtr: 0.6, contractValue: 5000, lotStep: 0.01, decimals: 3 },
  { symbol: "XPTUSD", label: "XPTUSD", note: "Platinum", exampleAtr: 20, contractValue: 50, lotStep: 0.01, decimals: 2 },
  { symbol: "XPDUSD", label: "XPDUSD", note: "Palladium", exampleAtr: 25, contractValue: 100, lotStep: 0.01, decimals: 2 },
  { symbol: "WTI", label: "Oil (WTI)", note: "Symbol name varies by broker", exampleAtr: 0.6, contractValue: 1000, lotStep: 0.01, decimals: 2 },
  { symbol: "US500", label: "US500", note: "S&P 500", exampleAtr: 25, contractValue: 1, lotStep: 0.01, decimals: 2 },
  { symbol: "US100", label: "US100", note: "Nasdaq 100", exampleAtr: 90, contractValue: 1, lotStep: 0.01, decimals: 2 },
];
