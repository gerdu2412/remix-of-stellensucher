import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AiNotice, PageHeader, Panel, SectionTitle } from "@/components/shared/ui-bits";
import { aiAnalyzeCv } from "@/lib/ai.functions";
import { useMasterCv, useProfile, useSearchProfile, useUpsertRow } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/profil")({
  head: () => ({
    meta: [
      { title: "Mein Profil – CareerPilot AI" },
      { name: "description", content: "Master-Lebenslauf erfassen, KI-gestützt analysieren und das Suchprofil definieren." },
      { property: "og:title", content: "Mein Profil – CareerPilot AI" },
      { property: "og:description", content: "Phase 1: Suchprofil und Master-CV." },
    ],
  }),
  component: ProfilPage,
});

type CvContent = {
  summary?: string;
  skills?: string[];
  methods?: string[];
  tools?: string[];
  certificates?: string[];
  career_level?: string;
  leadership?: string;
  target_roles?: string[];
  alternative_titles?: string[];
  experience?: { company: string; role: string; period: string; industry: string; achievements: string[] }[];
  education?: { degree: string; institution: string; year: string }[];
  languages?: { name: string; level: string }[];
};

function list(value: string): string[] {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function ProfilPage() {
  const profile = useProfile();
  const cv = useMasterCv();
  const search = useSearchProfile();
  const saveProfile = useUpsertRow("profiles", ["profile"], "id");
  const saveCv = useUpsertRow("master_cvs", ["master_cv"]);
  const saveSearch = useUpsertRow("search_profiles", ["search_profile"]);

  const [cvText, setCvText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (cv.data?.extracted_text) setCvText(cv.data.extracted_text);
  }, [cv.data?.extracted_text]);

  const structured = (cv.data?.structured_content ?? {}) as CvContent;

  async function analyze() {
    if (cvText.trim().length < 30) {
      toast.error("Bitte zuerst den Lebenslauftext einfügen.");
      return;
    }
    setAnalyzing(true);
    try {
      const result = await aiAnalyzeCv({ data: { text: cvText } });
      await saveCv.mutateAsync({
        ...(cv.data?.id ? { id: cv.data.id } : {}),
        extracted_text: cvText,
        structured_content: result,
        confirmed: false,
      });
      toast.success("Lebenslauf analysiert – bitte prüfen und bestätigen.");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Mein Profil"
        description="Phase 1: Master-Lebenslauf erfassen, von der KI strukturieren lassen und das Suchprofil festlegen."
      />

      <Tabs defaultValue="cv">
        <TabsList>
          <TabsTrigger value="cv">Master-Lebenslauf</TabsTrigger>
          <TabsTrigger value="suchprofil">Suchprofil</TabsTrigger>
          <TabsTrigger value="stammdaten">Stammdaten</TabsTrigger>
        </TabsList>

        <TabsContent value="cv" className="mt-4 grid gap-4 lg:grid-cols-2">
          <Panel>
            <SectionTitle hint="Fügen Sie Ihren Lebenslauf als Text ein. Die KI extrahiert Stationen, Kompetenzen und Erfolge.">
              Lebenslauf erfassen
            </SectionTitle>
            <Textarea
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              rows={16}
              placeholder="Lebenslauf hier einfügen …"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <Button onClick={analyze} disabled={analyzing}>
                {analyzing ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Sparkles className="mr-2 size-4" />}
                Mit KI analysieren
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  saveCv.mutate({
                    ...(cv.data?.id ? { id: cv.data.id } : {}),
                    extracted_text: cvText,
                    structured_content: structured,
                    confirmed: cv.data?.confirmed ?? false,
                  })
                }
              >
                Nur speichern
              </Button>
              {cv.data && !cv.data.confirmed && (
                <Button
                  variant="secondary"
                  onClick={() => saveCv.mutate({ id: cv.data!.id, confirmed: true })}
                >
                  Analyse bestätigen
                </Button>
              )}
            </div>
            {cv.data?.confirmed && <p className="mt-3 text-xs text-success">Analyse bestätigt.</p>}
          </Panel>

          <Panel>
            <SectionTitle>Strukturierte Analyse</SectionTitle>
            {!structured.summary && (
              <p className="text-sm text-muted-foreground">Noch keine Analyse vorhanden.</p>
            )}
            {structured.summary && (
              <div className="space-y-4 text-sm">
                {!cv.data?.confirmed && <AiNotice />}
                <p>{structured.summary}</p>
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Kompetenzen</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(structured.skills ?? []).map((s) => (
                      <Badge key={s} variant="secondary">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Stationen</p>
                  <div className="mt-2 space-y-3">
                    {(structured.experience ?? []).map((e, i) => (
                      <div key={i} className="rounded-md border border-border p-3">
                        <p className="font-medium">
                          {e.role} · {e.company}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {e.period} · {e.industry}
                        </p>
                        <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-muted-foreground">
                          {(e.achievements ?? []).map((a, j) => (
                            <li key={j}>{a}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
                {structured.leadership && (
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Führungserfahrung</p>
                    <p className="mt-1 text-muted-foreground">{structured.leadership}</p>
                  </div>
                )}
              </div>
            )}
          </Panel>
        </TabsContent>

        <TabsContent value="suchprofil" className="mt-4">
          <Panel>
            <SectionTitle hint="Grundlage für Stellenrecherche und Match-Bewertung.">Suchprofil</SectionTitle>
            <form
              className="grid gap-4 md:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget as HTMLFormElement);
                saveSearch.mutate({
                  ...(search.data?.id ? { id: search.data.id } : {}),
                  target_roles: list(String(f.get("target_roles") ?? "")),
                  industries: list(String(f.get("industries") ?? "")),
                  excluded_industries: list(String(f.get("excluded_industries") ?? "")),
                  regions: list(String(f.get("regions") ?? "")),
                  countries: list(String(f.get("countries") ?? "")),
                  company_sizes: list(String(f.get("company_sizes") ?? "")),
                  seniority: String(f.get("seniority") ?? ""),
                  leadership_scope: String(f.get("leadership_scope") ?? ""),
                  work_model: String(f.get("work_model") ?? ""),
                  contract_type: String(f.get("contract_type") ?? ""),
                  travel_readiness: String(f.get("travel_readiness") ?? ""),
                  exclusion_criteria: String(f.get("exclusion_criteria") ?? ""),
                  max_office_days: Number(f.get("max_office_days") ?? 0) || null,
                  salary_minimum: Number(f.get("salary_minimum") ?? 0) || null,
                });
              }}
            >
              {[
                { name: "target_roles", label: "Zielrollen (kommagetrennt)", value: (search.data?.target_roles ?? []).join(", ") },
                { name: "industries", label: "Branchen", value: (search.data?.industries ?? []).join(", ") },
                { name: "excluded_industries", label: "Ausgeschlossene Branchen", value: (search.data?.excluded_industries ?? []).join(", ") },
                { name: "regions", label: "Regionen", value: (search.data?.regions ?? []).join(", ") },
                { name: "countries", label: "Länder", value: (search.data?.countries ?? []).join(", ") },
                { name: "company_sizes", label: "Unternehmensgrößen", value: (search.data?.company_sizes ?? []).join(", ") },
                { name: "seniority", label: "Seniorität", value: search.data?.seniority ?? "" },
                { name: "leadership_scope", label: "Führungsspanne", value: search.data?.leadership_scope ?? "" },
                { name: "work_model", label: "Arbeitsmodell", value: search.data?.work_model ?? "" },
                { name: "contract_type", label: "Vertragsart", value: search.data?.contract_type ?? "" },
                { name: "travel_readiness", label: "Reisebereitschaft", value: search.data?.travel_readiness ?? "" },
                { name: "max_office_days", label: "Max. Bürotage pro Woche", value: String(search.data?.max_office_days ?? "") },
                { name: "salary_minimum", label: "Gehaltsuntergrenze (EUR)", value: String(search.data?.salary_minimum ?? "") },
              ].map((field) => (
                <div key={field.name} className="space-y-1.5">
                  <Label htmlFor={field.name}>{field.label}</Label>
                  <Input id={field.name} name={field.name} defaultValue={field.value} />
                </div>
              ))}
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="exclusion_criteria">Ausschlusskriterien</Label>
                <Textarea
                  id="exclusion_criteria"
                  name="exclusion_criteria"
                  rows={3}
                  defaultValue={search.data?.exclusion_criteria ?? ""}
                />
              </div>
              <div className="md:col-span-2">
                <Button type="submit">Suchprofil speichern</Button>
              </div>
            </form>
          </Panel>
        </TabsContent>

        <TabsContent value="stammdaten" className="mt-4">
          <Panel>
            <SectionTitle>Persönliche Daten</SectionTitle>
            <form
              className="grid gap-4 md:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget as HTMLFormElement);
                saveProfile.mutate({
                  id: profile.data?.id,
                  full_name: String(f.get("full_name") ?? ""),
                  headline: String(f.get("headline") ?? ""),
                  email: String(f.get("email") ?? ""),
                  phone: String(f.get("phone") ?? ""),
                  location: String(f.get("location") ?? ""),
                  linkedin_url: String(f.get("linkedin_url") ?? ""),
                });
              }}
            >
              {[
                { name: "full_name", label: "Name", value: profile.data?.full_name ?? "" },
                { name: "headline", label: "Positionierung", value: profile.data?.headline ?? "" },
                { name: "email", label: "E-Mail", value: profile.data?.email ?? "" },
                { name: "phone", label: "Telefon", value: profile.data?.phone ?? "" },
                { name: "location", label: "Wohnort", value: profile.data?.location ?? "" },
                { name: "linkedin_url", label: "LinkedIn", value: profile.data?.linkedin_url ?? "" },
              ].map((field) => (
                <div key={field.name} className="space-y-1.5">
                  <Label htmlFor={field.name}>{field.label}</Label>
                  <Input id={field.name} name={field.name} defaultValue={field.value} />
                </div>
              ))}
              <div className="md:col-span-2">
                <Button type="submit">Speichern</Button>
              </div>
            </form>
          </Panel>
        </TabsContent>
      </Tabs>
    </div>
  );
}