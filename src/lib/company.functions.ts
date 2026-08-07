import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { companyBriefingSchema } from "./ai-schemas";

export const aiCompanyBriefing = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ company: z.string().min(1), jobText: z.string().default("") }).parse(input),
  )
  .handler(async ({ data }) => {
    const { collectCompanyResearch, researchToPrompt } = await import("./companyresearch.server");
    const { runStructured } = await import("./ai-runner.server");

    const research = await collectCompanyResearch(data.company);
    const sources = [...research.news, ...research.press, ...research.reviews].slice(0, 12);

    const briefing = await runStructured(
      companyBriefingSchema,
      `Fasse die Rechercheergebnisse zu "${data.company}" kurz zusammen. Nutze ausschließlich die übergebenen Schlagzeilen.\n` +
        `news_summary: 2 bis 3 Sätze zu den Nachrichten der letzten 6 Monate.\n` +
        `press_summary: 2 bis 3 Sätze zu den Pressemitteilungen.\n` +
        `reviews_summary: 2 bis 3 Sätze zu Arbeitgeberbewertungen und Mitarbeiterstimmen.\n` +
        `assessment: eine zusammenfassende Einordnung in 3 bis 4 Sätzen mit Blick auf ein Bewerbungsgespräch für die genannte Stelle.\n` +
        `highlights: bis zu 5 Stichpunkte mit den wichtigsten Fakten.\n` +
        `interview_hooks: bis zu 4 Anknüpfungspunkte oder Rückfragen für das Interview.\n` +
        `Wenn zu einem Bereich keine Treffer vorliegen, schreibe das ausdrücklich.\n\n` +
        `${researchToPrompt(research)}\n\nSTELLE:\n${data.jobText.slice(0, 4000)}`,
    );

    return { briefing, sources };
  });
