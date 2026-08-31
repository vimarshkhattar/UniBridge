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
  const cleanedQuestion = question.trim();
  const lowerQuestion = cleanedQuestion.toLowerCase();

  if (/^(hi+|hello|hey|yo|namaste)\b/.test(lowerQuestion)) {
    return {
      fallback: true,
      answer:
        "Hi! I am here to help with campus life, classes, professors, studying, housing basics, events, making friends, and planning your next steps.\n\nYou can ask something like: How do I email a professor about office hours? Or: What should I ask my academic advisor?"
    };
  }

  return {
    fallback: true,
    answer: `I can still help you think through this: ${cleanedQuestion}\n\nFor most university questions, start by identifying which office owns the issue. Academic questions usually go to your professor, TA, academic advisor, or department office. Campus life questions usually go to student affairs, clubs, residence life, or the international student office.\n\nNext steps:\n1. Write down your exact concern and what result you want.\n2. Check whether there is a deadline or policy involved.\n3. Contact the relevant university office through the official website so you get accurate information.`
  };
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid chat request." }, { status: 400 });
  }

  const parsed = dashboardChatSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid chat request.", issues: parsed.error.flatten() }, { status: 400 });
  }

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(fallbackAnswer(parsed.data.question));
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  try {
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
    if (!answer) return NextResponse.json(fallbackAnswer(parsed.data.question));

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Dashboard chatbot failed", error);
    return NextResponse.json(fallbackAnswer(parsed.data.question));
  }
}
