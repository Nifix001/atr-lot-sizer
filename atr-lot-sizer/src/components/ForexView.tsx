"use client";

import { forexSizing, pipValuePerLot, pipsToPrice, priceToPips, riskAmount, type Rates } from "@/lib/calc";
import { trimNumber } from "@/lib/format";
import { FX_PAIRS, RATE_KEYS, type FxPair } from "@/lib/instruments";
import { defaultFxInputs, type AppState, type AtrMode } from "@/lib/state";
import { updateApp } from "@/lib/store";
import { Cell, Code, FormulaList, GridHeader, LotResult, RiskResult, StopResult } from "./Results";
import { Card, CardHeader } from "./ui/Card";
import { NumberField } from "./ui/NumberField";
import { ResetButton } from "./ui/ResetButton";
import { Segmented } from "./ui/Segmented";
import { cn } from "@/lib/cn";

const TEMPLATE =
  "lg:grid-cols-[minmax(8rem,1.1fr)_minmax(7.5rem,0.9fr)_minmax(4.5rem,0.7fr)_minmax(8rem,1fr)_minmax(7.5rem,1fr)_minmax(9.5rem,1.1fr)]";

const patchFx = (change: (fx: AppState["fx"]) => AppState["fx"]) => updateApp((s) => ({ ...s, fx: change(s.fx) }));

export function ForexView({ app }: { app: AppState }) {
  const { fx, balance } = app;
  const mt5 = fx.atrMode === "mt5";
  const rates = Object.fromEntries(RATE_KEYS.map((r) => [r.key, fx.rates[r.key] ?? NaN])) as Rates;
  const limit = riskAmount(balance ?? NaN, fx.riskPct ?? NaN);

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardHeader title="Forex settings" description="Risk and stop distance for the forex pairs. The balance is set above." />
        <div className="grid gap-4 sm:grid-cols-3">
          <NumberField label="Risk per trade" suffix="%" value={fx.riskPct} onValue={(v) => patchFx((f) => ({ ...f, riskPct: v }))} />
          <NumberField label="ATR multiplier" suffix="× ATR" value={fx.mult} onValue={(v) => patchFx((f) => ({ ...f, mult: v }))} />
          <div>
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted">ATR entered as</span>
            <Segmented<AtrMode>
              label="ATR entry mode"
              value={fx.atrMode}
              onChange={(atrMode) => patchFx((f) => ({ ...f, atrMode }))}
              options={[
                { value: "mt5", label: "MT5 value" },
                { value: "pips", label: "Pips" },
              ]}
            />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Reference prices"
          description="Used to turn each quote currency into USD. The values shown are examples. Replace them with the live prices from your Market Watch."
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {RATE_KEYS.map((r) => (
            <NumberField
              key={r.key}
              label={r.key}
              hint={r.hint}
              value={fx.rates[r.key]}
              onValue={(v) => patchFx((f) => ({ ...f, rates: { ...f.rates, [r.key]: v } }))}
            />
          ))}
        </div>
      </Card>

      <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
        <div className="p-5">
          <CardHeader
            title="Lot size by pair"
            description={
              <>
                Enter the 14-period ATR from your chart for each pair.
                {mt5 ? " Type the value MT5 shows (0.0035 on EURUSD, 0.50 on USDJPY)." : " Type it in pips."} The ATR values shown are examples.
              </>
            }
            action={
              <ResetButton onConfirm={() => patchFx((f) => ({ ...f, ...defaultFxInputs() }))}>Reset ATRs and prices</ResetButton>
            }
          />
        </div>
        <GridHeader
          template={TEMPLATE}
          columns={["Pair", mt5 ? "ATR (MT5)" : "ATR (pips)", "Stop (pips)", "Pip value / lot", "Lot size", "Actual risk"]}
        />
        <div>
          {FX_PAIRS.map((pair) => (
            <FxRow key={pair.symbol} pair={pair} app={app} rates={rates} limit={limit} />
          ))}
        </div>
      </section>

      <FormulaList
        items={[
          <>
            <Code>Risk = Balance × Risk %</Code>
          </>,
          <>
            <Code>Stop (pips) = ATR multiplier × ATR in pips</Code>
          </>,
          <>
            <Code>Pip value per lot</Code> is 10 USD on USD-quoted pairs. Otherwise it is 10 units of the quote currency (1,000 for JPY),
            converted to USD with the reference prices.
          </>,
          <>
            <Code>Lot size = Risk ÷ (Stop × Pip value per lot)</Code>, rounded down to 0.01.
          </>,
          <>If the result is under 0.01, the smallest lot already risks more than your limit. The table shows what 0.01 would cost.</>,
        ]}
      />
    </div>
  );
}

function FxRow({ pair, app, rates, limit }: { pair: FxPair; app: AppState; rates: Rates; limit: number }) {
  const { fx, balance } = app;
  const mt5 = fx.atrMode === "mt5";
  const pips = fx.atrPips[pair.symbol] ?? null;
  const sizing = forexSizing({ balance, riskPct: fx.riskPct, mult: fx.mult, atrPips: pips, quote: pair.quote, rates });
  const pv = pipValuePerLot(pair.quote, rates);

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-4 gap-y-4 border-b border-line p-4 last:border-b-0 sm:grid-cols-3 lg:items-center lg:py-3",
        TEMPLATE,
      )}
    >
      <div className="col-span-full lg:col-span-1">
        <div className="font-mono text-[15px] font-semibold tracking-wide">{pair.symbol}</div>
        <div className="text-xs text-muted">Quoted in {pair.quote}</div>
      </div>

      <Cell label={mt5 ? "ATR (MT5 value)" : "ATR (pips)"}>
        <NumberField
          label={`${pair.symbol} ATR`}
          hideLabel
          value={pips === null ? null : mt5 ? pipsToPrice(pips, pair.quote) : pips}
          format={(v) => trimNumber(v, mt5 ? (pair.quote === "JPY" ? 3 : 5) : 2)}
          onValue={(v) =>
            patchFx((f) => ({
              ...f,
              atrPips: {
                ...f.atrPips,
                [pair.symbol]: v === null ? null : mt5 ? Number(priceToPips(v, pair.quote).toFixed(4)) : v,
              },
            }))
          }
        />
      </Cell>

      <Cell label="Stop (pips)">
        <StopResult sizing={sizing} decimals={1} />
      </Cell>

      <Cell label="Pip value / lot">
        {Number.isFinite(pv.value) ? (
          <div>
            <div className="font-mono text-[15px] tabular-nums">${pv.value.toFixed(2)}</div>
            <div className="text-xs text-muted">{pv.note}</div>
          </div>
        ) : (
          <span className="font-mono text-[15px] text-muted">—</span>
        )}
      </Cell>

      <div className="col-span-full grid grid-cols-2 gap-4 rounded-xl bg-surface-2 p-3 sm:grid-cols-3 lg:contents">
        <Cell label="Lot size">
          <LotResult sizing={sizing} lotStep={0.01} />
        </Cell>
        <Cell label="Actual risk">
          <RiskResult sizing={sizing} limit={limit} />
        </Cell>
      </div>
    </div>
  );
}
