"use client";

import Link from "next/link";
import { CheckCircle2, Plus, Send, Trash2, UserMinus, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
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
    const nextMessages = { ...state.groupMessages };

    if (createdGroup?.id) {
      void import("@/lib/supabase/user-sync").then(({ deleteRemoteBuddyGroup }) => {
        void deleteRemoteBuddyGroup(createdGroup.id);
      });
      delete nextMessages[createdGroup.id];
    }

    updateState({
      ...state,
      created: false,
      joined: state.joinedGroupId === createdGroup?.id ? false : state.joined,
      joinedGroupId: state.joinedGroupId === createdGroup?.id ? undefined : state.joinedGroupId,
      joinNote: state.joinedGroupId === createdGroup?.id ? undefined : state.joinNote,
      group: undefined,
      groups: nextGroups,
      groupMessages: nextMessages
    });
  }

  function sendGroupMessage(formData: FormData) {
    if (!state.joinedGroupId) return;

    const message = String(formData.get("groupMessage") ?? "").trim();
    if (!message) return;

    updateState({
      ...state,
      groupMessages: {
        ...state.groupMessages,
        [state.joinedGroupId]: [...(state.groupMessages[state.joinedGroupId] ?? []), message]
      }
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

      {state.joined && joinedGroup && (
        <div className="rounded-md border border-border bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-bold text-navy">{joinedGroup.title} conversation</p>
              <p className="mt-1 text-sm text-muted-foreground">Use this space to plan where to meet, introduce yourself, and keep the group comfortable.</p>
            </div>
            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-primary">
              {joinedGroup.members.length}/{joinedGroup.maxMembers} members
            </span>
          </div>
          <div className="mt-4 grid gap-2 rounded-md bg-muted p-3 text-sm">
            <p className="rounded-md border border-border bg-white p-3 text-muted-foreground">
              Suggested starter: Hi everyone, I joined this group for {eventName}. Where should we meet before the event?
            </p>
            {(state.groupMessages[joinedGroup.id] ?? []).map((message, index) => (
              <p key={`${message}-${index}`} className="rounded-md border border-red-100 bg-red-50 p-3 text-red-950">
                <span className="font-semibold">You:</span> {message}
              </p>
            ))}
          </div>
          <form action={sendGroupMessage} className="mt-4 grid gap-3">
            <label className="grid gap-2 text-sm font-medium text-navy">
              Message the group
              <Textarea name="groupMessage" placeholder="Example: Hi everyone, I can meet near the entrance 10 minutes before it starts." />
            </label>
            <div>
              <Button type="submit">
                <Send className="size-4" aria-hidden />
                Send to group
              </Button>
            </div>
          </form>
        </div>
      )}

      {!hasGroup && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href={`/events/${eventId}/buddy/create`}>
            <Button type="button">
              <Plus className="size-4" aria-hidden />
              Create buddy group
            </Button>
          </Link>
          <Link href={`/events/${eventId}/buddy/join`}>
            <Button type="button" variant="secondary">
              <UsersRound className="size-4" aria-hidden />
              Join small group
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
