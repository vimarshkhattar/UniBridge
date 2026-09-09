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

  if (!cachedNow) cachedNow = Date.now();
  return cachedNow;
}


export function useClientNow(): number | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}
