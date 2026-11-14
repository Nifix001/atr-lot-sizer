import { useSyncExternalStore } from "react";
import { defaultState, mergeState, type AppState } from "./state";

const STORAGE_KEY = "atr-lot-sizer:v2";

const SERVER_STATE: AppState = defaultState();
const listeners = new Set<() => void>();
let current: AppState | undefined;

function read(): AppState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? mergeState(JSON.parse(raw)) : defaultState();
  } catch {
    return defaultState();
  }
}

function getSnapshot(): AppState {
  if (!current) current = read();
  return current;
}

function getServerSnapshot(): AppState {
  return SERVER_STATE;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  // Keep several open tabs or windows in step.
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      current = undefined;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function updateApp(change: (state: AppState) => AppState): void {
  current = change(getSnapshot());
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    // Storage can be blocked. The calculator still works for this visit.
  }
  listeners.forEach((l) => l());
}

/** The saved state in the browser, and the defaults during server rendering. */
export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

const noopSubscribe = () => () => {};

/** False while rendering on the server and during hydration, true afterwards. */
export function useHydrated(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}
