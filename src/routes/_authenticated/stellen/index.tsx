import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ExternalLink, Loader2, Plus, RefreshCw, Sparkles } from "lucide-react";
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  EmptyState,
  PageHeader,
  Panel,
  SectionTitle,
  STATUS_OPTIONS,
  StatusBadge,
  statusLabel,
} from "@/components/shared/ui-bits";
import { aiStructureJob } from "@/lib/ai.functions";
import { searchJobFeeds } from "@/lib/jobsearch.functions";
import { companyCareersUrl, companyWebsiteUrl, portalSearchLinks } from "@/lib/joblinks";
import { useInsertRow, useJobs, useMatches, useSearchProfile } from "@/lib/queries";

type FeedRun = Awaited<ReturnType<typeof searchJobFeeds>>;

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
  const searchProfile = useSearchProfile();
  const insertJob = useInsertRow("job_postings", ["job_postings"]);
  const [open, setOpen] = useState(false);
  const [raw, setRaw] = useState("");
  const [busy, setBusy] = useState(false);
  const [statusFilter, setStatusFilter] = useState("alle");
  const [query, setQuery] = useState("");
  const [updating, setUpdating] = useState(false);
  const [run, setRun] = useState<(FeedRun & { imported: number }) | null>(null);

  const scoreByJob = useMemo(
    () => new Map((matches.data ?? []).map((m) => [m.job_posting_id, m.overall_score])),
    [matches.data],
  );

  const filtered = (jobs.data ?? []).filter((j) => {
    const matchesStatus = statusFilter === "alle" || j.status === statusFilter;
    const text = `${j.title} ${j.company} ${j.location ?? ""}`.toLowerCase();
    return matchesStatus && text.includes(query.toLowerCase());
  });

  const profileRoles = searchProfile.data?.target_roles?.length
    ? searchProfile.data.target_roles
    : ["Projektmanager", "Transformationsmanager"];
  const profileLocations = searchProfile.data?.regions?.length ? searchProfile.data.regions : [""];
  const portals =
    run?.portals ??
    profileRoles
      .slice(0, 2)
      .flatMap((role) => profileLocations.slice(0, 2).flatMap((loc) => portalSearchLinks(role, loc)))
      .filter((link, i, all) => all.findIndex((o) => o.url === link.url) === i);

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

  async function updateFeeds() {
    setUpdating(true);
    try {
      const profile = searchProfile.data;
      const result = await searchJobFeeds({
        data: {
          roles: profile?.target_roles?.length ? profile.target_roles : ["Projektmanager", "Transformationsmanager"],
          locations: profile?.regions ?? [],
          excluded: profile?.excluded_industries ?? [],
          perQuery: 25,
        },
      });

      const known = new Set((jobs.data ?? []).map((j) => j.original_url).filter(Boolean) as string[]);
      let imported = 0;
      for (const job of result.jobs) {
        if (known.has(job.url)) continue;
        await insertJob.mutateAsync({
          title: job.title,
          company: job.company,
          location: job.location || null,
          country: job.country || null,
          region: job.region || null,
          salary_range: job.salary_range || null,
          description: job.description || null,
          original_url: job.url,
          source: job.source,
          publication_date: job.publication_date,
          status: "gefunden",
        });
        known.add(job.url);
        imported += 1;
      }

      setRun({ ...result, imported });
      toast.success(
        imported > 0
          ? `${imported} neue Stellen übernommen (${result.scanned} Anzeigen durchsucht).`
          : `Keine neuen Stellen – ${result.scanned} Anzeigen durchsucht.`,
      );
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Stellensuche"
        description="Erfassen Sie Ausschreibungen, lassen Sie sie strukturieren und priorisieren Sie nach Passung."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={updateFeeds} disabled={updating}>
              {updating ? <Loader2 className="mr-2 size-4 animate-spin" /> : <RefreshCw className="mr-2 size-4" />}
              Neue Stellen suchen
            </Button>
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
          </div>
        }
      />

      <Panel className="mb-4">
        <Accordion type="multiple" defaultValue={["quellen"]}>
          <AccordionItem value="quellen" className="border-0">
            <AccordionTrigger className="py-1 hover:no-underline">
              <div className="text-left">
                <p className="font-display text-sm font-semibold">Durchsuchte Quellen</p>
                <p className="text-xs font-normal text-muted-foreground">
                  {run
                    ? `Letzte Aktualisierung: ${new Date(run.ran_at).toLocaleString("de-DE")} · ${run.scanned} Anzeigen durchsucht · ${run.matched} passend · ${run.imported} neu übernommen`
                    : "Noch keine Aktualisierung in dieser Sitzung – Suche startet mit den Zielrollen und Regionen aus Ihrem Suchprofil."}
                </p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2">
        {run ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 pr-3 font-medium">Quelle</th>
                    <th className="py-2 pr-3 font-medium">Suchbegriff</th>
                    <th className="py-2 pr-3 font-medium">Region</th>
                    <th className="py-2 pr-3 text-right font-medium">Durchsucht</th>
                    <th className="py-2 pr-3 text-right font-medium">Passend</th>
                    <th className="py-2 text-right font-medium">Treffer gesamt</th>
                  </tr>
                </thead>
                <tbody>
                  {run.sources.map((s, i) => (
                    <tr key={`${s.query}-${s.location}-${i}`} className="border-b border-border/60 last:border-0">
                      <td className="py-2 pr-3">
                        {s.url ? (
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 hover:underline"
                          >
                            {s.source} <ExternalLink className="size-3" />
                          </a>
                        ) : (
                          s.source
                        )}
                      </td>
                      <td className="py-2 pr-3">{s.query}</td>
                      <td className="py-2 pr-3 text-muted-foreground">{s.location}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">{s.scanned}</td>
                      <td className="py-2 pr-3 text-right tabular-nums font-medium">
                        {s.error ? <span className="text-destructive">Fehler</span> : s.matched}
                      </td>
                      <td className="py-2 text-right tabular-nums text-muted-foreground">
                        {s.available.toLocaleString("de-DE")}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-border font-medium">
                    <td className="py-2 pr-3" colSpan={3}>
                      Gesamt
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums">{run.scanned}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{run.matched}</td>
                    <td className="py-2" />
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Klicken Sie auf „Neue Stellen suchen“, um die angebundenen Stellenportale zu durchsuchen. Anschließend sehen
              Sie hier je Quelle, wie viele Anzeigen geprüft wurden und wie viele davon zu Ihrem Profil passen.
            </p>
          )}
  
  
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="weitere" className="border-0 border-t border-border">
            <AccordionTrigger className="py-3 hover:no-underline">
              <div className="text-left">
                <p className="font-display text-sm font-semibold">Weitere Quellen (DE, AT, CH, LI, LU)</p>
                <p className="text-xs font-normal text-muted-foreground">
                  Direktsuche in den grossen Stellenboersen und auf Firmen-Karriereseiten mit Ihren Zielrollen und Regionen.
                </p>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-wrap gap-2">
                {portals.map((p) => (
                  <a
                    key={p.url}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs hover:bg-muted"
                  >
                    {p.name}: {p.query}
                    {p.location ? ` · ${p.location}` : ""} <ExternalLink className="size-3" />
                  </a>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Panel>

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
                <div
                  className="flex flex-wrap items-center gap-3 text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  {job.original_url && (
                    <a
                      href={job.original_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:underline"
                    >
                      Stellenanzeige <ExternalLink className="size-3" />
                    </a>
                  )}
                  <a
                    href={companyWebsiteUrl(job.company)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:underline"
                  >
                    Firmenwebseite <ExternalLink className="size-3" />
                  </a>
                  <a
                    href={companyCareersUrl(job.company)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:underline"
                  >
                    Karriereseite <ExternalLink className="size-3" />
                  </a>
                  {job.source && <span className="text-muted-foreground">Quelle: {job.source}</span>}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}