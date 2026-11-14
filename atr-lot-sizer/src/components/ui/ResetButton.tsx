"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/** Two-step button: the first click arms it, the second within three seconds confirms. */
export function ResetButton({ onConfirm, children }: { onConfirm: () => void; children: React.ReactNode }) {
  const [armed, setArmed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  function click() {
    if (!armed) {
      setArmed(true);
      timer.current = setTimeout(() => setArmed(false), 3000);
      return;
    }
    clearTimeout(timer.current);
    setArmed(false);
    onConfirm();
  }

  return (
    <button
      type="button"
      onClick={click}
      className={cn(
        "rounded-lg border px-3 py-1.5 text-xs font-medium transition",
        armed ? "border-warn bg-warn-soft text-warn" : "border-line text-muted hover:text-ink",
      )}
    >
      {armed ? "Click again to confirm" : children}
    </button>
  );
}
