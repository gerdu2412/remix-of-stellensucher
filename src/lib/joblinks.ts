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
  return `https://www.google.com/search?q=${enc(`${company} offizielle Webseite`)}&btnI=1`;
}

/** Karriere-/Jobseite des Unternehmens. */
export function companyCareersUrl(company: string): string {
  return `https://www.google.com/search?q=${enc(`${company} Karriere Stellenangebote`)}`;
}
