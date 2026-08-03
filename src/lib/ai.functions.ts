import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  companySchema,
  coverLetterSchema,
  cvSchema,
  jobSchema,
  matchSchema,
  questionsSchema,
  starSchema,
  strategySchema,
} from "./ai-schemas";

export const aiAnalyzeCv = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ text: z.string().min(30) }).parse(input))
  .handler(async ({ data }) => {
    const { runStructured } = await import("./ai-runner.server");
    return runStructured(
      cvSchema,
      `Analysiere den folgenden Lebenslauf und extrahiere die Inhalte strukturiert. Nichts hinzuerfinden.\n\nLEBENSLAUF:\n${data.text}`,
    );
  });

export const aiStructureJob = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ text: z.string().min(30) }).parse(input))
  .handler(async ({ data }) => {
    const { runStructured } = await import("./ai-runner.server");
    return runStructured(
      jobSchema,
      `Strukturiere die folgende Stellenausschreibung. Übernimm den Ausschreibungstext bereinigt in das Feld description. Unbekannte Felder als leeren String liefern.\n\nAUSSCHREIBUNG:\n${data.text}`,
    );
  });

export const aiMatchAnalysis = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ cvText: z.string().min(20), jobText: z.string().min(20), searchProfile: z.string().default("") }).parse(input),
  )
  .handler(async ({ data }) => {
    const { runStructured } = await import("./ai-runner.server");
    return runStructured(
      matchSchema,
      `Erstelle eine Match-Analyse zwischen Lebenslauf und Stellenausschreibung. Bewerte einen Gesamtscore von 0 bis 100 und Scores je Dimension (Fachliche Kompetenzen, Berufserfahrung, Führungserfahrung, Branchenerfahrung, Methodenkenntnisse, Ausbildung, Sprachkenntnisse, Seniorität, Standort und Mobilität, Arbeitsmodell, Gehaltskompatibilität, Kulturelle Passung). Das Feld outlook muss einen dieser Werte haben: sehr hohe Passung, gute Passung, realistische Bewerbung, Stretch-Position, geringe Passung.\n\nSUCHPROFIL:\n${data.searchProfile}\n\nLEBENSLAUF:\n${data.cvText}\n\nSTELLE:\n${data.jobText}`,
    );
  });

export const aiCompanyDossier = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ company: z.string().min(1), rawInput: z.string().default(""), jobText: z.string().default("") }).parse(input),
  )
  .handler(async ({ data }) => {
    const { runStructured } = await import("./ai-runner.server");
    return runStructured(
      companySchema,
      `Erstelle ein Unternehmens-Dossier für "${data.company}". Nutze ausschließlich die übergebenen Rechercheinhalte. Alles, was nicht belegt ist, gehört in assumptions oder open_questions und darf nicht als Fakt dargestellt werden.\n\nRECHERCHEINHALTE:\n${data.rawInput || "(keine Inhalte übergeben)"}\n\nSTELLE:\n${data.jobText}`,
    );
  });

export const aiStrategy = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        cvText: z.string().min(20),
        jobText: z.string().min(20),
        companyContext: z.string().default(""),
        matchContext: z.string().default(""),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { runStructured } = await import("./ai-runner.server");
    return runStructured(
      strategySchema,
      `Entwickle eine Bewerbungsstrategie inklusive Bewerbungsstory in drei Varianten (ein Satz, Elevator Pitch mit etwa 60 Sekunden, ausführliche Argumentationslinie).\n\nLEBENSLAUF:\n${data.cvText}\n\nSTELLE:\n${data.jobText}\n\nUNTERNEHMEN:\n${data.companyContext}\n\nMATCH-ANALYSE:\n${data.matchContext}`,
    );
  });

export const aiCoverLetter = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        cvText: z.string().min(20),
        jobText: z.string().min(20),
        strategyContext: z.string().default(""),
        tone: z.string().default("strategisch und executive"),
        contactPerson: z.string().default(""),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { runStructured } = await import("./ai-runner.server");
    return runStructured(
      coverLetterSchema,
      `Schreibe ein individuelles Anschreiben (maximal eine Seite, vier Absätze: Einstieg, Eignung, Umgang mit Lücken, Abschluss). Tonalität: ${data.tone}. Ansprechpartner: ${data.contactPerson || "unbekannt"}. Keine Floskeln, kein Wiederholen des gesamten Lebenslaufs, keine erfundenen Erfahrungen.\n\nLEBENSLAUF:\n${data.cvText}\n\nSTELLE:\n${data.jobText}\n\nSTRATEGIE:\n${data.strategyContext}`,
    );
  });

export const aiRewriteParagraph = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ text: z.string().min(5), instruction: z.string().min(3), context: z.string().default("") }).parse(input),
  )
  .handler(async ({ data }) => {
    const { runText } = await import("./ai-runner.server");
    const text = await runText(
      `Überarbeite den folgenden Absatz eines Bewerbungsanschreibens. Aufgabe: ${data.instruction}. Gib ausschließlich den überarbeiteten Absatztext zurück, ohne Anführungszeichen und ohne Vorbemerkung.\n\nKONTEXT:\n${data.context}\n\nABSATZ:\n${data.text}`,
    );
    return { text: text.trim() };
  });

export const aiInterviewPrep = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        cvText: z.string().min(20),
        jobText: z.string().min(20),
        companyContext: z.string().default(""),
        interviewType: z.string().default("hr"),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { runStructured } = await import("./ai-runner.server");
    return runStructured(
      questionsSchema,
      `Erstelle ein Interview-Briefing und mindestens acht wahrscheinliche Interviewfragen für ein Gespräch vom Typ "${data.interviewType}", inklusive individueller Musterantworten auf Basis des Lebenslaufs sowie Rückfragen an den Arbeitgeber.\n\nLEBENSLAUF:\n${data.cvText}\n\nSTELLE:\n${data.jobText}\n\nUNTERNEHMEN:\n${data.companyContext}`,
    );
  });

export const aiStarStory = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ notes: z.string().min(10), jobText: z.string().default("") }).parse(input),
  )
  .handler(async ({ data }) => {
    const { runStructured } = await import("./ai-runner.server");
    return runStructured(
      starSchema,
      `Formuliere aus den folgenden Notizen eine STAR-Story (Situation, Task, Action, Result, Erkenntnis, Bezug zur Zielstelle). Nichts hinzuerfinden.\n\nNOTIZEN:\n${data.notes}\n\nZIELSTELLE:\n${data.jobText}`,
    );
  });

export const aiAnswerFeedback = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ question: z.string().min(3), answer: z.string().min(3), jobText: z.string().default("") }).parse(input),
  )
  .handler(async ({ data }) => {
    const { runStructured } = await import("./ai-runner.server");
    const schema = z.object({
      score: z.number(),
      strengths: z.array(z.string()),
      improvements: z.array(z.string()),
      dimensions: z.array(z.object({ label: z.string(), rating: z.string() })),
    });
    return runStructured(
      schema,
      `Bewerte die folgende Interviewantwort nach Klarheit, Struktur, Relevanz, Konkretheit, Glaubwürdigkeit, Wirkung, Länge und Bezug zur Stelle. Gib einen Score von 0 bis 100.\n\nSTELLE:\n${data.jobText}\n\nFRAGE:\n${data.question}\n\nANTWORT:\n${data.answer}`,
    );
  });