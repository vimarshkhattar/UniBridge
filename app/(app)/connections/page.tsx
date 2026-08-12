"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { BookmarkX, MessageSquare, Send, Trash2, UserCheck, UserX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { useConnectionsState } from "@/lib/connections-store";
import { useDiscoverActions } from "@/lib/discover-actions-store";
import { students } from "@/lib/sample-data";
import type { ConnectionMessage } from "@/lib/supabase/user-sync";
import type { StudentProfile } from "@/lib/types";
import { cn, initials } from "@/lib/utils";

function isProfile(profile: StudentProfile | undefined): profile is StudentProfile {
  return Boolean(profile);
}

function ProfileAvatar({ profile, size = "md" }: { profile: StudentProfile; size?: "sm" | "md" }) {
  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden rounded-full font-bold text-white",
        size === "sm" ? "size-10 text-xs" : "size-12 text-sm",
        !profile.avatarUrl && profile.avatarColor
      )}
      style={profile.avatarUrl ? { backgroundImage: `url(${profile.avatarUrl})`, backgroundPosition: "center", backgroundSize: "cover" } : undefined}
      aria-hidden
    >
      {!profile.avatarUrl && initials(profile.fullName)}
    </div>
  );
}

export default function ConnectionsPage() {
  const { state, acceptRequest, declineRequest, removeConnection } = useConnectionsState();
  const { actions, cancelRequest, removeSavedProfile } = useDiscoverActions();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [remoteProfiles, setRemoteProfiles] = useState<StudentProfile[]>([]);
  const [removedName, setRemovedName] = useState("");
  const [messages, setMessages] = useState<ConnectionMessage[]>([]);
  const [messageDraft, setMessageDraft] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messageError, setMessageError] = useState("");

  useEffect(() => {
    let isActive = true;

    void import("@/lib/supabase/user-sync").then(async ({ loadRemoteDiscoverProfiles }) => {
      const profiles = await loadRemoteDiscoverProfiles();
      if (isActive) setRemoteProfiles(profiles);
    });

    return () => {
      isActive = false;
    };
  }, []);

  const profileById = useMemo(() => {
    const profiles = new Map<string, StudentProfile>();
    students.forEach((student) => profiles.set(student.id, student));
    remoteProfiles.forEach((profile) => profiles.set(profile.id, profile));
    return profiles;
  }, [remoteProfiles]);

  const accepted = useMemo(
    () => state.acceptedIds.map((id) => profileById.get(id)).filter(isProfile),
    [profileById, state.acceptedIds]
  );
  const pending = useMemo(
    () => state.pendingIds.map((id) => profileById.get(id)).filter(isProfile),
    [profileById, state.pendingIds]
  );
  const outgoing = useMemo(
    () => actions.requestedIds
      .filter((id) => !state.acceptedIds.includes(id))
      .map((id) => profileById.get(id))
      .filter(isProfile),
    [actions.requestedIds, profileById, state.acceptedIds]
  );
  const savedProfiles = useMemo(
    () => actions.savedIds
      .map((id) => profileById.get(id))
      .filter(isProfile),
    [actions.savedIds, profileById]
  );
  const declinedNames = useMemo(
    () => state.declinedIds.map((id) => profileById.get(id)?.fullName).filter(Boolean),
    [profileById, state.declinedIds]
  );
  const activeConversation = activeConversationId ? profileById.get(activeConversationId) : undefined;

  async function openConversation(studentId: string) {
    setActiveConversationId(studentId);
    setMessages([]);
    setIsLoadingMessages(true);
    setMessageError("");

    const { loadRemoteConnectionMessages } = await import("@/lib/supabase/user-sync");
    const remoteMessages = await loadRemoteConnectionMessages(studentId);
    setMessages(remoteMessages);
    setIsLoadingMessages(false);
  }

  useEffect(() => {
    if (!activeConversationId) return;

    let cleanup: (() => void) | undefined;
    let isActive = true;

    void import("@/lib/supabase/user-sync").then(async ({ subscribeToRemoteConnectionMessages }) => {
      const unsubscribe = await subscribeToRemoteConnectionMessages(activeConversationId, (message) => {
        setMessages((currentMessages) => {
          if (currentMessages.some((currentMessage) => currentMessage.id === message.id)) return currentMessages;
          return [...currentMessages, message];
        });
      });

      if (isActive) {
        cleanup = unsubscribe;
      } else {
        unsubscribe();
      }
    });

    return () => {
      isActive = false;
      cleanup?.();
    };
  }, [activeConversationId]);

  async function handleAcceptRequest(studentId: string) {
    await acceptRequest(studentId);
    await openConversation(studentId);
  }

  function handleDeclineRequest(studentId: string) {
    declineRequest(studentId);
    if (activeConversationId === studentId) setActiveConversationId(null);
  }

  function handleRemoveConnection(studentId: string, studentName: string) {
    removeConnection(studentId);
    setRemovedName(studentName);
    if (activeConversationId === studentId) setActiveConversationId(null);
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeConversationId) return;
    const message = messageDraft.trim();
    if (!message) return;

    setMessageError("");
    const { sendRemoteConnectionMessage } = await import("@/lib/supabase/user-sync");
    const savedMessage = await sendRemoteConnectionMessage(activeConversationId, message);

    if (!savedMessage) {
      setMessageError("Message could not be sent. Make sure this connection is accepted and Supabase is configured.");
      return;
    }

    setMessages((currentMessages) => {
      if (currentMessages.some((currentMessage) => currentMessage.id === savedMessage.id)) return currentMessages;
      return [...currentMessages, savedMessage];
    });
    setMessageDraft("");
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold text-navy">Connections</h1>
        <p className="mt-2 text-muted-foreground">Manage accepted connections, pending requests, saved profiles, and conversations with people who accepted.</p>
      </div>

      {declinedNames.length > 0 && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-900">
          Declined: {declinedNames.join(", ")}
        </div>
      )}
      {removedName && (
        <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-800">
          Removed connection with {removedName}.
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Accepted connections</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            {accepted.length === 0 && <p className="rounded-md bg-muted p-4 text-sm text-muted-foreground">No accepted connections yet. Once someone accepts, they will appear here and you can start a conversation.</p>}
            {accepted.map((student) => (
              <div key={student.id} className="grid gap-3 rounded-md border border-border p-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
                <div className="min-w-0">
                  <p className="font-semibold text-navy">{student.fullName}</p>
                  <p className="text-sm text-muted-foreground">{student.connectionTypes.slice(0, 2).join(", ")}</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_9.5rem] xl:w-[25rem]">
                  <Button variant="secondary" className="w-full whitespace-nowrap" onClick={() => void openConversation(student.id)}>
                    <MessageSquare className="size-4" /> Start Conversation
                  </Button>
                  <Button variant="danger" className="w-full whitespace-nowrap" onClick={() => handleRemoveConnection(student.id, student.fullName)}>
                    <Trash2 className="size-4" /> Remove
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Pending requests</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            {pending.length === 0 && <p className="rounded-md bg-muted p-4 text-sm text-muted-foreground">No pending requests right now.</p>}
            {pending.map((student) => (
              <div key={student.id} className="rounded-md border border-border p-3">
                <p className="font-semibold text-navy">{student.fullName}</p>
                <p className="text-sm text-muted-foreground">{student.bio}</p>
                <div className="mt-3 flex gap-2">
                  <Button onClick={() => handleAcceptRequest(student.id)}><UserCheck className="size-4" /> Accept</Button>
                  <Button variant="secondary" onClick={() => handleDeclineRequest(student.id)}><UserX className="size-4" /> Decline</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {accepted.length > 0 && (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-border bg-white px-4 py-3">
            <div>
              <CardTitle>Messaging</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Talk with students after both people are connected.</p>
            </div>
            {activeConversation && (
              <Button
                type="button"
                variant="ghost"
                className="size-9 px-0"
                aria-label="Close conversation"
                onClick={() => {
                  setActiveConversationId(null);
                  setMessages([]);
                  setMessageDraft("");
                  setMessageError("");
                }}
              >
                <X className="size-4" aria-hidden />
              </Button>
            )}
          </div>
          <CardContent className="p-0">
            <div className="grid min-h-[34rem] lg:grid-cols-[19rem_minmax(0,1fr)]">
              <aside className="border-b border-border bg-white lg:border-b-0 lg:border-r">
                <div className="border-b border-border p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Conversations</p>
                </div>
                <div className="max-h-72 overflow-y-auto lg:max-h-[32rem]">
                  {accepted.map((student) => (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => void openConversation(student.id)}
                      className={cn(
                        "flex w-full items-center gap-3 border-b border-border px-3 py-3 text-left transition",
                        activeConversationId === student.id ? "bg-red-50" : "bg-white hover:bg-muted"
                      )}
                    >
                      <ProfileAvatar profile={student} size="sm" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-navy">{student.fullName}</span>
                        <span className="block truncate text-xs text-muted-foreground">{student.connectionTypes.slice(0, 2).join(", ")}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </aside>

              <section className="flex min-h-[34rem] flex-col bg-white">
                {activeConversation ? (
                  <>
                    <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                      <ProfileAvatar profile={activeConversation} />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-navy">{activeConversation.fullName}</p>
                        <p className="truncate text-sm text-muted-foreground">
                          {activeConversation.major} · {activeConversation.university}
                        </p>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto bg-[#f3f2ef] p-4">
                      <div className="mx-auto grid max-w-3xl gap-3">
                        <div className="rounded-md border border-border bg-white p-3 text-sm text-muted-foreground">
                          <p className="font-semibold text-navy">Suggested opener</p>
                          <p className="mt-1">
                            Hi {activeConversation.fullName.split(" ")[0]}, nice to connect on UniBridge. Would you like to plan a study session or attend a campus event together?
                          </p>
                        </div>
                        {isLoadingMessages && (
                          <p className="rounded-md border border-border bg-white p-3 text-sm text-muted-foreground">Loading messages...</p>
                        )}
                        {!isLoadingMessages && messages.length === 0 && (
                          <p className="rounded-md border border-border bg-white p-3 text-sm text-muted-foreground">No messages yet. Send the first message when you are ready.</p>
                        )}
                        {messages.map((message) => {
                          const sentTime = new Date(message.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

                          return (
                            <div
                              key={message.id}
                              className={cn(
                                "max-w-[82%] rounded-2xl px-4 py-2 text-sm shadow-sm",
                                message.isOwn ? "ml-auto rounded-br-md bg-primary text-white" : "mr-auto rounded-bl-md border border-border bg-white text-foreground"
                              )}
                            >
                              <p className={cn("text-xs font-semibold", message.isOwn ? "text-white/80" : "text-muted-foreground")}>{message.senderName}</p>
                              <p className="mt-1 whitespace-pre-line leading-6">{message.body}</p>
                              <p className={cn("mt-1 text-right text-[11px]", message.isOwn ? "text-white/75" : "text-muted-foreground")}>{sentTime}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <form onSubmit={sendMessage} className="border-t border-border bg-white p-3">
                      {messageError && (
                        <p className="mb-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-900">{messageError}</p>
                      )}
                      <label className="sr-only" htmlFor="connection-message">Message</label>
                      <Textarea
                        id="connection-message"
                        value={messageDraft}
                        onChange={(event) => setMessageDraft(event.target.value)}
                        placeholder="Write a short, friendly message..."
                        className="min-h-24 resize-none"
                      />
                      <div className="mt-3 flex justify-end">
                        <Button type="submit"><Send className="size-4" /> Send message</Button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="grid flex-1 place-items-center p-6 text-center">
                    <div className="max-w-sm">
                      <span className="mx-auto grid size-12 place-items-center rounded-full bg-red-50 text-primary">
                        <MessageSquare className="size-6" aria-hidden />
                      </span>
                      <p className="mt-4 font-semibold text-navy">Select a connection to start messaging</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Choose someone from the conversation list. Your messages are saved in Supabase and visible to both connected students.
                      </p>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Requests you sent</CardTitle></CardHeader>
        <CardContent className="grid gap-3">
          {outgoing.length === 0 && <p className="rounded-md bg-muted p-4 text-sm text-muted-foreground">No outgoing requests right now. Send a request from Discover to track it here.</p>}
          {outgoing.map((student) => (
            <div key={student.id} className="grid gap-3 rounded-md border border-border p-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
              <div className="min-w-0">
                <p className="font-semibold text-navy">{student.fullName}</p>
                <p className="text-sm text-muted-foreground">Waiting for them to accept your request.</p>
              </div>
              <Button variant="secondary" onClick={() => cancelRequest(student.id)}>Cancel request</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Saved profiles</CardTitle></CardHeader>
        <CardContent className="grid gap-3">
          {savedProfiles.length === 0 && <p className="rounded-md bg-muted p-4 text-sm text-muted-foreground">No saved profiles yet. Save someone from Discover to revisit their profile here.</p>}
          {savedProfiles.map((student) => (
            <div key={student.id} className="grid gap-3 rounded-md border border-border p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
              <div className="min-w-0">
                <p className="font-semibold text-navy">{student.fullName}</p>
                <p className="mt-1 text-sm text-muted-foreground">{student.university} · {student.major} · {student.academicYear}</p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{student.bio}</p>
                <div className="mt-3 grid gap-1 text-sm">
                  <p><span className="font-semibold text-navy">Courses:</span> {student.courses.join(", ")}</p>
                  <p><span className="font-semibold text-navy">Interests:</span> {student.interests.join(", ")}</p>
                  <p><span className="font-semibold text-navy">Looking for:</span> {student.connectionTypes.join(", ")}</p>
                </div>
              </div>
              <Button variant="secondary" onClick={() => removeSavedProfile(student.id)}>
                <BookmarkX className="size-4" /> Unsave
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

    </div>
  );
}
