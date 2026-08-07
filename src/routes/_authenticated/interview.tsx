import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { useSimpleChat } from "@/lib/use-simple-chat";
import { Loader2, Mic, Send, Square, ExternalLink, Newspaper } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, Panel, SectionTitle } from "@/components/shared/ui-bits";
import { useJobs, useMasterCv } from "@/lib/queries";
import { useVoiceInput } from "@/lib/use-voice-input";
import { companyCareersUrl, companyContextLinks, companyNewsUrl, companyWebsiteUrl } from "@/lib/joblinks";

export const Route = createFileRoute("/_authenticated/interview")({
  head: () => ({
    meta: [
      { title: "Interviewtraining – CareerPilot AI" },
      { name: "description", content: "Realistische Interviewsimulation mit Feedback zu jeder Antwort." },
      { property: "og:title", content: "Interviewtraining – CareerPilot AI" },
      { property: "og:description", content: "Phase 5: Interviewsimulation und Feedback." },
    ],
  }),
  component: InterviewPage,
});

const TYPES = [
  { value: "hr", label: "HR-Interview" },
  { value: "fach", label: "Fachinterview" },
  { value: "management", label: "Management-Interview" },
  { value: "stress", label: "Stressinterview" },
  { value: "final", label: "Finalrunde" },
];

function InterviewPage() {
  const jobs = useJobs();
  const cv = useMasterCv();
  const [jobId, setJobId] = useState("");
  const [type, setType] = useState("hr");
  const [input, setInput] = useState("");
  const [autoSend, setAutoSend] = useState(true);

  const job = (jobs.data ?? []).find((j) => j.id === jobId);
  const setup = `Interviewtyp: ${type}. Stelle: ${job ? `${job.title} bei ${job.company}\n${job.description ?? ""}` : "allgemein"}.\nLebenslauf der Kandidatin oder des Kandidaten:\n${cv.data?.extracted_text ?? "(nicht hinterlegt)"}`;

  const onError = useCallback((message: string) => toast.error(message), []);
  const { messages, send, isLoading } = useSimpleChat(onError);

  function submit(text: string) {
    if (!text.trim()) return;
    void send(text, setup);
    setInput("");
  }

  const onTranscript = useCallback(
    (text: string) => {
      if (autoSend) {
        void send(text, setup);
        setInput("");
      } else {
        setInput((current) => (current ? `${current} ${text}` : text));
      }
    },
    [autoSend, send, setup],
  );
  const voice = useVoiceInput({ onTranscript, onError });

  const facts = job
    ? ([
        ["Unternehmen", job.company],
        ["Position", job.title],
        ["Ort", [job.location, job.region, job.country].filter(Boolean).join(", ")],
        ["Remote-Anteil", job.remote_share],
        ["Level", job.seniority],
        ["Gehalt", job.salary_range],
        ["Ansprechpartner", job.contact_person],
        ["Veröffentlicht", job.publication_date],
        ["Bewerbungsfrist", job.deadline],
        ["Quelle", job.source],
      ] as [string, string | null | undefined][]).filter(([, value]) => value)
    : [];

  return (
    <div>
      <PageHeader
        title="Interviewtraining"
        description="Phase 5: Simulieren Sie ein Gespräch und erhalten Sie nach jeder Antwort Feedback."
      />
      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        {job && (
          <div className="grid gap-4 lg:col-span-2 lg:grid-cols-2">
            <Panel className="space-y-2">
              <SectionTitle>Stellenanzeige</SectionTitle>
              <p className="text-sm font-medium">
                {job.title} · {job.company}
              </p>
              <div className="max-h-72 overflow-y-auto whitespace-pre-wrap text-sm text-muted-foreground">
                {job.description?.trim() || "Für diese Stelle ist kein Anzeigentext hinterlegt."}
              </div>
              {job.original_url && (
                <a
                  href={job.original_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary underline"
                >
                  <ExternalLink className="size-3.5" /> Originalanzeige öffnen
                </a>
              )}
            </Panel>

            <Panel className="space-y-3">
              <SectionTitle>Kontext zur Stelle und Firma</SectionTitle>
              <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                {facts.map(([label, value]) => (
                  <div key={label} className="contents">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="truncate" title={String(value)}>
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="flex flex-wrap gap-2 pt-1">
                <a
                  href={companyWebsiteUrl(job.company)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-accent"
                >
                  <ExternalLink className="size-3.5" /> Homepage
                </a>
                <a
                  href={companyCareersUrl(job.company)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-accent"
                >
                  <ExternalLink className="size-3.5" /> Karriereseite
                </a>
                {job.original_url && (
                  <a
                    href={job.original_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-accent"
                  >
                    <ExternalLink className="size-3.5" /> Stellenausschreibung
                  </a>
                )}
                <a
                  href={companyNewsUrl(job.company)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-accent"
                >
                  <Newspaper className="size-3.5" /> Nachrichten (6 Monate)
                </a>
                {companyContextLinks(job.company).map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-accent"
                  >
                    <ExternalLink className="size-3.5" /> {link.name}
                  </a>
                ))}
              </div>
            </Panel>
          </div>
        )}

        <Panel className="space-y-4">
          <SectionTitle>Rahmen</SectionTitle>
          <Select value={jobId} onValueChange={setJobId}>
            <SelectTrigger>
              <SelectValue placeholder="Stelle wählen" />
            </SelectTrigger>
            <SelectContent>
              {(jobs.data ?? []).map((j) => (
                <SelectItem key={j.id} value={j.id}>
                  {j.title} · {j.company}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button className="w-full" onClick={() => submit("Bitte starte die Interviewsimulation mit der ersten Frage.")}>
            Simulation starten
          </Button>
          <Button variant="outline" className="w-full" onClick={() => submit("Gesamtfeedback")}>
            Gesamtfeedback anfordern
          </Button>
          <div className="space-y-2 border-t border-border pt-3">
            <SectionTitle>Spracheingabe</SectionTitle>
            <Button
              variant={voice.isRecording ? "destructive" : "outline"}
              className="w-full"
              onClick={voice.toggle}
              disabled={voice.isTranscribing}
            >
              {voice.isTranscribing ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : voice.isRecording ? (
                <Square className="mr-2 size-4" />
              ) : (
                <Mic className="mr-2 size-4" />
              )}
              {voice.isTranscribing ? "Wird transkribiert …" : voice.isRecording ? "Aufnahme stoppen" : "Antwort sprechen"}
            </Button>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input type="checkbox" checked={autoSend} onChange={(e) => setAutoSend(e.target.checked)} />
              Gesprochene Antwort direkt senden
            </label>
          </div>
        </Panel>

        <Panel className="flex min-h-[60vh] flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto pr-1">
            {messages.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Wählen Sie eine Stelle und den Interviewtyp und starten Sie die Simulation.
              </p>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.role === "user"
                    ? "ml-auto max-w-[85%] rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
                    : "max-w-[85%] rounded-lg border border-border bg-card px-4 py-2 text-sm"
                }
              >
                <span className="whitespace-pre-wrap">{message.text}</span>
              </div>
            ))}
            {isLoading && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
          </div>
          <form
            className="mt-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              submit(input);
            }}
          >
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ihre Antwort …" />
            <Button
              type="button"
              variant={voice.isRecording ? "destructive" : "outline"}
              onClick={voice.toggle}
              disabled={voice.isTranscribing}
              aria-label={voice.isRecording ? "Aufnahme stoppen" : "Antwort sprechen"}
            >
              {voice.isTranscribing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : voice.isRecording ? (
                <Square className="size-4" />
              ) : (
                <Mic className="size-4" />
              )}
            </Button>
            <Button type="submit" disabled={isLoading} aria-label="Senden">
              <Send className="size-4" />
            </Button>
          </form>
        </Panel>
      </div>
    </div>
  );
}