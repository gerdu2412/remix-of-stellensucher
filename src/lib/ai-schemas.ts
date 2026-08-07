import { z } from "zod";

// Modelle liefern gelegentlich fehlende oder null-Felder. Tolerante Primitive
// verhindern, dass die gesamte KI-Antwort verworfen wird.
// Wichtig: keine .optional()/.nullish()/.transform()-Wrapper. OpenAI verlangt im
// strict-JSON-Schema-Modus, dass jedes Property in "required" steht; Wrapper
// führen dazu, dass Felder aus "required" fallen und die Anfrage mit 400 scheitert.
const str = () => z.string();
const num = () => z.number();
const list = <T extends z.ZodTypeAny>(item: T) => z.array(item);

export const GUARDRAIL =
  "Du bist ein Karriere- und Bewerbungsexperte für erfahrene Fach- und Führungskräfte im deutschsprachigen Raum. " +
  "Antworte ausschließlich auf Deutsch, sachlich, präzise und ohne Floskeln. " +
  "Erfinde niemals Arbeitgeber, Projekte, Zertifikate, Kompetenzen oder Erfolge. " +
  "Nutze ausschließlich Informationen aus den übergebenen Daten. " +
  "Wenn eine Information fehlt, kennzeichne sie ausdrücklich als Annahme oder Vorschlag.";

export const cvSchema = z.object({
  summary: str(),
  experience: list(
    z.object({
      company: str(),
      role: str(),
      period: str(),
      industry: str(),
      achievements: list(str()),
    }),
  ),
  skills: list(str()),
  methods: list(str()),
  leadership: str(),
  education: list(z.object({ degree: str(), institution: str(), year: str() })),
  certificates: list(str()),
  languages: list(z.object({ name: str(), level: str() })),
  tools: list(str()),
  career_level: str(),
  target_roles: list(str()),
  alternative_titles: list(str()),
});

export const matchSchema = z.object({
  overall_score: num(),
  summary: str(),
  outlook: str(),
  category_scores: list(z.object({ label: str(), score: num() })),
  fulfilled_requirements: list(str()),
  partial_requirements: list(str()),
  missing_requirements: list(str()),
  transferable_skills: list(str()),
  risks: list(str()),
  differentiators: list(str()),
  cv_recommendations: list(
    z.object({
      area: str(),
      current: str(),
      suggestion: str(),
      reason: str(),
      relevance: str(),
    }),
  ),
});

export const strategySchema = z.object({
  positioning: str(),
  core_message: str(),
  motivation_company: str(),
  motivation_role: str(),
  arguments: list(str()),
  objections: list(z.object({ objection: str(), counter: str() })),
  keywords: list(str()),
  tone: str(),
  story_one_liner: str(),
  story_elevator: str(),
  story_long: str(),
});

export const coverLetterSchema = z.object({
  salutation: str(),
  paragraphs: list(z.object({ id: str(), label: str(), text: str() })),
  closing: str(),
});

export const companySchema = z.object({
  dossier: z.object({
    profile: str(),
    business_model: str(),
    market: str(),
    competitors: str(),
    strategy: str(),
    transformation: str(),
    ai: str(),
    news: str(),
    leadership: str(),
    culture: str(),
    ratings: str(),
    opportunities: str(),
    risks: str(),
    role_challenges: str(),
  }),
  assumptions: list(str()),
  open_questions: list(str()),
});

export const questionsSchema = z.object({
  briefing: z.object({
    company_summary: str(),
    role_requirements: list(str()),
    challenges: list(str()),
    strengths: list(str()),
    weak_points: list(str()),
    counterparts: list(str()),
    interests: list(str()),
  }),
  questions: list(
    z.object({
      question: str(),
      category: str(),
      probability: str(),
      difficulty: str(),
      goal: str(),
      structure: str(),
      answer: str(),
      follow_up: str(),
    }),
  ),
  reverse_questions: list(
    z.object({
      audience: str(),
      question: str(),
      impact: str(),
      insight: str(),
      risk: str(),
      phase: str(),
    }),
  ),
});

export const starSchema = z.object({
  title: str(),
  situation: str(),
  task: str(),
  action: str(),
  result: str(),
  learning: str(),
  relevance: str(),
});

export const tailoredCvSchema = z.object({
  headline: str(),
  profile: str(),
  key_skills: list(str()),
  experience: list(
    z.object({
      company: str(),
      role: str(),
      period: str(),
      highlights: list(str()),
    }),
  ),
  education: list(z.object({ degree: str(), institution: str(), year: str() })),
  certificates: list(str()),
  languages: list(str()),
  adjustments: list(str()),
});

export const jobSchema = z.object({
  title: str(),
  company: str(),
  location: str(),
  country: str(),
  region: str(),
  remote_share: str(),
  seniority: str(),
  salary_range: str(),
  contact_person: str(),
  description: str(),
});
export const companyBriefingSchema = z.object({
  news_summary: str(),
  press_summary: str(),
  reviews_summary: str(),
  assessment: str(),
  highlights: list(str()),
  interview_hooks: list(str()),
});
