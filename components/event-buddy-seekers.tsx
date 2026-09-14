"use client";

import { useEffect, useState } from "react";
import { UsersRound } from "lucide-react";
import { useEventActivity } from "@/lib/event-activity-store";
import { useStoredProfile } from "@/lib/profile-store";
import type { BuddySeeker } from "@/lib/supabase/user-sync";

export function EventBuddySeekers({ eventId }: { eventId: string }) {
  const { activity } = useEventActivity();
  const { profile } = useStoredProfile();
  const [seekers, setSeekers] = useState<BuddySeeker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const userNeedsBuddy = activity.buddyIds.includes(eventId);

  // Reloads whenever this student's own buddy state flips, so their card shows
  // up straight away instead of only after a refresh.
  useEffect(() => {
    let isActive = true;

    void import("@/lib/supabase/user-sync").then(async ({ loadRemoteEventBuddySeekers }) => {
      const remoteSeekers = await loadRemoteEventBuddySeekers(eventId);
      if (isActive) {
        setSeekers(remoteSeekers);
        setIsLoading(false);
      }
    });

    return () => {
      isActive = false;
    };
  }, [eventId, userNeedsBuddy]);

  // The current student is rendered from local state even before the round trip
  // finishes, so pressing the button feels immediate.
  const others = seekers.filter((seeker) => !seeker.isCurrentUser);
  const showSelf = userNeedsBuddy;
  const hasAnyone = showSelf || others.length > 0;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-bold text-navy">Students seeking a buddy</h2>
        {others.length > 0 && (
          <span className="rounded-full bg-[var(--red-soft)] px-3 py-1 text-xs font-bold text-[#ffc9cd]">
            {others.length} {others.length === 1 ? "other student" : "other students"}
          </span>
        )}
      </div>

      {showSelf && (
        <div className="mt-3 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          <p className="font-semibold">Your buddy request is active for this event.</p>
          <p className="mt-1">Other students who open this event will see you in the list below.</p>
        </div>
      )}

      {isLoading && !hasAnyone && (
        <p className="mt-3 rounded-xl border border-border bg-white/[0.03] p-4 text-sm text-muted-foreground">
          Checking who else is looking for a buddy...
        </p>
      )}

      {!isLoading && !hasAnyone && (
        <p className="mt-3 rounded-xl border border-border bg-white/[0.03] p-4 text-sm text-muted-foreground">
          No students have asked for a buddy at this event yet. Request a buddy below and you will be the first one
          listed here for other students to find.
        </p>
      )}

      {hasAnyone && (
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          {showSelf && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm">
              <div className="flex items-center gap-2">
                <UsersRound className="size-4 text-[var(--red-bright)]" aria-hidden />
                <p className="font-semibold text-navy">{profile.fullName || "You"} (You)</p>
              </div>
              {profile.major && <p className="mt-1 text-green-800">{profile.major}</p>}
              <p className="mt-2 text-xs font-medium text-green-800">Looking for someone to attend with</p>
            </div>
          )}
          {others.map((seeker) => (
            <div key={seeker.id} className="rounded-xl border border-border bg-white/[0.03] p-3 text-sm">
              <div className="flex items-center gap-2">
                <UsersRound className="size-4 text-[var(--red-bright)]" aria-hidden />
                <p className="font-semibold text-navy">{seeker.fullName}</p>
              </div>
              {seeker.major && <p className="mt-1 text-muted-foreground">{seeker.major}</p>}
              <p className="mt-2 text-xs font-medium text-muted-foreground">
                {seeker.note || "Looking for someone to attend with"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
