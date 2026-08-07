/**
 * Reduziert typische Erkennungsmerkmale KI-generierter Texte
 * (vgl. Wikipedia: "Anzeichen für KI-generierte Inhalte").
 */

export const HUMAN_STYLE_RULES =
  "Schreibe so, dass der Text nicht als KI-generiert erkennbar ist. Beachte strikt:\n" +
  "- Keine Gedankenstriche vom Typ Halbgeviertstrich/Geviertstrich (– —). Nutze Komma, Punkt oder Doppelpunkt.\n" +
  "- Keine typografischen Anführungszeichen aus KI-Ausgaben, nutze einfache gerade Zeichen.\n" +
  "- Keine Werbe- und Füllfloskeln wie 'in der heutigen schnelllebigen Welt', 'es ist wichtig zu beachten', " +
  "'zusammenfassend lässt sich sagen', 'nicht nur ..., sondern auch', 'ein echter Gamechanger', 'maßgeschneidert', " +
  "'nahtlos', 'ganzheitlich', 'facettenreich', 'in der Tat', 'letztendlich'.\n" +
  "- Keine Dreier-Adjektivketten, keine übertriebenen Superlative, keine Emojis, keine Markdown-Fettungen.\n" +
  "- Keine gleichförmigen Satzlängen: variiere kurze und längere Sätze, nutze konkrete Zahlen, Rollen und Fakten aus den Daten.\n" +
  "- Keine symmetrischen Aufzählungen mit immer gleichem Satzbau, kein generisches Fazit am Ende.\n" +
  "- Keine Selbstreferenz auf KI, Modelle oder Prompts, keine Platzhalter wie [Name].";

const PHRASES: Array<[RegExp, string]> = [
  [/\s*[–—]\s*/g, ", "],
  [/[“”„‟]/g, '"'],
  [/[‘’‚‛]/g, "'"],
  [/…/g, "..."],
  [/\bIn der heutigen (schnelllebigen|dynamischen|digitalen) (Welt|Arbeitswelt|Zeit)\b,?\s*/gi, ""],
  [/\bEs ist wichtig zu (beachten|erwähnen|betonen)(,)?\s*(dass)?\s*/gi, ""],
  [/\bZusammenfassend lässt sich sagen(,)?\s*(dass)?\s*/gi, ""],
  [/\bLetztendlich\b,?\s*/gi, ""],
  [/\bInsgesamt lässt sich festhalten(,)?\s*(dass)?\s*/gi, ""],
  [/\bIn der Tat\b,?\s*/gi, ""],
  [/\bnahtlos(e|en|er|es)?\b/gi, "reibungslos"],
  [/\bganzheitlich(e|en|er|es)?\b/gi, "umfassend"],
  [/\bmaßgeschneidert(e|en|er|es)?\b/gi, "passgenau"],
  [/\bGamechanger\b/gi, "wichtiger Hebel"],
  [/\bfacettenreich(e|en|er|es)?\b/gi, "vielseitig"],
  [/\*\*(.+?)\*\*/g, "$1"],
  [/^\s*#+\s*/gm, ""],
  [
    /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu,
    "",
  ],
];

/** Bereinigt einen einzelnen Textwert. */
export function humanizeText(value: string): string {
  let out = value;
  for (const [pattern, replacement] of PHRASES) out = out.replace(pattern, replacement);
  out = out
    .replace(/ {2,}/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/,\s*,/g, ",")
    .replace(/\n{3,}/g, "\n\n");
  // Satzanfänge nach Floskel-Entfernung wieder groß schreiben.
  out = out.replace(/(^|[.!?]\s+)([a-zäöüß])/g, (_m, p, c: string) => p + c.toUpperCase());
  return out.trim();
}

/** Bereinigt rekursiv alle Strings eines strukturierten KI-Ergebnisses. */
export function humanizeDeep<T>(value: T): T {
  if (typeof value === "string") return humanizeText(value) as unknown as T;
  if (Array.isArray(value)) return value.map((v) => humanizeDeep(v)) as unknown as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) out[k] = humanizeDeep(v);
    return out as T;
  }
  return value;
}