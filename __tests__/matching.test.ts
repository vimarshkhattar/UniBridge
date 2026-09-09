import { describe, expect, it } from "vitest";
import { calculateMatchScore } from "@/lib/matching";
import type { StudentProfile } from "@/lib/types";

function buildProfile(overrides: Partial<StudentProfile>): StudentProfile {
  return {
    id: "test-viewer",
    fullName: "Test Student",
    email: "test.student@stonybrook.edu",
    university: "Stony Brook University",
    major: "Computer Science",
    academicYear: "Graduate",
    country: "India",
    languages: ["English", "Hindi"],
    courses: ["CSE 532", "CSE 548", "AMS 561"],
    interests: ["Hackathons", "Badminton", "Career prep"],
    preferredActivities: ["Study sessions", "Campus events"],
    studyStyle: "Quiet focus with planned breaks",
    preferredStudyTimes: ["Evenings"],
    studentStatus: "New student",
    connectionTypes: ["Study partner", "Event buddy"],
    bio: "Test profile used only by the matching tests.",
    avatarColor: "bg-primary",
    ...overrides
  };
}

const viewer = buildProfile({});

const sameCampusMatch = buildProfile({
  id: "test-same-campus",
  email: "same.campus@stonybrook.edu",
  courses: ["CSE 532", "CSE 416", "AMS 561"],
  interests: ["Hackathons", "Career prep"]
});

const otherCampusMatch = buildProfile({
  id: "test-other-campus",
  email: "other.campus@nyu.edu",
  university: "New York University",
  major: "Data Science",
  languages: ["English", "Portuguese"],
  courses: ["DS 1003"],
  interests: ["Music"],
  preferredActivities: ["Campus events"],
  studyStyle: "Flexible, depends on the class"
});

describe("calculateMatchScore", () => {
  it("rewards transparent compatibility signals and caps at 100", () => {
    const match = calculateMatchScore(viewer, sameCampusMatch);

    expect(match.sameUniversity).toBe(20);
    expect(match.sameMajor).toBe(10);
    expect(match.sharedCourses).toBeGreaterThan(0);
    expect(match.total).toBeLessThanOrEqual(100);
  });

  it("scores weaker cross-university matches lower than strong same-university course matches", () => {
    const strong = calculateMatchScore(viewer, sameCampusMatch).total;
    const weaker = calculateMatchScore(viewer, otherCampusMatch).total;

    expect(strong).toBeGreaterThan(weaker);
  });
});
