import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, STATUS_OPTIONS, statusLabel } from "@/components/shared/ui-bits";
import { Button } from "@/components/ui/button";
import { aiCoverLetter, aiTailoredCv } from "@/lib/ai.functions";
import { useDocuments, useJobs, useMasterCv, useMatches, useUpdateRow, useUpsertRow } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/bewerbungen")({
  head: () => ({
    meta: [
      { title: "Bewerbungen – CareerPilot AI" },
      { name: "description", content: "Kanban-Board über alle Bewerbungen von der Recherche bis zum Angebot." },
      { property: "og:title", content: "Bewerbungen – CareerPilot AI" },
      { property: "og:description", content: "Bewerbungspipeline im Blick behalten." },
    ],
  }),
  component: BewerbungenPage,
});

function BewerbungenPage() {
  const jobs = useJobs();
  const updateJob = useUpdateRow("job_postings", ["job_postings"]);
  const cv = useMasterCv();
  const matches = useMatches();
  const documents = useDocuments();
  const saveDocument = useUpsertRow("application_documents", ["application_documents"]);
  const [busy, setBusy] = useState<string | null>(null);
  const list = jobs.data ?? [];

  const cvText = cv.data?.extracted_text ?? "";

  function docFor(jobId: string, type: string) {
    return (documents.data ?? []).find((d) => d.job_posting_id === jobId && d.document_type === type);
  }

  async function createDocuments(job: { id: string; title: string; company: string; description: string | null; contact_person?: string | null }) {
    if (cvText.trim().length < 30) {
      toast.error("Bitte zuerst den Master-Lebenslauf hochladen.");
      return;
    }
    setBusy(job.id);
    try {
      const jobText = `${job.title} bei ${job.company}\n${job.description ?? ""}`;
      const matchContext = JSON.stringify((matches.data ?? []).find((m) => m.job_posting_id === job.id) ?? {});
      const letter = await aiCoverLetter({
        data: {
          cvText,
          jobText,
          strategyContext: "",
          tone: "strategisch und executive",
          contactPerson: job.contact_person ?? "",
        },
      });
      const existingLetter = docFor(job.id, "anschreiben");
      await saveDocument.mutateAsync({
        ...(existingLetter?.id ? { id: existingLetter.id } : {}),
        job_posting_id: job.id,
        document_type: "anschreiben",
        title: `Anschreiben ${job.company}`,
        tone: "strategisch und executive",
        status: "entwurf",
        content: letter as unknown as Record<string, unknown>,
        version: (existingLetter?.version ?? 0) + 1,
      });

      const tailored = await aiTailoredCv({ data: { cvText, jobText, matchContext } });
      const existingCv = docFor(job.id, "lebenslauf");
      await saveDocument.mutateAsync({
        ...(existingCv?.id ? { id: existingCv.id } : {}),
        job_posting_id: job.id,
        document_type: "lebenslauf",
        title: `Lebenslauf ${job.company}`,
        status: "entwurf",
        content: tailored as unknown as Record<string, unknown>,
        version: (existingCv?.version ?? 0) + 1,
      });
      toast.success("Unterlagen erstellt, bitte inhaltlich prüfen.");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <PageHeader title="Bewerbungen" description="Status je Stelle pflegen und den Fortschritt verfolgen." />
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUS_OPTIONS.map((status) => {
          const items = list.filter((j) => j.status === status);
          return (
            <div key={status} className="w-72 shrink-0">
              <div className="mb-2 flex items-center justify-between px-1">
                <p className="text-sm font-semibold">{statusLabel(status)}</p>
                <span className="text-xs text-muted-foreground">{items.length}</span>
              </div>
              <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-3">
                {items.length === 0 && <p className="text-xs text-muted-foreground">Keine Einträge</p>}
                {items.map((job) => {
                  const index = STATUS_OPTIONS.indexOf(status);
                  const hasDocs = Boolean(docFor(job.id, "anschreiben") || docFor(job.id, "lebenslauf"));
                  return (
                    <div key={job.id} className="rounded-md border border-border bg-card p-3">
                      <Link
                        to="/stellen/$jobId"
                        params={{ jobId: job.id }}
                        className="text-sm font-medium hover:underline"
                      >
                        {job.title}
                      </Link>
                      <p className="mt-0.5 text-xs text-muted-foreground">{job.company}</p>
                      <div className="mt-2 space-y-1.5">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="w-full"
                          disabled={busy === job.id}
                          onClick={() => createDocuments(job)}
                        >
                          {busy === job.id ? (
                            <Loader2 className="mr-2 size-4 animate-spin" />
                          ) : (
                            <Sparkles className="mr-2 size-4" />
                          )}
                          Unterlagen erstellen
                        </Button>
                        {hasDocs && (
                          <Link
                            to="/stellen/$jobId"
                            params={{ jobId: job.id }}
                            hash="unterlagen"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <FileText className="size-3.5" /> Unterlagen öffnen
                          </Link>
                        )}
                      </div>
                      <div className="mt-2 flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={index <= 0}
                          onClick={() =>
                            updateJob.mutate({ id: job.id, values: { status: STATUS_OPTIONS[index - 1] } })
                          }
                        >
                          Zurück
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={index >= STATUS_OPTIONS.length - 1}
                          onClick={() =>
                            updateJob.mutate({ id: job.id, values: { status: STATUS_OPTIONS[index + 1] } })
                          }
                        >
                          Weiter
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}