export type AcademicYear = "First year" | "Sophomore" | "Junior" | "Senior" | "Graduate" | "Exchange";

export type ConnectionType =
  | "Study partner"
  | "Friend"
  | "Gym partner"
  | "Event buddy"
  | "Roommate search"
  | "English practice partner"
  | "Same-country connection";

export type StudentProfile = {
  id: string;
  fullName: string;
  email: string;
  university: string;
  major: string;
  academicYear: AcademicYear;
  country: string;
  languages: string[];
  courses: string[];
  interests: string[];
  preferredActivities: string[];
  studyStyle: string;
  preferredStudyTimes: string[];
  studentStatus: "New student" | "Returning student";
  connectionTypes: ConnectionType[];
  bio: string;
  avatarColor: string;
  avatarUrl?: string;
};

export type CampusEvent = {
  id: string;
  name: string;
  description: string;
  startsAt: string;
  location: string;
  category: string;
  organizer: string;
  interestedCount: number;
  buddyCount: number;
  sampleLabel: string;
};

export type SurvivalGuide = {
  id: string;
  title: string;
  summary: string;
  category: string;
  readingTime: string;
  lastUpdated: string;
  sections: { heading: string; body: string }[];
  examples: string[];
  checklist: string[];
  disclaimer?: string;
};
