import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Briefcase, FileText, MessagesSquare, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, StatusBadge, ScoreRing } from "@/components/shared/ui-bits";
import { useApplications, useDocuments, useJobs, useMatches, useSearchProfile } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard – CareerPilot AI" },
      { name: "description", content: "Überblick über Stellen, Match-Scores, Unterlagen und Interviewvorbereitung." },
      { property: "og:title", content: "Dashboard – CareerPilot AI" },
      { property: "og:description", content: "Alle Bewerbungsaktivitäten auf einen Blick." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const jobs = useJobs();
  const matches = useMatches();
  const documents = useDocuments();
  const applications = useApplications();
  const profile = useSearchProfile();

  const jobList = jobs.data ?? [];
  const matchList = matches.data ?? [];
  const topMatches = [...matchList].sort((a, b) => b.overall_score - a.overall_score).slice(0, 4);
  const avgScore = matchList.length
    ? Math.round(matchList.reduce((sum, m) => sum + m.overall_score, 0) / matchList.length)
    : 0;
  const activeApplications = (applications.data ?? []).filter(
    (a) => !["absage", "zurueckgezogen"].includes(a.status),
  ).length;

  const stats = [
    { label: "Stellen im Blick", value: jobList.length, icon: Briefcase, to: "/stellen" },
    { label: "Analysierte Matches", value: matchList.length, icon: Target, to: "/stellen" },
    { label: "Unterlagen", value: (documents.data ?? []).length, icon: FileText, to: "/dokumente" },
    { label: "Aktive Bewerbungen", value: activeApplications, icon: MessagesSquare, to: "/bewerbungen" },
  ];

  const jobById = new Map(jobList.map((j) => [j.id, j]));

  return (
    <div>
      <PageHeader
        title="Willkommen zurück"
        description="Ihr aktueller Stand über alle fünf Phasen des Bewerbungsprozesses."
        actions={
          <Button asChild>
            <Link to="/stellen">Stellen verwalten</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className="panel panel-hover block p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <s.icon className="size-4 text-primary" />
            </div>
            <p className="mt-3 font-display text-3xl font-semibold">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Beste Übereinstimmungen</h2>
            <Link to="/stellen" className="text-sm text-primary hover:underline">
              Alle Stellen
            </Link>
          </div>
          <div className="space-y-3">
            {topMatches.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Noch keine Match-Analyse vorhanden. Legen Sie eine Stelle an und starten Sie die Analyse.
              </p>
            )}
            {topMatches.map((m) => {
              const job = jobById.get(m.job_posting_id);
              return (
                <Link
                  key={m.id}
                  to="/stellen/$jobId"
                  params={{ jobId: m.job_posting_id }}
                  className="flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-primary/40"
                >
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-border font-display text-sm font-semibold">
                    {m.overall_score}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{job?.title ?? "Stelle"}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {job?.company} · {job?.location ?? "—"}
                    </p>
                  </div>
                  {job && <StatusBadge status={job.status} />}
                  <ArrowRight className="size-4 text-muted-foreground" />
                </Link>
              );
            })}
          </div>
        </Panel>

        <Panel>
          <h2 className="font-display text-lg font-semibold">Durchschnittlicher Match</h2>
          <div className="mt-4 flex justify-center">
            <ScoreRing score={avgScore} />
          </div>
          <div className="mt-5 space-y-2 text-sm">
            <p className="text-muted-foreground">
              {profile.data
                ? `Zielrollen: ${(profile.data.target_roles ?? []).slice(0, 3).join(", ") || "nicht definiert"}`
                : "Noch kein Suchprofil hinterlegt."}
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/profil">Suchprofil bearbeiten</Link>
            </Button>
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          { title: "Phase 1 – Suchprofil", text: "Profil schärfen und Stellen erfassen.", to: "/profil" },
          { title: "Phase 2–4 – Analyse & Unterlagen", text: "Match, Strategie, Anschreiben und CV.", to: "/dokumente" },
          { title: "Phase 5 – Interview", text: "Fragen, Antworten und Simulation.", to: "/interview" },
        ].map((c) => (
          <Link key={c.title} to={c.to} className="panel panel-hover block p-5">
            <p className="text-sm font-semibold">{c.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{c.text}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}