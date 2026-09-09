"use client";

import { UsersRound } from "lucide-react";
import { useEventActivity } from "@/lib/event-activity-store";
import { useStoredProfile } from "@/lib/profile-store";

export function EventBuddySeekers({ eventId }: { eventId: string }) {
  const { activity } = useEventActivity();
  const { profile } = useStoredProfile();
  const userNeedsBuddy = activity.buddyIds.includes(eventId);

  return (
    <div className="depth-scene">
      <h2 className="font-bold text-navy">Students seeking a buddy</h2>
      {userNeedsBuddy ? (
        <>
          <div className="mt-3 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            <p className="font-semibold">Your buddy request is active for this event.</p>
            <p className="mt-1">Other students who open this event will see you in the list below.</p>
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-3">
            <div className="tilt-card rounded-md border border-green-200 bg-green-50 p-3 text-sm">
              <div className="flex items-center gap-2">
                <UsersRound className="size-4 text-primary" aria-hidden />
                <p className="font-semibold text-navy">{profile.fullName || "You"} (You)</p>
              </div>
              {profile.major && <p className="mt-1 text-green-800">{profile.major}</p>}
              <p className="mt-2 text-xs font-medium text-green-800">Looking for someone to attend with</p>
            </div>
          </div>
        </>
      ) : (
        <p className="mt-3 rounded-md border border-border bg-muted p-4 text-sm text-muted-foreground">
          No students have asked for a buddy at this event yet. Request a buddy below and you will be the first one listed
          here for other students to find.
        </p>
      )}
    </div>
  );
}
