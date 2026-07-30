"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { BookmarkX, MessageSquare, Send, Trash2, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { useConnectionsState } from "@/lib/connections-store";
import { useDiscoverActions } from "@/lib/discover-actions-store";
import { students } from "@/lib/sample-data";
import type { ConnectionMessage } from "@/lib/supabase/user-sync";
import type { StudentProfile } from "@/lib/types";

function isProfile(profile: StudentProfile | undefined): profile is StudentProfile {
  return Boolean(profile);
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

    setMessages((currentMessages) => [...currentMessages, savedMessage]);
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

      {activeConversation && (
        <Card>
          <CardHeader>
            <CardTitle>Conversation with {activeConversation.fullName}</CardTitle>
            <p className="text-sm text-muted-foreground">Messages here are saved in Supabase and visible to both accepted students.</p>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2 rounded-md bg-muted p-4 text-sm">
              <p className="font-semibold text-navy">Suggested opener</p>
              <p className="text-muted-foreground">Hi {activeConversation.fullName.split(" ")[0]}, nice to connect on UniBridge. Would you like to plan a study session or attend a campus event together?</p>
              {isLoadingMessages && <p className="rounded-md border border-border bg-white p-3 text-muted-foreground">Loading messages...</p>}
              {!isLoadingMessages && messages.length === 0 && (
                <p className="rounded-md border border-border bg-white p-3 text-muted-foreground">No messages yet. Send the first message when you are ready.</p>
              )}
              {messages.map((message) => (
                <p key={message.id} className="rounded-md border border-border bg-white p-3 text-foreground">
                  <span className="font-semibold text-navy">{message.senderName}:</span> {message.body}
                </p>
              ))}
            </div>
            {messageError && (
              <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-900">{messageError}</p>
            )}
            <form onSubmit={sendMessage} className="grid gap-3">
              <label className="grid gap-2 text-sm font-medium text-navy">
                Message
                <Textarea value={messageDraft} onChange={(event) => setMessageDraft(event.target.value)} placeholder="Write a short, friendly message..." />
              </label>
              <div className="flex gap-2">
                <Button type="submit"><Send className="size-4" /> Send message</Button>
                <Button type="button" variant="secondary" onClick={() => {
                  setActiveConversationId(null);
                  setMessages([]);
                  setMessageDraft("");
                  setMessageError("");
                }}>Close</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
