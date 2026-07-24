"use client";

import { useMemo, useState } from "react";
import { BookmarkX, MessageSquare, Send, Trash2, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { useConnectionsState } from "@/lib/connections-store";
import { useDiscoverActions } from "@/lib/discover-actions-store";
import { students } from "@/lib/sample-data";

export default function ConnectionsPage() {
  const { state, acceptRequest, declineRequest, addMessage, removeConnection } = useConnectionsState();
  const { actions, cancelRequest, removeSavedProfile } = useDiscoverActions();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [removedName, setRemovedName] = useState("");

  const accepted = useMemo(
    () => state.acceptedIds.map((id) => students.find((student) => student.id === id)).filter(Boolean),
    [state.acceptedIds]
  );
  const pending = useMemo(
    () => state.pendingIds.map((id) => students.find((student) => student.id === id)).filter(Boolean),
    [state.pendingIds]
  );
  const outgoing = useMemo(
    () => actions.requestedIds
      .filter((id) => !state.acceptedIds.includes(id))
      .map((id) => students.find((student) => student.id === id))
      .filter(Boolean),
    [actions.requestedIds, state.acceptedIds]
  );
  const savedProfiles = useMemo(
    () => actions.savedIds
      .map((id) => students.find((student) => student.id === id))
      .filter(Boolean),
    [actions.savedIds]
  );
  const declinedNames = useMemo(
    () => state.declinedIds.map((id) => students.find((student) => student.id === id)?.fullName).filter(Boolean),
    [state.declinedIds]
  );
  const activeConversation = students.find((student) => student.id === activeConversationId);

  function handleAcceptRequest(studentId: string) {
    acceptRequest(studentId);
    setActiveConversationId(studentId);
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

  function sendMessage(formData: FormData) {
    if (!activeConversationId) return;
    const message = String(formData.get("message") ?? "").trim();
    if (!message) return;

    addMessage(activeConversationId, message);
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold text-navy">Connections</h1>
        <p className="mt-2 text-muted-foreground">Manage accepted connections, pending requests, saved profiles, and low-pressure conversation starters.</p>
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
            {accepted.length === 0 && <p className="rounded-md bg-muted p-4 text-sm text-muted-foreground">No accepted connections yet. Accept a request to start a conversation.</p>}
            {accepted.map((student) => (
              <div key={student!.id} className="grid gap-3 rounded-md border border-border p-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
                <div className="min-w-0">
                  <p className="font-semibold text-navy">{student!.fullName}</p>
                  <p className="text-sm text-muted-foreground">{student!.connectionTypes.slice(0, 2).join(", ")}</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_9.5rem] xl:w-[25rem]">
                  <Button variant="secondary" className="w-full whitespace-nowrap" onClick={() => setActiveConversationId(student!.id)}>
                    <MessageSquare className="size-4" /> Start Conversation
                  </Button>
                  <Button variant="danger" className="w-full whitespace-nowrap" onClick={() => handleRemoveConnection(student!.id, student!.fullName)}>
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
              <div key={student!.id} className="rounded-md border border-border p-3">
                <p className="font-semibold text-navy">{student!.fullName}</p>
                <p className="text-sm text-muted-foreground">{student!.bio}</p>
                <div className="mt-3 flex gap-2">
                  <Button onClick={() => handleAcceptRequest(student!.id)}><UserCheck className="size-4" /> Accept</Button>
                  <Button variant="secondary" onClick={() => handleDeclineRequest(student!.id)}><UserX className="size-4" /> Decline</Button>
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
            <div key={student!.id} className="grid gap-3 rounded-md border border-border p-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
              <div className="min-w-0">
                <p className="font-semibold text-navy">{student!.fullName}</p>
                <p className="text-sm text-muted-foreground">Waiting for them to accept your request.</p>
              </div>
              <Button variant="secondary" onClick={() => cancelRequest(student!.id)}>Cancel request</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Saved profiles</CardTitle></CardHeader>
        <CardContent className="grid gap-3">
          {savedProfiles.length === 0 && <p className="rounded-md bg-muted p-4 text-sm text-muted-foreground">No saved profiles yet. Save someone from Discover to revisit their profile here.</p>}
          {savedProfiles.map((student) => (
            <div key={student!.id} className="grid gap-3 rounded-md border border-border p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
              <div className="min-w-0">
                <p className="font-semibold text-navy">{student!.fullName}</p>
                <p className="mt-1 text-sm text-muted-foreground">{student!.university} · {student!.major} · {student!.academicYear}</p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{student!.bio}</p>
                <div className="mt-3 grid gap-1 text-sm">
                  <p><span className="font-semibold text-navy">Courses:</span> {student!.courses.join(", ")}</p>
                  <p><span className="font-semibold text-navy">Interests:</span> {student!.interests.join(", ")}</p>
                  <p><span className="font-semibold text-navy">Looking for:</span> {student!.connectionTypes.join(", ")}</p>
                </div>
              </div>
              <Button variant="secondary" onClick={() => removeSavedProfile(student!.id)}>
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
            <p className="text-sm text-muted-foreground">This is a demo conversation area. A production version would save messages in Supabase.</p>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2 rounded-md bg-muted p-4 text-sm">
              <p className="font-semibold text-navy">Suggested opener</p>
              <p className="text-muted-foreground">Hi {activeConversation.fullName.split(" ")[0]}, nice to connect on UniBridge. Would you like to plan a study session or attend a campus event together?</p>
              {(state.sentMessages[activeConversation.id] ?? []).map((message, index) => (
                <p key={`${message}-${index}`} className="rounded-md border border-border bg-white p-3 text-foreground">You: {message}</p>
              ))}
            </div>
            <form action={sendMessage} className="grid gap-3">
              <label className="grid gap-2 text-sm font-medium text-navy">
                Message
                <Textarea name="message" placeholder="Write a short, friendly message..." />
              </label>
              <div className="flex gap-2">
                <Button type="submit"><Send className="size-4" /> Send message</Button>
                <Button type="button" variant="secondary" onClick={() => setActiveConversationId(null)}>Close</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
