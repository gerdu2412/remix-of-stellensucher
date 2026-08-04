/**
 * Gerenderter Seitenabruf ("Playwright as a Service").
 * Playwright selbst laeuft nicht in der Serverless-Runtime (kein Chromium, kein
 * child_process). Stattdessen wird ein gehosteter Browser per HTTP genutzt.
 * Unterstuetzt: Browserless, ScrapingBee, Bright Data Web Unlocker.
 * Ohne Key faellt der Abruf auf einen normalen fetch zurueck.
 */

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

export type RenderMode = "browserless" | "scrapingbee" | "brightdata" | "plain";

/* ---------- Kreditschonung: Cache + Budget ---------- */

/** Wie lange ein gerendertes Ergebnis wiederverwendet wird (ms). */
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
/** Maximale kostenpflichtige Render-Aufrufe pro Zeitfenster. */
const RENDER_BUDGET = 12;
const BUDGET_WINDOW_MS = 60 * 60 * 1000;

const cache = new Map<string, { html: string; at: number }>();
let budgetWindowStart = 0;
let budgetUsed = 0;

function cacheGet(url: string): string | null {
  const hit = cache.get(url);
  if (!hit) return null;
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    cache.delete(url);
    return null;
  }
  return hit.html;
}

function cacheSet(url: string, html: string): void {
  if (cache.size > 200) cache.clear();
  cache.set(url, { html, at: Date.now() });
}

/** True, solange noch Render-Budget im aktuellen Zeitfenster frei ist. */
function takeBudget(): boolean {
  const now = Date.now();
  if (now - budgetWindowStart > BUDGET_WINDOW_MS) {
    budgetWindowStart = now;
    budgetUsed = 0;
  }
  if (budgetUsed >= RENDER_BUDGET) return false;
  budgetUsed += 1;
  return true;
}

export function renderBudgetStatus(): { used: number; limit: number } {
  const now = Date.now();
  if (now - budgetWindowStart > BUDGET_WINDOW_MS) return { used: 0, limit: RENDER_BUDGET };
  return { used: budgetUsed, limit: RENDER_BUDGET };
}

/** Heuristik: sieht die Seite nach Blockade/Bot-Wall aus? */
function looksBlocked(html: string): boolean {
  if (html.length < 3000) return true;
  const lower = html.slice(0, 5000).toLowerCase();
  return (
    lower.includes("captcha") ||
    lower.includes("access denied") ||
    lower.includes("just a moment") ||
    lower.includes("verify you are human")
  );
}

export function renderProvider(): RenderMode {
  if (process.env["BROWSERLESS_API_KEY"]) return "browserless";
  if (process.env["SCRAPINGBEE_API_KEY"]) return "scrapingbee";
  if (process.env["BRIGHTDATA_API_TOKEN"]) return "brightdata";
  return "plain";
}

export function renderProviderLabel(): string {
  switch (renderProvider()) {
    case "browserless":
      return "Browserless";
    case "scrapingbee":
      return "ScrapingBee";
    case "brightdata":
      return "Bright Data";
    default:
      return "Direktabruf (kein Browser-Dienst)";
  }
}

async function plainFetch(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "user-agent": UA,
      accept: "text/html,application/xhtml+xml",
      "accept-language": "de-DE,de;q=0.9,en;q=0.7",
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "none",
      "upgrade-insecure-requests": "1",
    },
  });
  if (!res.ok) throw new Error(`Antwort ${res.status}`);
  return res.text();
}

/** Laedt eine Seite mit echtem Browser-Rendering (JS ausgefuehrt), wenn konfiguriert. */
export async function renderHtml(url: string, waitMs = 2500): Promise<string> {
  const provider = renderProvider();
  if (provider === "plain") return plainFetch(url);

  const cached = cacheGet(url);
  if (cached) return cached;
  // Budget aufgebraucht: kein kostenpflichtiger Aufruf mehr, Direktabruf als Ersatz.
  if (!takeBudget()) return plainFetch(url);

  if (provider === "browserless") {
    const key = process.env["BROWSERLESS_API_KEY"]!;
    const base = process.env["BROWSERLESS_URL"] ?? "https://production-sfo.browserless.io";
    const res = await fetch(`${base}/content?token=${encodeURIComponent(key)}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        url,
        gotoOptions: { waitUntil: "networkidle2", timeout: 30000 },
        waitForTimeout: waitMs,
        bestAttempt: true,
        userAgent: UA,
      }),
    });
    if (!res.ok) throw new Error(`Browserless ${res.status}`);
    const html = await res.text();
    cacheSet(url, html);
    return html;
  }

  if (provider === "scrapingbee") {
    const key = process.env["SCRAPINGBEE_API_KEY"]!;
    const params = new URLSearchParams({
      api_key: key,
      url,
      render_js: "true",
      wait: String(waitMs),
      premium_proxy: "true",
      country_code: "de",
    });
    const res = await fetch(`https://app.scrapingbee.com/api/v1/?${params.toString()}`);
    if (!res.ok) throw new Error(`ScrapingBee ${res.status}`);
    const html = await res.text();
    cacheSet(url, html);
    return html;
  }

  if (provider === "brightdata") {
    const token = process.env["BRIGHTDATA_API_TOKEN"]!;
    const zone = process.env["BRIGHTDATA_ZONE"] ?? "web_unlocker1";
    const res = await fetch("https://api.brightdata.com/request", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ zone, url, format: "raw" }),
    });
    if (!res.ok) throw new Error(`Bright Data ${res.status}`);
    const html = await res.text();
    cacheSet(url, html);
    return html;
  }

  return plainFetch(url);
}

/**
 * Kreditschonend: zuerst Direktabruf (kostenlos), nur bei Blockade/leerer Seite
 * wird der kostenpflichtige Browser-Dienst genutzt.
 */
export async function renderHtmlSafe(url: string, waitMs?: number): Promise<string> {
  const cached = cacheGet(url);
  if (cached) return cached;
  try {
    const html = await plainFetch(url);
    if (!looksBlocked(html) || renderProvider() === "plain") return html;
  } catch (error) {
    if (renderProvider() === "plain") throw error;
  }
  try {
    return await renderHtml(url, waitMs);
  } catch {
    return plainFetch(url);
  }
}
