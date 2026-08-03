import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Loader2, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  EmptyState,
  PageHeader,
  STATUS_OPTIONS,
  StatusBadge,
  statusLabel,
} from "@/components/shared/ui-bits";
import { aiStructureJob } from "@/lib/ai.functions";
import { useInsertRow, useJobs, useMatches } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/stellen/")({
  head: () => ({
    meta: [
      { title: "Stellensuche – CareerPilot AI" },
      { name: "description", content: "Passende Stellen erfassen, strukturieren und nach Match-Score priorisieren." },
      { property: "og:title", content: "Stellensuche – CareerPilot AI" },
      { property: "og:description", content: "Phase 1: Stellenrecherche und Priorisierung." },
    ],
  }),
  component: StellenPage,
});

function StellenPage() {
  const jobs = useJobs();
  const matches = useMatches();
  const insertJob = useInsertRow("job_postings", ["job_postings"]);
  const [open, setOpen] = useState(false);
  const [raw, setRaw] = useState("");
  const [busy, setBusy] = useState(false);
  const [statusFilter, setStatusFilter] = useState("alle");
  const [query, setQuery] = useState("");

  const scoreByJob = useMemo(
    () => new Map((matches.data ?? []).map((m) => [m.job_posting_id, m.overall_score])),
    [matches.data],
  );

  const filtered = (jobs.data ?? []).filter((j) => {
    const matchesStatus = statusFilter === "alle" || j.status === statusFilter;
    const text = `${j.title} ${j.company} ${j.location ?? ""}`.toLowerCase();
    return matchesStatus && text.includes(query.toLowerCase());
  });

  async function importJob() {
    if (raw.trim().length < 30) {
      toast.error("Bitte den Ausschreibungstext einfügen.");
      return;
    }
    setBusy(true);
    try {
      const parsed = await aiStructureJob({ data: { text: raw } });
      await insertJob.mutateAsync({
        title: parsed.title || "Unbenannte Stelle",
        company: parsed.company || "Unbekannt",
        location: parsed.location,
        country: parsed.country,
        region: parsed.region,
        remote_share: parsed.remote_share,
        seniority: parsed.seniority,
        salary_range: parsed.salary_range,
        contact_person: parsed.contact_person,
        description: parsed.description || raw,
        status: "gefunden",
      });
      toast.success("Stelle übernommen.");
      setRaw("");
      setOpen(false);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Stellensuche"
        description="Erfassen Sie Ausschreibungen, lassen Sie sie strukturieren und priorisieren Sie nach Passung."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 size-4" /> Stelle hinzufügen
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Stellenausschreibung erfassen</DialogTitle>
                <DialogDescription>
                  Text der Ausschreibung einfügen – die KI extrahiert Titel, Unternehmen, Standort und Anforderungen.
                </DialogDescription>
              </DialogHeader>
              <Textarea rows={12} value={raw} onChange={(e) => setRaw(e.target.value)} placeholder="Ausschreibungstext …" />
              <DialogFooter>
                <Button onClick={importJob} disabled={busy}>
                  {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Sparkles className="mr-2 size-4" />}
                  Strukturieren und speichern
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="suche" className="sr-only">
            Suche
          </Label>
          <Input id="suche" placeholder="Nach Titel, Unternehmen oder Ort suchen" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:w-56">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alle">Alle Status</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {statusLabel(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Keine Stellen gefunden"
          description="Fügen Sie eine Ausschreibung hinzu, um Match-Analyse, Strategie und Unterlagen zu starten."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((job) => {
            const score = scoreByJob.get(job.id);
            return (
              <Link
                key={job.id}
                to="/stellen/$jobId"
                params={{ jobId: job.id }}
                className="panel panel-hover flex flex-col gap-3 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-display text-base font-semibold">{job.title}</h2>
                    <p className="truncate text-sm text-muted-foreground">{job.company}</p>
                  </div>
                  {typeof score === "number" && (
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-border font-display text-sm font-semibold">
                      {score}
                    </div>
                  )}
                </div>
                <p className="line-clamp-3 text-xs text-muted-foreground">{job.description}</p>
                <div className="mt-auto flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <StatusBadge status={job.status} />
                  <span>{job.location ?? "Ort offen"}</span>
                  {job.remote_share && <span>· {job.remote_share}</span>}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}