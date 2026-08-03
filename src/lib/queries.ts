/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

export type Profile = Tables<"profiles">;
export type MasterCv = Tables<"master_cvs">;
export type SearchProfile = Tables<"search_profiles">;
export type JobPosting = Tables<"job_postings">;
export type MatchAnalysis = Tables<"match_analyses">;
export type CompanyResearch = Tables<"company_research">;
export type ApplicationStrategy = Tables<"application_strategies">;
export type ApplicationDocument = Tables<"application_documents">;
export type InterviewPreparation = Tables<"interview_preparations">;
export type StarStory = Tables<"star_stories">;
export type Application = Tables<"applications">;

const db = supabase as any;

async function currentUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Nicht angemeldet");
  return data.user.id;
}

function unwrap(res: { data: any; error: any }): any {
  if (res.error) throw new Error(res.error.message ?? "Datenbankfehler");
  return res.data;
}

export function useProfile() {
  return useQuery<Profile | null>({
    queryKey: ["profile"],
    queryFn: async () => {
      const uid = await currentUserId();
      return unwrap(await db.from("profiles").select("*").eq("id", uid).maybeSingle());
    },
  });
}

export function useMasterCv() {
  return useQuery<MasterCv | null>({
    queryKey: ["master_cv"],
    queryFn: async () =>
      unwrap(
        await db.from("master_cvs").select("*").order("updated_at", { ascending: false }).limit(1).maybeSingle(),
      ),
  });
}

export function useSearchProfile() {
  return useQuery<SearchProfile | null>({
    queryKey: ["search_profile"],
    queryFn: async () => unwrap(await db.from("search_profiles").select("*").limit(1).maybeSingle()),
  });
}

export function useJobs() {
  return useQuery<JobPosting[]>({
    queryKey: ["job_postings"],
    queryFn: async () =>
      unwrap(await db.from("job_postings").select("*").order("created_at", { ascending: false })) ?? [],
  });
}

export function useJob(id: string) {
  return useQuery<JobPosting | null>({
    queryKey: ["job_postings", id],
    queryFn: async () => unwrap(await db.from("job_postings").select("*").eq("id", id).maybeSingle()),
    enabled: Boolean(id),
  });
}

export function useMatches() {
  return useQuery<MatchAnalysis[]>({
    queryKey: ["match_analyses"],
    queryFn: async () =>
      unwrap(await db.from("match_analyses").select("*").order("overall_score", { ascending: false })) ?? [],
  });
}

export function useMatch(jobId: string) {
  return useQuery<MatchAnalysis | null>({
    queryKey: ["match_analyses", jobId],
    queryFn: async () =>
      unwrap(await db.from("match_analyses").select("*").eq("job_posting_id", jobId).maybeSingle()),
    enabled: Boolean(jobId),
  });
}

export function useCompanyResearch(jobId: string) {
  return useQuery<CompanyResearch | null>({
    queryKey: ["company_research", jobId],
    queryFn: async () =>
      unwrap(await db.from("company_research").select("*").eq("job_posting_id", jobId).maybeSingle()),
    enabled: Boolean(jobId),
  });
}

export function useStrategy(jobId: string) {
  return useQuery<ApplicationStrategy | null>({
    queryKey: ["application_strategies", jobId],
    queryFn: async () =>
      unwrap(await db.from("application_strategies").select("*").eq("job_posting_id", jobId).maybeSingle()),
    enabled: Boolean(jobId),
  });
}

export function useDocuments(jobId?: string) {
  return useQuery<ApplicationDocument[]>({
    queryKey: ["application_documents", jobId ?? "all"],
    queryFn: async () => {
      let q = db.from("application_documents").select("*").order("updated_at", { ascending: false });
      if (jobId) q = q.eq("job_posting_id", jobId);
      return unwrap(await q) ?? [];
    },
  });
}

export function useInterviewPreps(jobId?: string) {
  return useQuery<InterviewPreparation[]>({
    queryKey: ["interview_preparations", jobId ?? "all"],
    queryFn: async () => {
      let q = db.from("interview_preparations").select("*").order("updated_at", { ascending: false });
      if (jobId) q = q.eq("job_posting_id", jobId);
      return unwrap(await q) ?? [];
    },
  });
}

export function useStarStories() {
  return useQuery<StarStory[]>({
    queryKey: ["star_stories"],
    queryFn: async () =>
      unwrap(await db.from("star_stories").select("*").order("created_at", { ascending: false })) ?? [],
  });
}

export function useApplications() {
  return useQuery<Application[]>({
    queryKey: ["applications"],
    queryFn: async () =>
      unwrap(await db.from("applications").select("*").order("updated_at", { ascending: false })) ?? [],
  });
}

/* ---------------- Mutations ---------------- */

function useInvalidate(keys: string[]) {
  const qc = useQueryClient();
  return () => keys.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
}

export function useUpsertRow(table: string, keys: string[], ownerColumn: "user_id" | "id" = "user_id") {
  const done = useInvalidate(keys);
  return useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      const uid = await currentUserId();
      const payload = { ...values, [ownerColumn]: values[ownerColumn] ?? uid };
      return unwrap(await db.from(table).upsert(payload).select().maybeSingle());
    },
    onSuccess: () => {
      done();
      toast.success("Gespeichert");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useInsertRow(table: string, keys: string[]) {
  const done = useInvalidate(keys);
  return useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      const uid = await currentUserId();
      return unwrap(await db.from(table).insert({ ...values, user_id: uid }).select().maybeSingle());
    },
    onSuccess: () => done(),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateRow(table: string, keys: string[]) {
  const done = useInvalidate(keys);
  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Record<string, unknown> }) => {
      const { error } = await db.from(table).update(values).eq("id", id);
      if (error) throw new Error(error.message);
      return true;
    },
    onSuccess: () => done(),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteRow(table: string, keys: string[]) {
  const done = useInvalidate(keys);
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from(table).delete().eq("id", id);
      if (error) throw new Error(error.message);
      return true;
    },
    onSuccess: () => {
      done();
      toast.success("Gelöscht");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}