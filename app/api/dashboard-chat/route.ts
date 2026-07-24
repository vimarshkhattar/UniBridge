import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { dashboardChatSchema } from "@/lib/validation";

const systemPrompt = `You are UniBridge's dashboard chatbot for international university students.
Answer general questions about university life, studying, campus adjustment, academic communication, housing basics, events, friendships, culture, and planning.
Use warm, simple, practical language.
Do not use Markdown formatting symbols such as **, *, #, backticks, or tables.
Use plain text headings only when helpful, with no decorative punctuation.
Do not claim to know a specific university's current policies, deadlines, tuition, visa rules, immigration law, health requirements, or official procedures unless the user provided them.
For official or high-stakes topics, explain the general idea and tell the student to confirm with the university office, official website, advisor, international student office, or other relevant authority.
Keep answers helpful and descriptive, usually 1 to 3 short paragraphs plus a few concrete next steps when useful.`;

function fallbackAnswer(question: string) {
  return {
    answer: `Here is a helpful way to think about it: ${question.trim()}\n\nFor most university questions, start by identifying which office owns the issue. Academic questions usually go to your professor, TA, academic advisor, or department office. Campus life questions usually go to student affairs, clubs, residence life, or the international student office.\n\nA good next step is to write down your exact concern, what result you want, and any deadline involved. Then contact the relevant office through the official university website so you have the most accurate information.`
  };
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = dashboardChatSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid chat request.", issues: parsed.error.flatten() }, { status: 400 });
  }

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(fallbackAnswer(parsed.data.question));
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: systemPrompt },
      ...(parsed.data.history ?? []).map((message) => ({
        role: message.role,
        content: message.content
      })),
      { role: "user", content: parsed.data.question }
    ],
    temperature: 0.35
  });

  const answer = completion.choices[0]?.message?.content;
  if (!answer) return NextResponse.json({ error: "No chat response returned." }, { status: 502 });

  return NextResponse.json({ answer });
}
