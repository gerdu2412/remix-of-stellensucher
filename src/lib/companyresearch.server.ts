export type FeedItem = { title: string; source: string; date: string; url: string };

function decode(value: string): string {
  return value
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function pick(block: string, tag: string): string {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return match ? decode(match[1]) : "";
}

async function fetchFeed(query: string, limit: number): Promise<FeedItem[]> {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(`${query} when:6m`)}&hl=de&gl=DE&ceid=DE:de`;
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; CareerPilotBot/1.0)" },
      signal: AbortSignal.timeout(12_000),
    });
    if (!response.ok) return [];
    const xml = await response.text();
    const blocks = xml.split("<item>").slice(1, limit + 1);
    return blocks
      .map((block) => ({
        title: pick(block, "title"),
        source: pick(block, "source"),
        date: pick(block, "pubDate"),
        url: pick(block, "link"),
      }))
      .filter((item) => item.title);
  } catch {
    return [];
  }
}

/** Sammelt Nachrichten, Pressemitteilungen und Arbeitgeberbewertungen der letzten 6 Monate. */
export async function collectCompanyResearch(company: string) {
  const [news, press, reviews] = await Promise.all([
    fetchFeed(company, 10),
    fetchFeed(`"${company}" Pressemitteilung OR Presseinformation`, 8),
    fetchFeed(`"${company}" Arbeitgeber Bewertung OR kununu OR Mitarbeiter`, 6),
  ]);
  return { news, press, reviews };
}

export function researchToPrompt(research: Awaited<ReturnType<typeof collectCompanyResearch>>): string {
  const render = (label: string, items: FeedItem[]) =>
    `${label}:\n${items.length ? items.map((i) => `- ${i.date} | ${i.source} | ${i.title}`).join("\n") : "(keine Treffer)"}`;
  return [
    render("NACHRICHTEN (6 Monate)", research.news),
    render("PRESSEMITTEILUNGEN (6 Monate)", research.press),
    render("ARBEITGEBERBEWERTUNGEN / MITARBEITERSTIMMEN", research.reviews),
  ].join("\n\n");
}
