import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { aiAssistantSchema } from "@/lib/validation";

const systemPrompt = `You are UniBridge's communication assistant for international university students.
Produce respectful, culturally sensitive university communication in simple English.
Always write from the student's point of view, not as an assistant or university staff member.
Do not impersonate university officials.
Do not invent policies, deadlines, grades, or personal facts.
Tell the student when official university guidance is necessary.
Avoid threatening, dishonest, academically deceptive, or manipulative messages.
Ask for help, clarification, a meeting, or next steps in a natural student voice.
Use the student's provided details, but fix minor spelling and capitalization issues when obvious.
Make the draft specific and descriptive enough to send without sounding robotic.
For emails, include a clear subject and 2 to 4 short paragraphs.
For text or group-chat messages, write 3 to 6 complete sentences unless the student asks for a shorter version.
For in-person outlines, use concise bullet-style talking points.
Explain communication choices briefly and clearly.`;

function mockResponse(input: ReturnType<typeof aiAssistantSchema.parse>) {
  const subject = input.format === "Email" ? `Subject: Request about ${input.situation.slice(0, 42)}` : "";
  if (input.currentDraft && input.revisionInstruction) {
    if (input.revisionInstruction === "Regenerate") {
      return mockResponse({ ...input, currentDraft: undefined, revisionInstruction: undefined });
    }

    const shorterMessage = input.currentDraft
      .split("\n")
      .filter((line) => line.trim())
      .slice(0, 4)
      .join("\n\n");
    const revisionTone = input.revisionInstruction === "Make it more formal"
      ? "formal and polished"
      : input.revisionInstruction === "Make it friendlier"
        ? "warmer and more conversational"
        : "clearer and easier to scan";

    return {
      mock: true,
      subject,
      message: input.revisionInstruction === "Make it shorter"
        ? shorterMessage
        : `${input.currentDraft}\n\nRevision note: adjusted to sound ${revisionTone}.`,
      explanation: `This revision follows the request to ${input.revisionInstruction.toLowerCase()} while keeping the same facts.`,
      tip: "Review the message before sending so the tone matches your real relationship with the recipient.",
      reminder: "Mock output. Review names, dates, course numbers, deadlines, policies, and facts before sending."
    };
  }

  return {
    mock: true,
    subject,
    message: `Hi ${input.recipient},\n\nI hope you are doing well. I am reaching out because I need help with ${input.details}. I would appreciate your guidance on what steps I should take and whether there is anything important I should check before making a decision.\n\nWould it be possible to ${input.desiredResult}? If there is a better person or office I should contact, please let me know.\n\nThank you,\n[Your name]`,
    explanation: `This uses a ${input.tone.toLowerCase()} tone by giving context, making one clear request, and respecting the recipient's time.`,
    tip: "In many US university settings, a concise message with course context and a specific request is easier for professors, TAs, and advisors to answer.",
    reminder: "Mock output. Review names, dates, course numbers, deadlines, policies, and facts before sending."
  };
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = aiAssistantSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid assistant request.", issues: parsed.error.flatten() }, { status: 400 });
  }

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(mockResponse(parsed.data));
  }

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: JSON.stringify({
            task: parsed.data.currentDraft && parsed.data.revisionInstruction
              ? "Revise currentDraft according to revisionInstruction. Preserve the student's facts. Return JSON with subject, message, explanation, tip, reminder."
              : "Draft a polished, specific, send-ready message from the student's point of view. Do not speak as the assistant. Return JSON with subject, message, explanation, tip, reminder.",
            input: parsed.data
          })
        }
      ],
      temperature: 0.4,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return NextResponse.json(mockResponse(parsed.data));

    return NextResponse.json({ mock: false, ...JSON.parse(content) });
  } catch {
    return NextResponse.json(mockResponse(parsed.data));
  }
}
