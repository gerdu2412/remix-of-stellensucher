import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Loader2, Plus, RefreshCw, Sparkles, Trash2, Wrench } from "lucide-react";
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
  STATUS_OPTIONS,
  StatusBadge,
  statusLabel,
} from "@/components/shared/ui-bits";
import { aiStructureJob } from "@/lib/ai.functions";
import { BulkMatchButton } from "@/components/shared/bulk-match";
import { searchJobFeeds } from "@/lib/jobsearch.functions";
import { DEFAULT_ACTIVE_PROVIDERS, JOB_PROVIDERS, PROVIDER_GROUP_LABEL, type ProviderGroup } from "@/lib/jobproviders";
import { companyCareersUrl, companyWebsiteUrl, portalSearchLinks } from "@/lib/joblinks";
import { useInsertRow, useJobs, useMatches, useSearchProfile } from "@/lib/queries";

type FeedRun = Awaited<ReturnType<typeof searchJobFeeds>>;

type CustomSource = { id: string; label: string; url: string; enabled: boolean };

const DEFAULT_TERMS = [
  "Strategieentwicklung",
  "Unternehmensentwicklung",
  "Digitale Transformation",
  "Organisationsentwicklung",
  "Prozessmanagement",
  "Prozessoptimierung",
  "Projektmanagement",
  "Programmmanagement",
  "Produktmanagement",
  "Business Excellence",
  "Innovation Management",
  "KI-Transformation",
  "Consulting",
  "ASPICE",
  "Systemengineering",
  "Systems Engineering",
];

const ANY_REGION = "Egal (überall)";
const DEFAULT_REGIONS = [
  ANY_REGION,
  "Rheinland-Pfalz",
  "Hessen",
  "Bayern",
  "Baden-Württemberg",
  "Nordrhein-Westfalen",
  "Österreich",
  "Schweiz",
  "Luxemburg",
  "Remote",
];
const PRIORITY_REGIONS = [ANY_REGION, "Rheinland-Pfalz", "Hessen", "Bayern"];

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
  const RUN_STORAGE_KEY = "careerpilot.stellen.lastRun";
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
  const [run, setRunState] = useState<(FeedRun & { imported: number }) | null>(null);
  const [customTerms, setCustomTerms] = useState<string[]>([]);
  const [newTerm, setNewTerm] = useState("");
  const [activeTerms, setActiveTerms] = useState<string[]>(DEFAULT_TERMS);
  const [customRegions, setCustomRegions] = useState<string[]>([]);
  const [newRegion, setNewRegion] = useState("");
  const [fixOpen, setFixOpen] = useState(false);
  const [activeRegions, setActiveRegions] = useState<string[]>(PRIORITY_REGIONS);
  const PROVIDER_STORAGE_KEY = "careerpilot.stellen.providers";
  const [activeProviders, setActiveProvidersState] = useState<string[]>(DEFAULT_ACTIVE_PROVIDERS);
  const CUSTOM_SOURCE_STORAGE_KEY = "careerpilot.stellen.customSources";
  const [customSources, setCustomSourcesState] = useState<CustomSource[]>([]);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [sourceLabel, setSourceLabel] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CUSTOM_SOURCE_STORAGE_KEY);
      if (stored) setCustomSourcesState(JSON.parse(stored) as CustomSource[]);
    } catch {
      /* ignorieren */
    }
  }, []);

  function setCustomSources(next: CustomSource[]) {
    setCustomSourcesState(next);
    try {
      localStorage.setItem(CUSTOM_SOURCE_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignorieren */
    }
  }

  function addCustomSource() {
    const label = sourceLabel.trim();
    const url = sourceUrl.trim();
    if (!label || !/^https?:\/\//i.test(url)) {
      toast.error("Bitte Name und vollständige URL (mit https://) angeben.");
      return;
    }
    if (customSources.some((s) => s.url === url)) {
      toast.error("Diese Quelle ist bereits gespeichert.");
      return;
    }
    setCustomSources([
      ...customSources,
      { id: `custom-${Date.now()}`, label, url, enabled: true },
    ]);
    setSourceLabel("");
    setSourceUrl("");
    setSourceOpen(false);
    toast.success("Quelle gespeichert – sie wird bei jeder Suche durchsucht.");
  }

  function toggleCustomSource(id: string) {
    setCustomSources(customSources.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
  }

  function removeCustomSource(id: string) {
    setCustomSources(customSources.filter((s) => s.id !== id));
  }

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PROVIDER_STORAGE_KEY);
      if (stored) setActiveProvidersState(JSON.parse(stored) as string[]);
    } catch {
      /* ignorieren */
    }
  }, []);

  function setActiveProviders(next: string[]) {
    setActiveProvidersState(next);
    try {
      localStorage.setItem(PROVIDER_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignorieren */
    }
  }

  function toggleProvider(id: string) {
    setActiveProviders(
      activeProviders.includes(id) ? activeProviders.filter((p) => p !== id) : [...activeProviders, id],
    );
  }

  // Letzten Suchlauf lokal speichern, damit die Tabellen bis zur naechsten Aktualisierung erhalten bleiben.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RUN_STORAGE_KEY);
      if (stored) setRunState(JSON.parse(stored) as FeedRun & { imported: number });
    } catch {
      /* ignorieren */
    }
  }, []);

  function setRun(value: (FeedRun & { imported: number }) | null) {
    setRunState(value);
    try {
      if (value) localStorage.setItem(RUN_STORAGE_KEY, JSON.stringify(value));
      else localStorage.removeItem(RUN_STORAGE_KEY);
    } catch {
      /* ignorieren */
    }
  }

  const matchByJob = useMemo(
    () => new Map((matches.data ?? []).map((m) => [m.job_posting_id, m])),
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
  const allTerms = useMemo(
    () => [...new Set([...profileRoles, ...DEFAULT_TERMS, ...customTerms])],
    [profileRoles.join("|"), customTerms],
  );
  const selectedTerms = activeTerms.filter((t) => allTerms.includes(t));

  const allRegions = useMemo(
    () => [...new Set([...DEFAULT_REGIONS, ...(searchProfile.data?.regions ?? []).filter(Boolean), ...customRegions])],
    [searchProfile.data?.regions?.join("|"), customRegions],
  );
  const selectedRegions = activeRegions.filter((r) => allRegions.includes(r));
  const searchLocations = useMemo(
    () => [...new Set(selectedRegions.map((r) => (r === ANY_REGION ? "" : r)))],
    [selectedRegions.join("|")],
  );

  function toggleRegion(region: string) {
    setActiveRegions((prev) => (prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]));
  }

  function addRegion() {
    const value = newRegion.trim();
    if (!value) return;
    if (!allRegions.includes(value)) setCustomRegions((prev) => [...prev, value]);
    setActiveRegions((prev) => (prev.includes(value) ? prev : [...prev, value]));
    setNewRegion("");
  }

  function toggleTerm(term: string) {
    setActiveTerms((prev) => (prev.includes(term) ? prev.filter((t) => t !== term) : [...prev, term]));
  }

  function addTerm() {
    const value = newTerm.trim();
    if (!value) return;
    if (!allTerms.includes(value)) setCustomTerms((prev) => [...prev, value]);
    setActiveTerms((prev) => (prev.includes(value) ? prev : [...prev, value]));
    setNewTerm("");
  }
  const portals = useMemo(() => {
    const roles = (selectedTerms.length ? selectedTerms : profileRoles).slice(0, 8);
    const locations = (searchLocations.length ? searchLocations : [""]).slice(0, 5);
    return roles
      .flatMap((role) => locations.flatMap((loc) => portalSearchLinks(role, loc)))
      .filter((link, i, all) => all.findIndex((o) => o.url === link.url) === i);
  }, [selectedTerms.join("|"), searchLocations.join("|"), profileRoles.join("|")]);

  const portalGroups = useMemo(() => {
    const map = new Map<string, { name: string; url: string; links: number; terms: Set<string>; regions: Set<string> }>();
    for (const p of portals) {
      const entry = map.get(p.name) ?? { name: p.name, url: p.url, links: 0, terms: new Set<string>(), regions: new Set<string>() };
      entry.links += 1;
      if (p.query) entry.terms.add(p.query);
      entry.regions.add(p.location || "überall");
      map.set(p.name, entry);
    }
    return [...map.values()].map((e) => ({
      name: e.name,
      url: e.url,
      links: e.links,
      terms: e.terms.size,
      regions: e.regions.size,
    }));
  }, [portals]);

  const runGroups = useMemo(() => {
    if (!run) return [] as {
      source: string;
      url: string;
      runs: number;
      scanned: number;
      matched: number;
      available: number;
      errors: number;
      messages: string[];
    }[];
    const map = new Map<string, { source: string; url: string; runs: number; scanned: number; matched: number; available: number; errors: number; messages: string[] }>();
    for (const s of run.sources) {
      const prev = map.get(s.source);
      map.set(s.source, {
        source: s.source,
        url: prev?.url || s.url,
        runs: (prev?.runs ?? 0) + 1,
        scanned: (prev?.scanned ?? 0) + s.scanned,
        matched: (prev?.matched ?? 0) + s.matched,
        available: (prev?.available ?? 0) + s.available,
        errors: (prev?.errors ?? 0) + (s.error ? 1 : 0),
        messages: s.error && !(prev?.messages ?? []).includes(s.error) ? [...(prev?.messages ?? []), s.error] : (prev?.messages ?? []),
      });
    }
    return [...map.values()];
  }, [run]);

  const okSources = runGroups.filter((s) => s.errors === 0 && s.scanned > 0);
  const problemSources = runGroups.filter((s) => s.errors > 0 || s.scanned === 0);
  /**
   * Portal-Namen der "Weiteren Quellen" auf die Labels der tatsaechlich
   * durchsuchten Quellen abbilden (z. B. "StepStone" -> "StepStone Deutschland").
   */
  const statsFor = useMemo(() => {
    const aliases: Record<string, string[]> = {
      "stepstone": ["stepstone deutschland"],
      "stepstone.at": ["stepstone österreich"],
      "linkedin jobs": ["linkedin"],
      "xing jobs": ["xing"],
      "job-room": ["job-room"],
      "jobs.ch": ["jobs.ch"],
      "karriere.at": ["karriere.at"],
      "moovijob": ["moovijob"],
      "indeed": ["indeed"],
      "adzuna": ["adzuna"],
      "careerjet": ["careerjet"],
      "jooble": ["jooble"],
      "theirstack": ["theirstack"],
      "techmap": ["techmap"],
      "nomado24": ["nomado24"],
      "metajob.de": ["metajob"],
    };
    return (portalName: string) => {
      const key = portalName.toLowerCase();
      const prefixes = aliases[key] ?? [key];
      const hits = runGroups.filter((g) =>
        prefixes.some((p) => g.source.toLowerCase().startsWith(p)),
      );
      if (!hits.length) return null;
      return hits.reduce(
        (acc, g) => ({
          scanned: acc.scanned + g.scanned,
          matched: acc.matched + g.matched,
          available: acc.available + g.available,
        }),
        { scanned: 0, matched: 0, available: 0 },
      );
    };
  }, [runGroups]);

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
      const roles = selectedTerms.length ? selectedTerms : profileRoles;
      const result = await searchJobFeeds({
        data: {
          roles,
          locations: searchLocations.length ? searchLocations : (profile?.regions ?? []),
          excluded: profile?.excluded_industries ?? [],
          perQuery: 25,
          providers: activeProviders,
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
            <BulkMatchButton variant="outline" />
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
          <AccordionItem value="begriffe" className="border-0 border-b border-border">
              <AccordionTrigger className="py-1 hover:no-underline">
                <div className="text-left">
                  <p className="font-display text-sm font-semibold">Suchbegriffe und Regionen</p>
                  <p className="text-xs font-normal text-muted-foreground">
                    {selectedTerms.length} von {allTerms.length} Suchbegriffen aktiv ·{" "}
                    {selectedRegions.includes(ANY_REGION)
                      ? `alle Regionen (Prio: ${selectedRegions.filter((r) => r !== ANY_REGION).join(", ") || "keine"})`
                      : `${selectedRegions.length} Regionen`}
                  </p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Suchbegriffe</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {allTerms.map((term) => {
                    const active = selectedTerms.includes(term);
                    return (
                      <button
                        key={term}
                        type="button"
                        onClick={() => toggleTerm(term)}
                        className={
                          "rounded-full border px-3 py-1 text-xs transition " +
                          (active
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:bg-muted")
                        }
                      >
                        {term}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Input
                    value={newTerm}
                    onChange={(e) => setNewTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTerm();
                      }
                    }}
                    placeholder="Eigenen Suchbegriff hinzufügen …"
                    className="max-w-xs"
                  />
                  <Button type="button" variant="outline" onClick={addTerm}>
                    <Plus className="mr-2 size-4" /> Hinzufügen
                  </Button>
                </div>
                <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">Regionen</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {allRegions.map((region) => {
                    const active = selectedRegions.includes(region);
                    return (
                      <button
                        key={region}
                        type="button"
                        onClick={() => toggleRegion(region)}
                        className={
                          "rounded-full border px-3 py-1 text-xs transition " +
                          (active
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:bg-muted")
                        }
                      >
                        {region}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Input
                    value={newRegion}
                    onChange={(e) => setNewRegion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addRegion();
                      }
                    }}
                    placeholder="Eigene Region hinzufügen …"
                    className="max-w-xs"
                  />
                  <Button type="button" variant="outline" onClick={addRegion}>
                    <Plus className="mr-2 size-4" /> Hinzufügen
                  </Button>
                </div>
              </AccordionContent>
          </AccordionItem>

          <AccordionItem value="apis" className="border-0 border-b border-border">
            <AccordionTrigger className="py-3 hover:no-underline">
              <div className="text-left">
                <p className="font-display text-sm font-semibold">Quellen und APIs aktivieren</p>
                <p className="text-xs font-normal text-muted-foreground">
                  {activeProviders.length} von {JOB_PROVIDERS.length} Quellen aktiv
                </p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2">
              <div className="mb-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setActiveProviders(DEFAULT_ACTIVE_PROVIDERS)}
                >
                  Alle aktivieren
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setActiveProviders([])}>
                  Alle deaktivieren
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setActiveProviders(JOB_PROVIDERS.filter((p) => !p.needsKey).map((p) => p.id))
                  }
                >
                  Nur kostenlose Quellen
                </Button>
              </div>
              <div className="space-y-4">
                {(["amtlich", "crawler", "browser", "aggregator"] as ProviderGroup[]).map((group) => (
                  <div key={group}>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {PROVIDER_GROUP_LABEL[group]}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {JOB_PROVIDERS.filter((p) => p.group === group).map((p) => {
                        const active = activeProviders.includes(p.id);
                        return (
                          <Button
                            key={p.id}
                            type="button"
                            size="sm"
                            variant={active ? "default" : "outline"}
                            onClick={() => toggleProvider(p.id)}
                            aria-pressed={active}
                          >
                            {p.label}
                            <span className="ml-2 text-xs opacity-70">{active ? "aktiv" : "aus"}</span>
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Quellen mit Schlüsselbedarf laufen nur, wenn der passende API-Schlüssel hinterlegt ist. Die Auswahl wird
                lokal gespeichert und gilt für die nächste Suche.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="quellen" className="border-0">
            <AccordionTrigger className="py-1 hover:no-underline">
              <div className="text-left">
                <p className="font-display text-sm font-semibold">Durchsuchte Quellen</p>
                <p className="text-xs font-normal text-muted-foreground">
                  {run
                    ? `Stand: ${new Date(run.ran_at).toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" })} Uhr · gespeichert bis zur nächsten Aktualisierung · ${run.scanned} Anzeigen durchsucht · ${run.matched} passend · ${run.imported} neu übernommen`
                    : "Noch keine Aktualisierung gespeichert – Suche startet mit den Zielrollen und Regionen aus Ihrem Suchprofil."}
                </p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2">
        {run ? (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 pr-3 font-medium">Quelle</th>
                    <th className="py-2 pr-3 font-medium">Abfragen</th>
                    <th className="py-2 pr-3 text-right font-medium">Durchsucht</th>
                    <th className="py-2 pr-3 text-right font-medium">Passend</th>
                    <th className="py-2 text-right font-medium">Treffer gesamt</th>
                  </tr>
                </thead>
                <tbody>
                  {okSources.map((s) => (
                    <tr key={s.source} className="border-b border-border/60 last:border-0">
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
                      <td className="py-2 pr-3 text-muted-foreground tabular-nums">{s.runs}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">{s.scanned}</td>
                      <td className="py-2 pr-3 text-right tabular-nums font-medium">{s.matched}</td>
                      <td className="py-2 text-right tabular-nums text-muted-foreground">
                        {s.available.toLocaleString("de-DE")}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-border font-medium">
                    <td className="py-2 pr-3" colSpan={2}>
                      Gesamt
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums">{run.scanned}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{run.matched}</td>
                    <td className="py-2" />
                  </tr>
                </tfoot>
              </table>
            </div>
            {problemSources.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs text-muted-foreground">
                  {problemSources.length} Quelle(n) ohne Treffer oder mit Fehler ausgeblendet.
                </p>
                <Button type="button" variant="outline" size="sm" onClick={() => setFixOpen(true)}>
                  <Wrench className="mr-2 size-4" /> Fehlerbehebung
                </Button>
              </div>
            ) : null}
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
                  {portalGroups.length} Portale · {portals.length} vorbereitete Direktsuchen
                </p>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="py-2 pr-3 font-medium">Quelle</th>
                      <th className="py-2 pr-3 font-medium">Abfragen</th>
                      <th className="py-2 pr-3 text-right font-medium">Durchsucht</th>
                      <th className="py-2 pr-3 text-right font-medium">Passend</th>
                      <th className="py-2 text-right font-medium">Treffer gesamt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portalGroups.map((g) => {
                      const stats = statsFor(g.name);
                      return (
                      <tr key={g.name} className="border-b border-border/60 last:border-0">
                        <td className="py-2 pr-3">
                          <a
                            href={g.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 hover:underline"
                          >
                            {g.name} <ExternalLink className="size-3" />
                          </a>
                        </td>
                        <td className="py-2 pr-3 text-muted-foreground tabular-nums">{g.links}</td>
                        <td className="py-2 pr-3 text-right tabular-nums">{stats ? stats.scanned : "–"}</td>
                        <td className="py-2 pr-3 text-right tabular-nums font-medium">{stats ? stats.matched : "–"}</td>
                        <td className="py-2 text-right tabular-nums text-muted-foreground">
                          {stats ? stats.available.toLocaleString("de-DE") : "–"}
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-border font-medium">
                      <td className="py-2 pr-3">Gesamt</td>
                      <td className="py-2 pr-3 tabular-nums">{portals.length}</td>
                      <td className="py-2" colSpan={2} />
                      <td className="py-2" />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Panel>

      <Dialog open={fixOpen} onOpenChange={setFixOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Fehlerbehebung Quellen</DialogTitle>
            <DialogDescription>
              Diese Quellen lieferten keine Anzeigen oder meldeten einen Fehler und werden in der Übersicht ausgeblendet.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[50vh] space-y-3 overflow-y-auto">
            {problemSources.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aktuell keine problematischen Quellen.</p>
            ) : (
              problemSources.map((s) => (
                <div key={s.source} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{s.source}</p>
                    <span className="text-xs text-muted-foreground">
                      {s.runs} Abfragen · {s.scanned} durchsucht
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-destructive">
                    {s.messages.length ? s.messages.join(" · ") : "Keine Treffer geliefert (Blocker, Limit oder Suchbegriffe zu eng)."}
                  </p>
                  {s.url ? (
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs hover:underline"
                    >
                      Quelle manuell öffnen <ExternalLink className="size-3" />
                    </a>
                  ) : null}
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={async () => {
                setFixOpen(false);
                await updateFeeds();
              }}
              disabled={updating}
            >
              {updating ? <Loader2 className="mr-2 size-4 animate-spin" /> : <RefreshCw className="mr-2 size-4" />}
              Erneut versuchen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            const match = matchByJob.get(job.id);
            const score = match?.overall_score;
            return (
              <div key={job.id} className="panel panel-hover relative flex flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      to="/stellen/$jobId"
                      params={{ jobId: job.id }}
                      className="after:absolute after:inset-0 after:content-['']"
                    >
                      <h2 className="truncate font-display text-base font-semibold">{job.title}</h2>
                    </Link>
                    <p className="truncate text-sm text-muted-foreground">{job.company}</p>
                  </div>
                  {typeof score === "number" && (
                    <div className="flex shrink-0 flex-col items-center gap-1">
                      <div
                        className={
                          "flex size-12 items-center justify-center rounded-full border-2 font-display text-sm font-semibold " +
                          (score >= 80
                            ? "border-primary text-primary"
                            : score >= 60
                              ? "border-border"
                              : "border-muted text-muted-foreground")
                        }
                      >
                        {score}
                      </div>
                    </div>
                  )}
                </div>
                <p className="line-clamp-3 text-xs text-muted-foreground">{job.description}</p>
                <div className="mt-auto flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <StatusBadge status={job.status} />
                  <span>{job.location ?? "Ort offen"}</span>
                  {job.remote_share && <span>· {job.remote_share}</span>}
                </div>
                <div className="relative z-10 flex flex-wrap items-center gap-3 text-xs">
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}