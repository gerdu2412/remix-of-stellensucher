/** Adapter fuer Job-Aggregatoren (Adzuna, Jooble, Careerjet). */
import type { CrawledJob, CrawlResult } from "./jobcrawler.server";

const enc = encodeURIComponent;

export class MissingKeyError extends Error {}

function stripTags(value: string): string {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/** Adzuna – Aggregator mit offizieller API (DE/AT/CH). */
export async function searchAdzuna(role: string, country: "de" | "at" | "ch", location: string): Promise<CrawlResult> {
  const appId = process.env["ADZUNA_APP_ID"];
  const appKey = process.env["ADZUNA_APP_KEY"];
  const publicUrl = `https://www.adzuna.${country === "de" ? "de" : country}/search?q=${enc(role)}`;
  if (!appId || !appKey) {
    throw new MissingKeyError("Adzuna-API-Schlüssel fehlt (ADZUNA_APP_ID / ADZUNA_APP_KEY)");
  }
  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    results_per_page: "25",
    what: role,
    "content-type": "application/json",
  });
  if (location) params.set("where", location);
  const res = await fetch(`https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params.toString()}`, {
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Antwort ${res.status}`);
  const data = (await res.json()) as { count?: number; results?: any[] };
  const countryName = country === "de" ? "Deutschland" : country === "at" ? "Österreich" : "Schweiz";
  const jobs: CrawledJob[] = (data.results ?? [])
    .filter((r) => r?.redirect_url && r?.title)
    .map((r) => ({
      id: String(r.id ?? r.redirect_url),
      title: stripTags(String(r.title)),
      company: r.company?.display_name ?? "Unbekannt",
      location: r.location?.display_name ?? location,
      country: countryName,
      publication_date: typeof r.created === "string" ? r.created : null,
      url: String(r.redirect_url),
      description: stripTags(String(r.description ?? "")).slice(0, 12000),
    }));
  return { source: `Adzuna (${countryName})`, url: publicUrl, available: data.count ?? jobs.length, jobs };
}

/** Jooble – Aggregator-API (POST mit Key in der URL). */
export async function searchJooble(role: string, location: string): Promise<CrawlResult> {
  const key = process.env["JOOBLE_API_KEY"];
  const publicUrl = `https://de.jooble.org/SearchResult?ukw=${enc(role)}${location ? `&rgns=${enc(location)}` : ""}`;
  if (!key) throw new MissingKeyError("Jooble-API-Schlüssel fehlt (JOOBLE_API_KEY)");
  const res = await fetch(`https://jooble.org/api/${key}`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ keywords: role, location: location || "Deutschland", page: "1" }),
  });
  if (!res.ok) throw new Error(`Antwort ${res.status}`);
  const data = (await res.json()) as { totalCount?: number; jobs?: any[] };
  const jobs: CrawledJob[] = (data.jobs ?? [])
    .filter((j) => j?.link && j?.title)
    .map((j) => ({
      id: String(j.id ?? j.link),
      title: stripTags(String(j.title)),
      company: j.company || "Unbekannt",
      location: j.location || location,
      country: location || "Deutschland",
      publication_date: typeof j.updated === "string" ? j.updated : null,
      url: String(j.link),
      description: stripTags(String(j.snippet ?? "")).slice(0, 12000),
    }));
  return { source: "Jooble", url: publicUrl, available: data.totalCount ?? jobs.length, jobs };
}

const CAREERJET_LOCALES: Record<string, { locale: string; country: string; host: string }> = {
  de: { locale: "de_DE", country: "Deutschland", host: "www.careerjet.de" },
  at: { locale: "de_AT", country: "Österreich", host: "www.careerjet.at" },
  ch: { locale: "de_CH", country: "Schweiz", host: "www.careerjet.ch" },
  lu: { locale: "fr_LU", country: "Luxemburg", host: "www.careerjet.lu" },
};

/** Careerjet – Public Search API (benoetigt Partner-Affiliate-ID). */
export async function searchCareerjet(role: string, market: keyof typeof CAREERJET_LOCALES, location: string): Promise<CrawlResult> {
  const cfg = CAREERJET_LOCALES[market]!;
  const affid = process.env["CAREERJET_AFFID"];
  const publicUrl = `https://${cfg.host}/stellenangebote?s=${enc(role)}&l=${enc(location)}`;
  if (!affid) throw new MissingKeyError("Careerjet-Affiliate-ID fehlt (CAREERJET_AFFID)");
  const params = new URLSearchParams({
    locale_code: cfg.locale,
    keywords: role,
    location,
    affid,
    pagesize: "25",
    user_ip: "1.1.1.1",
    user_agent: "Mozilla/5.0 (compatible; CareerPilotAI/1.0)",
  });
  const res = await fetch(`https://public.api.careerjet.net/search?${params.toString()}`, {
    headers: { accept: "application/json", referer: `https://${cfg.host}/` },
  });
  if (!res.ok) throw new Error(`Antwort ${res.status}`);
  const data = (await res.json()) as { type?: string; error?: string; hits?: number; jobs?: any[] };
  if (data.type === "ERROR") throw new Error(data.error ?? "Careerjet-Fehler");
  const jobs: CrawledJob[] = (data.jobs ?? [])
    .filter((j) => j?.url && j?.title)
    .map((j) => ({
      id: String(j.url),
      title: stripTags(String(j.title)),
      company: j.company || "Unbekannt",
      location: j.locations || location,
      country: cfg.country,
      publication_date: typeof j.date === "string" ? j.date : null,
      url: String(j.url),
      description: stripTags(String(j.description ?? "")).slice(0, 12000),
    }));
  return { source: `Careerjet (${cfg.country})`, url: publicUrl, available: data.hits ?? jobs.length, jobs };
}

/** TheirStack – Job-Datenbank mit Firmen-/Tech-Signalen (API-Key noetig). */
export async function searchTheirStack(role: string, countries: string[]): Promise<CrawlResult> {
  const key = process.env["THEIRSTACK_API_KEY"];
  const publicUrl = `https://theirstack.com/en/jobs?q=${enc(role)}`;
  if (!key) throw new MissingKeyError("TheirStack-API-Schlüssel fehlt (THEIRSTACK_API_KEY)");
  const res = await fetch("https://api.theirstack.com/v1/jobs/search", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      page: 0,
      limit: 25,
      job_title_or: [role],
      job_country_code_or: countries,
      posted_at_max_age_days: 30,
    }),
  });
  if (!res.ok) throw new Error(`Antwort ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = (await res.json()) as { metadata?: { total_results?: number }; data?: any[] };
  const jobs: CrawledJob[] = (data.data ?? [])
    .filter((j) => j?.url && j?.job_title)
    .map((j) => ({
      id: String(j.id ?? j.url),
      title: stripTags(String(j.job_title)),
      company: j.company_object?.name ?? j.company ?? "Unbekannt",
      location: j.location ?? j.short_location ?? "",
      country: j.country ?? "",
      publication_date: typeof j.date_posted === "string" ? j.date_posted : null,
      url: String(j.final_url ?? j.url),
      description: stripTags(String(j.description ?? "")).slice(0, 12000),
    }));
  return { source: "TheirStack", url: publicUrl, available: data.metadata?.total_results ?? jobs.length, jobs };
}

/** Techmap – taegliche internationale Stellenanzeigen (RapidAPI-Key noetig). */
export async function searchTechmap(role: string, countryCode: string): Promise<CrawlResult> {
  const key = process.env["TECHMAP_RAPIDAPI_KEY"];
  const publicUrl = `https://techmap.io/`;
  if (!key) throw new MissingKeyError("Techmap-API-Schlüssel fehlt (TECHMAP_RAPIDAPI_KEY)");
  const params = new URLSearchParams({
    title: role,
    countryCode,
    dateCreated: new Date(Date.now() - 14 * 864e5).toISOString().slice(0, 10),
    limit: "25",
  });
  const res = await fetch(`https://daily-international-job-postings.p.rapidapi.com/api/v2/jobs/search?${params.toString()}`, {
    headers: {
      "x-rapidapi-key": key,
      "x-rapidapi-host": "daily-international-job-postings.p.rapidapi.com",
      accept: "application/json",
    },
  });
  if (!res.ok) throw new Error(`Antwort ${res.status}`);
  const data = (await res.json()) as { totalCount?: number; result?: any[] };
  const jobs: CrawledJob[] = (data.result ?? [])
    .filter((j) => (j?.json?.url || j?.url) && (j?.json?.title || j?.title))
    .map((j) => {
      const src = j.json ?? j;
      return {
        id: String(src.id ?? src.url),
        title: stripTags(String(src.title)),
        company: src.hiringOrganization?.name ?? src.company ?? "Unbekannt",
        location: src.jobLocation?.address?.addressLocality ?? src.city ?? "",
        country: src.jobLocation?.address?.addressCountry ?? countryCode,
        publication_date: typeof src.datePosted === "string" ? src.datePosted : null,
        url: String(src.url),
        description: stripTags(String(src.description ?? "")).slice(0, 12000),
      };
    });
  return { source: `Techmap (${countryCode})`, url: publicUrl, available: data.totalCount ?? jobs.length, jobs };
}
