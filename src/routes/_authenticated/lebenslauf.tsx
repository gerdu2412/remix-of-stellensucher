import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { FileSpreadsheet, FileText, FileType2, Loader2, Sparkles, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PageHeader, Panel, SectionTitle } from "@/components/shared/ui-bits";
import { supabase } from "@/integrations/supabase/client";
import { aiAnalyzeCv } from "@/lib/ai.functions";
import { useMasterCv, useUpsertRow } from "@/lib/queries";
import { ACCEPTED_EXTENSIONS, extractTextFromFile, fileKind } from "@/lib/cv-parse";

export const Route = createFileRoute("/_authenticated/lebenslauf")({
  head: () => ({
    meta: [
      { title: "Lebenslauf hochladen – CareerPilot AI" },
      {
        name: "description",
        content: "Lebenslauf als PDF, Word oder Excel hochladen, Text automatisch auslesen und per KI strukturieren lassen.",
      },
      { property: "og:title", content: "Lebenslauf hochladen – CareerPilot AI" },
      { property: "og:description", content: "PDF, DOCX, XLSX: Datei hochladen und KI-Analyse starten." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CvUploadPage,
});

const MAX_BYTES = 15 * 1024 * 1024;

function KindIcon({ name }: { name?: string | null }) {
  const kind = name ? fileKind(name) : null;
  if (kind === "excel") return <FileSpreadsheet className="size-5 text-success" />;
  if (kind === "word") return <FileType2 className="size-5 text-primary" />;
  return <FileText className="size-5 text-primary" />;
}

function CvUploadPage() {
  const cv = useMasterCv();
  const saveCv = useUpsertRow("master_cvs", ["master_cv"]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<null | "upload" | "analyze">(null);
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState("");

  const record = cv.data as (typeof cv.data & { file_path?: string | null; file_size?: number | null }) | null;
  const text = preview || record?.extracted_text || "";

  async function handleFile(file: File) {
    if (!fileKind(file.name)) {
      toast.error("Nicht unterstütztes Format. Erlaubt: PDF, DOC/DOCX, XLS/XLSX, CSV, TXT.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Die Datei ist größer als 15 MB.");
      return;
    }
    setBusy("upload");
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Nicht angemeldet");

      const parsed = await extractTextFromFile(file);
      if (parsed.text.trim().length < 30) {
        throw new Error("Aus der Datei konnte kein Text ausgelesen werden (evtl. ein Scan ohne Textebene).");
      }

      const path = `${auth.user.id}/${Date.now()}-${file.name.replace(/[^\w.\-]+/g, "_")}`;
      const { error } = await supabase.storage.from("cv-uploads").upload(path, file, { upsert: true });
      if (error) throw new Error(error.message);

      setPreview(parsed.text);
      await saveCv.mutateAsync({
        ...(record?.id ? { id: record.id } : {}),
        file_name: file.name,
        file_path: path,
        file_type: file.type || parsed.kind,
        file_size: file.size,
        extracted_text: parsed.text,
        confirmed: false,
      });
      toast.success("Lebenslauf hochgeladen und Text ausgelesen.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function analyze() {
    if (text.trim().length < 30) {
      toast.error("Bitte zuerst eine Datei hochladen.");
      return;
    }
    setBusy("analyze");
    try {
      const result = await aiAnalyzeCv({ data: { text } });
      await saveCv.mutateAsync({
        ...(record?.id ? { id: record.id } : {}),
        extracted_text: text,
        structured_content: result,
        confirmed: false,
      });
      toast.success("Analyse erstellt – Details unter „Mein Profil“.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function download() {
    if (!record?.file_path) return;
    const { data, error } = await supabase.storage.from("cv-uploads").createSignedUrl(record.file_path, 60);
    if (error || !data) {
      toast.error(error?.message ?? "Download nicht möglich");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener");
  }

  async function removeFile() {
    if (!record?.id) return;
    if (record.file_path) await supabase.storage.from("cv-uploads").remove([record.file_path]);
    await saveCv.mutateAsync({ id: record.id, file_name: null, file_path: null, file_type: null, file_size: null });
    setPreview("");
    toast.success("Datei entfernt.");
  }

  return (
    <div>
      <PageHeader
        title="Lebenslauf hochladen"
        description="Laden Sie Ihren Lebenslauf als PDF, Word- oder Excel-Datei hoch. Der Text wird automatisch ausgelesen und dient als Grundlage für alle KI-Module."
        actions={
          <Button variant="outline" asChild>
            <Link to="/profil">Zu Mein Profil</Link>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <SectionTitle hint="Unterstützt: PDF, DOCX, XLSX, XLS, CSV, TXT – maximal 15 MB.">Datei auswählen</SectionTitle>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) void handleFile(file);
            }}
            className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              dragging ? "border-primary bg-primary/5" : "border-border"
            }`}
          >
            <Upload className="mb-3 size-6 text-muted-foreground" />
            <p className="text-sm font-medium">Datei hierher ziehen oder auswählen</p>
            <p className="mt-1 text-xs text-muted-foreground">PDF · DOCX · XLSX · CSV · TXT</p>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept={ACCEPTED_EXTENSIONS.join(",")}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFile(file);
                e.target.value = "";
              }}
            />
            <Button className="mt-4" onClick={() => inputRef.current?.click()} disabled={busy !== null}>
              {busy === "upload" ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Upload className="mr-2 size-4" />}
              Datei hochladen
            </Button>
          </div>

          {record?.file_name && (
            <div className="mt-4 flex items-center gap-3 rounded-md border border-border p-3">
              <KindIcon name={record.file_name} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{record.file_name}</p>
                <p className="text-xs text-muted-foreground">
                  {record.file_size ? `${Math.round(record.file_size / 1024)} KB · ` : ""}
                  {record.confirmed ? "Analyse bestätigt" : "Noch nicht bestätigt"}
                </p>
              </div>
              {record.file_path && (
                <Button variant="outline" size="sm" onClick={download}>
                  Öffnen
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={removeFile} aria-label="Datei entfernen">
                <Trash2 className="size-4" />
              </Button>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={analyze} disabled={busy !== null || text.trim().length < 30}>
              {busy === "analyze" ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Sparkles className="mr-2 size-4" />}
              Mit KI analysieren
            </Button>
            <Badge variant="secondary">{text ? `${text.length.toLocaleString("de-DE")} Zeichen ausgelesen` : "Kein Text"}</Badge>
          </div>
        </Panel>

        <Panel>
          <SectionTitle hint="Sie können den ausgelesenen Text vor der Analyse korrigieren.">Ausgelesener Text</SectionTitle>
          <Textarea
            rows={18}
            value={text}
            onChange={(e) => setPreview(e.target.value)}
            placeholder="Noch kein Text vorhanden – bitte Datei hochladen."
          />
          <div className="mt-3">
            <Button
              variant="outline"
              disabled={!text.trim()}
              onClick={() =>
                saveCv.mutate({ ...(record?.id ? { id: record.id } : {}), extracted_text: text })
              }
            >
              Text speichern
            </Button>
          </div>
        </Panel>
      </div>
    </div>
  );
}
