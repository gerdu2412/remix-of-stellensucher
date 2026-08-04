import { companyCareersUrl, companyWebsiteUrl, portalSearchLinks, type PortalLink } from "./joblinks";

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
}): Promise<FeedSearchResult> {
  const roles = input.roles.filter(Boolean).slice(0, 4);
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

  for (const combo of combos.slice(0, 8)) {
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

  const jobs = [...found.values()].sort((a, b) => b.score - a.score).slice(0, 20);
  await Promise.all(
    jobs.slice(0, 12).map(async (job) => {
      job.description = await fetchDescription(job.refnr);
    }),
  );

  return {
    sources,
    portals: combos
      .slice(0, 8)
      .flatMap((c) => portalSearchLinks(c.query, c.location))
      .filter(
        (link, index, all) => all.findIndex((other) => other.url === link.url) === index,
      ),
    jobs,
    scanned: sources.reduce((sum, s) => sum + s.scanned, 0),
    matched: jobs.length,
    ran_at: new Date().toISOString(),
  };
}
