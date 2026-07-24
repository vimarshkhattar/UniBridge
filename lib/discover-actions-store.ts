"use client";

import { useEffect, useSyncExternalStore } from "react";

type DiscoverActions = {
  requestedIds: string[];
  savedIds: string[];
};

const STORAGE_KEY = "unibridge.discoverActions";
const STORE_EVENT = "unibridge-discover-actions-updated";
const defaultActions: DiscoverActions = {
  requestedIds: [],
  savedIds: []
};

let cachedRaw: string | null = null;
let cachedActions = defaultActions;

function readActions() {
  if (typeof window === "undefined") return defaultActions;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === cachedRaw) return cachedActions;
    if (!stored) {
      cachedRaw = null;
      cachedActions = defaultActions;
      return cachedActions;
    }

    cachedRaw = stored;
    cachedActions = { ...defaultActions, ...JSON.parse(stored) };
    return cachedActions;
  } catch {
    return defaultActions;
  }
}

function saveActions(actions: DiscoverActions) {
  cachedRaw = JSON.stringify(actions);
  cachedActions = actions;
  window.localStorage.setItem(STORAGE_KEY, cachedRaw);
  window.dispatchEvent(new CustomEvent(STORE_EVENT));
}

export function useDiscoverActions() {
  const actions = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener(STORE_EVENT, onStoreChange);
      window.addEventListener("storage", onStoreChange);

      return () => {
        window.removeEventListener(STORE_EVENT, onStoreChange);
        window.removeEventListener("storage", onStoreChange);
      };
    },
    readActions,
    () => defaultActions
  );

  useEffect(() => {
    let isActive = true;

    void import("@/lib/supabase/user-sync").then(async ({ loadRemoteDiscoverActions }) => {
      const remoteActions = await loadRemoteDiscoverActions();
      if (isActive && remoteActions) saveActions(remoteActions);
    });

    return () => {
      isActive = false;
    };
  }, []);

  function sendRequest(studentId: string) {
    saveActions({
      ...actions,
      requestedIds: actions.requestedIds.includes(studentId) ? actions.requestedIds : [...actions.requestedIds, studentId]
    });
    void import("@/lib/supabase/user-sync").then(({ sendRemoteConnectionRequest }) => {
      void sendRemoteConnectionRequest(studentId);
    });
  }

  function saveProfile(studentId: string) {
    saveActions({
      ...actions,
      savedIds: actions.savedIds.includes(studentId) ? actions.savedIds : [...actions.savedIds, studentId]
    });
    void import("@/lib/supabase/user-sync").then(({ saveRemoteProfile }) => {
      void saveRemoteProfile(studentId);
    });
  }

  function cancelRequest(studentId: string) {
    saveActions({
      ...actions,
      requestedIds: actions.requestedIds.filter((id) => id !== studentId)
    });
    void import("@/lib/supabase/user-sync").then(({ cancelRemoteConnectionRequest }) => {
      void cancelRemoteConnectionRequest(studentId);
    });
  }

  function removeSavedProfile(studentId: string) {
    saveActions({
      ...actions,
      savedIds: actions.savedIds.filter((id) => id !== studentId)
    });
    void import("@/lib/supabase/user-sync").then(({ removeRemoteSavedProfile }) => {
      void removeRemoteSavedProfile(studentId);
    });
  }

  return { actions, sendRequest, saveProfile, cancelRequest, removeSavedProfile };
}
