"use client";

import { commoditySizing, riskAmount } from "@/lib/calc";
import { cn } from "@/lib/cn";
import { trimNumber } from "@/lib/format";
import { CM_INSTRUMENTS, type CmInstrument } from "@/lib/instruments";
import { defaultCmInputs, type AppState, type CmItem } from "@/lib/state";
import { updateApp } from "@/lib/store";
import { Cell, Code, FormulaList, GridHeader, LotResult, RiskResult, StopResult } from "./Results";
import { Card, CardHeader } from "./ui/Card";
import { NumberField } from "./ui/NumberField";
import { ResetButton } from "./ui/ResetButton";

const TEMPLATE =
  "lg:grid-cols-[minmax(8rem,1.2fr)_minmax(6.5rem,0.9fr)_minmax(4.5rem,0.7fr)_minmax(6.5rem,0.9fr)_minmax(5rem,0.6fr)_minmax(7rem,0.9fr)_minmax(9.5rem,1.1fr)]";

const patchCm = (change: (cm: AppState["cm"]) => AppState["cm"]) => updateApp((s) => ({ ...s, cm: change(s.cm) }));

export function CommoditiesView({ app }: { app: AppState }) {
  const { cm, balance } = app;
  const limit = riskAmount(balance ?? NaN, cm.riskPct ?? NaN);

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardHeader
          title="Metals, oil and indices settings"
          description="Separate from the forex settings. The balance is set above."
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <NumberField label="Risk per trade" suffix="%" value={cm.riskPct} onValue={(v) => patchCm((c) => ({ ...c, riskPct: v }))} />
          <NumberField label="ATR multiplier" suffix="× ATR" value={cm.mult} onValue={(v) => patchCm((c) => ({ ...c, mult: v }))} />
        </div>
      </Card>

      <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
        <div className="p-5">
          <CardHeader
            title="Lot size by instrument"
            description={
              <>
                Enter the 14-period ATR in price units, as MT5 shows it (25.00 on gold means $25). Contract value is what 1.00 lot gains or
                loses when the price moves by 1.00. It differs between brokers, especially on oil and indices. In MT5, right-click the
                symbol in Market Watch, open Specification, and divide Tick value by Tick size. The contract values, lot steps and ATRs
                shown are examples.
              </>
            }
            action={
              <ResetButton onConfirm={() => patchCm((c) => ({ ...c, items: defaultCmInputs() }))}>Reset to examples</ResetButton>
            }
          />
        </div>
        <GridHeader
          template={TEMPLATE}
          columns={["Instrument", "ATR", "Stop (price)", "$ per 1.00 move", "Lot step", "Lot size", "Actual risk"]}
        />
        <div>
          {CM_INSTRUMENTS.map((instrument) => (
            <CmRow key={instrument.symbol} instrument={instrument} app={app} limit={limit} />
          ))}
        </div>
      </section>

      <FormulaList
        items={[
          <>
            <Code>Risk = Balance × Risk %</Code>
          </>,
          <>
            <Code>Stop = ATR multiplier × ATR</Code>, in price units.
          </>,
          <>
            <Code>Loss per 1.00 lot = Stop × $ per 1.00 move</Code>
          </>,
          <>
            <Code>Lot size = Risk ÷ Loss per 1.00 lot</Code>, rounded down to the lot step.
          </>,
          <>If the result is below one lot step, the smallest lot already risks more than your limit. The table shows what that lot would cost.</>,
        ]}
      />
    </div>
  );
}

function CmRow({ instrument, app, limit }: { instrument: CmInstrument; app: AppState; limit: number }) {
  const { cm, balance } = app;
  const item: CmItem = cm.items[instrument.symbol];
  const sizing = commoditySizing({ balance, riskPct: cm.riskPct, mult: cm.mult, ...item });

  const setItem = (patch: Partial<CmItem>) =>
    patchCm((c) => ({ ...c, items: { ...c.items, [instrument.symbol]: { ...c.items[instrument.symbol], ...patch } } }));

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-4 gap-y-4 border-b border-line p-4 last:border-b-0 sm:grid-cols-4 lg:items-center lg:py-3",
        TEMPLATE,
      )}
    >
      <div className="col-span-full lg:col-span-1">
        <div className="font-mono text-[15px] font-semibold tracking-wide">{instrument.label}</div>
        <div className="text-xs text-muted">{instrument.note}</div>
      </div>

      <Cell label="ATR">
        <NumberField
          label={`${instrument.label} ATR`}
          hideLabel
          value={item.atr}
          format={(v) => trimNumber(v, 4)}
          onValue={(atr) => setItem({ atr })}
        />
      </Cell>

      <Cell label="Stop (price)">
        <StopResult sizing={sizing} decimals={instrument.decimals} />
      </Cell>

      <Cell label="$ per 1.00 move">
        <NumberField
          label={`${instrument.label} dollars per 1.00 move`}
          hideLabel
          prefix="$"
          value={item.contractValue}
          onValue={(contractValue) => setItem({ contractValue })}
        />
      </Cell>

      <Cell label="Lot step">
        <NumberField
          label={`${instrument.label} lot step`}
          hideLabel
          value={item.lotStep}
          onValue={(lotStep) => setItem({ lotStep })}
        />
      </Cell>

      <div className="col-span-full grid grid-cols-2 gap-4 rounded-xl bg-surface-2 p-3 lg:contents">
        <Cell label="Lot size">
          <LotResult sizing={sizing} lotStep={item.lotStep} />
        </Cell>
        <Cell label="Actual risk">
          <RiskResult sizing={sizing} limit={limit} />
        </Cell>
      </div>
    </div>
  );
}
