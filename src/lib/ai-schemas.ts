import { z } from "zod";

export const GUARDRAIL =
  "Du bist ein Karriere- und Bewerbungsexperte für erfahrene Fach- und Führungskräfte im deutschsprachigen Raum. " +
  "Antworte ausschließlich auf Deutsch, sachlich, präzise und ohne Floskeln. " +
  "Erfinde niemals Arbeitgeber, Projekte, Zertifikate, Kompetenzen oder Erfolge. " +
  "Nutze ausschließlich Informationen aus den übergebenen Daten. " +
  "Wenn eine Information fehlt, kennzeichne sie ausdrücklich als Annahme oder Vorschlag.";

export const cvSchema = z.object({
  summary: z.string(),
  experience: z.array(
    z.object({
      company: z.string(),
      role: z.string(),
      period: z.string(),
      industry: z.string(),
      achievements: z.array(z.string()),
    }),
  ),
  skills: z.array(z.string()),
  methods: z.array(z.string()),
  leadership: z.string(),
  education: z.array(z.object({ degree: z.string(), institution: z.string(), year: z.string() })),
  certificates: z.array(z.string()),
  languages: z.array(z.object({ name: z.string(), level: z.string() })),
  tools: z.array(z.string()),
  career_level: z.string(),
  target_roles: z.array(z.string()),
  alternative_titles: z.array(z.string()),
});

export const matchSchema = z.object({
  overall_score: z.number(),
  summary: z.string(),
  outlook: z.string(),
  category_scores: z.array(z.object({ label: z.string(), score: z.number() })),
  fulfilled_requirements: z.array(z.string()),
  partial_requirements: z.array(z.string()),
  missing_requirements: z.array(z.string()),
  transferable_skills: z.array(z.string()),
  risks: z.array(z.string()),
  differentiators: z.array(z.string()),
  cv_recommendations: z.array(
    z.object({
      area: z.string(),
      current: z.string(),
      suggestion: z.string(),
      reason: z.string(),
      relevance: z.string(),
    }),
  ),
});

export const strategySchema = z.object({
  positioning: z.string(),
  core_message: z.string(),
  motivation_company: z.string(),
  motivation_role: z.string(),
  arguments: z.array(z.string()),
  objections: z.array(z.object({ objection: z.string(), counter: z.string() })),
  keywords: z.array(z.string()),
  tone: z.string(),
  story_one_liner: z.string(),
  story_elevator: z.string(),
  story_long: z.string(),
});

export const coverLetterSchema = z.object({
  salutation: z.string(),
  paragraphs: z.array(z.object({ id: z.string(), label: z.string(), text: z.string() })),
  closing: z.string(),
});

export const companySchema = z.object({
  dossier: z.object({
    profile: z.string(),
    business_model: z.string(),
    market: z.string(),
    competitors: z.string(),
    strategy: z.string(),
    transformation: z.string(),
    ai: z.string(),
    news: z.string(),
    leadership: z.string(),
    culture: z.string(),
    ratings: z.string(),
    opportunities: z.string(),
    risks: z.string(),
    role_challenges: z.string(),
  }),
  assumptions: z.array(z.string()),
  open_questions: z.array(z.string()),
});

export const questionsSchema = z.object({
  briefing: z.object({
    company_summary: z.string(),
    role_requirements: z.array(z.string()),
    challenges: z.array(z.string()),
    strengths: z.array(z.string()),
    weak_points: z.array(z.string()),
    counterparts: z.array(z.string()),
    interests: z.array(z.string()),
  }),
  questions: z.array(
    z.object({
      question: z.string(),
      category: z.string(),
      probability: z.string(),
      difficulty: z.string(),
      goal: z.string(),
      structure: z.string(),
      answer: z.string(),
      follow_up: z.string(),
    }),
  ),
  reverse_questions: z.array(
    z.object({
      audience: z.string(),
      question: z.string(),
      impact: z.string(),
      insight: z.string(),
      risk: z.string(),
      phase: z.string(),
    }),
  ),
});

export const starSchema = z.object({
  title: z.string(),
  situation: z.string(),
  task: z.string(),
  action: z.string(),
  result: z.string(),
  learning: z.string(),
  relevance: z.string(),
});

export const jobSchema = z.object({
  title: z.string(),
  company: z.string(),
  location: z.string(),
  country: z.string(),
  region: z.string(),
  remote_share: z.string(),
  seniority: z.string(),
  salary_range: z.string(),
  contact_person: z.string(),
  description: z.string(),
});