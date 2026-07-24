"use client";

import { useEffect, useSyncExternalStore } from "react";

export type BuddyGroupDetails = {
  id: string;
  title: string;
  basis: string;
  description: string;
  maxMembers: number;
  meetingPreference: string;
  note: string;
  members: string[];
  createdByCurrentUser?: boolean;
};

export type BuddyState = {
  created: boolean;
  joined: boolean;
  group?: BuddyGroupDetails;
  groups: BuddyGroupDetails[];
  joinedGroupId?: string;
  joinNote?: string;
};

const defaultState: BuddyState = {
  created: false,
  joined: false,
  groups: []
};

const cachedBuddyStates = new Map<string, { raw: string | null; state: BuddyState }>();

function storageKey(eventId: string) {
  return `unibridge.eventBuddy.${eventId}`;
}

function eventName(eventId: string) {
  return `unibridge-event-buddy-${eventId}`;
}

function readBuddyState(eventId: string): BuddyState {
  if (typeof window === "undefined") return defaultState;

  try {
    const stored = window.localStorage.getItem(storageKey(eventId));
    const cached = cachedBuddyStates.get(eventId);
    if (cached?.raw === stored) return cached.state;

    const parsed = stored ? { ...defaultState, ...JSON.parse(stored) } : defaultState;
    const state = normalizeBuddyState(parsed);
    cachedBuddyStates.set(eventId, { raw: stored, state });
    return state;
  } catch {
    return defaultState;
  }
}

export function saveBuddyState(eventId: string, state: BuddyState) {
  const normalized = normalizeBuddyState(state);
  const raw = JSON.stringify(normalized);
  cachedBuddyStates.set(eventId, { raw, state: normalized });
  window.localStorage.setItem(storageKey(eventId), raw);
  window.dispatchEvent(new CustomEvent(eventName(eventId)));
}

export function useBuddyState(eventId: string) {
  const state = useSyncExternalStore(
    (onStoreChange) => {
      const name = eventName(eventId);
      window.addEventListener(name, onStoreChange);
      window.addEventListener("storage", onStoreChange);

      return () => {
        window.removeEventListener(name, onStoreChange);
        window.removeEventListener("storage", onStoreChange);
      };
    },
    () => readBuddyState(eventId),
    () => defaultState
  );

  useEffect(() => {
    let isActive = true;

    void import("@/lib/supabase/user-sync").then(async ({ loadRemoteBuddyState }) => {
      const remoteState = await loadRemoteBuddyState(eventId);
      if (isActive && remoteState) {
        saveBuddyState(eventId, {
          ...remoteState,
          joinNote: readBuddyState(eventId).joinNote
        });
      }
    });

    return () => {
      isActive = false;
    };
  }, [eventId]);

  function updateState(nextState: BuddyState) {
    saveBuddyState(eventId, nextState);
  }

  return { state, updateState };
}

export function demoBuddyGroups(eventId: string): BuddyGroupDetails[] {
  return [
    {
      id: `${eventId}-calm`,
      title: "Calm first-timers group",
      basis: "First-time event attendees",
      description: "A low-pressure group for students who want to arrive together, introduce themselves, and avoid walking in alone.",
      maxMembers: 4,
      meetingPreference: "Meet near the event entrance",
      note: "Good for students who feel awkward attending events alone.",
      members: ["Sofia Martinez", "Chen Wei"]
    },
    {
      id: `${eventId}-career`,
      title: "Career and networking group",
      basis: "Same major or career interest",
      description: "A group for students who want to talk about classes, internships, career prep, and useful campus resources after the event.",
      maxMembers: 5,
      meetingPreference: "Meet 10 minutes before the event",
      note: "Bring one question you want to ask someone at the event.",
      members: ["Daniel Kim", "Amina Hassan"]
    }
  ];
}

export function groupsForEvent(eventId: string, state: BuddyState) {
  const groupsById = new Map<string, BuddyGroupDetails>();

  demoBuddyGroups(eventId).forEach((group) => groupsById.set(group.id, group));
  state.groups.forEach((group) => groupsById.set(group.id, group));

  return Array.from(groupsById.values()).map((group) => (
    state.joinedGroupId === group.id && !group.members.includes("You")
      ? { ...group, members: [...group.members, "You"] }
      : group
  ));
}

function normalizeBuddyState(state: BuddyState): BuddyState {
  const groups = [...(state.groups ?? [])];

  if (state.group && !groups.some((group) => group.id === state.group?.id)) {
    groups.push({
      ...state.group,
      id: state.group.id ?? "user-created-group",
      members: state.group.members ?? ["You"],
      createdByCurrentUser: state.group.createdByCurrentUser ?? state.created
    });
  }

  return {
    ...defaultState,
    ...state,
    groups,
    group: groups.find((group) => group.createdByCurrentUser) ?? state.group,
    joinedGroupId: state.joinedGroupId ?? (state.joined ? groups[0]?.id : undefined)
  };
}
