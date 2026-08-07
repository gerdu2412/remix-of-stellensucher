import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export const OPENAI_MODEL = "gpt-4o-mini";
export const DEFAULT_MODEL = "google/gemini-3.6-flash";

export function createLovableAiGatewayProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: { "Lovable-API-Key": apiKey },
    supportsStructuredOutputs: true,
  });
}

function createOpenAiProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "openai",
    baseURL: "https://api.openai.com/v1",
    headers: { Authorization: `Bearer ${apiKey}` },
    supportsStructuredOutputs: true,
  });
}

/**
 * Uses the user's own OpenAI account when OPENAI_API_KEY is set,
 * otherwise falls back to the Lovable AI gateway.
 */
export function createChatModel() {
  const openAiKey = process.env["OPENAI_API_KEY"];
  if (openAiKey) {
    return createOpenAiProvider(openAiKey)(OPENAI_MODEL);
  }
  const gatewayKey = process.env["LOVABLE_API_KEY"];
  if (!gatewayKey) throw new Error("KI-Dienst ist nicht konfiguriert.");
  return createLovableAiGatewayProvider(gatewayKey)(DEFAULT_MODEL);
}

export function requireGatewayKey(): string {
  const key = process.env["OPENAI_API_KEY"] ?? process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("KI-Dienst ist nicht konfiguriert.");
  return key;
}