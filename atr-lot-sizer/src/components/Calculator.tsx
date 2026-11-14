"use client";

import { riskAmount } from "@/lib/calc";
import { cn } from "@/lib/cn";
import { trimNumber, usd } from "@/lib/format";
import { CM_INSTRUMENTS, FX_PAIRS } from "@/lib/instruments";
import type { Tab } from "@/lib/state";
import { updateApp, useAppState, useHydrated } from "@/lib/store";
import { CommoditiesView } from "./CommoditiesView";
import { ForexView } from "./ForexView";
import { InstallButton } from "./InstallButton";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { NumberField } from "./ui/NumberField";
import { Segmented } from "./ui/Segmented";

export function Calculator() {
  const app = useAppState();
  const hydrated = useHydrated();

  const riskPct = app.tab === "fx" ? app.fx.riskPct : app.cm.riskPct;
  const risk = riskAmount(app.balance ?? NaN, riskPct ?? NaN);

  return (
    <main
      className={cn(
        "mx-auto w-full max-w-6xl px-4 pb-16 pt-5 transition-opacity duration-300 sm:px-6",
        hydrated ? "opacity-100" : "opacity-0",
      )}
    >
      <header>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Logo className="size-9 rounded-[10px]" />
            <span className="text-sm font-semibold tracking-tight">ATR Lot Sizer</span>
          </div>
          <div className="flex items-center gap-2">
            <InstallButton />
            <ThemeToggle />
          </div>
        </div>

        <div className="mt-10 grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">Position sizing</p>
            <h1 className="mt-3 max-w-2xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
              Set the risk. Read the lot size.
            </h1>
            <p className="mt-4 max-w-xl text-pretty leading-relaxed text-muted">
              Pick an instrument, type in its ATR, and get the largest lot that keeps your stop-out inside the risk you chose.
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-surface px-6 py-5 shadow-card lg:min-w-72">
            <div className="text-xs font-medium uppercase tracking-wider text-muted">Risk per trade</div>
            <div className="mt-1 font-mono text-4xl font-semibold tabular-nums">{usd(risk)}</div>
            <div className="mt-1 text-sm text-muted">
              {riskPct === null ? "—" : trimNumber(riskPct, 3)}% of {usd(app.balance ?? NaN)}
              {" for "}
              {app.tab === "fx" ? "forex pairs" : "metals, oil and indices"}
            </div>
          </div>
        </div>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-[minmax(0,16rem)_1fr] sm:items-end">
        <NumberField
          label="Account balance"
          prefix="$"
          value={app.balance}
          onValue={(balance) => updateApp((s) => ({ ...s, balance }))}
        />
        <div className="max-w-full overflow-x-auto sm:justify-self-end">
          <Segmented<Tab>
            label="Instrument group"
            value={app.tab}
            onChange={(tab) => updateApp((s) => ({ ...s, tab }))}
            options={[
              { value: "fx", label: "Forex pairs", badge: String(FX_PAIRS.length) },
              { value: "cm", label: "Metals, oil, indices", badge: String(CM_INSTRUMENTS.length) },
            ]}
          />
        </div>
      </div>

      <div className="mt-5">{app.tab === "fx" ? <ForexView app={app} /> : <CommoditiesView app={app} />}</div>

      <footer className="mt-12 border-t border-line pt-6 text-xs leading-relaxed text-muted">
        <p className="max-w-3xl">
          Entries are saved in this browser only. The ATR values, prices and contract sizes shown on first load are examples. Position
          sizing is a risk tool, not financial advice. Check each symbol&apos;s Specification in MT5, because contract sizes, lot steps and
          symbol names differ between brokers.
        </p>
      </footer>
    </main>
  );
}
