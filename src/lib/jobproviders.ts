/** Zentrale Liste der anbindbaren Quellen/APIs – von Client und Server genutzt. */
export type ProviderGroup = "amtlich" | "browser" | "crawler" | "aggregator";

export type ProviderInfo = {
  id: string;
  label: string;
  group: ProviderGroup;
  /** Benoetigt einen hinterlegten API-Schluessel. */
  needsKey?: boolean;
  note?: string;
};

export const JOB_PROVIDERS: ProviderInfo[] = [
  { id: "arbeitsagentur", label: "Bundesagentur für Arbeit", group: "amtlich" },
  { id: "linkedin", label: "LinkedIn Jobs", group: "browser", needsKey: true, note: "Browser-Dienst" },
  { id: "indeed", label: "Indeed", group: "browser", needsKey: true, note: "Browser-Dienst" },
  { id: "stepstone-de", label: "StepStone Deutschland", group: "browser", needsKey: true, note: "Browser-Dienst" },
  { id: "xing", label: "Xing Jobs", group: "browser", needsKey: true, note: "Browser-Dienst" },
  { id: "stepstone-at", label: "StepStone Österreich", group: "crawler" },
  { id: "jobs-ch", label: "jobs.ch (CH/LI)", group: "crawler" },
  { id: "job-room", label: "Job-Room (CH/LI)", group: "crawler" },
  { id: "moovijob", label: "Moovijob (LU)", group: "crawler" },
  { id: "nomado24", label: "Nomado24", group: "crawler" },
  { id: "metajob", label: "metajob.de", group: "crawler" },
  { id: "theirstack", label: "TheirStack", group: "aggregator", needsKey: true },
  { id: "adzuna", label: "Adzuna (DE/AT/CH)", group: "aggregator", needsKey: true },
  { id: "jooble", label: "Jooble", group: "aggregator", needsKey: true },
  { id: "careerjet", label: "Careerjet (DE/AT/CH/LU)", group: "aggregator", needsKey: true },
  { id: "techmap", label: "Techmap (DE/AT/CH)", group: "aggregator", needsKey: true },
];

export const PROVIDER_GROUP_LABEL: Record<ProviderGroup, string> = {
  amtlich: "Amtliche Jobbörse",
  browser: "Browser-Rendering (kostenpflichtig)",
  crawler: "Direkte Portal-Crawler (kostenlos)",
  aggregator: "Aggregator-APIs",
};

/** Standard: alles aktiv. */
export const DEFAULT_ACTIVE_PROVIDERS = JOB_PROVIDERS.map((p) => p.id);
