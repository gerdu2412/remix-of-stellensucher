import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">{title}</h1>
        {description && <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn("panel p-5", className)}>{children}</section>;
}

export function SectionTitle({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="mb-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{children}</h2>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function ScoreRing({ score, size = 132 }: { score: number; size?: number }) {
  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(Math.max(score, 0), 100) / 100);
  const tone = score >= 80 ? "var(--success)" : score >= 60 ? "var(--warning)" : "var(--destructive)";
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="var(--border)" strokeWidth={10} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={tone}
          strokeWidth={10}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl font-semibold">{Math.round(score)}%</span>
        <span className="text-[11px] text-muted-foreground">Match</span>
      </div>
    </div>
  );
}

export function ScoreBar({ label, score }: { label: string; score: number }) {
  const tone = score >= 80 ? "bg-success" : score >= 60 ? "bg-warning" : "bg-destructive";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-foreground">{label}</span>
        <span className="text-muted-foreground">{score}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full transition-all", tone)} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

const STATUS_LABEL: Record<string, string> = {
  gefunden: "Gefunden",
  in_pruefung: "In Prüfung",
  hoher_match: "Hoher Match",
  bewerbung_vorbereiten: "Bewerbung vorbereiten",
  bewerbung_versendet: "Bewerbung versendet",
  rueckmeldung_ausstehend: "Rückmeldung ausstehend",
  interview_geplant: "Interview geplant",
  zweite_runde: "Zweite Runde",
  angebot: "Angebot",
  absage: "Absage",
  zurueckgezogen: "Zurückgezogen",
  entwurf: "Entwurf",
  freigegeben: "Freigegeben",
  offen: "Offen",
  in_arbeit: "In Arbeit",
};

export const STATUS_OPTIONS = [
  "gefunden",
  "in_pruefung",
  "hoher_match",
  "bewerbung_vorbereiten",
  "bewerbung_versendet",
  "rueckmeldung_ausstehend",
  "interview_geplant",
  "zweite_runde",
  "angebot",
  "absage",
  "zurueckgezogen",
] as const;

export function statusLabel(value: string) {
  return STATUS_LABEL[value] ?? value;
}

export function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "angebot"
      ? "border-success/40 bg-success/10 text-success"
      : status === "absage" || status === "zurueckgezogen"
        ? "border-destructive/30 bg-destructive/10 text-destructive"
        : status === "interview_geplant" || status === "zweite_runde"
          ? "border-info/40 bg-info/10 text-info"
          : status === "hoher_match" || status === "bewerbung_versendet"
            ? "border-primary/30 bg-primary/10 text-primary"
            : "border-border bg-muted text-muted-foreground";
  return (
    <Badge variant="outline" className={cn("font-medium", tone)}>
      {statusLabel(status)}
    </Badge>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="panel flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}

export function AiNotice({ children }: { children?: ReactNode }) {
  return (
    <p className="rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning-foreground">
      {children ??
        "KI-Vorschlag: Bitte prüfen und bestätigen. Nicht belegte Aussagen sind als Annahme gekennzeichnet."}
    </p>
  );
}