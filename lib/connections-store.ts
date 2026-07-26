"use client";

import { useEffect, useSyncExternalStore } from "react";
import { students } from "@/lib/sample-data";

export type ConnectionsState = {
  acceptedIds: string[];
  pendingIds: string[];
  declinedIds: string[];
};

const STORAGE_KEY = "unibridge.connections";
const STORE_EVENT = "unibridge-connections-updated";

const defaultConnections: ConnectionsState = {
  acceptedIds: students.slice(1, 3).map((student) => student.id),
  pendingIds: students.slice(3, 6).map((student) => student.id),
  declinedIds: []
};

let cachedRaw: string | null = null;
let cachedConnections = defaultConnections;

function readConnections(): ConnectionsState {
  if (typeof window === "undefined") return defaultConnections;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === cachedRaw) return cachedConnections;

    const state = stored ? { ...defaultConnections, ...JSON.parse(stored) } : defaultConnections;
    cachedRaw = stored;
    cachedConnections = state;
    return state;
  } catch {
    return defaultConnections;
  }
}

function saveConnections(state: ConnectionsState) {
  const raw = JSON.stringify(state);
  window.localStorage.setItem(STORAGE_KEY, raw);
  cachedRaw = raw;
  cachedConnections = state;
  window.dispatchEvent(new CustomEvent(STORE_EVENT));
}

export function useConnectionsState() {
  const state = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener(STORE_EVENT, onStoreChange);
      window.addEventListener("storage", onStoreChange);

      return () => {
        window.removeEventListener(STORE_EVENT, onStoreChange);
        window.removeEventListener("storage", onStoreChange);
      };
    },
    readConnections,
    () => defaultConnections
  );

  useEffect(() => {
    let isActive = true;

    void import("@/lib/supabase/user-sync").then(async ({ loadRemoteConnectionsState }) => {
      const remoteState = await loadRemoteConnectionsState();
      if (isActive && remoteState) {
        saveConnections({
          ...readConnections(),
          acceptedIds: remoteState.acceptedIds,
          pendingIds: remoteState.pendingIds,
          declinedIds: remoteState.declinedIds
        });
      }
    });

    return () => {
      isActive = false;
    };
  }, []);

  async function acceptRequest(studentId: string) {
    saveConnections({
      ...state,
      pendingIds: state.pendingIds.filter((id) => id !== studentId),
      declinedIds: state.declinedIds.filter((id) => id !== studentId),
      acceptedIds: state.acceptedIds.includes(studentId) ? state.acceptedIds : [...state.acceptedIds, studentId]
    });
    const { acceptRemoteConnectionRequest } = await import("@/lib/supabase/user-sync");
    await acceptRemoteConnectionRequest(studentId);
  }

  function declineRequest(studentId: string) {
    saveConnections({
      ...state,
      pendingIds: state.pendingIds.filter((id) => id !== studentId),
      acceptedIds: state.acceptedIds.filter((id) => id !== studentId),
      declinedIds: state.declinedIds.includes(studentId) ? state.declinedIds : [studentId, ...state.declinedIds]
    });
    void import("@/lib/supabase/user-sync").then(({ declineRemoteConnectionRequest }) => {
      void declineRemoteConnectionRequest(studentId);
    });
  }

  function removeConnection(studentId: string) {
    saveConnections({
      ...state,
      acceptedIds: state.acceptedIds.filter((id) => id !== studentId)
    });
    void import("@/lib/supabase/user-sync").then(({ removeRemoteConnection }) => {
      void removeRemoteConnection(studentId);
    });
  }

  return { state, acceptRequest, declineRequest, removeConnection };
}
