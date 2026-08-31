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
  const [copyStatus, setCopyStatus] = useState("");

  async function submit(formData: FormData, modifier?: string) {
    setLoadingAction(modifier ?? "Generate draft");
    setError("");
    setCopyStatus("");
    const payload = {
      recipient: String(formData.get("recipient") ?? "").trim(),
      situation: String(formData.get("template") ?? "").trim(),
      details: String(formData.get("details") ?? "").trim(),
      desiredResult: String(formData.get("desiredResult") ?? "").trim(),
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
      const fallbackMessage = response.status === 400
        ? "Please complete the required fields and try again."
        : "The AI service could not answer right now. I made a safe draft from your details instead.";

      if (response.status !== 400) {
        const fallback = {
          mock: true,
          subject: payload.format === "Email" ? `Subject: Request about ${payload.situation}` : "",
          message: `Hi ${payload.recipient},\n\nI hope you are doing well. I am reaching out because ${payload.details}. Would it be possible to ${payload.desiredResult}?\n\nThank you,\n[Your name]`,
          explanation: `This uses a ${String(payload.tone).toLowerCase()} tone with a clear reason and one direct request.`,
          tip: "Review names, dates, course numbers, and any official policy details before sending.",
          reminder: "Generated fallback draft. Please edit it so it matches your exact situation."
        };

        setResult(fallback);
        setRevision(fallback.message);
      }

      setError(fallbackMessage);
      return;
    }
    const data = await response.json();
    setResult(data);
    setRevision(data.message);
  }

  async function copyDraft() {
    setCopyStatus("");
    try {
      await navigator.clipboard.writeText(revision);
      setCopyStatus("Copied.");
      return;
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = revision;
      textArea.setAttribute("readonly", "");
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      const copied = document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopyStatus(copied ? "Copied." : "Copy failed. Select the draft text and copy it manually.");
    }
  }

  function reviseDraft(label: string) {
    if (!formRef.current) {
      setError("Fill out the message details first, then try again.");
      return;
    }

    submit(new FormData(formRef.current), label);
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
                {result.subject && <p className="font-semibold text-navy">{result.subject}</p>}
                <Textarea value={revision} onChange={(event) => setRevision(event.target.value)} className="min-h-64" aria-label="Editable generated message" />
                <div className="grid gap-2 text-sm text-muted-foreground">
                  <p><span className="font-semibold text-navy">Why this tone works:</span> {result.explanation}</p>
                  <p><span className="font-semibold text-navy">Communication tip:</span> {result.tip}</p>
                  <p><span className="font-semibold text-navy">Reminder:</span> {result.reminder}</p>
                </div>
                {copyStatus && <p className="text-sm font-medium text-muted-foreground">{copyStatus}</p>}
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" onClick={copyDraft}><Copy className="size-4" /> Copy</Button>
                  {["Make it shorter", "Make it more formal", "Make it friendlier", "Regenerate"].map((label) => (
                    <Button
                      key={label}
                      type="button"
                      variant="ghost"
                      disabled={Boolean(loadingAction)}
                      onClick={() => reviseDraft(label)}
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
