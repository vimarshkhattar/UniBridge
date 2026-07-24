import { z } from "zod";

export const onboardingSchema = z.object({
  fullName: z.string().min(2, "Enter your full name."),
  university: z.string().min(2, "Select or enter your university."),
  major: z.string().min(2, "Enter your major."),
  academicYear: z.string().min(1, "Choose your academic year."),
  country: z.string().optional(),
  languages: z.string().optional(),
  courses: z.string().optional(),
  interests: z.string().optional(),
  studyStyle: z.string().optional()
});

export const aiAssistantSchema = z.object({
  recipient: z.string().min(2, "Tell us who you are writing to."),
  situation: z.string().min(5, "Describe the situation."),
  details: z.string().min(5, "Add the important details."),
  desiredResult: z.string().min(3, "Add the result you want."),
  tone: z.enum(["Polite", "Friendly", "Formal", "Direct but respectful"]),
  format: z.enum(["Email", "Text message", "Group-chat message", "In-person conversation outline"]),
  currentDraft: z.string().max(6000).optional(),
  revisionInstruction: z.string().max(100).optional()
});

export const dashboardChatSchema = z.object({
  question: z.string().min(3, "Ask a question.").max(1200, "Keep the question shorter."),
  history: z
    .array(z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().max(2000)
    }))
    .max(8)
    .optional()
});

export const connectionRequestSchema = z.object({
  receiverId: z.string().min(1),
  message: z.string().max(500).optional()
});

export const eventBuddySchema = z.object({
  eventId: z.string().min(1),
  note: z.string().max(400).optional()
});
