"use client";

import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { saveBuddyState, useBuddyState } from "@/lib/event-buddy-store";

export function BuddyCreateForm({ eventId, eventName }: { eventId: string; eventName: string }) {
  const router = useRouter();
  const { state } = useBuddyState(eventId);

  async function handleCreate(formData: FormData) {
    const maxMembers = Number(formData.get("maxMembers") || 4);
    const group = {
      id: `user-created-${Date.now()}`,
      title: String(formData.get("title") || `${eventName} buddy group`),
      basis: String(formData.get("basis") || "Shared event interest"),
      description: String(formData.get("description") || "A friendly group for students who want to attend together."),
      maxMembers: Math.min(Math.max(maxMembers, 2), 8),
      meetingPreference: String(formData.get("meetingPreference") || "Meet near the event entrance"),
      note: String(formData.get("note") || ""),
      members: ["You"],
      createdByCurrentUser: true
    };
    const { createRemoteBuddyGroup } = await import("@/lib/supabase/user-sync");
    const remoteGroupId = await createRemoteBuddyGroup(eventId, group);
    const savedGroup = remoteGroupId ? { ...group, id: remoteGroupId } : group;

    saveBuddyState(eventId, {
      ...state,
      created: true,
      joined: true,
      group: savedGroup,
      groups: [...state.groups.filter((item) => !item.createdByCurrentUser), savedGroup],
      joinedGroupId: savedGroup.id
    });

    router.push(`/events/${eventId}`);
  }

  return (
    <form action={handleCreate} className="grid gap-4">
      <label className="grid gap-2 text-sm font-medium text-navy">
        Group name
        <Input name="title" defaultValue={`${eventName} buddy group`} required />
      </label>
      <label className="grid gap-2 text-sm font-medium text-navy">
        Create group on what basis?
        <Select name="basis" defaultValue={state.group?.basis ?? "Same major or career interest"}>
          <option>Same major or career interest</option>
          <option>Same country or language</option>
          <option>First-time event attendees</option>
          <option>Quiet and low-pressure group</option>
          <option>Networking-focused group</option>
          <option>Anyone friendly is welcome</option>
        </Select>
      </label>
      <label className="grid gap-2 text-sm font-medium text-navy">
        Description
        <Textarea
          name="description"
          required
          defaultValue={state.group?.description ?? "Looking for students who want to attend together, introduce ourselves, and compare notes after the event."}
        />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-navy">
          Maximum people allowed
          <Input name="maxMembers" type="number" min={2} max={8} defaultValue={state.group?.maxMembers ?? 4} required />
        </label>
        <label className="grid gap-2 text-sm font-medium text-navy">
          Meeting preference
          <Select name="meetingPreference" defaultValue={state.group?.meetingPreference ?? "Meet near the event entrance"}>
            <option>Meet near the event entrance</option>
            <option>Meet 10 minutes before the event</option>
            <option>Meet at a public campus landmark</option>
            <option>Coordinate after joining</option>
          </Select>
        </label>
      </div>
      <label className="grid gap-2 text-sm font-medium text-navy">
        Extra note for students
        <Textarea name="note" defaultValue={state.group?.note ?? ""} placeholder="Example: Good for students who feel awkward attending alone." />
      </label>
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-900">
        For safety, meet in a public campus location and avoid sharing sensitive personal or financial information.
      </div>
      <div className="flex gap-2">
        <Button type="submit"><Save className="size-4" /> Save group</Button>
        <Button type="button" variant="secondary" onClick={() => router.push(`/events/${eventId}`)}>Cancel</Button>
      </div>
    </form>
  );
}
