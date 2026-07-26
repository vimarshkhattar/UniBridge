"use client";

import { UsersRound } from "lucide-react";
import { useEventActivity } from "@/lib/event-activity-store";
import { useStoredProfile } from "@/lib/profile-store";
import { students } from "@/lib/sample-data";

export function EventBuddySeekers({ eventId }: { eventId: string }) {
  const { activity } = useEventActivity();
  const { profile } = useStoredProfile();
  const userNeedsBuddy = activity.buddyIds.includes(eventId);
  const seekers = students.slice(2, 7);

  return (
    <div>
      <h2 className="font-bold text-navy">Students seeking a buddy</h2>
      {userNeedsBuddy && (
        <div className="mt-3 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          <p className="font-semibold">Other students would now see you here.</p>
          <p className="mt-1">Your buddy request is visible for this event in the list below.</p>
        </div>
      )}
      <div className="mt-3 grid gap-2 md:grid-cols-3">
        {userNeedsBuddy && (
          <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm">
            <div className="flex items-center gap-2">
              <UsersRound className="size-4 text-primary" aria-hidden />
              <p className="font-semibold text-navy">{profile.fullName} (You)</p>
            </div>
            <p className="mt-1 text-green-800">{profile.major}</p>
            <p className="mt-2 text-xs font-medium text-green-800">Looking for someone to attend with</p>
          </div>
        )}
        {seekers.map((student) => (
          <div key={student.id} className="rounded-md border border-border p-3 text-sm">
            <p className="font-semibold text-navy">{student.fullName}</p>
            <p className="text-muted-foreground">{student.major}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
