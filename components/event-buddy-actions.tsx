"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Plus, Send, Trash2, UserMinus, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { groupsForEvent, useBuddyState } from "@/lib/event-buddy-store";
import type { GroupMessage } from "@/lib/supabase/user-sync";
import { cn } from "@/lib/utils";

export function EventBuddyActions({ eventId, eventName }: { eventId: string; eventName: string }) {
  const { state, updateState } = useBuddyState(eventId);
  const hasGroup = state.created || state.joined;
  const groups = groupsForEvent(state);
  const joinedGroup = groups.find((group) => group.id === state.joinedGroupId);
  const createdGroup = state.groups.find((group) => group.createdByCurrentUser);
  const conversationGroup = joinedGroup ?? createdGroup;
  const conversationGroupId = conversationGroup?.id;

  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [messageError, setMessageError] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Group chat lives in Supabase so every member sees it and the insert trigger
  // raises a bell notification for everyone except the sender.
  useEffect(() => {
    if (!conversationGroupId) return;

    let isActive = true;
    let cleanup: (() => void) | undefined;

    void import("@/lib/supabase/user-sync").then(async ({ loadRemoteGroupMessages, subscribeToRemoteGroupMessages }) => {
      const loaded = await loadRemoteGroupMessages(conversationGroupId);
      if (isActive) setMessages(loaded);

      const unsubscribe = await subscribeToRemoteGroupMessages(conversationGroupId, (message) => {
        setMessages((current) =>
          current.some((existing) => existing.id === message.id) ? current : [...current, message]
        );
      });

      if (isActive) cleanup = unsubscribe;
      else unsubscribe();
    });

    return () => {
      isActive = false;
      cleanup?.();
    };
  }, [conversationGroupId]);

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

  async function sendGroupMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = draft.trim();
    if (!conversationGroupId || !message) return;

    setMessageError("");
    setIsSending(true);
    const { sendRemoteGroupMessage } = await import("@/lib/supabase/user-sync");
    const saved = await sendRemoteGroupMessage(conversationGroupId, message);
    setIsSending(false);

    if (!saved) {
      setMessageError("Message could not be sent. Run supabase/group-messages.sql, then try again.");
      return;
    }

    setMessages((current) => (current.some((existing) => existing.id === saved.id) ? current : [...current, saved]));
    setDraft("");
  }

  return (
    <div className="grid gap-4">
      {hasGroup && (
        <div className="rounded-[var(--radius-lg)] border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
            <div>
              <p className="font-bold">
                {state.created ? "Buddy group created" : "Joined a small buddy group"}
              </p>
              <p className="mt-1">
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

      {conversationGroup && (
        <div className="rounded-[var(--radius-lg)] border border-border bg-card p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-bold text-navy">{conversationGroup.title} conversation</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Everyone in this group sees these messages, and they get a bell notification when you post.
              </p>
            </div>
            <span className="rounded-full bg-[var(--red-soft)] px-3 py-1 text-xs font-bold text-[#ffc9cd]">
              {conversationGroup.members.length}/{conversationGroup.maxMembers} members
            </span>
          </div>

          <div className="mt-4 grid max-h-80 gap-2 overflow-y-auto rounded-xl bg-white/[0.03] p-3 text-sm">
            <p className="rounded-xl border border-border bg-white/[0.03] p-3 text-muted-foreground">
              Suggested starter: Hi everyone, I joined this group for {eventName}. Where should we meet before the event?
            </p>
            {messages.length === 0 && (
              <p className="rounded-xl border border-border bg-white/[0.03] p-3 text-muted-foreground">
                No messages yet. Send the first one when you are ready.
              </p>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2",
                  message.isOwn
                    ? "ml-auto rounded-br-md bg-[var(--red)] text-white"
                    : "mr-auto rounded-bl-md border border-border bg-white/[0.05] text-foreground"
                )}
              >
                <p className={cn("text-xs font-semibold", message.isOwn ? "text-white/80" : "text-muted-foreground")}>
                  {message.senderName}
                </p>
                <p className="mt-1 whitespace-pre-line leading-6">{message.body}</p>
                <p className={cn("mt-1 text-right text-[11px]", message.isOwn ? "text-white/70" : "text-muted-foreground")}>
                  {new Date(message.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                </p>
              </div>
            ))}
          </div>

          <form onSubmit={sendGroupMessage} className="mt-4 grid gap-3">
            {messageError && (
              <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-900">{messageError}</p>
            )}
            <label className="grid gap-2 text-sm font-medium text-navy">
              Message the group
              <Textarea
                name="groupMessage"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Example: Hi everyone, I can meet near the entrance 10 minutes before it starts."
              />
            </label>
            <div>
              <Button type="submit" disabled={isSending || !draft.trim()}>
                <Send className="size-4" aria-hidden />
                {isSending ? "Sending..." : "Send to group"}
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
