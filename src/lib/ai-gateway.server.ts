import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export function createLovableAiGatewayProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: { "Lovable-API-Key": apiKey },
    supportsStructuredOutputs: true,
  });
}

export const DEFAULT_MODEL = "google/gemini-3.6-flash";

export function requireGatewayKey(): string {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("KI-Dienst ist nicht konfiguriert.");
  return key;
}