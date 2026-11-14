const usdFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function usd(value: number): string {
  return Number.isFinite(value) ? usdFormat.format(value) : "$0.00";
}

/** Rounds to `digits` decimals and drops trailing zeros: 0.0035 stays 0.0035, 50.0 becomes 50. */
export function trimNumber(value: number, digits: number): string {
  return String(Number(value.toFixed(digits)));
}
