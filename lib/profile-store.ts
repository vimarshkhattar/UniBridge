"use client";

import { useEffect, useSyncExternalStore } from "react";
import { currentStudent } from "@/lib/sample-data";
import type { StudentProfile } from "@/lib/types";

const STORAGE_KEY = "unibridge.profile";
const LEGACY_STORAGE_KEY = "unibridge.demoProfile";
const PROFILE_EVENT = "unibridge-profile-updated";

export type ProfileVisibility = {
  country: boolean;
  languages: boolean;
  courses: boolean;
  sameUniversityOnly: boolean;
};

export type StoredProfile = StudentProfile & {
  visibility: ProfileVisibility;
};

export const defaultStoredProfile: StoredProfile = {
  ...currentStudent,
  fullName: "Vimarsh Khattar",
  email: "vimarsh.khattar@stonybrook.edu",
  bio: "International student looking for study partners, event buddies, and practical guidance for adjusting to university life.",
  visibility: {
    country: true,
    languages: true,
    courses: true,
    sameUniversityOnly: false
  }
};

export function calculateProfileCompletion(profile: StoredProfile) {
  const checks = [
    profile.fullName,
    profile.email,
    profile.university,
    profile.major,
    profile.academicYear,
    profile.country,
    profile.languages.length > 0,
    profile.courses.length > 0,
    profile.interests.length > 0,
    profile.connectionTypes.length > 0,
    profile.bio,
    profile.avatarUrl
  ];

  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
}

let cachedRawProfile: string | null = null;
let cachedProfile: StoredProfile = defaultStoredProfile;

function readProfile(): StoredProfile {
  if (typeof window === "undefined") return defaultStoredProfile;

  try {
    const legacyStored = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    const stored = window.localStorage.getItem(STORAGE_KEY) ?? legacyStored;
    if (!window.localStorage.getItem(STORAGE_KEY) && legacyStored) {
      window.localStorage.setItem(STORAGE_KEY, legacyStored);
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
    if (stored === cachedRawProfile) return cachedProfile;
    if (!stored) {
      cachedRawProfile = null;
      cachedProfile = defaultStoredProfile;
      return cachedProfile;
    }
    cachedRawProfile = stored;
    cachedProfile = { ...defaultStoredProfile, ...JSON.parse(stored) };
    return cachedProfile;
  } catch {
    return defaultStoredProfile;
  }
}

export function saveStoredProfile(profile: StoredProfile) {
  const raw = JSON.stringify(profile);
  window.localStorage.setItem(STORAGE_KEY, raw);
  cachedRawProfile = raw;
  cachedProfile = profile;
  window.dispatchEvent(new CustomEvent(PROFILE_EVENT, { detail: profile }));
}

export function useStoredProfile() {
  const profile = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener(PROFILE_EVENT, onStoreChange);
      window.addEventListener("storage", onStoreChange);

      return () => {
        window.removeEventListener(PROFILE_EVENT, onStoreChange);
        window.removeEventListener("storage", onStoreChange);
      };
    },
    readProfile,
    () => defaultStoredProfile
  );

  useEffect(() => {
    let isActive = true;

    void import("@/lib/supabase/user-sync").then(async ({ loadCurrentUserProfile }) => {
      const remoteProfile = await loadCurrentUserProfile();
      if (isActive && remoteProfile) saveStoredProfile(remoteProfile);
    });

    return () => {
      isActive = false;
    };
  }, []);

  function updateProfile(nextProfile: StoredProfile) {
    saveStoredProfile(nextProfile);
    void import("@/lib/supabase/user-sync").then(({ upsertCurrentUserProfile }) => {
      void upsertCurrentUserProfile(nextProfile);
    });
  }

  return { profile, updateProfile };
}

export function listFromInput(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
