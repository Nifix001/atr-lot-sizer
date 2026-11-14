"use client";

import { useEffect } from "react";

/** Registers the offline cache in production builds only, so dev reloads are never stale. */
export function RegisterServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Offline support is optional. The app works without it.
    });
  }, []);

  return null;
}
