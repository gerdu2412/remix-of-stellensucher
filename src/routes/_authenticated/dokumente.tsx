import { createFileRoute, Link } from "@tanstack/react-router";
import { EmptyState, PageHeader, Panel } from "@/components/shared/ui-bits";
import { Badge } from "@/components/ui/badge";
import { useDocuments, useJobs } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/dokumente")({
  head: () => ({
    meta: [
      { title: "Dokumente – CareerPilot AI" },
      { name: "description", content: "Alle Anschreiben und Lebenslauf-Versionen zu Ihren Bewerbungen." },
      { property: "og:title", content: "Dokumente – CareerPilot AI" },
      { property: "og:description", content: "Phase 4: Bewerbungsunterlagen verwalten." },
    ],
  }),
  component: DokumentePage,
});

function DokumentePage() {
  const documents = useDocuments();
  const jobs = useJobs();
  const jobById = new Map((jobs.data ?? []).map((j) => [j.id, j]));
  const list = documents.data ?? [];

  return (
    <div>
      <PageHeader title="Dokumente" description="Phase 4: Anschreiben und Lebenslauf-Versionen je Stelle." />
      {list.length === 0 ? (
        <EmptyState
          title="Noch keine Unterlagen"
          description="Erstellen Sie ein Anschreiben in der Stellendetailansicht unter „Anschreiben“."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((doc) => {
            const job = doc.job_posting_id ? jobById.get(doc.job_posting_id) : undefined;
            return (
              <Panel key={doc.id} className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-display text-base font-semibold">{doc.title ?? doc.document_type}</p>
                  <Badge variant="outline">{doc.status === "freigegeben" ? "Freigegeben" : "Entwurf"}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {job ? `${job.title} · ${job.company}` : "Ohne Stellenbezug"} · Version {doc.version}
                  {doc.tone ? ` · ${doc.tone}` : ""}
                </p>
                {job && (
                  <Link
                    to="/stellen/$jobId"
                    params={{ jobId: job.id }}
                    className="text-sm text-primary hover:underline"
                  >
                    Dokument öffnen
                  </Link>
                )}
              </Panel>
            );
          })}
        </div>
      )}
    </div>
  );
}