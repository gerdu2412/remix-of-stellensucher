export type PortalLink = { name: string; url: string; query: string; location: string };

const enc = encodeURIComponent;

/** Deep-Links in die grossen Stellenboersen fuer eine Rolle/Region. */
export function portalSearchLinks(role: string, location: string): PortalLink[] {
  const loc = location || "Deutschland";
  const base = (name: string, url: string): PortalLink => ({ name, url, query: role, location: loc });
  return [
    base("LinkedIn Jobs", `https://www.linkedin.com/jobs/search/?keywords=${enc(role)}&location=${enc(loc)}`),
    base("Indeed", `https://de.indeed.com/jobs?q=${enc(role)}&l=${enc(location)}`),
    base("StepStone", `https://www.stepstone.de/jobs/${enc(role)}/in-${enc(loc)}`),
    base("Xing Jobs", `https://www.xing.com/jobs/search?keywords=${enc(role)}&location=${enc(loc)}`),
    base("Google Jobs", `https://www.google.com/search?q=${enc(`${role} ${loc} Stelle`)}&ibp=htl;jobs`),
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

/** Direktsuchen in den fuehrenden Portalen in AT, CH, LI und LU. */
export function regionalPortalLinks(role: string): PortalLink[] {
  const link = (name: string, url: string, location: string): PortalLink => ({ name, url, query: role, location });
  return [
    link("karriere.at", `https://www.karriere.at/jobs/${enc(role)}`, "Österreich"),
    link("StepStone.at", `https://www.stepstone.at/jobs/${enc(role)}`, "Österreich"),
    link("jobs.ch", `https://www.jobs.ch/de/stellenangebote/?term=${enc(role)}`, "Schweiz"),
    link("Job-Room", `https://www.job-room.ch/job-search?query=${enc(role)}`, "Schweiz / Liechtenstein"),
    link("jobs.li", `https://www.jobs.li/stellenangebote?search=${enc(role)}`, "Liechtenstein"),
    link("Moovijob", `https://www.moovijob.com/de/jobs?query=${enc(role)}`, "Luxemburg"),
    link("jobs.lu", `https://www.jobs.lu/jobsearch?keywords=${enc(role)}`, "Luxemburg"),
    link("ADEM", `https://adem.public.lu/de/emploi/offres-emploi.html`, "Luxemburg"),
  ];
}
