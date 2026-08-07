import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/speak")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const openAiKey = process.env["OPENAI_API_KEY"];
        const key = openAiKey ?? process.env["LOVABLE_API_KEY"];
        if (!key) return new Response("KI-Dienst ist nicht konfiguriert", { status: 500 });

        const body = (await request.json().catch(() => null)) as { text?: string } | null;
        const text = (body?.text ?? "").trim().slice(0, 3500);
        if (!text) return new Response("Kein Text übergeben", { status: 400 });

        const endpoint = openAiKey
          ? "https://api.openai.com/v1/audio/speech"
          : "https://ai.gateway.lovable.dev/v1/audio/speech";

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: openAiKey ? "gpt-4o-mini-tts" : "openai/gpt-4o-mini-tts",
            input: text,
            voice: "alloy",
            response_format: "mp3",
          }),
        });

        if (!response.ok) {
          const detail = await response.text().catch(() => "");
          const message =
            response.status === 429
              ? "Zu viele Anfragen. Bitte kurz warten."
              : response.status === 402 || response.status === 403
                ? "Das KI-Guthaben ist aufgebraucht."
                : `Sprachausgabe fehlgeschlagen: ${detail || response.status}`;
          return new Response(message, { status: response.status });
        }

        return new Response(response.body, { headers: { "Content-Type": "audio/mpeg" } });
      },
    },
  },
});
