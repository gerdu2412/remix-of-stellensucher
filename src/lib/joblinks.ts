export type PortalLink = { name: string; url: string; query: string; location: string };

const enc = encodeURIComponent;

/** Pfad-Segmente brauchen Bindestriche statt Leerzeichen/Umlaute. */
function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Fallback fuer Portale ohne stabile Such-URL: gezielte Websuche innerhalb der Domain. */
function siteSearch(domain: string, query: string): string {
  return `https://duckduckgo.com/?q=${enc(`site:${domain} ${query}`)}`;
}

/** Deep-Links in die grossen Stellenboersen fuer eine Rolle/Region. */
export function portalSearchLinks(role: string, location: string): PortalLink[] {
  const loc = location || "Deutschland";
  const base = (name: string, url: string): PortalLink => ({ name, url, query: role, location: loc });
  return [
    base("LinkedIn Jobs", `https://www.linkedin.com/jobs/search/?keywords=${enc(role)}&location=${enc(loc)}`),
    base("Indeed", `https://de.indeed.com/jobs?q=${enc(role)}&l=${enc(loc)}`),
    base("StepStone", `https://www.stepstone.de/jobs/${slug(role)}/in-${slug(loc)}`),
    base("Xing Jobs", `https://www.xing.com/jobs/search?keywords=${enc(role)}&location=${enc(loc)}&sc_o=jobs_search_button`),
    base("Google Jobs", `https://www.google.com/search?q=${enc(`${role} ${loc} Stelle`)}&ibp=htl;jobs`),
    base("Adzuna", `https://www.adzuna.de/search?q=${enc(role)}&w=${enc(loc)}`),
    base("Jooble", `https://de.jooble.org/SearchResult?ukw=${enc(role)}&rgns=${enc(loc)}`),
    base("Careerjet", `https://www.careerjet.de/stellenangebote?s=${enc(role)}&l=${enc(loc)}`),
    base("metajob.de", siteSearch("metajob.de", `${role} ${loc}`)),
    base("Nomado24", `https://www.nomado24.de/?s=${enc(role)}`),
    base("TheirStack", `https://theirstack.com/en/jobs?q=${enc(role)}`),
    base(
      "Firmen-Karriereseiten",
      `https://www.google.com/search?q=${enc(`"${role}" ${loc} (Karriere OR Stellenangebot) -site:indeed.com -site:stepstone.de`)}`,
    ),
  ];
}

/** Bester verfuegbarer Link auf die Firmenwebseite (Suche, da Domain nicht geliefert wird). */
export function companyWebsiteUrl(company: string): string {
  // DuckDuckGo "!ducky" leitet direkt auf den ersten Treffer weiter (ohne Consent-Zwischenseite).
  return `https://duckduckgo.com/?q=${enc(`!ducky ${company} offizielle Website`)}`;
}

/** Karriere-/Jobseite des Unternehmens. */
export function companyCareersUrl(company: string): string {
  return `https://duckduckgo.com/?q=${enc(`${company} Karriere Stellenangebote Jobs`)}`;
}

/** Aktuelle Nachrichten zum Unternehmen, begrenzt auf die letzten 6 Monate. */
export function companyNewsUrl(company: string): string {
  return `https://www.google.com/search?q=${enc(`${company}`)}&tbm=nws&tbs=qdr:m6`;
}

/** Weitere Kontextquellen zum Unternehmen (Presse, Bewertungen, Profil). */
export function companyContextLinks(company: string): { name: string; url: string }[] {
  return [
    { name: "Pressemitteilungen (6 Monate)", url: `https://www.google.com/search?q=${enc(`${company} Pressemitteilung`)}&tbm=nws&tbs=qdr:m6` },
    { name: "LinkedIn-Unternehmensprofil", url: `https://www.linkedin.com/search/results/companies/?keywords=${enc(company)}` },
    { name: "Kununu-Bewertungen", url: `https://www.kununu.com/de/search?q=${enc(company)}` },
    { name: "Wikipedia", url: `https://de.wikipedia.org/w/index.php?search=${enc(company)}` },
  ];
}

/** Direktsuchen in den fuehrenden Portalen in AT, CH, LI und LU. */
export function regionalPortalLinks(role: string): PortalLink[] {
  const link = (name: string, url: string, location: string): PortalLink => ({ name, url, query: role, location });
  return [
    link("karriere.at", `https://www.karriere.at/jobs/${slug(role)}`, "Österreich"),
    link("StepStone.at", `https://www.stepstone.at/jobs/${slug(role)}`, "Österreich"),
    link("jobs.ch", `https://www.jobs.ch/de/stellenangebote/?term=${enc(role)}`, "Schweiz"),
    link("Job-Room", `https://www.job-room.ch/job-search?query=${enc(role)}`, "Schweiz / Liechtenstein"),
    link("jobs.li", siteSearch("jobs.li", role), "Liechtenstein"),
    link("Moovijob", siteSearch("moovijob.com", role), "Luxemburg"),
    link("jobs.lu", siteSearch("jobs.lu", role), "Luxemburg"),
    link("ADEM", `https://adem.public.lu/de.html`, "Luxemburg"),
  ];
}
