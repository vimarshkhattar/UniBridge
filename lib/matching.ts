import type { StudentProfile } from "@/lib/types";

export type MatchBreakdown = {
  sameUniversity: number;
  sharedCourses: number;
  sameMajor: number;
  sharedInterests: number;
  sharedLanguage: number;
  studyStyle: number;
  preferredActivities: number;
  total: number;
};

function sharedCount(a: string[], b: string[]) {
  const normalized = new Set(a.map((item) => item.toLowerCase()));
  return b.filter((item) => normalized.has(item.toLowerCase())).length;
}

export function calculateMatchScore(viewer: StudentProfile, candidate: StudentProfile): MatchBreakdown {
  const sameUniversity = viewer.university === candidate.university ? 20 : 0;
  const sharedCourses = Math.min(sharedCount(viewer.courses, candidate.courses) * 9, 25);
  const sameMajor = viewer.major === candidate.major ? 10 : 0;
  const sharedInterests = Math.min(sharedCount(viewer.interests, candidate.interests) * 5, 15);
  const sharedLanguage = sharedCount(viewer.languages, candidate.languages) > 0 ? 10 : 0;
  const studyStyle = viewer.studyStyle === candidate.studyStyle ? 10 : 0;
  const preferredActivities = Math.min(sharedCount(viewer.preferredActivities, candidate.preferredActivities) * 5, 10);

  const total = Math.min(
    100,
    sameUniversity + sharedCourses + sameMajor + sharedInterests + sharedLanguage + studyStyle + preferredActivities
  );

  return {
    sameUniversity,
    sharedCourses,
    sameMajor,
    sharedInterests,
    sharedLanguage,
    studyStyle,
    preferredActivities,
    total
  };
}
