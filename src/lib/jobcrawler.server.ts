/** Crawler fuer oeffentliche Stellenportale in DACH + Liechtenstein/Luxemburg. */
import { renderHtmlSafe, renderHtml, renderProvider } from "./browserfetch.server";

export type CrawledJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  country: string;
  publication_date: string | null;
  url: string;
  description: string;
};

export type CrawlResult = {
  source: string;
  url: string;
  available: number;
  jobs: CrawledJob[];
};

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

async function getHtml(url: string): Promise<string> {
  return renderHtmlSafe(url);
}

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/** Alle JobPosting-Objekte aus den JSON-LD-Bloecken einer Seite. */
function jsonLdJobs(html: string): any[] {
  const out: any[] = [];
  const blocks = html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi);
  for (const block of blocks) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(block[1] ?? "null");
    } catch {
      continue;
    }
    const walk = (node: unknown) => {
      if (Array.isArray(node)) return node.forEach(walk);
      if (!node || typeof node !== "object") return;
      const obj = node as any;
      if (obj["@type"] === "JobPosting") out.push(obj);
      Object.values(obj).forEach(walk);
    };
    walk(parsed);
  }
  return out;
}

function fromJsonLd(job: any, fallbackCountry: string): CrawledJob | null {
  const title = typeof job.title === "string" ? job.title.trim() : "";
  const url = typeof job.url === "string" ? job.url : "";
  if (!title || !url) return null;
  const org = job.hiringOrganization;
  const address = job.jobLocation?.address ?? job.jobLocation?.[0]?.address ?? {};
  return {
    id: url,
    title,
    company: (typeof org === "object" && org?.name) || "Unbekannt",
    location: address.addressLocality ?? address.addressRegion ?? "",
    country: address.addressCountry ?? fallbackCountry,
    publication_date: typeof job.datePosted === "string" ? job.datePosted : null,
    url,
    description: stripHtml(String(job.description ?? "")).slice(0, 12000),
  };
}

/** jobs.ch – Schweiz und (per Suchbegriff) Liechtenstein. */
export async function crawlJobsCh(role: string, location: string): Promise<CrawlResult> {
  const term = [role, location].filter(Boolean).join(" ");
  const url = `https://www.jobs.ch/de/stellenangebote/?term=${encodeURIComponent(term)}`;
  const html = await getHtml(url);
  const jobs = jsonLdJobs(html)
    .map((j) => fromJsonLd(j, "Schweiz"))
    .filter((j): j is CrawledJob => Boolean(j));
  const count = html.match(/"numberOfItems":\s*(\d+)/);
  return { source: "jobs.ch", url, available: count ? Number(count[1]) : jobs.length, jobs };
}

/** StepStone Oesterreich – strukturierte Trefferliste aus dem Preload-State. */
export async function crawlStepstoneAt(role: string, location: string): Promise<CrawlResult> {
  const path = location
    ? `${encodeURIComponent(role)}/in-${encodeURIComponent(location)}`
    : encodeURIComponent(role);
  const url = `https://www.stepstone.at/jobs/${path}`;
  const html = await getHtml(url);
  const start = html.indexOf('"items":[');
  const jobs: CrawledJob[] = [];
  let available = 0;
  if (start >= 0) {
    const arrayStart = html.indexOf("[", start);
    let depth = 0;
    let end = -1;
    for (let i = arrayStart; i < html.length; i += 1) {
      const c = html[i]!;
      if (c === "[") depth += 1;
      else if (c === "]") {
        depth -= 1;
        if (depth === 0) {
          end = i + 1;
          break;
        }
      }
    }
    if (end > 0) {
      try {
        const items = JSON.parse(html.slice(arrayStart, end)) as any[];
        for (const item of items) {
          if (!item?.title || !item?.url) continue;
          const href = String(item.url).startsWith("http")
            ? String(item.url)
            : `https://www.stepstone.at${item.url}`;
          jobs.push({
            id: href,
            title: String(item.title),
            company: String(item.companyName ?? "Unbekannt"),
            location: String(item.location ?? location ?? ""),
            country: "Österreich",
            publication_date: typeof item.datePosted === "string" ? item.datePosted : null,
            url: href,
            description: stripHtml(String(item.jobSnippet ?? item.description ?? "")).slice(0, 12000),
          });
        }
      } catch {
        /* Trefferliste nicht lesbar */
      }
    }
  }
  const total = html.match(/"numberOfJobs?":\s*(\d+)/) ?? html.match(/"totalResults?":\s*(\d+)/);
  available = total ? Number(total[1]) : jobs.length;
  return { source: "StepStone Österreich", url, available, jobs };
}

/** Job-Room (offizielle Stellenplattform des Bundes, Schweiz/Liechtenstein). */
export async function crawlJobRoom(role: string): Promise<CrawlResult> {
  const api = "https://www.job-room.ch/jobadservice/api/jobAdvertisements/_search?page=0&size=25&sort=score";
  const res = await fetch(api, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json", "user-agent": UA },
    body: JSON.stringify({ permanent: null, workloadPercentageMin: 0, workloadPercentageMax: 100, keywords: [role] }),
  });
  if (!res.ok) throw new Error(`Antwort ${res.status}`);
  const total = Number(res.headers.get("x-total-count") ?? 0);
  const data = (await res.json()) as any[];
  const jobs: CrawledJob[] = [];
  for (const entry of data) {
    const ad = entry?.jobAdvertisement;
    const content = ad?.jobContent;
    const desc = content?.jobDescriptions?.[0];
    if (!ad?.id || !desc?.title) continue;
    const url = `https://www.job-room.ch/job-search/${ad.id}`;
    jobs.push({
      id: url,
      title: stripHtml(desc.title),
      company: content?.company?.name ?? "Unbekannt",
      location: content?.location?.city ?? "",
      country: content?.location?.countryIsoCode === "LI" ? "Liechtenstein" : "Schweiz",
      publication_date: typeof ad.createdTime === "string" ? ad.createdTime : null,
      url,
      description: stripHtml(String(desc.description ?? "")).slice(0, 12000),
    });
  }
  return { source: "Job-Room (CH/LI)", url: `https://www.job-room.ch/job-search?query=${encodeURIComponent(role)}`, available: total || jobs.length, jobs };
}

/** Moovijob Luxemburg – Trefferliste der Suchseite. */
export async function crawlMoovijob(role: string): Promise<CrawlResult> {
  const url = `https://www.moovijob.com/recherche?q=${encodeURIComponent(role)}`;
  const html = await getHtml(url);
  const jobs: CrawledJob[] = [];
  const seen = new Set<string>();
  const cards = html.matchAll(
    /<a\s+href="(https:\/\/www\.moovijob\.com\/offres-emploi\/[^"]+\/[^"?]+)"[\s\S]{0,1600}?card-job-offer-new-title[^>]*>([\s\S]*?)<\/p>[\s\S]{0,400}?company-name[^>]*>([\s\S]*?)<\/p>/g,
  );
  for (const card of cards) {
    const href = card[1]!;
    if (seen.has(href)) continue;
    seen.add(href);
    const title = stripHtml(card[2] ?? "");
    if (!title) continue;
    jobs.push({
      id: href,
      title,
      company: stripHtml(card[3] ?? "") || "Unbekannt",
      location: "Luxemburg",
      country: "Luxemburg",
      publication_date: null,
      url: href,
      description: "",
    });
  }
  return { source: "Moovijob (LU)", url, available: jobs.length, jobs };
}

/** Nomado24 – deutscher Remote-Job-Aggregator (serverseitig gerenderte Trefferliste). */
export async function crawlNomado24(role: string): Promise<CrawlResult> {
  const url = `https://www.nomado24.de/de/remote-jobs/alle?query=${encodeURIComponent(role)}`;
  const html = await getHtml(url);
  const jobs: CrawledJob[] = [];
  const seen = new Set<string>();
  const cards = html.matchAll(
    /<a[^>]+href="(\/de\/remote-jobs\/job\/[^"]+)"[^>]*>([\s\S]*?)<\/a>\s*<span[^>]*>([\s\S]*?)<\/span>/g,
  );
  for (const card of cards) {
    const href = `https://www.nomado24.de${card[1]}`;
    if (seen.has(href)) continue;
    seen.add(href);
    const title = stripHtml(card[2] ?? "");
    if (!title) continue;
    const meta = stripHtml(card[3] ?? "").split("·");
    jobs.push({
      id: href,
      title,
      company: (meta[0] ?? "").trim() || "Unbekannt",
      location: (meta[1] ?? "").trim() || "Remote",
      country: "Deutschland",
      publication_date: null,
      url: href,
      description: "",
    });
  }
  return { source: "Nomado24", url, available: jobs.length, jobs };
}

/** metajob.de – Meta-Suchmaschine (blockt Bots haeufig, daher tolerant). */
export async function crawlMetajob(role: string, location: string): Promise<CrawlResult> {
  const url = `https://www.metajob.de/${encodeURIComponent(role)}${location ? `/in-${encodeURIComponent(location)}` : ""}`;
  const html = await getHtml(url);
  const jobs = jsonLdJobs(html)
    .map((j) => fromJsonLd(j, "Deutschland"))
    .filter((j): j is CrawledJob => Boolean(j));
  return { source: "metajob.de", url, available: jobs.length, jobs };
}

/** True, sobald ein gehosteter Browser konfiguriert ist. */
export function browserCrawlersEnabled(): boolean {
  return renderProvider() !== "plain";
}

/** LinkedIn Jobs – gerenderte Trefferliste (Guest-Ansicht). */
export async function crawlLinkedIn(role: string, location: string): Promise<CrawlResult> {
  const loc = location || "Deutschland";
  const url = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(role)}&location=${encodeURIComponent(loc)}`;
  const html = await renderHtml(url, 3500);
  const jobs: CrawledJob[] = [];
  const seen = new Set<string>();
  const cards = html.matchAll(
    /<a[^>]+href="(https:\/\/[a-z.]*linkedin\.com\/jobs\/view\/[^"?]+)[^"]*"[\s\S]{0,2500}?base-search-card__title"[^>]*>([\s\S]*?)<\/h3>[\s\S]{0,600}?base-search-card__subtitle"[^>]*>([\s\S]*?)<\/h4>[\s\S]{0,600}?job-search-card__location"[^>]*>([\s\S]*?)<\/span>/g,
  );
  for (const card of cards) {
    const href = card[1]!;
    if (seen.has(href)) continue;
    seen.add(href);
    const title = stripHtml(card[2] ?? "");
    if (!title) continue;
    jobs.push({
      id: href,
      title,
      company: stripHtml(card[3] ?? "") || "Unbekannt",
      location: stripHtml(card[4] ?? "") || loc,
      country: loc,
      publication_date: null,
      url: href,
      description: "",
    });
  }
  if (!jobs.length) {
    for (const j of jsonLdJobs(html).map((x) => fromJsonLd(x, loc))) if (j) jobs.push(j);
  }
  return { source: "LinkedIn Jobs", url, available: jobs.length, jobs };
}

/** Indeed – gerenderte Trefferliste (nur mit Browser-Dienst realistisch). */
export async function crawlIndeed(role: string, location: string): Promise<CrawlResult> {
  const url = `https://de.indeed.com/jobs?q=${encodeURIComponent(role)}${location ? `&l=${encodeURIComponent(location)}` : ""}`;
  const html = await renderHtml(url, 4000);
  const jobs: CrawledJob[] = [];
  const seen = new Set<string>();
  const cards = html.matchAll(
    /<a[^>]+data-jk="([^"]+)"[\s\S]{0,1200}?<span[^>]*title="([^"]+)"[\s\S]{0,1500}?company_location[\s\S]{0,600}?>([\s\S]*?)<\/div>/g,
  );
  for (const card of cards) {
    const href = `https://de.indeed.com/viewjob?jk=${card[1]}`;
    if (seen.has(href)) continue;
    seen.add(href);
    const meta = stripHtml(card[3] ?? "");
    jobs.push({
      id: href,
      title: stripHtml(card[2] ?? ""),
      company: meta.split(/\s{2,}|·/)[0]?.trim() || "Unbekannt",
      location: location || meta,
      country: "Deutschland",
      publication_date: null,
      url: href,
      description: "",
    });
  }
  if (!jobs.length) {
    for (const j of jsonLdJobs(html).map((x) => fromJsonLd(x, "Deutschland"))) if (j) jobs.push(j);
  }
  return { source: "Indeed", url, available: jobs.length, jobs };
}

/** StepStone Deutschland – gerenderte Trefferliste. */
export async function crawlStepstoneDe(role: string, location: string): Promise<CrawlResult> {
  const path = location
    ? `${encodeURIComponent(role)}/in-${encodeURIComponent(location)}`
    : encodeURIComponent(role);
  const url = `https://www.stepstone.de/jobs/${path}`;
  const html = await renderHtml(url, 3500);
  const jobs = jsonLdJobs(html)
    .map((j) => fromJsonLd(j, "Deutschland"))
    .filter((j): j is CrawledJob => Boolean(j));
  const total = html.match(/"totalResults?":\s*(\d+)/);
  return { source: "StepStone Deutschland", url, available: total ? Number(total[1]) : jobs.length, jobs };
}

/** Xing Jobs – gerenderte Trefferliste. */
export async function crawlXing(role: string, location: string): Promise<CrawlResult> {
  const url = `https://www.xing.com/jobs/search?keywords=${encodeURIComponent(role)}${location ? `&location=${encodeURIComponent(location)}` : ""}`;
  const html = await renderHtml(url, 3500);
  const jobs = jsonLdJobs(html)
    .map((j) => fromJsonLd(j, "Deutschland"))
    .filter((j): j is CrawledJob => Boolean(j));
  return { source: "Xing Jobs", url, available: jobs.length, jobs };
}
