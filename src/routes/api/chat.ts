import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createChatModel } from "@/lib/ai-gateway.server";

type ChatRequestBody = { messages?: unknown; setup?: string };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages, setup } = (await request.json()) as ChatRequestBody;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }
        const key = process.env["OPENAI_API_KEY"] ?? process.env["LOVABLE_API_KEY"];
        if (!key) return new Response("KI-Dienst ist nicht konfiguriert", { status: 500 });

        const result = streamText({
          model: createChatModel(),
          system:
            "Du führst eine realistische Interviewsimulation für erfahrene Fach- und Führungskräfte durch. " +
            "Stelle immer genau eine Frage und warte auf die Antwort. " +
            "Gib nach jeder Antwort ein kurzes Feedback zu Klarheit, Struktur, Konkretheit und Wirkung (maximal drei Sätze), " +
            "danach die nächste Frage. Erfinde keine Fakten über die Kandidatin oder den Kandidaten. " +
            "Wenn die Nutzerin oder der Nutzer 'Gesamtfeedback' schreibt, erstelle eine Auswertung mit Gesamtbewertung, Stärken, " +
            "Schwächen, kritischen Antworten, Verbesserungsvorschlägen, Wahrscheinlichkeit für die nächste Runde und Trainingsschwerpunkten. " +
            "Antworte auf Deutsch.\n\nRAHMEN DER SIMULATION:\n" +
            (setup ?? "Allgemeines HR-Interview."),
          messages: await convertToModelMessages(messages as UIMessage[]),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
          onError: (error) => {
            const text = error instanceof Error ? error.message : String(error);
            if (/forbidden|403|credit/i.test(text)) {
              return "KI-Guthaben aufgebraucht: Das Workspace-Kreditlimit ist erreicht. Bitte Limit erhöhen, dann startet die Interviewsimulation wieder.";
            }
            return `KI-Fehler: ${text}`;
          },
        });
      },
    },
  },
});