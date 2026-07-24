"use client";

import { useRef, useState } from "react";
import { Copy, RefreshCcw, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/input";

type AssistantResponse = {
  mock: boolean;
  subject?: string;
  message: string;
  explanation: string;
  tip: string;
  reminder: string;
};

const templates = [
  "Emailing a professor about missing class",
  "Asking a professor for clarification",
  "Contacting an academic advisor",
  "Asking a teaching assistant for help",
  "Inviting classmates to a study group",
  "Asking a roommate to reduce noise",
  "Following up after receiving no reply",
  "Requesting an appointment",
  "Asking about a campus job",
  "Writing a polite group-project message"
];

export default function AssistantPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [result, setResult] = useState<AssistantResponse | null>(null);
  const [loadingAction, setLoadingAction] = useState("");
  const [error, setError] = useState("");
  const [revision, setRevision] = useState("");

  async function submit(formData: FormData, modifier?: string) {
    setLoadingAction(modifier ?? "Generate draft");
    setError("");
    const payload = {
      recipient: String(formData.get("recipient")),
      situation: String(formData.get("template")),
      details: String(formData.get("details")),
      desiredResult: String(formData.get("desiredResult")),
      tone: modifier === "Make it more formal" ? "Formal" : modifier === "Make it friendlier" ? "Friendly" : String(formData.get("tone")),
      format: String(formData.get("format")),
      currentDraft: modifier ? revision : undefined,
      revisionInstruction: modifier
    };
    const response = await fetch("/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    setLoadingAction("");
    if (!response.ok) {
      setError("Please complete the required fields and try again.");
      return;
    }
    const data = await response.json();
    setResult(data);
    setRevision(data.message);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <section>
        <h1 className="text-3xl font-bold text-navy">Communication Helper</h1>
        <p className="mt-2 text-muted-foreground">Draft respectful university messages without inventing policies, facts, or official guidance.</p>
        <Card className="mt-6">
          <CardHeader><CardTitle>Message details</CardTitle></CardHeader>
          <CardContent>
            <form
              ref={formRef}
              className="grid gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                submit(new FormData(event.currentTarget));
              }}
            >
              <label className="grid gap-2 text-sm font-medium text-navy">
                Situation template
                <Select name="template">{templates.map((template) => <option key={template}>{template}</option>)}</Select>
              </label>
              <label className="grid gap-2 text-sm font-medium text-navy">
                Recipient or relationship
                <Input name="recipient" required placeholder="Professor Lee, my TA, my roommate..." />
              </label>
              <label className="grid gap-2 text-sm font-medium text-navy">
                Important details
                <Textarea name="details" required placeholder="Course, assignment, dates, what happened, what you already tried..." />
              </label>
              <label className="grid gap-2 text-sm font-medium text-navy">
                Desired result
                <Input name="desiredResult" required placeholder="schedule a meeting, ask for clarification, reduce noise..." />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium text-navy">
                  Tone
                  <Select name="tone">
                    {["Polite", "Friendly", "Formal", "Direct but respectful"].map((tone) => <option key={tone}>{tone}</option>)}
                  </Select>
                </label>
                <label className="grid gap-2 text-sm font-medium text-navy">
                  Format
                  <Select name="format">
                    {["Email", "Text message", "Group-chat message", "In-person conversation outline"].map((format) => <option key={format}>{format}</option>)}
                  </Select>
                </label>
              </div>
              {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
              <Button type="submit" disabled={Boolean(loadingAction)}><Wand2 className="size-4" /> {loadingAction === "Generate draft" ? "Drafting..." : "Generate draft"}</Button>
            </form>
          </CardContent>
        </Card>
      </section>
      <section>
        <Card>
          <CardHeader><CardTitle>Assistant result</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            {!result && <p className="rounded-md bg-muted p-4 text-sm text-muted-foreground">Your draft will appear here with a subject line, message, tone explanation, communication tip, and review reminder.</p>}
            {result && (
              <>
                {result.mock && <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Development fallback: no Groq API key is configured.</p>}
                {result.subject && <p className="font-semibold text-navy">{result.subject}</p>}
                <Textarea value={revision} onChange={(event) => setRevision(event.target.value)} className="min-h-64" aria-label="Editable generated message" />
                <div className="grid gap-2 text-sm text-muted-foreground">
                  <p><span className="font-semibold text-navy">Why this tone works:</span> {result.explanation}</p>
                  <p><span className="font-semibold text-navy">Communication tip:</span> {result.tip}</p>
                  <p><span className="font-semibold text-navy">Reminder:</span> {result.reminder}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => navigator.clipboard.writeText(revision)}><Copy className="size-4" /> Copy</Button>
                  {["Make it shorter", "Make it more formal", "Make it friendlier", "Regenerate"].map((label) => (
                    <Button
                      key={label}
                      variant="ghost"
                      disabled={Boolean(loadingAction)}
                      onClick={() => {
                        if (!formRef.current) return;
                        submit(new FormData(formRef.current), label);
                      }}
                    >
                      <RefreshCcw className="size-4" /> {loadingAction === label ? "Working..." : label}
                    </Button>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
