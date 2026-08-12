"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { events, students } from "@/lib/sample-data";
import type { BuddyGroupDetails, BuddyState } from "@/lib/event-buddy-store";
import { defaultStoredProfile, type StoredProfile } from "@/lib/profile-store";
import type { ConnectionType } from "@/lib/types";

type CurrentUser = {
  id: string;
  email?: string;
  fullName?: string;
};

type ProfileRow = {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  major: string | null;
  academic_year: string | null;
  country: string | null;
  languages: string[] | null;
  preferred_activities: string[] | null;
  study_style: string | null;
  preferred_study_times: string[] | null;
  student_status: string | null;
  bio: string | null;
  show_country: boolean;
  show_languages: boolean;
  show_courses: boolean;
  same_university_only: boolean;
  universities: { name: string | null } | { name: string | null }[] | null;
};

type SavedProfileRow = { saved_user_id: string };
type SentRequestRow = { receiver_id: string };
type IncomingRequestRow = { sender_id: string; status: string };
type ConnectionRow = { id?: string; user_a: string; user_b: string };
type ConnectionMessageRow = { id: string; sender_id: string; body: string; created_at: string };
type ProfileIdentityRow = { id: string; email: string | null; full_name: string | null };
type EventIdentityRow = { id: string; name: string };
type EventAttendeeRow = { event_id: string; needs_buddy: boolean };
type BuddyRequestRow = { event_id: string };
type BuddyGroupRow = {
  id: string;
  name: string;
  basis: string | null;
  description: string | null;
  max_members: number;
  meeting_preference: string | null;
  note: string | null;
  created_by: string | null;
};
type BuddyMemberRow = { group_id: string; user_id: string };

function studentStatus(value: string | null): StoredProfile["studentStatus"] {
  return value === "Returning student" ? "Returning student" : "New student";
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function universityName(value: ProfileRow["universities"]) {
  return Array.isArray(value) ? value[0]?.name ?? null : value?.name ?? null;
}

function isSeededDemoProfileId(id: string) {
  return /^00000000-0000-0000-0000-0000000000\d{2}$/.test(id);
}

function client() {
  return createSupabaseBrowserClient();
}

async function currentUser(): Promise<CurrentUser | null> {
  const supabase = client();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return {
    id: data.user.id,
    email: data.user.email ?? undefined,
    fullName: typeof data.user.user_metadata?.full_name === "string" ? data.user.user_metadata.full_name : undefined
  };
}

async function universityId(name: string) {
  const supabase = client();
  if (!supabase) return null;

  const { data } = await supabase.from("universities").select("id").eq("name", name).maybeSingle();
  return data?.id ?? null;
}

async function profileIdFromStudentId(studentId: string) {
  const supabase = client();
  if (!supabase) return null;
  if (isUuid(studentId)) return studentId;

  const sampleStudent = students.find((student) => student.id === studentId);
  const email = sampleStudent?.email;
  if (!email) return null;

  const { data } = await supabase.from("profiles").select("id").eq("email", email).maybeSingle();
  return data?.id ?? null;
}

async function connectionIdForStudent(studentId: string) {
  const supabase = client();
  const user = await currentUser();
  const otherUserId = await profileIdFromStudentId(studentId);
  if (!supabase || !user || !otherUserId) return null;

  const existingConnectionId = await findConnectionId(user.id, otherUserId);
  if (existingConnectionId) return existingConnectionId;

  const { data: acceptedRequests } = await supabase
    .from("connection_requests")
    .select("sender_id")
    .eq("status", "accepted")
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
    .limit(1);

  if (!acceptedRequests?.length) return null;

  const [userA, userB] = [user.id, otherUserId].sort();
  const { data: createdConnection } = await supabase
    .from("connections")
    .insert({ user_a: userA, user_b: userB })
    .select("id,user_a,user_b")
    .maybeSingle();

  return (createdConnection as ConnectionRow | null)?.id ?? await findConnectionId(user.id, otherUserId);
}

async function findConnectionId(currentUserId: string, otherUserId: string) {
  const supabase = client();
  if (!supabase) return null;

  const { data } = await supabase
    .from("connections")
    .select("id,user_a,user_b")
    .or(`and(user_a.eq.${currentUserId},user_b.eq.${otherUserId}),and(user_a.eq.${otherUserId},user_b.eq.${currentUserId})`)
    .order("created_at", { ascending: true })
    .limit(1);

  return ((data ?? []) as ConnectionRow[])[0]?.id ?? null;
}

function localStudentIdFromProfile(profile: ProfileIdentityRow) {
  return students.find((student) => student.email === profile.email)?.id ?? profile.id;
}

async function localStudentIdsFromProfileIds(profileIds: string[]) {
  const supabase = client();
  if (!supabase || !profileIds.length) return [];

  const { data } = await supabase.from("profiles").select("id,email,full_name").in("id", profileIds);
  return ((data ?? []) as ProfileIdentityRow[])
    .map(localStudentIdFromProfile)
    .filter((id): id is string => Boolean(id));
}

async function eventUuidFromLocalId(eventId: string) {
  const supabase = client();
  if (!supabase) return null;

  const event = events.find((item) => item.id === eventId);
  if (!event) return null;

  const { data } = await supabase.from("events").select("id").eq("name", event.name).maybeSingle();
  if (data?.id) return data.id as string;

  const user = await currentUser();
  const { data: createdEvent } = await supabase
    .from("events")
    .insert({
      name: event.name,
      description: event.description,
      starts_at: event.startsAt,
      location: event.location,
      category: event.category,
      organizer: event.organizer,
      source_label: event.sampleLabel,
      created_by: user?.id ?? null
    })
    .select("id")
    .maybeSingle();

  return createdEvent?.id ?? null;
}

function localEventIdFromEvent(event: EventIdentityRow) {
  return events.find((item) => item.name === event.name)?.id ?? null;
}

async function localEventIdsFromUuids(eventIds: string[]) {
  const supabase = client();
  if (!supabase || !eventIds.length) return [];

  const { data } = await supabase.from("events").select("id,name").in("id", eventIds);
  return ((data ?? []) as EventIdentityRow[])
    .map(localEventIdFromEvent)
    .filter((id): id is string => Boolean(id));
}

export async function loadCurrentUserProfile() {
  const supabase = client();
  const user = await currentUser();
  if (!supabase || !user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, avatar_url, major, academic_year, country, languages, preferred_activities, study_style, preferred_study_times, student_status, bio, show_country, show_languages, show_courses, same_university_only, universities(name)")
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();

  if (error) return null;

  if (!data) {
    const fallbackProfile = {
      ...defaultStoredProfile,
      id: user.id,
      fullName: user.fullName || user.email?.split("@")[0]?.replace(/[._-]/g, " ") || "UniBridge Student",
      email: user.email ?? defaultStoredProfile.email
    } satisfies StoredProfile;

    await upsertCurrentUserProfile(fallbackProfile);
    return fallbackProfile;
  }

  const { data: preferences } = await supabase
    .from("connection_preferences")
    .select("connection_type")
    .eq("user_id", user.id);

  return {
    ...defaultStoredProfile,
    id: data.id,
    fullName: data.full_name,
    email: data.email,
    university: universityName(data.universities) ?? defaultStoredProfile.university,
    avatarUrl: data.avatar_url ?? undefined,
    major: data.major ?? defaultStoredProfile.major,
    academicYear: (data.academic_year ?? defaultStoredProfile.academicYear) as StoredProfile["academicYear"],
    country: data.country ?? defaultStoredProfile.country,
    languages: data.languages?.length ? data.languages : defaultStoredProfile.languages,
    interests: data.preferred_activities?.length ? data.preferred_activities : defaultStoredProfile.interests,
    preferredActivities: data.preferred_activities?.length ? data.preferred_activities : defaultStoredProfile.preferredActivities,
    studyStyle: data.study_style ?? defaultStoredProfile.studyStyle,
    preferredStudyTimes: data.preferred_study_times?.length ? data.preferred_study_times : defaultStoredProfile.preferredStudyTimes,
    studentStatus: studentStatus(data.student_status),
    bio: data.bio ?? defaultStoredProfile.bio,
    connectionTypes: preferences?.length
      ? preferences.map((preference) => preference.connection_type as ConnectionType)
      : defaultStoredProfile.connectionTypes,
    visibility: {
      country: data.show_country,
      languages: data.show_languages,
      courses: data.show_courses,
      sameUniversityOnly: data.same_university_only
    }
  } satisfies StoredProfile;
}

export async function loadRemoteDiscoverProfiles(): Promise<StoredProfile[]> {
  const supabase = client();
  const user = await currentUser();
  if (!supabase || !user) return [];

  await loadCurrentUserProfile();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, avatar_url, major, academic_year, country, languages, preferred_activities, study_style, preferred_study_times, student_status, bio, show_country, show_languages, show_courses, same_university_only, universities(name)");

  if (error || !data) return [];

  const profileRows = (data as ProfileRow[]).filter((profile) => !isSeededDemoProfileId(profile.id));
  const profileIds = profileRows.map((profile) => profile.id);
  const { data: preferences } = profileIds.length
    ? await supabase.from("connection_preferences").select("user_id,connection_type").in("user_id", profileIds)
    : { data: [] };

  const preferencesByUser = new Map<string, ConnectionType[]>();
  (preferences ?? []).forEach((row) => {
    const item = row as { user_id: string; connection_type: ConnectionType };
    preferencesByUser.set(item.user_id, [...(preferencesByUser.get(item.user_id) ?? []), item.connection_type]);
  });

  return profileRows.map((profile, index) => ({
    ...defaultStoredProfile,
    id: profile.id,
    fullName: profile.full_name,
    email: profile.email,
    university: universityName(profile.universities) ?? defaultStoredProfile.university,
    avatarColor: students[index % students.length]?.avatarColor ?? defaultStoredProfile.avatarColor,
    avatarUrl: profile.avatar_url ?? undefined,
    major: profile.major ?? defaultStoredProfile.major,
    academicYear: (profile.academic_year ?? defaultStoredProfile.academicYear) as StoredProfile["academicYear"],
    country: profile.show_country ? profile.country ?? defaultStoredProfile.country : "Hidden",
    languages: profile.show_languages ? profile.languages ?? [] : [],
    courses: profile.show_courses ? defaultStoredProfile.courses : [],
    interests: profile.preferred_activities?.length ? profile.preferred_activities : defaultStoredProfile.interests,
    preferredActivities: profile.preferred_activities?.length ? profile.preferred_activities : defaultStoredProfile.preferredActivities,
    studyStyle: profile.study_style ?? defaultStoredProfile.studyStyle,
    preferredStudyTimes: profile.preferred_study_times?.length ? profile.preferred_study_times : defaultStoredProfile.preferredStudyTimes,
    studentStatus: studentStatus(profile.student_status),
    connectionTypes: preferencesByUser.get(profile.id)?.length ? preferencesByUser.get(profile.id)! : defaultStoredProfile.connectionTypes,
    bio: profile.bio ?? defaultStoredProfile.bio,
    visibility: {
      country: profile.show_country,
      languages: profile.show_languages,
      courses: profile.show_courses,
      sameUniversityOnly: profile.same_university_only
    }
  }));
}

export async function upsertCurrentUserProfile(profile: StoredProfile) {
  const supabase = client();
  const user = await currentUser();
  if (!supabase || !user) return;

  const resolvedUniversityId = await universityId(profile.university);

  await supabase.from("profiles").upsert({
    id: user.id,
    university_id: resolvedUniversityId,
    full_name: profile.fullName,
    email: user.email ?? profile.email,
    avatar_url: profile.avatarUrl ?? null,
    major: profile.major,
    academic_year: profile.academicYear,
    country: profile.country,
    languages: profile.languages,
    preferred_activities: profile.interests,
    study_style: profile.studyStyle,
    preferred_study_times: profile.preferredStudyTimes,
    student_status: profile.studentStatus,
    bio: profile.bio,
    show_country: profile.visibility.country,
    show_languages: profile.visibility.languages,
    show_courses: profile.visibility.courses,
    same_university_only: profile.visibility.sameUniversityOnly
  });

  await supabase.from("connection_preferences").delete().eq("user_id", user.id);
  if (profile.connectionTypes.length) {
    await supabase.from("connection_preferences").insert(
      profile.connectionTypes.map((connectionType) => ({
        user_id: user.id,
        connection_type: connectionType
      }))
    );
  }
}

export async function saveRemoteProfile(studentId: string) {
  const supabase = client();
  const user = await currentUser();
  const savedUserId = await profileIdFromStudentId(studentId);
  if (!supabase || !user || !savedUserId) return;

  await supabase.from("saved_profiles").upsert({
    saver_id: user.id,
    saved_user_id: savedUserId
  });
}

export async function removeRemoteSavedProfile(studentId: string) {
  const supabase = client();
  const user = await currentUser();
  const savedUserId = await profileIdFromStudentId(studentId);
  if (!supabase || !user || !savedUserId) return;

  await supabase.from("saved_profiles").delete().eq("saver_id", user.id).eq("saved_user_id", savedUserId);
}

export async function sendRemoteConnectionRequest(studentId: string) {
  const supabase = client();
  const user = await currentUser();
  const receiverId = await profileIdFromStudentId(studentId);
  if (!supabase || !user || !receiverId || receiverId === user.id) return;

  await supabase.from("connection_requests").upsert({
    sender_id: user.id,
    receiver_id: receiverId,
    message: "I would like to connect through UniBridge.",
    status: "pending"
  });
}

export async function cancelRemoteConnectionRequest(studentId: string) {
  const supabase = client();
  const user = await currentUser();
  const receiverId = await profileIdFromStudentId(studentId);
  if (!supabase || !user || !receiverId) return;

  await supabase.from("connection_requests").delete().eq("sender_id", user.id).eq("receiver_id", receiverId).eq("status", "pending");
}

export async function acceptRemoteConnectionRequest(studentId: string) {
  const supabase = client();
  const user = await currentUser();
  const senderId = await profileIdFromStudentId(studentId);
  if (!supabase || !user || !senderId) return;

  await supabase.from("connection_requests").update({ status: "accepted" }).eq("sender_id", senderId).eq("receiver_id", user.id);
  await connectionIdForStudent(studentId);
}

export async function declineRemoteConnectionRequest(studentId: string) {
  const supabase = client();
  const user = await currentUser();
  const senderId = await profileIdFromStudentId(studentId);
  if (!supabase || !user || !senderId) return;

  await supabase.from("connection_requests").update({ status: "declined" }).eq("sender_id", senderId).eq("receiver_id", user.id);
}

export async function removeRemoteConnection(studentId: string) {
  const supabase = client();
  const user = await currentUser();
  const otherUserId = await profileIdFromStudentId(studentId);
  if (!supabase || !user || !otherUserId) return;

  await supabase.from("connections").delete().or(`and(user_a.eq.${user.id},user_b.eq.${otherUserId}),and(user_a.eq.${otherUserId},user_b.eq.${user.id})`);
}

export type ConnectionMessage = {
  id: string;
  body: string;
  createdAt: string;
  senderName: string;
  isOwn: boolean;
};

export async function loadRemoteConnectionMessages(studentId: string): Promise<ConnectionMessage[]> {
  const supabase = client();
  const user = await currentUser();
  const connectionId = await connectionIdForStudent(studentId);
  if (!supabase || !user || !connectionId) return [];

  const otherStudent = students.find((student) => student.id === studentId);
  const { data } = await supabase
    .from("connection_messages")
    .select("id,sender_id,body,created_at")
    .eq("connection_id", connectionId)
    .order("created_at", { ascending: true });

  return ((data ?? []) as ConnectionMessageRow[]).map((message) => ({
    id: message.id,
    body: message.body,
    createdAt: message.created_at,
    senderName: message.sender_id === user.id ? "You" : otherStudent?.fullName ?? "Student",
    isOwn: message.sender_id === user.id
  }));
}

export async function sendRemoteConnectionMessage(studentId: string, body: string): Promise<ConnectionMessage | null> {
  const supabase = client();
  const user = await currentUser();
  const connectionId = await connectionIdForStudent(studentId);
  const trimmed = body.trim();
  if (!supabase || !user || !connectionId || !trimmed) return null;

  const { data, error } = await supabase
    .from("connection_messages")
    .insert({
      connection_id: connectionId,
      sender_id: user.id,
      body: trimmed
    })
    .select("id,sender_id,body,created_at")
    .single();

  if (error || !data) return null;

  const message = data as ConnectionMessageRow;
  return {
    id: message.id,
    body: message.body,
    createdAt: message.created_at,
    senderName: "You",
    isOwn: true
  };
}

export async function subscribeToRemoteConnectionMessages(
  studentId: string,
  onMessage: (message: ConnectionMessage) => void
): Promise<() => void> {
  const supabase = client();
  const user = await currentUser();
  const connectionId = await connectionIdForStudent(studentId);
  if (!supabase || !user || !connectionId) return () => {};

  const otherStudent = students.find((student) => student.id === studentId);
  const channel = supabase
    .channel(`connection-messages-${connectionId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "connection_messages", filter: `connection_id=eq.${connectionId}` },
      (payload) => {
        const message = payload.new as ConnectionMessageRow;
        onMessage({
          id: message.id,
          body: message.body,
          createdAt: message.created_at,
          senderName: message.sender_id === user.id ? "You" : otherStudent?.fullName ?? "Student",
          isOwn: message.sender_id === user.id
        });
      }
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

export async function loadRemoteDiscoverActions() {
  const supabase = client();
  const user = await currentUser();
  if (!supabase || !user) return null;

  const { data: savedProfiles } = await supabase.from("saved_profiles").select("saved_user_id").eq("saver_id", user.id);
  const { data: sentRequests } = await supabase.from("connection_requests").select("receiver_id").eq("sender_id", user.id).eq("status", "pending");

  return {
    savedIds: await localStudentIdsFromProfileIds(((savedProfiles ?? []) as SavedProfileRow[]).map((row) => row.saved_user_id)),
    requestedIds: await localStudentIdsFromProfileIds(((sentRequests ?? []) as SentRequestRow[]).map((row) => row.receiver_id))
  };
}

export async function loadRemoteConnectionsState() {
  const supabase = client();
  const user = await currentUser();
  if (!supabase || !user) return null;

  const { data: incomingRequests } = await supabase.from("connection_requests").select("sender_id,status").eq("receiver_id", user.id);
  const { data: connections } = await supabase.from("connections").select("user_a,user_b").or(`user_a.eq.${user.id},user_b.eq.${user.id}`);
  const acceptedProfileIds = ((connections ?? []) as ConnectionRow[]).map((connection) => connection.user_a === user.id ? connection.user_b : connection.user_a);
  const pendingProfileIds = ((incomingRequests ?? []) as IncomingRequestRow[]).filter((request) => request.status === "pending").map((request) => request.sender_id);
  const declinedProfileIds = ((incomingRequests ?? []) as IncomingRequestRow[]).filter((request) => request.status === "declined").map((request) => request.sender_id);

  return {
    acceptedIds: await localStudentIdsFromProfileIds(acceptedProfileIds),
    pendingIds: await localStudentIdsFromProfileIds(pendingProfileIds),
    declinedIds: await localStudentIdsFromProfileIds(declinedProfileIds)
  };
}

export async function joinRemoteEvent(eventId: string, needsBuddy: boolean) {
  const supabase = client();
  const user = await currentUser();
  const eventUuid = await eventUuidFromLocalId(eventId);
  if (!supabase || !user || !eventUuid) return;

  await supabase.from("event_attendees").upsert({
    event_id: eventUuid,
    user_id: user.id,
    status: "joined",
    needs_buddy: needsBuddy
  });

  if (needsBuddy) {
    await supabase.from("event_buddy_requests").upsert({
      event_id: eventUuid,
      user_id: user.id,
      note: "I would like to attend with a small group.",
      status: "open"
    });
  }
}

export async function loadRemoteEventActivity() {
  const supabase = client();
  const user = await currentUser();
  if (!supabase || !user) return null;

  const { data: attendees } = await supabase.from("event_attendees").select("event_id,needs_buddy").eq("user_id", user.id);
  const { data: buddyRequests } = await supabase.from("event_buddy_requests").select("event_id").eq("user_id", user.id).eq("status", "open");

  return {
    joinedIds: await localEventIdsFromUuids(((attendees ?? []) as EventAttendeeRow[]).map((row) => row.event_id)),
    buddyIds: await localEventIdsFromUuids([
      ...((attendees ?? []) as EventAttendeeRow[]).filter((row) => row.needs_buddy).map((row) => row.event_id),
      ...((buddyRequests ?? []) as BuddyRequestRow[]).map((row) => row.event_id)
    ])
  };
}

export async function createRemoteBuddyGroup(eventId: string, group: BuddyGroupDetails) {
  const supabase = client();
  const user = await currentUser();
  const eventUuid = await eventUuidFromLocalId(eventId);
  if (!supabase || !user || !eventUuid) return null;

  const { data, error } = await supabase
    .from("event_buddy_groups")
    .insert({
      event_id: eventUuid,
      name: group.title,
      basis: group.basis,
      description: group.description,
      max_members: group.maxMembers,
      meeting_preference: group.meetingPreference,
      note: group.note,
      created_by: user.id
    })
    .select("id")
    .single();

  if (error || !data?.id) return null;
  await supabase.from("event_buddy_group_members").upsert({ group_id: data.id, user_id: user.id });
  return data.id as string;
}

export async function joinRemoteBuddyGroup(groupId: string) {
  const supabase = client();
  const user = await currentUser();
  if (!supabase || !user || !isUuid(groupId)) return;

  await supabase.from("event_buddy_group_members").upsert({ group_id: groupId, user_id: user.id });
}

export async function leaveRemoteBuddyGroup(groupId: string) {
  const supabase = client();
  const user = await currentUser();
  if (!supabase || !user || !isUuid(groupId)) return;

  await supabase.from("event_buddy_group_members").delete().eq("group_id", groupId).eq("user_id", user.id);
}

export async function deleteRemoteBuddyGroup(groupId: string) {
  const supabase = client();
  if (!supabase || !isUuid(groupId)) return;

  await supabase.from("event_buddy_groups").delete().eq("id", groupId);
}

export async function loadRemoteBuddyState(eventId: string): Promise<BuddyState | null> {
  const supabase = client();
  const user = await currentUser();
  const eventUuid = await eventUuidFromLocalId(eventId);
  if (!supabase || !user || !eventUuid) return null;

  const { data: groups } = await supabase.from("event_buddy_groups").select("id,name,basis,description,max_members,meeting_preference,note,created_by").eq("event_id", eventUuid);
  const groupRows = (groups ?? []) as BuddyGroupRow[];
  if (!groupRows.length) return { created: false, joined: false, groups: [], groupMessages: {} };

  const groupIds = groupRows.map((group) => group.id);
  const { data: members } = await supabase.from("event_buddy_group_members").select("group_id,user_id").in("group_id", groupIds);
  const memberRows = (members ?? []) as BuddyMemberRow[];
  const memberProfileIds = Array.from(new Set(memberRows.map((member) => member.user_id)));
  const { data: memberProfiles } = memberProfileIds.length
    ? await supabase.from("profiles").select("id,email,full_name").in("id", memberProfileIds)
    : { data: [] };
  const profileNames = new Map(
    ((memberProfiles ?? []) as ProfileIdentityRow[]).map((profile) => [profile.id, profile.id === user.id ? "You" : profile.full_name ?? profile.email ?? "Student"])
  );

  const buddyGroups = groupRows.map((group) => ({
    id: group.id,
    title: group.name,
    basis: group.basis ?? "Shared event interest",
    description: group.description ?? "A friendly group for students who want to attend together.",
    maxMembers: group.max_members,
    meetingPreference: group.meeting_preference ?? "Coordinate after joining",
    note: group.note ?? "",
    members: memberRows.filter((member) => member.group_id === group.id).map((member) => profileNames.get(member.user_id) ?? "Student"),
    createdByCurrentUser: group.created_by === user.id
  }));
  const joinedGroup = memberRows.find((member) => member.user_id === user.id);
  const createdGroup = buddyGroups.find((group) => group.createdByCurrentUser);

  return {
    created: Boolean(createdGroup),
    joined: Boolean(joinedGroup),
    group: createdGroup,
    groups: buddyGroups,
    joinedGroupId: joinedGroup?.group_id,
    groupMessages: {}
  };
}
