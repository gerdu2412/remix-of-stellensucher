import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, STATUS_OPTIONS, statusLabel } from "@/components/shared/ui-bits";
import { Button } from "@/components/ui/button";
import { useJobs, useUpdateRow } from "@/lib/queries";

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
  const list = jobs.data ?? [];

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