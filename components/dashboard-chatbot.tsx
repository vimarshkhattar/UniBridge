"use client";

import { useState } from "react";
import { Bot, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const starterQuestions = [
  "How do I email a professor about office hours?",
  "How can I make friends on campus?",
  "What should I ask my academic advisor?"
];

const THINKING_DELAY_MS = 6000;
const TYPING_INTERVAL_MS = 18;

function cleanChatText(value: string) {
  return value
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/^\s*[-*]\s+/gm, "- ");
}

export function DashboardChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hi, I can help with university life questions, study planning, campus resources, and practical next steps."
    }
  ]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState("");

  function wait(ms: number) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  async function typeAnswer(nextMessages: ChatMessage[], answer: string) {
    setTyping(true);
    setMessages([...nextMessages, { role: "assistant", content: "" }]);

    for (let index = 0; index <= answer.length; index += 2) {
      const partialAnswer = answer.slice(0, index);
      setMessages([...nextMessages, { role: "assistant", content: partialAnswer }]);
      await wait(TYPING_INTERVAL_MS);
    }

    setMessages([...nextMessages, { role: "assistant", content: answer }]);
    setTyping(false);
  }

  async function askChatbot(nextQuestion = question) {
    const trimmed = nextQuestion.trim();
    if (!trimmed) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setQuestion("");
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/dashboard-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: trimmed,
          history: messages.slice(-6)
        })
      });

      const data = (await response.json().catch(() => null)) as { answer?: unknown; error?: unknown } | null;

      if (!response.ok) {
        setLoading(false);
        setError(typeof data?.error === "string" ? data.error : "The chatbot had trouble connecting. Please try again.");
        return;
      }

      const answer = typeof data?.answer === "string" ? cleanChatText(data.answer) : "";
      if (!answer) {
        setLoading(false);
        setError("The chatbot had trouble answering. Please try again.");
        return;
      }

      await wait(THINKING_DELAY_MS);
      setLoading(false);
      await typeAnswer(nextMessages, answer);
    } catch {
      setLoading(false);
      setTyping(false);
      setError("The chatbot connection had a problem. Please try again.");
    }
  }

  return (
    <Card id="campus-chatbot" className="scroll-mt-24 lg:col-span-3">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-md bg-primary/10 text-primary">
            <Bot className="size-5" aria-hidden />
          </span>
          <CardTitle>Campus question chatbot</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="max-h-80 overflow-y-auto rounded-md border border-border bg-background/70 p-3">
          <div className="grid gap-3">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={message.role === "user" ? "ml-auto max-w-[85%] rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground" : "max-w-[90%] rounded-md bg-muted px-3 py-2 text-sm text-foreground"}
              >
                <p className="whitespace-pre-line">{message.content}</p>
              </div>
            ))}
            {loading && (
              <div className="max-w-[90%] rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
                Thinking...
              </div>
            )}
            {typing && (
              <div className="max-w-[90%] rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
                Typing...
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {starterQuestions.map((starter) => (
            <Button key={starter} type="button" variant="ghost" disabled={loading || typing} onClick={() => askChatbot(starter)}>
              <Sparkles className="size-4" /> {starter}
            </Button>
          ))}
        </div>

        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            askChatbot();
          }}
        >
          <Textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask about classes, professors, campus life, events, studying, housing basics..."
            className="min-h-20"
          />
          {error && <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={loading || typing || question.trim().length < 3} className="w-full sm:w-fit">
            <Send className="size-4" /> Ask chatbot
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
