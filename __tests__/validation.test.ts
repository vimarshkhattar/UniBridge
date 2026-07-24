import { describe, expect, it } from "vitest";
import { aiAssistantSchema, connectionRequestSchema, eventBuddySchema, onboardingSchema } from "@/lib/validation";

describe("forms and action validation", () => {
  it("validates onboarding required profile fields", () => {
    expect(onboardingSchema.safeParse({ fullName: "Maya Iyer", university: "Stony Brook University", major: "Computer Science", academicYear: "Graduate" }).success).toBe(true);
    expect(onboardingSchema.safeParse({ fullName: "", university: "", major: "", academicYear: "" }).success).toBe(false);
  });

  it("validates AI assistant requests", () => {
    expect(aiAssistantSchema.safeParse({
      recipient: "Professor Lee",
      situation: "Missing class",
      details: "I was sick on Monday and missed lecture.",
      desiredResult: "ask how to catch up",
      tone: "Polite",
      format: "Email"
    }).success).toBe(true);
  });

  it("validates connection and event buddy behavior inputs", () => {
    expect(connectionRequestSchema.safeParse({ receiverId: "user-002", message: "Want to study?" }).success).toBe(true);
    expect(connectionRequestSchema.safeParse({ receiverId: "" }).success).toBe(false);
    expect(eventBuddySchema.safeParse({ eventId: "event-001", note: "Looking for a small group." }).success).toBe(true);
    expect(eventBuddySchema.safeParse({ eventId: "" }).success).toBe(false);
  });
});
