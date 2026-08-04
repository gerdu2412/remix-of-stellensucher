import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { aiMatchAnalysis } from "@/lib/ai.functions";
import { useJobs, useMasterCv, useMatches, useSearchProfile } from "@/lib/queries";

/* eslint-disable @typescript-eslint/no-explicit-any */
const db = supabase as any;

/** Startet die Match-Analyse fuer alle Stellen (optional nur fuer fehlende). */
export function BulkMatchButton({ variant = "default" }: { variant?: "default" | "outline" }) {
  const jobs = useJobs();
  const matches = useMatches();
  const cv = useMasterCv();
  const search = useSearchProfile();
  const qc = useQueryClient();
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const running = progress !== null;
  const analysed = new Map((matches.data ?? []).map((m) => [m.job_posting_id, m]));
  const openJobs = (jobs.data ?? []).filter((j) => !analysed.has(j.id));

  async function runAll() {
    const cvText = cv.data?.extracted_text ?? "";
    if (cvText.trim().length < 20) {
      toast.error("Bitte zuerst einen Lebenslauf hochladen oder bestätigen.");
      return;
    }
    const targets = openJobs.length ? openJobs : (jobs.data ?? []);
    if (!targets.length) {
      toast.error("Keine Stellen vorhanden.");
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) {
      toast.error("Nicht angemeldet.");
      return;
    }

    setProgress({ done: 0, total: targets.length });
    let ok = 0;
    let failed = 0;

    for (const job of targets) {
      const jobText = `${job.title}\n${job.company}\n${job.location ?? ""}\n${job.description ?? ""}`;
      try {
        if (jobText.trim().length < 20) throw new Error("Kein Ausschreibungstext");
        const result = await aiMatchAnalysis({
          data: { cvText, jobText, searchProfile: JSON.stringify(search.data ?? {}) },
        });
        const values = {
          user_id: uid,
          job_posting_id: job.id,
          overall_score: Math.round(result.overall_score),
          summary: result.summary,
          outlook: result.outlook,
          category_scores: result.category_scores,
          fulfilled_requirements: result.fulfilled_requirements,
          partial_requirements: result.partial_requirements,
          missing_requirements: result.missing_requirements,
          transferable_skills: result.transferable_skills,
          risks: result.risks,
          differentiators: result.differentiators,
          cv_recommendations: result.cv_recommendations,
        };
        const existing = analysed.get(job.id);
        const res = existing
          ? await db.from("match_analyses").update(values).eq("id", existing.id)
          : await db.from("match_analyses").insert(values);
        if (res.error) throw new Error(res.error.message);
        ok += 1;
      } catch {
        failed += 1;
      }
      setProgress((p) => (p ? { ...p, done: p.done + 1 } : p));
      qc.invalidateQueries({ queryKey: ["match_analyses"] });
    }

    setProgress(null);
    toast.success(
      failed ? `${ok} Analysen erstellt, ${failed} übersprungen.` : `${ok} Match-Analysen erstellt.`,
    );
  }

  return (
    <Button variant={variant} onClick={runAll} disabled={running || jobs.isLoading}>
      {running ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Sparkles className="mr-2 size-4" />}
      {running
        ? `Analysiere ${progress.done}/${progress.total} …`
        : openJobs.length
          ? `Alle Stellen analysieren (${openJobs.length})`
          : "Alle Analysen aktualisieren"}
    </Button>
  );
}
