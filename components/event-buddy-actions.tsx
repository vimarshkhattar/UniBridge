"use client";

import Link from "next/link";
import { CheckCircle2, Plus, Trash2, UserMinus, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { groupsForEvent, useBuddyState } from "@/lib/event-buddy-store";

export function EventBuddyActions({ eventId, eventName }: { eventId: string; eventName: string }) {
  const { state, updateState } = useBuddyState(eventId);
  const hasGroup = state.created || state.joined;
  const groups = groupsForEvent(eventId, state);
  const joinedGroup = groups.find((group) => group.id === state.joinedGroupId);
  const createdGroup = state.groups.find((group) => group.createdByCurrentUser);

  function leaveGroup() {
    if (state.joinedGroupId) {
      void import("@/lib/supabase/user-sync").then(({ leaveRemoteBuddyGroup }) => {
        void leaveRemoteBuddyGroup(state.joinedGroupId!);
      });
    }

    updateState({
      ...state,
      joined: false,
      joinedGroupId: undefined,
      joinNote: undefined,
      groups: state.groups.map((group) => ({ ...group, members: group.members.filter((member) => member !== "You") }))
    });
  }

  function deleteGroup() {
    const nextGroups = state.groups.filter((group) => !group.createdByCurrentUser);

    if (createdGroup?.id) {
      void import("@/lib/supabase/user-sync").then(({ deleteRemoteBuddyGroup }) => {
        void deleteRemoteBuddyGroup(createdGroup.id);
      });
    }

    updateState({
      ...state,
      created: false,
      joined: state.joinedGroupId === createdGroup?.id ? false : state.joined,
      joinedGroupId: state.joinedGroupId === createdGroup?.id ? undefined : state.joinedGroupId,
      joinNote: state.joinedGroupId === createdGroup?.id ? undefined : state.joinNote,
      group: undefined,
      groups: nextGroups
    });
  }

  return (
    <div className="grid gap-4">
      {hasGroup && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-950">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
            <div>
              <p className="font-bold">
                {state.created ? "Buddy group created" : "Joined a small buddy group"}
              </p>
              <p className="mt-1 text-red-900">
                {state.created
                  ? `Your group for ${eventName} is open for up to ${state.group?.maxMembers ?? 4} students.`
                  : `You joined ${joinedGroup?.title ?? "a small group"} for ${eventName}.`}
              </p>
              {(joinedGroup ?? state.group) && (
                <div className="mt-2 grid gap-1">
                  <p><span className="font-semibold">Group:</span> {(joinedGroup ?? state.group)!.title}</p>
                  <p><span className="font-semibold">Basis:</span> {(joinedGroup ?? state.group)!.basis}</p>
                  <p><span className="font-semibold">Description:</span> {(joinedGroup ?? state.group)!.description}</p>
                  <p><span className="font-semibold">Meeting preference:</span> {(joinedGroup ?? state.group)!.meetingPreference}</p>
                  <p><span className="font-semibold">Members:</span> {(joinedGroup ?? state.group)!.members.join(", ")}</p>
                </div>
              )}
              {state.joinNote && <p className="mt-2"><span className="font-semibold">Your join preference:</span> {state.joinNote}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                {state.joined && (
                  <Button type="button" variant="secondary" onClick={leaveGroup}>
                    <UserMinus className="size-4" aria-hidden />
                    Leave group
                  </Button>
                )}
                {state.created && (
                  <Button type="button" variant="danger" onClick={deleteGroup}>
                    <Trash2 className="size-4" aria-hidden />
                    Delete my group
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Link href={`/events/${eventId}/buddy/create`}>
          <Button type="button" disabled={state.created}>
            <Plus className="size-4" aria-hidden />
            {state.created ? "Group created" : "Create buddy group"}
          </Button>
        </Link>
        <Link href={`/events/${eventId}/buddy/join`}>
          <Button type="button" variant="secondary" disabled={state.joined}>
            <UsersRound className="size-4" aria-hidden />
            {state.joined ? "Joined group" : "Join small group"}
          </Button>
        </Link>
      </div>
    </div>
  );
}
