import { describe, expect, it } from "vitest";
import { calculateMatchScore } from "@/lib/matching";
import { currentStudent, students } from "@/lib/sample-data";

describe("calculateMatchScore", () => {
  it("rewards transparent compatibility signals and caps at 100", () => {
    const match = calculateMatchScore(currentStudent, students[1]);

    expect(match.sameUniversity).toBe(20);
    expect(match.sameMajor).toBe(10);
    expect(match.sharedCourses).toBeGreaterThan(0);
    expect(match.total).toBeLessThanOrEqual(100);
  });

  it("scores weaker cross-university matches lower than strong same-university course matches", () => {
    const strong = calculateMatchScore(currentStudent, students[1]).total;
    const weaker = calculateMatchScore(currentStudent, students[5]).total;

    expect(strong).toBeGreaterThan(weaker);
  });
});
