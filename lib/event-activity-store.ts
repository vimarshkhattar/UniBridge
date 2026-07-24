"use client";

import { useEffect, useSyncExternalStore } from "react";

type EventActivity = {
  joinedIds: string[];
  buddyIds: string[];
};

const STORAGE_KEY = "unibridge.eventActivity";
const STORE_EVENT = "unibridge-event-activity-updated";

const defaultActivity: EventActivity = {
  joinedIds: [],
  buddyIds: []
};

let cachedRaw: string | null = null;
let cachedActivity = defaultActivity;

function readActivity() {
  if (typeof window === "undefined") return defaultActivity;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === cachedRaw) return cachedActivity;

    cachedRaw = stored;
    cachedActivity = stored ? { ...defaultActivity, ...JSON.parse(stored) } : defaultActivity;
    return cachedActivity;
  } catch {
    return defaultActivity;
  }
}

function saveActivity(activity: EventActivity) {
  const raw = JSON.stringify(activity);
  window.localStorage.setItem(STORAGE_KEY, raw);
  cachedRaw = raw;
  cachedActivity = activity;
  window.dispatchEvent(new CustomEvent(STORE_EVENT));
}

export function useEventActivity() {
  const activity = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener(STORE_EVENT, onStoreChange);
      window.addEventListener("storage", onStoreChange);

      return () => {
        window.removeEventListener(STORE_EVENT, onStoreChange);
        window.removeEventListener("storage", onStoreChange);
      };
    },
    readActivity,
    () => defaultActivity
  );

  useEffect(() => {
    let isActive = true;

    void import("@/lib/supabase/user-sync").then(async ({ loadRemoteEventActivity }) => {
      const remoteActivity = await loadRemoteEventActivity();
      if (isActive && remoteActivity) saveActivity(remoteActivity);
    });

    return () => {
      isActive = false;
    };
  }, []);

  function joinEvent(eventId: string) {
    saveActivity({
      ...activity,
      joinedIds: activity.joinedIds.includes(eventId) ? activity.joinedIds : [...activity.joinedIds, eventId]
    });
    void import("@/lib/supabase/user-sync").then(({ joinRemoteEvent }) => {
      void joinRemoteEvent(eventId, activity.buddyIds.includes(eventId));
    });
  }

  function requestBuddy(eventId: string) {
    saveActivity({
      ...activity,
      joinedIds: activity.joinedIds.includes(eventId) ? activity.joinedIds : [...activity.joinedIds, eventId],
      buddyIds: activity.buddyIds.includes(eventId) ? activity.buddyIds : [...activity.buddyIds, eventId]
    });
    void import("@/lib/supabase/user-sync").then(({ joinRemoteEvent }) => {
      void joinRemoteEvent(eventId, true);
    });
  }

  return { activity, joinEvent, requestBuddy };
}
