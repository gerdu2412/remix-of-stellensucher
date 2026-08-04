import { createFileRoute, Link } from "@tanstack/react-router";
import { EmptyState, PageHeader, ScoreBar, StatusBadge } from "@/components/shared/ui-bits";
import { BulkMatchButton } from "@/components/shared/bulk-match";
import { useJobs, useMatches } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/match")({
  head: () => ({
    meta: [
      { title: "Match-Analysen – CareerPilot AI" },
      { name: "description", content: "Alle Match-Scores im Vergleich: Passung, Lücken und Priorisierung." },
      { property: "og:title", content: "Match-Analysen – CareerPilot AI" },
      { property: "og:description", content: "Phase 2: Passung aller Stellen im Überblick." },
    ],
  }),
  component: MatchPage,
});

function MatchPage() {
  const matches = useMatches();
  const jobs = useJobs();
  const jobById = new Map((jobs.data ?? []).map((j) => [j.id, j]));
  const list = [...(matches.data ?? [])].sort((a, b) => b.overall_score - a.overall_score);
  const openCount = (jobs.data ?? []).filter((j) => !list.some((m) => m.job_posting_id === j.id)).length;

  return (
    <div>
      <PageHeader
        title="Match-Analysen"
        description={
          openCount
            ? `Phase 2: Vergleich aller analysierten Stellen nach Passung. ${openCount} Stellen noch ohne Analyse.`
            : "Phase 2: Vergleich aller analysierten Stellen nach Passung."
        }
        actions={<BulkMatchButton />}
      />
      {list.length === 0 ? (
        <EmptyState
          title="Noch keine Analysen"
          description="Starten Sie die Analyse für alle Stellen oder öffnen Sie eine Stellendetailseite."
        />
      ) : (
        <div className="space-y-3">
          {list.map((m) => {
            const job = jobById.get(m.job_posting_id);
            return (
              <Link
                key={m.id}
                to="/stellen/$jobId"
                params={{ jobId: m.job_posting_id }}
                className="panel panel-hover block p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-display text-base font-semibold">{job?.title ?? "Stelle"}</p>
                    <p className="text-sm text-muted-foreground">{job?.company}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {job && <StatusBadge status={job.status} />}
                    <span className="font-display text-xl font-semibold">{m.overall_score}%</span>
                  </div>
                </div>
                <div className="mt-3">
                  <ScoreBar label={m.outlook ?? "Gesamtpassung"} score={m.overall_score} />
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{m.summary}</p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}