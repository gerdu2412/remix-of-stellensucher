import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ExternalLink, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AiNotice,
  PageHeader,
  Panel,
  ScoreBar,
  ScoreRing,
  SectionTitle,
  STATUS_OPTIONS,
  statusLabel,
} from "@/components/shared/ui-bits";
import {
  aiCompanyDossier,
  aiCoverLetter,
  aiInterviewPrep,
  aiMatchAnalysis,
  aiStrategy,
} from "@/lib/ai.functions";
import {
  useCompanyResearch,
  useDocuments,
  useInterviewPreps,
  useJob,
  useMasterCv,
  useMatch,
  useSearchProfile,
  useStrategy,
  useUpdateRow,
  useUpsertRow,
} from "@/lib/queries";
import { companyCareersUrl, companyWebsiteUrl } from "@/lib/joblinks";

export const Route = createFileRoute("/_authenticated/stellen/$jobId")({
  head: () => ({
    meta: [
      { title: "Stellendetail – CareerPilot AI" },
      { name: "description", content: "Match-Analyse, Unternehmensdossier, Bewerbungsstrategie und Unterlagen zu einer Stelle." },
      { property: "og:title", content: "Stellendetail – CareerPilot AI" },
      { property: "og:description", content: "Alle KI-Module zu einer konkreten Stelle." },
    ],
  }),
  component: JobDetail,
});

type Json = Record<string, unknown>;

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function Bullets({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-muted-foreground">{title}</p>
      <ul className="mt-1.5 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
        {items.map((i, idx) => (
          <li key={idx}>{i}</li>
        ))}
      </ul>
    </div>
  );
}

function JobDetail() {
  const { jobId } = Route.useParams();
  const job = useJob(jobId);
  const cv = useMasterCv();
  const search = useSearchProfile();
  const match = useMatch(jobId);
  const company = useCompanyResearch(jobId);
  const strategy = useStrategy(jobId);
  const documents = useDocuments(jobId);
  const interviews = useInterviewPreps(jobId);

  const updateJob = useUpdateRow("job_postings", ["job_postings"]);
  const saveMatch = useUpsertRow("match_analyses", ["match_analyses"]);
  const saveCompany = useUpsertRow("company_research", ["company_research"]);
  const saveStrategy = useUpsertRow("application_strategies", ["application_strategies"]);
  const saveDocument = useUpsertRow("application_documents", ["application_documents"]);
  const savePrep = useUpsertRow("interview_preparations", ["interview_preparations"]);

  const [busy, setBusy] = useState<string | null>(null);
  const [research, setResearch] = useState("");
  const [tone, setTone] = useState("strategisch und executive");

  const cvText = cv.data?.extracted_text ?? "";
  const jobText = `${job.data?.title ?? ""} bei ${job.data?.company ?? ""}\n${job.data?.description ?? ""}`;

  function guard(): boolean {
    if (cvText.trim().length < 30) {
      toast.error("Bitte zuerst den Master-Lebenslauf im Profil erfassen.");
      return false;
    }
    return true;
  }

  async function run(key: string, fn: () => Promise<void>) {
    setBusy(key);
    try {
      await fn();
      toast.success("KI-Ergebnis erstellt – bitte prüfen.");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const matchData = match.data;
  const dossier = (company.data?.dossier ?? {}) as Record<string, string>;
  const coverLetter = documents.data?.find((d) => d.document_type === "anschreiben");
  const prep = interviews.data?.[0];

  if (!job.data) {
    return <p className="text-sm text-muted-foreground">Stelle wird geladen …</p>;
  }

  return (
    <div>
      <Link to="/stellen" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Zurück zur Stellensuche
      </Link>
      <PageHeader
        title={job.data.title}
        description={`${job.data.company} · ${job.data.location ?? "Ort offen"}${job.data.salary_range ? ` · ${job.data.salary_range}` : ""}`}
        actions={
          <Select
            value={job.data.status}
            onValueChange={(value) => updateJob.mutate({ id: jobId, values: { status: value } })}
          >
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {statusLabel(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
        {job.data.original_url && (
          <a
            href={job.data.original_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:underline"
          >
            Stellenanzeige öffnen <ExternalLink className="size-3.5" />
          </a>
        )}
        <a
          href={companyWebsiteUrl(job.data.company)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 hover:underline"
        >
          Firmenwebseite <ExternalLink className="size-3.5" />
        </a>
        <a
          href={companyCareersUrl(job.data.company)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 hover:underline"
        >
          Karriereseite <ExternalLink className="size-3.5" />
        </a>
        {job.data.source && <span className="text-muted-foreground">Quelle: {job.data.source}</span>}
      </div>

      <Tabs defaultValue="match">
        <TabsList className="flex-wrap">
          <TabsTrigger value="match">Match-Analyse</TabsTrigger>
          <TabsTrigger value="unternehmen">Unternehmen</TabsTrigger>
          <TabsTrigger value="strategie">Strategie</TabsTrigger>
          <TabsTrigger value="unterlagen">Anschreiben</TabsTrigger>
          <TabsTrigger value="interview">Interview</TabsTrigger>
          <TabsTrigger value="ausschreibung">Ausschreibung</TabsTrigger>
        </TabsList>

        {/* Phase 2 */}
        <TabsContent value="match" className="mt-4 space-y-4">
          <Panel>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <SectionTitle hint="Vergleich von Lebenslauf, Suchprofil und Anforderungen.">Match-Analyse</SectionTitle>
              <Button
                disabled={busy === "match"}
                onClick={() =>
                  guard() &&
                  run("match", async () => {
                    const result = await aiMatchAnalysis({
                      data: {
                        cvText,
                        jobText,
                        searchProfile: JSON.stringify(search.data ?? {}),
                      },
                    });
                    await saveMatch.mutateAsync({
                      ...(matchData?.id ? { id: matchData.id } : {}),
                      job_posting_id: jobId,
                      overall_score: Math.round(result.overall_score),
                      summary: result.summary,
                      outlook: result.outlook,
                      category_scores: result.category_scores,
                      fulfilled_requirements: result.fulfilled_requirements,
                      partial_requirements: result.partial_requirements,
                      missing_requirements: result.missing_requirements,
                      transferable_skills: result.transferable_skills,
                      risks: result.risks,
                      differentiators: result.differentiators,
                      cv_recommendations: result.cv_recommendations,
                    });
                  })
                }
              >
                {busy === "match" ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Sparkles className="mr-2 size-4" />}
                Analyse {matchData ? "aktualisieren" : "starten"}
              </Button>
            </div>
            {!matchData && <p className="text-sm text-muted-foreground">Noch keine Analyse vorhanden.</p>}
            {matchData && (
              <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
                <div className="flex flex-col items-center gap-2">
                  <ScoreRing score={matchData.overall_score} />
                  <Badge variant="outline">{matchData.outlook}</Badge>
                </div>
                <div className="space-y-4">
                  <p className="text-sm">{matchData.summary}</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {asArray<{ label: string; score: number }>(matchData.category_scores).map((c) => (
                      <ScoreBar key={c.label} label={c.label} score={c.score} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Panel>

          {matchData && (
            <div className="grid gap-4 lg:grid-cols-2">
              <Panel className="space-y-4">
                <SectionTitle>Anforderungsabgleich</SectionTitle>
                <Bullets title="Erfüllt" items={asArray<string>(matchData.fulfilled_requirements)} />
                <Bullets title="Teilweise erfüllt" items={asArray<string>(matchData.partial_requirements)} />
                <Bullets title="Nicht erfüllt" items={asArray<string>(matchData.missing_requirements)} />
                <Bullets title="Übertragbare Kompetenzen" items={asArray<string>(matchData.transferable_skills)} />
              </Panel>
              <Panel className="space-y-4">
                <SectionTitle>Risiken und Differenzierung</SectionTitle>
                <Bullets title="Risiken" items={asArray<string>(matchData.risks)} />
                <Bullets title="Alleinstellungsmerkmale" items={asArray<string>(matchData.differentiators)} />
              </Panel>
              <Panel className="lg:col-span-2">
                <SectionTitle hint="Konkrete Optimierungen für den Lebenslauf zu dieser Stelle.">
                  CV-Optimierung
                </SectionTitle>
                <div className="space-y-3">
                  {asArray<{ area: string; current: string; suggestion: string; reason: string; relevance: string }>(
                    matchData.cv_recommendations,
                  ).map((rec, i) => (
                    <div key={i} className="rounded-md border border-border p-3 text-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{rec.area}</p>
                        <Badge variant="secondary">{rec.relevance}</Badge>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">Bisher: {rec.current}</p>
                      <p className="mt-1">Vorschlag: {rec.suggestion}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Begründung: {rec.reason}</p>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          )}
        </TabsContent>

        {/* Phase 3 */}
        <TabsContent value="unternehmen" className="mt-4 space-y-4">
          <Panel>
            <SectionTitle hint="Fügen Sie Rechercheinhalte ein (Website, Geschäftsbericht, Presse). Die KI verdichtet sie zu einem Dossier.">
              Unternehmensanalyse
            </SectionTitle>
            <Textarea
              rows={6}
              value={research}
              onChange={(e) => setResearch(e.target.value)}
              placeholder="Rechercheinhalte einfügen …"
            />
            <Button
              className="mt-3"
              disabled={busy === "company"}
              onClick={() =>
                run("company", async () => {
                  const result = await aiCompanyDossier({
                    data: { company: job.data!.company, rawInput: research || company.data?.raw_input || "", jobText },
                  });
                  await saveCompany.mutateAsync({
                    ...(company.data?.id ? { id: company.data.id } : {}),
                    job_posting_id: jobId,
                    company: job.data!.company,
                    raw_input: research || company.data?.raw_input || "",
                    dossier: result.dossier,
                    assumptions: result.assumptions,
                    open_questions: result.open_questions,
                  });
                })
              }
            >
              {busy === "company" ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Sparkles className="mr-2 size-4" />}
              Dossier erstellen
            </Button>
          </Panel>

          {company.data && (
            <div className="grid gap-4 lg:grid-cols-2">
              <Panel className="space-y-3 lg:col-span-2">
                <AiNotice />
                {Object.entries({
                  profile: "Unternehmensprofil",
                  business_model: "Geschäftsmodell",
                  market: "Markt",
                  competitors: "Wettbewerb",
                  strategy: "Strategie",
                  transformation: "Transformation",
                  ai: "KI und Digitalisierung",
                  news: "Aktuelle Entwicklungen",
                  leadership: "Führung",
                  culture: "Kultur",
                  ratings: "Arbeitgeberbewertungen",
                  opportunities: "Chancen",
                  risks: "Risiken",
                  role_challenges: "Herausforderungen der Rolle",
                }).map(([key, label]) =>
                  dossier[key] ? (
                    <div key={key}>
                      <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
                      <p className="mt-1 text-sm">{dossier[key]}</p>
                    </div>
                  ) : null,
                )}
              </Panel>
              <Panel>
                <SectionTitle>Annahmen</SectionTitle>
                <Bullets title="" items={asArray<string>(company.data.assumptions)} />
              </Panel>
              <Panel>
                <SectionTitle>Offene Fragen</SectionTitle>
                <Bullets title="" items={asArray<string>(company.data.open_questions)} />
              </Panel>
            </div>
          )}
        </TabsContent>

        {/* Phase 3b */}
        <TabsContent value="strategie" className="mt-4 space-y-4">
          <Panel>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <SectionTitle hint="Positionierung, Kernbotschaft und Bewerbungsstory.">Bewerbungsstrategie</SectionTitle>
              <Button
                disabled={busy === "strategy"}
                onClick={() =>
                  guard() &&
                  run("strategy", async () => {
                    const result = await aiStrategy({
                      data: {
                        cvText,
                        jobText,
                        companyContext: JSON.stringify(company.data?.dossier ?? {}),
                        matchContext: JSON.stringify(matchData ?? {}),
                      },
                    });
                    await saveStrategy.mutateAsync({
                      ...(strategy.data?.id ? { id: strategy.data.id } : {}),
                      job_posting_id: jobId,
                      positioning: result.positioning,
                      core_message: result.core_message,
                      motivation_company: result.motivation_company,
                      motivation_role: result.motivation_role,
                      arguments: result.arguments,
                      objections: result.objections,
                      keywords: result.keywords,
                      tone: result.tone,
                      story_one_liner: result.story_one_liner,
                      story_elevator: result.story_elevator,
                      story_long: result.story_long,
                    });
                  })
                }
              >
                {busy === "strategy" ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Sparkles className="mr-2 size-4" />}
                Strategie erstellen
              </Button>
            </div>
            {strategy.data ? (
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Positionierung</p>
                  <p className="mt-1">{strategy.data.positioning}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Kernbotschaft</p>
                  <p className="mt-1">{strategy.data.core_message}</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Motivation Unternehmen</p>
                    <p className="mt-1">{strategy.data.motivation_company}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Motivation Rolle</p>
                    <p className="mt-1">{strategy.data.motivation_role}</p>
                  </div>
                </div>
                <Bullets title="Argumente" items={asArray<string>(strategy.data.arguments)} />
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Einwände und Antworten</p>
                  <div className="mt-2 space-y-2">
                    {asArray<{ objection: string; counter: string }>(strategy.data.objections).map((o, i) => (
                      <div key={i} className="rounded-md border border-border p-3">
                        <p className="font-medium">{o.objection}</p>
                        <p className="mt-1 text-muted-foreground">{o.counter}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {[
                    { label: "Ein Satz", value: strategy.data.story_one_liner },
                    { label: "Elevator Pitch", value: strategy.data.story_elevator },
                    { label: "Ausführlich", value: strategy.data.story_long },
                  ].map((s) => (
                    <div key={s.label} className="rounded-md border border-border p-3">
                      <p className="text-xs font-semibold uppercase text-muted-foreground">{s.label}</p>
                      <p className="mt-1 text-sm">{s.value}</p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(strategy.data.keywords ?? []).map((k) => (
                    <Badge key={k} variant="secondary">
                      {k}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Noch keine Strategie vorhanden.</p>
            )}
          </Panel>
        </TabsContent>

        {/* Phase 4 */}
        <TabsContent value="unterlagen" className="mt-4 space-y-4">
          <Panel>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <SectionTitle hint="Individuelles Anschreiben auf Basis von Lebenslauf, Stelle und Strategie.">
                Anschreiben
              </SectionTitle>
              <div className="flex flex-wrap gap-2">
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="w-56">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["strategisch und executive", "sachlich und faktenorientiert", "modern und dynamisch", "klassisch und formell"].map(
                      (t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
                <Button
                  disabled={busy === "letter"}
                  onClick={() =>
                    guard() &&
                    run("letter", async () => {
                      const result = await aiCoverLetter({
                        data: {
                          cvText,
                          jobText,
                          strategyContext: JSON.stringify(strategy.data ?? {}),
                          tone,
                          contactPerson: job.data?.contact_person ?? "",
                        },
                      });
                      await saveDocument.mutateAsync({
                        ...(coverLetter?.id ? { id: coverLetter.id } : {}),
                        job_posting_id: jobId,
                        document_type: "anschreiben",
                        title: `Anschreiben ${job.data!.company}`,
                        tone,
                        status: "entwurf",
                        content: result as unknown as Json,
                        version: (coverLetter?.version ?? 0) + 1,
                      });
                    })
                  }
                >
                  {busy === "letter" ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Sparkles className="mr-2 size-4" />}
                  Anschreiben erzeugen
                </Button>
              </div>
            </div>
            {coverLetter ? (
              <article className="space-y-3 text-sm leading-relaxed">
                <AiNotice>KI-Entwurf – bitte inhaltlich prüfen und persönlich anpassen.</AiNotice>
                <p>{(coverLetter.content as Json)["salutation"] as string}</p>
                {asArray<{ id: string; label: string; text: string }>((coverLetter.content as Json)["paragraphs"]).map((p) => (
                  <p key={p.id}>{p.text}</p>
                ))}
                <p>{(coverLetter.content as Json)["closing"] as string}</p>
                <Button
                  variant="outline"
                  onClick={() => saveDocument.mutate({ id: coverLetter.id, status: "freigegeben" })}
                >
                  Als final markieren
                </Button>
              </article>
            ) : (
              <p className="text-sm text-muted-foreground">Noch kein Anschreiben erstellt.</p>
            )}
          </Panel>
        </TabsContent>

        {/* Phase 5 */}
        <TabsContent value="interview" className="mt-4 space-y-4">
          <Panel>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <SectionTitle hint="Briefing, wahrscheinliche Fragen mit Musterantworten und Rückfragen.">
                Interviewvorbereitung
              </SectionTitle>
              <Button
                disabled={busy === "prep"}
                onClick={() =>
                  guard() &&
                  run("prep", async () => {
                    const result = await aiInterviewPrep({
                      data: {
                        cvText,
                        jobText,
                        companyContext: JSON.stringify(company.data?.dossier ?? {}),
                        interviewType: prep?.interview_type ?? "hr",
                      },
                    });
                    await savePrep.mutateAsync({
                      ...(prep?.id ? { id: prep.id } : {}),
                      job_posting_id: jobId,
                      interview_type: prep?.interview_type ?? "hr",
                      preparation_status: "in_arbeit",
                      briefing: result.briefing,
                      questions: result.questions,
                      reverse_questions: result.reverse_questions,
                    });
                  })
                }
              >
                {busy === "prep" ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Sparkles className="mr-2 size-4" />}
                Vorbereitung erstellen
              </Button>
            </div>
            {prep ? (
              <div className="space-y-4">
                <div className="space-y-3">
                  {asArray<{
                    question: string;
                    category: string;
                    probability: string;
                    difficulty: string;
                    goal: string;
                    structure: string;
                    answer: string;
                    follow_up: string;
                  }>(prep.questions).map((q, i) => (
                    <div key={i} className="rounded-md border border-border p-3 text-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{q.question}</p>
                        <Badge variant="secondary">{q.category}</Badge>
                        <Badge variant="outline">{q.probability}</Badge>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">Ziel: {q.goal}</p>
                      <p className="mt-2">{q.answer}</p>
                      {q.follow_up && <p className="mt-2 text-xs text-muted-foreground">Nachfrage: {q.follow_up}</p>}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Rückfragen an das Unternehmen</p>
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                    {asArray<{ question: string; audience: string }>(prep.reverse_questions).map((q, i) => (
                      <li key={i}>
                        {q.question} <span className="text-xs">({q.audience})</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button asChild variant="outline">
                  <Link to="/interview">Zur Interviewsimulation</Link>
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Noch keine Interviewvorbereitung vorhanden.</p>
            )}
          </Panel>
        </TabsContent>

        <TabsContent value="ausschreibung" className="mt-4">
          <Panel>
            <SectionTitle>Ausschreibungstext</SectionTitle>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">{job.data.description}</p>
          </Panel>
        </TabsContent>
      </Tabs>
    </div>
  );
}