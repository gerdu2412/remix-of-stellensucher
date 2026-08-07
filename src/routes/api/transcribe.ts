import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/transcribe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return new Response("KI-Dienst ist nicht konfiguriert", { status: 500 });

        const form = await request.formData();
        const file = form.get("file");
        if (!(file instanceof File) || file.size < 2048) {
          return new Response("Die Aufnahme war leer. Bitte erneut sprechen.", { status: 400 });
        }
        if (file.size > 20 * 1024 * 1024) {
          return new Response("Die Aufnahme ist zu lang.", { status: 413 });
        }

        const upstream = new FormData();
        upstream.append("model", "openai/gpt-4o-mini-transcribe");
        upstream.append("file", file, "recording.wav");

        const response = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}` },
          body: upstream,
        });

        if (!response.ok) {
          const detail = await response.text().catch(() => "");
          const message =
            response.status === 429
              ? "Zu viele Anfragen. Bitte kurz warten."
              : response.status === 402 || response.status === 403
                ? "Das KI-Guthaben des Workspace ist aufgebraucht."
                : `Transkription fehlgeschlagen: ${detail || response.status}`;
          return new Response(message, { status: response.status });
        }

        const data = (await response.json()) as { text?: string };
        return Response.json({ text: data.text ?? "" });
      },
    },
  },
});