"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/cn";
import { trimNumber } from "@/lib/format";

interface NumberFieldProps {
  label: string;
  value: number | null;
  onValue: (value: number | null) => void;
  /** How the stored value is shown when the field is not being edited. */
  format?: (value: number) => string;
  prefix?: string;
  suffix?: string;
  /** Keeps the label for screen readers only, for fields inside table rows. */
  hideLabel?: boolean;
  hint?: string;
  className?: string;
  inputClassName?: string;
}

const ALLOWED = /^\d*[.,]?\d*$/;

function parse(text: string): number | null {
  if (text.trim() === "") return null;
  const n = Number(text.replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

const defaultFormat = (v: number) => trimNumber(v, 6);

/**
 * Text input for non-negative decimals. It shows exactly what is typed while editing
 * ("0." stays "0.") and the formatted stored value otherwise.
 */
export function NumberField({
  label,
  value,
  onValue,
  format = defaultFormat,
  prefix,
  suffix,
  hideLabel,
  hint,
  className,
  inputClassName,
}: NumberFieldProps) {
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? (value === null ? "" : format(value));

  return (
    <div className={cn("min-w-0", className)}>
      <label
        htmlFor={id}
        className={hideLabel ? "sr-only" : "mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted"}
      >
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-3 flex items-center font-mono text-sm text-muted">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
          value={shown}
          aria-describedby={hint ? `${id}-hint` : undefined}
          onChange={(event) => {
            const text = event.target.value;
            if (!ALLOWED.test(text)) return;
            setDraft(text);
            onValue(parse(text));
          }}
          onFocus={(event) => event.currentTarget.select()}
          onBlur={() => setDraft(null)}
          className={cn(
            "w-full rounded-lg border border-line bg-surface-2 py-2 font-mono text-[15px] tabular-nums text-ink outline-none transition placeholder:text-muted/50 focus:border-accent focus:ring-2 focus:ring-accent/25",
            prefix ? "pl-7" : "pl-3",
            suffix ? "pr-12" : "pr-3",
            inputClassName,
          )}
        />
        {suffix && (
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted">
            {suffix}
          </span>
        )}
      </div>
      {hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}
