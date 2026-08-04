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
    return res.text();
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
    return res.text();
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
    return res.text();
  }

  return plainFetch(url);
}

/** Rendern mit Fallback auf den Direktabruf, damit einzelne Ausfaelle nicht die Suche stoppen. */
export async function renderHtmlSafe(url: string, waitMs?: number): Promise<string> {
  try {
    return await renderHtml(url, waitMs);
  } catch (error) {
    if (renderProvider() === "plain") throw error;
    return plainFetch(url);
  }
}
