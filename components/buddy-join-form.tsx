"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, Textarea } from "@/components/ui/input";
import { groupsForEvent, saveBuddyState, useBuddyState } from "@/lib/event-buddy-store";

export function BuddyJoinForm({ eventId, eventName }: { eventId: string; eventName: string }) {
  const router = useRouter();
  const { state } = useBuddyState(eventId);
  const groups = groupsForEvent(eventId, state);

  async function handleJoin(formData: FormData) {
    const preference = String(formData.get("preference") || "Friendly low-pressure group");
    const note = String(formData.get("note") || "");
    const selectedGroupId = String(formData.get("groupId") || groups[0]?.id || "");
    const selectedGroup = groups.find((group) => group.id === selectedGroupId);
    const updatedGroups = state.groups.map((group) => (
      group.id === selectedGroupId && !group.members.includes("You")
        ? { ...group, members: [...group.members, "You"] }
        : group
    ));
    const { joinRemoteBuddyGroup } = await import("@/lib/supabase/user-sync");
    await joinRemoteBuddyGroup(selectedGroupId);

    saveBuddyState(eventId, {
      ...state,
      joined: true,
      groups: updatedGroups,
      joinedGroupId: selectedGroupId,
      joinNote: `${selectedGroup?.title ?? preference}${note ? `: ${note}` : ""}`
    });

    router.push(`/events/${eventId}`);
  }

  return (
    <form action={handleJoin} className="grid gap-4">
      <div className="grid gap-3">
        <p className="text-sm font-semibold text-navy">Choose a group to join</p>
        {groups.map((group, index) => {
          const isFull = group.members.length >= group.maxMembers;

          return (
            <label key={group.id} className="grid cursor-pointer gap-3 rounded-md border border-border bg-white p-4 text-sm has-[:checked]:border-primary has-[:checked]:bg-red-50">
              <div className="flex items-start gap-3">
                <input name="groupId" type="radio" value={group.id} defaultChecked={index === 0 && !isFull} disabled={isFull} required className="mt-1" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-navy">{group.title}</p>
                    {group.createdByCurrentUser && <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-primary">Created by you</span>}
                    {state.joinedGroupId === group.id && <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-800"><CheckCircle2 className="size-3" /> Joined</span>}
                  </div>
                  <p className="mt-1 text-muted-foreground">{group.description}</p>
                  <div className="mt-2 grid gap-1 text-muted-foreground">
                    <p><span className="font-semibold text-navy">Basis:</span> {group.basis}</p>
                    <p><span className="font-semibold text-navy">Members:</span> {group.members.join(", ")} ({group.members.length}/{group.maxMembers})</p>
                    <p><span className="font-semibold text-navy">Meeting:</span> {group.meetingPreference}</p>
                    {group.note && <p><span className="font-semibold text-navy">Note:</span> {group.note}</p>}
                    {isFull && <p className="font-semibold text-primary">This group is full.</p>}
                  </div>
                </div>
              </div>
            </label>
          );
        })}
      </div>
      {state.joined && (
        <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          You already joined a group. Choosing another group here will move your membership to the selected group.
        </div>
      )}
      <label className="grid gap-2 text-sm font-medium text-navy">
        What kind of group do you want to join?
        <Select name="preference" defaultValue="Friendly low-pressure group">
          <option>Friendly low-pressure group</option>
          <option>Same major or career interest</option>
          <option>Same country or language</option>
          <option>First-time event attendees</option>
          <option>Networking-focused group</option>
          <option>Quiet group</option>
        </Select>
      </label>
      <label className="grid gap-2 text-sm font-medium text-navy">
        Note to the group
        <Textarea name="note" placeholder="Example: I am attending this event for the first time and would like to meet near the entrance." />
      </label>
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-900">
        You are joining a buddy group for {eventName}. Group members will be able to see your name in the member list.
      </div>
      <div className="flex gap-2">
        <Button type="submit"><UsersRound className="size-4" /> Join group</Button>
        <Button type="button" variant="secondary" onClick={() => router.push(`/events/${eventId}`)}>Cancel</Button>
      </div>
    </form>
  );
}
