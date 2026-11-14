import type { ReactNode } from "react";
import { stepDigits, type Sizing } from "@/lib/calc";
import { cn } from "@/lib/cn";
import { usd } from "@/lib/format";
import { CopyButton } from "./ui/CopyButton";

/** A table cell. Below the lg breakpoint rows become cards, so each cell carries its own label. */
export function Cell({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted lg:hidden">{label}</div>
      {children}
    </div>
  );
}

export function LotResult({ sizing, lotStep }: { sizing: Sizing; lotStep: number | null }) {
  if (sizing.status === "invalid") {
    return <span className="font-mono text-xl text-muted">—</span>;
  }

  const digits = stepDigits(lotStep ?? 0.01);

  if (sizing.status === "under") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xl font-semibold text-muted">0</span>
        <span className="rounded-full bg-warn-soft px-2 py-0.5 text-xs font-medium text-warn">
          Under {(lotStep ?? 0.01).toFixed(digits)}
        </span>
      </div>
    );
  }

  const text = sizing.lots.toFixed(digits);
  return (
    <div>
      <div className="flex items-center gap-1">
        <span className="font-mono text-xl font-semibold tabular-nums text-accent">{text}</span>
        <CopyButton text={text} label="Copy lot size" />
      </div>
      <div className="text-xs text-muted">
        unrounded <span className="font-mono">{sizing.rawLots.toFixed(4)}</span>
      </div>
    </div>
  );
}

export function RiskResult({ sizing, limit }: { sizing: Sizing; limit: number }) {
  if (sizing.status === "invalid") {
    return <span className="font-mono text-[15px] text-muted">—</span>;
  }

  const under = sizing.status === "under";
  const ratio = limit > 0 ? sizing.actualRisk / limit : 0;
  const width = Number.isFinite(ratio) ? Math.min(ratio, 1) * 100 : 0;
  const description = under
    ? "Over the risk limit at one lot step"
    : `${Math.round(ratio * 100)}% of the risk limit used`;

  return (
    <div>
      <div className="font-mono text-[15px] font-medium tabular-nums">{usd(sizing.actualRisk)}</div>
      <div className="text-xs text-muted">
        {sizing.actualRiskPct.toFixed(2)}% of balance{under ? ", at one lot step" : ""}
      </div>
      <div
        role="img"
        aria-label={description}
        title={description}
        className="mt-1.5 h-1 w-full max-w-36 overflow-hidden rounded-full bg-line"
      >
        <div className={cn("h-full rounded-full", under ? "bg-warn" : "bg-accent")} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export function StopResult({ sizing, decimals }: { sizing: Sizing; decimals: number }) {
  return (
    <span className="font-mono text-[15px] tabular-nums">
      {sizing.status === "invalid" ? "—" : sizing.stop.toFixed(decimals)}
    </span>
  );
}

export function GridHeader({ columns, template }: { columns: string[]; template: string }) {
  return (
    <div
      className={cn(
        "hidden gap-x-4 border-b border-line bg-surface-2 px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted lg:grid",
        template,
      )}
    >
      {columns.map((name) => (
        <div key={name}>{name}</div>
      ))}
    </div>
  );
}

export function FormulaList({ items }: { items: ReactNode[] }) {
  return (
    <details className="group rounded-2xl border border-line bg-surface shadow-card">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 text-sm font-semibold marker:hidden">
        How it is worked out
        <svg viewBox="0 0 24 24" className="size-4 text-muted transition group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </summary>
      <ul className="space-y-2.5 border-t border-line px-5 py-4 text-sm leading-relaxed text-muted">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </details>
  );
}

export function Code({ children }: { children: ReactNode }) {
  return <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-ink">{children}</code>;
}
