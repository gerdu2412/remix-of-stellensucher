import {
  browserCrawlersEnabled,
  crawlCustomSource,
  crawlIndeed,
  crawlLinkedIn,
  crawlStepstoneDe,
  crawlXing,
  crawlJobRoom,
  crawlJobsCh,
  crawlMetajob,
  crawlMoovijob,
  crawlNomado24,
  crawlStepstoneAt,
  type CrawlResult,
} from "./jobcrawler.server";
import { companyCareersUrl, companyWebsiteUrl, portalSearchLinks, regionalPortalLinks, type PortalLink } from "./joblinks";
import { renderProviderLabel } from "./browserfetch.server";
import { searchAdzuna, searchCareerjet, searchJooble, searchTechmap, searchTheirStack } from "./jobaggregators.server";

const BASE = "https://rest.arbeitsagentur.de/jobboerse/jobsuche-service";
const API_KEY = "jobboerse-jobsuche";

export const FEED_SOURCE = "Bundesagentur für Arbeit – Jobbörse";

export type FeedSourceStat = {
  source: string;
  query: string;
  location: string;
  url: string;
  scanned: number;
  available: number;
  matched: number;
  error?: string;
};

export type FoundJob = {
  refnr: string;
  title: string;
  company: string;
  location: string;
  region: string;
  country: string;
  publication_date: string | null;
  salary_range: string;
  url: string;
  description: string;
  source: string;
  company_url: string;
  company_careers_url: string;
  score: number;
  reasons: string[];
};

export type FeedSearchResult = {
  sources: FeedSourceStat[];
  portals: PortalLink[];
  jobs: FoundJob[];
  scanned: number;
  matched: number;
  ran_at: string;
};

type Angebot = {
  referenznummer?: string;
  stellenangebotsTitel?: string;
  titel?: string;
  beruf?: string;
  arbeitgeber?: string;
  firma?: string;
  gehaltsspanneVon?: number;
  gehaltsspanneBis?: number;
  datumErsteVeroeffentlichung?: string;
  stellenlokationen?: { adresse?: { ort?: string; region?: string; land?: string } }[];
  arbeitsort?: { ort?: string; region?: string; land?: string };
};

function tokens(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((t) => t.length > 3);
}

function jobUrl(refnr: string): string {
  return `https://www.arbeitsagentur.de/jobsuche/jobdetail/${encodeURIComponent(refnr)}`;
}

async function fetchList(query: string, location: string, size: number) {
  const params = new URLSearchParams({ was: query, size: String(size), page: "1", angebotsart: "1" });
  if (location) {
    params.set("wo", location);
    params.set("umkreis", "50");
  }
  const url = `${BASE}/pc/v6/jobs?${params.toString()}`;
  const res = await fetch(url, { headers: { "X-API-Key": API_KEY, accept: "application/json" } });
  if (!res.ok) throw new Error(`Antwort ${res.status}`);
  const data = (await res.json()) as { ergebnisliste?: Angebot[]; maxErgebnisse?: number };
  return {
    url: `https://www.arbeitsagentur.de/jobsuche/suche?was=${encodeURIComponent(query)}${
      location ? `&wo=${encodeURIComponent(location)}` : ""
    }`,
    list: data.ergebnisliste ?? [],
    available: data.maxErgebnisse ?? data.ergebnisliste?.length ?? 0,
  };
}

async function fetchDescription(refnr: string): Promise<string> {
  try {
    const encoded = btoa(refnr);
    const res = await fetch(`${BASE}/pc/v4/jobdetails/${encoded}`, {
      headers: { "X-API-Key": API_KEY, accept: "application/json" },
    });
    if (!res.ok) return "";
    const data = (await res.json()) as { stellenangebotsBeschreibung?: string };
    return (data.stellenangebotsBeschreibung ?? "").slice(0, 12000);
  } catch {
    return "";
  }
}

export async function searchFeeds(input: {
  roles: string[];
  locations: string[];
  excluded: string[];
  perQuery: number;
  providers?: string[] | undefined;
}): Promise<FeedSearchResult> {
  const enabled = (id: string) => !input.providers || input.providers.includes(id);
  const roles = input.roles.filter(Boolean).slice(0, 16);
  const locations = input.locations.filter(Boolean).slice(0, 3);
  const combos: { query: string; location: string }[] = [];
  for (const role of roles.length ? roles : ["Projektmanager"]) {
    if (locations.length) for (const loc of locations) combos.push({ query: role, location: loc });
    else combos.push({ query: role, location: "" });
  }

  const roleTokens = new Set(roles.flatMap(tokens));
  const excluded = input.excluded.map((e) => e.toLowerCase()).filter((e) => e.length > 2);

  const sources: FeedSourceStat[] = [];
  const found = new Map<string, FoundJob>();

  for (const combo of enabled("arbeitsagentur") ? combos.slice(0, 24) : []) {
    try {
      const { list, url, available } = await fetchList(combo.query, combo.location, input.perQuery);
      let matched = 0;
      for (const item of list) {
        const refnr = item.referenznummer;
        const title = item.stellenangebotsTitel ?? item.titel ?? item.beruf ?? "";
        if (!refnr || !title) continue;
        const company = item.arbeitgeber ?? item.firma ?? "Unbekannt";
        const haystack = `${title} ${company}`.toLowerCase();
        if (excluded.some((term) => haystack.includes(term))) continue;

        const hits = [...roleTokens].filter((t) => haystack.includes(t));
        const score = Math.min(100, 40 + hits.length * 20);
        if (roleTokens.size > 0 && hits.length === 0) continue;

        matched += 1;
        if (found.has(refnr)) continue;
        const address = item.stellenlokationen?.[0]?.adresse ?? item.arbeitsort ?? {};
        const salary =
          item.gehaltsspanneVon && item.gehaltsspanneBis
            ? `${Math.round(item.gehaltsspanneVon).toLocaleString("de-DE")} – ${Math.round(
                item.gehaltsspanneBis,
              ).toLocaleString("de-DE")} EUR p. a.`
            : "";
        found.set(refnr, {
          refnr,
          title,
          company,
          location: address.ort ?? combo.location,
          region: address.region ?? "",
          country: address.land ?? "Deutschland",
          publication_date: item.datumErsteVeroeffentlichung ?? null,
          salary_range: salary,
          url: jobUrl(refnr),
          description: "",
          source: FEED_SOURCE,
          company_url: companyWebsiteUrl(company),
          company_careers_url: companyCareersUrl(company),
          score,
          reasons: hits,
        });
      }
      sources.push({
        source: FEED_SOURCE,
        query: combo.query,
        location: combo.location || "bundesweit",
        url,
        scanned: list.length,
        available,
        matched,
      });
    } catch (error) {
      sources.push({
        source: FEED_SOURCE,
        query: combo.query,
        location: combo.location || "bundesweit",
        url: "",
        scanned: 0,
        available: 0,
        matched: 0,
        error: (error as Error).message,
      });
    }
  }

  const primaryLocation = locations[0] ?? "";
  const activeRoles = roles.length ? roles : ["Projektmanager"];

  // --- Crawler: DACH, Liechtenstein, Luxemburg, Meta-Portale ---
  const crawlerTargets: { label: string; location: string; role: string; run: () => Promise<CrawlResult> }[] = [];
  for (const role of activeRoles) {
    if (enabled("stepstone-at")) crawlerTargets.push({ label: "StepStone Österreich", location: "Österreich", role, run: () => crawlStepstoneAt(role, "") });
    if (enabled("jobs-ch")) crawlerTargets.push({ label: "jobs.ch", location: "Schweiz", role, run: () => crawlJobsCh(role, "") });
    if (enabled("job-room")) crawlerTargets.push({ label: "Job-Room (CH/LI)", location: "Schweiz / Liechtenstein", role, run: () => crawlJobRoom(role) });
    if (enabled("jobs-ch")) crawlerTargets.push({ label: "jobs.ch", location: "Liechtenstein", role, run: () => crawlJobsCh(role, "Liechtenstein") });
    if (enabled("moovijob")) crawlerTargets.push({ label: "Moovijob (LU)", location: "Luxemburg", role, run: () => crawlMoovijob(role) });
    if (enabled("nomado24")) crawlerTargets.push({ label: "Nomado24", location: "Remote / Deutschland", role, run: () => crawlNomado24(role) });
    if (enabled("metajob")) crawlerTargets.push({ label: "metajob.de", location: primaryLocation || "Deutschland", role, run: () => crawlMetajob(role, primaryLocation) });
  }

  // --- Gehosteter Browser (Playwright-Rendering) fuer JS-lastige Portale ---
  const browserTargets: { label: string; location: string; role: string; run: () => Promise<CrawlResult> }[] = [];
  const anyBrowser = ["linkedin", "indeed", "stepstone-de", "xing"].some(enabled);
  if (browserCrawlersEnabled() && anyBrowser) {
    // Kreditschonend: nur die ersten Suchbegriffe durch den kostenpflichtigen Browser.
    for (const role of activeRoles.slice(0, 2)) {
      if (enabled("linkedin")) browserTargets.push({ label: "LinkedIn Jobs", location: primaryLocation || "Deutschland", role, run: () => crawlLinkedIn(role, primaryLocation) });
      if (enabled("indeed")) browserTargets.push({ label: "Indeed", location: primaryLocation || "Deutschland", role, run: () => crawlIndeed(role, primaryLocation) });
      if (enabled("stepstone-de")) browserTargets.push({ label: "StepStone Deutschland", location: primaryLocation || "Deutschland", role, run: () => crawlStepstoneDe(role, primaryLocation) });
      if (enabled("xing")) browserTargets.push({ label: "Xing Jobs", location: primaryLocation || "Deutschland", role, run: () => crawlXing(role, primaryLocation) });
    }
  } else if (anyBrowser) {
    sources.push({
      source: `Browser-Rendering (${renderProviderLabel()})`,
      query: activeRoles[0] ?? "",
      location: primaryLocation || "Deutschland",
      url: "",
      scanned: 0,
      available: 0,
      matched: 0,
      error:
        "Kein Browser-Dienst hinterlegt – LinkedIn, Indeed, StepStone DE und Xing werden übersprungen. API-Key für Browserless, ScrapingBee oder Bright Data hinterlegen.",
    });
  }

  // --- Job-Aggregatoren (Adzuna, Jooble, Careerjet, TheirStack, Techmap) ---
  const aggregatorTargets: { label: string; location: string; role: string; run: () => Promise<CrawlResult> }[] = [];
  // TheirStack zuerst (einziger aktiver Key) – damit es nie durch das Limit abgeschnitten wird.
  for (const role of enabled("theirstack") ? activeRoles : []) {
    aggregatorTargets.push({ label: "TheirStack", location: "DACH / LU / LI", role, run: () => searchTheirStack(role, ["DE", "AT", "CH", "LU", "LI"]) });
  }
  for (const role of activeRoles) {
    if (enabled("adzuna")) {
      aggregatorTargets.push({ label: "Adzuna (Deutschland)", location: primaryLocation || "Deutschland", role, run: () => searchAdzuna(role, "de", primaryLocation) });
      aggregatorTargets.push({ label: "Adzuna (Österreich)", location: "Österreich", role, run: () => searchAdzuna(role, "at", "") });
      aggregatorTargets.push({ label: "Adzuna (Schweiz)", location: "Schweiz", role, run: () => searchAdzuna(role, "ch", "") });
    }
    if (enabled("jooble")) aggregatorTargets.push({ label: "Jooble", location: primaryLocation || "Deutschland", role, run: () => searchJooble(role, primaryLocation) });
    if (enabled("careerjet")) {
      aggregatorTargets.push({ label: "Careerjet (Deutschland)", location: primaryLocation || "Deutschland", role, run: () => searchCareerjet(role, "de", primaryLocation) });
      aggregatorTargets.push({ label: "Careerjet (Österreich)", location: "Österreich", role, run: () => searchCareerjet(role, "at", "") });
      aggregatorTargets.push({ label: "Careerjet (Schweiz)", location: "Schweiz", role, run: () => searchCareerjet(role, "ch", "") });
      aggregatorTargets.push({ label: "Careerjet (Luxemburg)", location: "Luxemburg", role, run: () => searchCareerjet(role, "lu", "") });
    }
    if (enabled("techmap")) {
      aggregatorTargets.push({ label: "Techmap (DE)", location: "Deutschland", role, run: () => searchTechmap(role, "de") });
      aggregatorTargets.push({ label: "Techmap (AT)", location: "Österreich", role, run: () => searchTechmap(role, "at") });
      aggregatorTargets.push({ label: "Techmap (CH)", location: "Schweiz", role, run: () => searchTechmap(role, "ch") });
    }
  }

  const crawlerRuns = await Promise.all(
    [
      // Browser-Quellen zuerst: sie duerfen nie durch das Limit entfallen.
      ...browserTargets.map((target) => ({ target, role: target.role })),
      ...crawlerTargets.slice(0, 60).map((target) => ({ target, role: target.role })),
      ...aggregatorTargets.slice(0, 48).map((target) => ({ target, role: target.role })),
    ].map(async ({ target, role }) => {
      try {
        return { target, role, result: await target.run(), error: "" };
      } catch (error) {
        return { target, role, result: null, error: (error as Error).message };
      }
    }),
  );

  for (const run of crawlerRuns) {
    if (!run.result) {
      sources.push({
        source: run.target.label,
        query: run.role,
        location: run.target.location,
        url: "",
        scanned: 0,
        available: 0,
        matched: 0,
        error: run.error,
      });
      continue;
    }
    let matched = 0;
    for (const item of run.result.jobs) {
      const haystack = `${item.title} ${item.company}`.toLowerCase();
      if (excluded.some((term) => haystack.includes(term))) continue;
      const hits = [...roleTokens].filter((t) => haystack.includes(t));
      if (roleTokens.size > 0 && hits.length === 0) continue;
      matched += 1;
      if (found.has(item.url)) continue;
      found.set(item.url, {
        refnr: item.id,
        title: item.title,
        company: item.company,
        location: item.location,
        region: run.target.location,
        country: item.country,
        publication_date: item.publication_date,
        salary_range: "",
        url: item.url,
        description: item.description,
        source: run.result.source,
        company_url: companyWebsiteUrl(item.company),
        company_careers_url: companyCareersUrl(item.company),
        score: Math.min(100, 40 + hits.length * 20),
        reasons: hits,
      });
    }
    sources.push({
      source: run.result.source,
      query: run.role,
      location: run.target.location,
      url: run.result.url,
      scanned: run.result.jobs.length,
      available: run.result.available,
      matched,
    });
  }

  const jobs = [...found.values()].sort((a, b) => b.score - a.score).slice(0, 40);
  await Promise.all(
    jobs
      .filter((job) => job.source === FEED_SOURCE && !job.description)
      .slice(0, 12)
      .map(async (job) => {
        job.description = await fetchDescription(job.refnr);
      }),
  );

  return {
    sources,
    portals: [
      ...combos.slice(0, 8).flatMap((c) => portalSearchLinks(c.query, c.location)),
      ...(roles.length ? roles : ["Projektmanager"]).slice(0, 2).flatMap((role) => regionalPortalLinks(role)),
    ]
      .filter(
        (link, index, all) => all.findIndex((other) => other.url === link.url) === index,
      ),
    jobs,
    scanned: sources.reduce((sum, s) => sum + s.scanned, 0),
    matched: jobs.length,
    ran_at: new Date().toISOString(),
  };
}
