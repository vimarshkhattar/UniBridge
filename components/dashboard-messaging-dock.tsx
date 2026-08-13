"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, MoreHorizontal, Search, Send, SlidersHorizontal, SquarePen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { useConnectionsState } from "@/lib/connections-store";
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
        "relative grid shrink-0 place-items-center overflow-hidden rounded-full font-bold text-white",
        size === "sm" ? "size-10 text-xs" : "size-11 text-sm",
        !profile.avatarUrl && profile.avatarColor
      )}
      style={profile.avatarUrl ? { backgroundImage: `url(${profile.avatarUrl})`, backgroundPosition: "center", backgroundSize: "cover" } : undefined}
      aria-hidden
    >
      {!profile.avatarUrl && initials(profile.fullName)}
      <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-white bg-green-600" />
    </div>
  );
}

function formatMessageTime(value?: string) {
  if (!value) return "";

  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

export function DashboardMessagingDock() {
  const { state } = useConnectionsState();
  const [expanded, setExpanded] = useState(false);
  const [conversationTab, setConversationTab] = useState<"focused" | "other">("focused");
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [remoteProfiles, setRemoteProfiles] = useState<StudentProfile[]>([]);
  const [messages, setMessages] = useState<ConnectionMessage[]>([]);
  const [messageDraft, setMessageDraft] = useState("");
  const [messageError, setMessageError] = useState("");
  const [dockNotice, setDockNotice] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [search, setSearch] = useState("");

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

  const accepted = useMemo(() => state.acceptedIds.map((id) => profileById.get(id)).filter(isProfile), [profileById, state.acceptedIds]);
  const searchQuery = search.trim().toLowerCase();
  const activeConversation = activeConversationId ? profileById.get(activeConversationId) : undefined;

  const activeMessagesMatchSearch = useMemo(() => {
    if (!searchQuery || !activeConversationId) return false;

    return messages.some((message) => [message.senderName, message.body].join(" ").toLowerCase().includes(searchQuery));
  }, [activeConversationId, messages, searchQuery]);

  const filteredAccepted = useMemo(() => {
    if (!searchQuery) return accepted;

    const matches = accepted.filter((student) =>
      [student.fullName, student.major, student.university, ...student.connectionTypes].join(" ").toLowerCase().includes(searchQuery)
    );

    if (activeMessagesMatchSearch && activeConversation && !matches.some((student) => student.id === activeConversation.id)) {
      return [activeConversation, ...matches];
    }

    return matches;
  }, [accepted, activeConversation, activeMessagesMatchSearch, searchQuery]);

  const visibleMessages = useMemo(() => {
    if (!searchQuery) return messages;

    return messages.filter((message) => [message.senderName, message.body].join(" ").toLowerCase().includes(searchQuery));
  }, [messages, searchQuery]);

  async function openConversation(studentId: string) {
    setExpanded(true);
    setConversationTab("focused");
    setOptionsOpen(false);
    setDockNotice("");
    setActiveConversationId(studentId);
    setMessages([]);
    setIsLoadingMessages(true);
    setMessageError("");

    const { loadRemoteConnectionMessages } = await import("@/lib/supabase/user-sync");
    const remoteMessages = await loadRemoteConnectionMessages(studentId);
    setMessages(remoteMessages);
    setIsLoadingMessages(false);
  }

  function openDock() {
    if (!activeConversationId && filteredAccepted[0]) {
      void openConversation(filteredAccepted[0].id);
      return;
    }

    setExpanded(true);
  }

  function startNewMessage() {
    setExpanded(true);
    setConversationTab("focused");
    setOptionsOpen(false);
    setDockNotice("");
    setSearch("");
    setActiveConversationId(null);
    setMessages([]);
    setMessageDraft("");
    setMessageError("");
    setIsLoadingMessages(false);
  }

  function toggleDock() {
    if (expanded) {
      setExpanded(false);
      setOptionsOpen(false);
      return;
    }

    openDock();
  }

  function toggleOptions() {
    setExpanded(true);
    setOptionsOpen((isOpen) => !isOpen);
  }

  function clearMessageSearch() {
    setSearch("");
    setOptionsOpen(false);
    setDockNotice("Search cleared.");
  }

  function markMessagesRead() {
    setOptionsOpen(false);
    setDockNotice("Messaging notifications marked read for this session.");
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

      if (isActive) cleanup = unsubscribe;
      else unsubscribe();
    });

    return () => {
      isActive = false;
      cleanup?.();
    };
  }, [activeConversationId]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeConversation) return;

    const message = messageDraft.trim();
    if (!message) return;

    setMessageError("");
    const { sendRemoteConnectionMessage } = await import("@/lib/supabase/user-sync");
    const savedMessage = await sendRemoteConnectionMessage(activeConversation.id, message);

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

  if (!accepted.length) return null;

  return (
    <section
      className={cn(
        "fixed bottom-24 right-3 z-40 w-[calc(100vw-1.5rem)] max-w-[28rem] overflow-hidden rounded-t-lg border border-border bg-white shadow-2xl shadow-red-100 transition-all sm:right-5 sm:w-[28rem] lg:bottom-4",
        expanded ? "max-h-[min(44rem,calc(100vh-7rem))]" : "max-h-16"
      )}
      aria-label="Messaging dock"
    >
      <div className="flex h-16 items-center justify-between border-b border-border px-3">
        <button type="button" onClick={toggleDock} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <ProfileAvatar profile={accepted[0]} size="sm" />
          <span className="truncate text-lg font-bold text-navy">Messaging</span>
        </button>
        <div className="relative flex items-center gap-1">
          <Button type="button" variant="ghost" className="size-9 px-0" aria-label="More messaging options" onClick={toggleOptions}>
            <MoreHorizontal className="size-4" aria-hidden />
          </Button>
          {optionsOpen && (
            <div className="absolute right-16 top-11 z-50 w-52 overflow-hidden rounded-md border border-border bg-white py-1 text-sm font-semibold text-navy shadow-xl">
              <button type="button" className="block w-full px-3 py-2 text-left hover:bg-muted" onClick={startNewMessage}>
                New message
              </button>
              <button type="button" className="block w-full px-3 py-2 text-left hover:bg-muted" onClick={clearMessageSearch}>
                Clear search
              </button>
              <button type="button" className="block w-full px-3 py-2 text-left hover:bg-muted" onClick={markMessagesRead}>
                Mark messages read
              </button>
              <a className="block px-3 py-2 text-left hover:bg-muted" href="/connections">
                Open connections page
              </a>
            </div>
          )}
          <Button type="button" variant="ghost" className="size-9 px-0" aria-label="Start a new message" onClick={startNewMessage}>
            <SquarePen className="size-4" aria-hidden />
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="size-9 px-0"
            aria-label={expanded ? "Collapse messaging" : "Open messaging"}
            onClick={toggleDock}
          >
            {expanded ? <ChevronDown className="size-5" aria-hidden /> : <ChevronUp className="size-5" aria-hidden />}
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="grid max-h-[calc(100vh-11rem)] grid-rows-[auto_auto_minmax(0,1fr)] bg-white">
          <div className="p-3">
            <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2">
              <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search messages"
                className="h-8 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
              />
              <SlidersHorizontal className="size-5 shrink-0 text-muted-foreground" aria-hidden />
            </div>
            {dockNotice && <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-xs font-medium text-primary">{dockNotice}</p>}
          </div>

          <div className="grid grid-cols-2 border-b border-border text-center text-sm font-bold">
            <button
              type="button"
              className={cn(
                "border-b-2 py-2",
                conversationTab === "focused" ? "border-primary text-primary" : "border-transparent text-muted-foreground"
              )}
              onClick={() => {
                setConversationTab("focused");
                setOptionsOpen(false);
              }}
            >
              Focused
            </button>
            <button
              type="button"
              className={cn(
                "border-b-2 py-2",
                conversationTab === "other" ? "border-primary text-primary" : "border-transparent text-muted-foreground"
              )}
              onClick={() => {
                setConversationTab("other");
                setOptionsOpen(false);
              }}
            >
              Other
            </button>
          </div>

          {conversationTab === "other" ? (
            <div className="grid min-h-[24rem] place-items-center p-6 text-center">
              <div className="max-w-xs">
                <p className="text-sm font-bold text-navy">No other conversations yet.</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Accepted student chats stay in Focused. Future archived or filtered conversations can appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid min-h-0 md:grid-cols-[13rem_minmax(0,1fr)]">
              <aside className="max-h-56 overflow-y-auto border-b border-border md:max-h-[32rem] md:border-b-0 md:border-r">
                {filteredAccepted.length === 0 && <p className="p-4 text-sm text-muted-foreground">No matching conversations.</p>}
                {filteredAccepted.map((student) => {
                  const isActive = activeConversation?.id === student.id;

                  return (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => void openConversation(student.id)}
                      className={cn("flex w-full gap-2 border-b border-border px-3 py-3 text-left transition hover:bg-muted", isActive && "bg-red-50")}
                    >
                      <ProfileAvatar profile={student} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-navy">{student.fullName}</span>
                        <span className="block truncate text-xs text-muted-foreground">{student.connectionTypes.slice(0, 2).join(", ")}</span>
                      </span>
                    </button>
                  );
                })}
              </aside>

              <div className="flex min-h-[24rem] flex-col">
                {activeConversation ? (
                  <>
                    <div className="flex items-center gap-2 border-b border-border px-3 py-3">
                      <ProfileAvatar profile={activeConversation} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-navy">{activeConversation.fullName}</p>
                        <p className="truncate text-xs text-muted-foreground">{activeConversation.major}</p>
                      </div>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto bg-[#f3f2ef] p-3">
                      <div className="grid gap-2">
                        {isLoadingMessages && <p className="rounded-md bg-white p-3 text-sm text-muted-foreground">Loading messages...</p>}
                        {!isLoadingMessages && messages.length === 0 && (
                          <p className="rounded-md bg-white p-3 text-sm text-muted-foreground">
                            No messages yet. Say hi to {activeConversation.fullName.split(" ")[0]}.
                          </p>
                        )}
                        {!isLoadingMessages && messages.length > 0 && searchQuery && visibleMessages.length === 0 && (
                          <p className="rounded-md bg-white p-3 text-sm text-muted-foreground">No messages in this conversation match your search.</p>
                        )}
                        {visibleMessages.map((message) => (
                          <div
                            key={message.id}
                            className={cn(
                              "max-w-[86%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                              message.isOwn ? "ml-auto rounded-br-md bg-primary text-white" : "mr-auto rounded-bl-md border border-border bg-white text-foreground"
                            )}
                          >
                            <p className={cn("text-[11px] font-semibold", message.isOwn ? "text-white/80" : "text-muted-foreground")}>
                              {message.senderName}
                            </p>
                            <p className="mt-1 whitespace-pre-line leading-5">{message.body}</p>
                            <p className={cn("mt-1 text-right text-[10px]", message.isOwn ? "text-white/75" : "text-muted-foreground")}>
                              {formatMessageTime(message.createdAt)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <form onSubmit={sendMessage} className="border-t border-border p-3">
                      {messageError && <p className="mb-2 rounded-md border border-red-200 bg-red-50 p-2 text-xs font-medium text-red-900">{messageError}</p>}
                      <Textarea
                        value={messageDraft}
                        onChange={(event) => setMessageDraft(event.target.value)}
                        placeholder="Write a reply..."
                        className="min-h-20 resize-none text-sm"
                      />
                      <div className="mt-2 flex justify-end">
                        <Button type="submit" className="h-9 px-3 text-xs">
                          <Send className="size-4" /> Send
                        </Button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="grid flex-1 place-items-center p-4 text-center text-sm text-muted-foreground">Pick a connection to message.</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
