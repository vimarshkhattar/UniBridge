"use client";

import { useSyncExternalStore } from "react";

const REFRESH_MS = 60_000;

let cachedNow = 0;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);

  if (!timer) {
    timer = setInterval(() => {
      cachedNow = Date.now();
      listeners.forEach((listener) => listener());
    }, REFRESH_MS);
  }

  return () => {
    listeners.delete(onStoreChange);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

function getSnapshot() {
  // Cached so repeated renders see a stable value; the interval above advances it.
  if (!cachedNow) cachedNow = Date.now();
  return cachedNow;
}

/**
 * The current time, or `null` during server rendering.
 *
 * Anything that compares a date against "now" has to wait for the client, or the
 * server's clock would decide what counts as a past event and cause a hydration
 * mismatch. Callers should treat `null` as "not known yet".
 */
export function useClientNow(): number | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}
