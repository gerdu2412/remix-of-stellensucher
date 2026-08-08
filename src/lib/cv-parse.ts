export type ParsedFile = { text: string; kind: "pdf" | "word" | "excel" | "text" };

export const ACCEPTED_EXTENSIONS = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".csv", ".txt"];

export function fileKind(name: string): ParsedFile["kind"] | null {
  const ext = name.toLowerCase().slice(name.lastIndexOf("."));
  if (ext === ".pdf") return "pdf";
  if (ext === ".doc" || ext === ".docx") return "word";
  if (ext === ".xls" || ext === ".xlsx" || ext === ".csv") return "excel";
  if (ext === ".txt") return "text";
  return null;
}

async function parsePdf(buffer: ArrayBuffer): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  const doc = await pdfjs.getDocument({ data: buffer }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    pages.push(
      content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim(),
    );
  }
  return pages.join("\n\n");
}

async function parseWord(buffer: ArrayBuffer): Promise<string> {
  const mod = (await import("mammoth/mammoth.browser.js")) as unknown as {
    default?: { extractRawText: (o: { arrayBuffer: ArrayBuffer }) => Promise<{ value?: string }> };
    extractRawText?: (o: { arrayBuffer: ArrayBuffer }) => Promise<{ value?: string }>;
  };
  const mammoth = mod.default ?? mod;
  if (!mammoth?.extractRawText) throw new Error("Word-Datei konnte nicht gelesen werden.");
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return String(result.value ?? "").trim();
}


async function parseExcel(buffer: ArrayBuffer): Promise<string> {
  const XLSX = await import("xlsx");
  const wb = XLSX.read(buffer, { type: "array" });
  return wb.SheetNames.map((name) => {
    const sheet = wb.Sheets[name];
    if (!sheet) return "";
    const csv = XLSX.utils.sheet_to_csv(sheet, { blankrows: false });
    return `# ${name}\n${csv}`.trim();
  })
    .filter(Boolean)
    .join("\n\n");
}

export async function extractTextFromFile(file: File): Promise<ParsedFile> {
  const kind = fileKind(file.name);
  if (!kind) throw new Error("Nicht unterstütztes Format. Erlaubt: PDF, DOC/DOCX, XLS/XLSX, CSV, TXT.");
  if (kind === "text") return { text: (await file.text()).trim(), kind };

  const buffer = await file.arrayBuffer();
  if (kind === "pdf") return { text: await parsePdf(buffer), kind };
  if (kind === "excel") return { text: await parseExcel(buffer), kind };

  if (file.name.toLowerCase().endsWith(".doc")) {
    throw new Error(
      "Alte .doc-Dateien können nicht ausgelesen werden. Bitte als .docx oder PDF speichern und erneut hochladen.",
    );
  }
  return { text: await parseWord(buffer), kind };
}
