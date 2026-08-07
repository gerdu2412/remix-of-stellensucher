import { generateText, Output } from "ai";
import type { z } from "zod";
import { createLovableAiGatewayProvider, DEFAULT_MODEL, requireGatewayKey } from "./ai-gateway.server";
import { GUARDRAIL } from "./ai-schemas";
import { HUMAN_STYLE_RULES, humanizeDeep, humanizeText } from "./ai-style.server";

export async function runStructured<T extends z.ZodTypeAny>(
  schema: T,
  prompt: string,
): Promise<z.infer<T>> {
  const gateway = createLovableAiGatewayProvider(requireGatewayKey());
  try {
    const { output } = await generateText({
      model: gateway(DEFAULT_MODEL),
      system: `${GUARDRAIL}\n\n${HUMAN_STYLE_RULES}`,
      prompt,
      output: Output.object({ schema }),
    });
    return humanizeDeep(output) as z.infer<T>;
  } catch (error) {
    throw mapGatewayError(error);
  }
}

export async function runText(prompt: string, system?: string): Promise<string> {
  const gateway = createLovableAiGatewayProvider(requireGatewayKey());
  try {
    const { text } = await generateText({
      model: gateway(DEFAULT_MODEL),
      system: `${system ?? GUARDRAIL}\n\n${HUMAN_STYLE_RULES}`,
      prompt,
    });
    return humanizeText(text);
  } catch (error) {
    throw mapGatewayError(error);
  }
}

function mapGatewayError(error: unknown): Error {
  const status = (error as { statusCode?: number; status?: number })?.statusCode ?? (error as { status?: number })?.status;
  if (status === 429) {
    return new Error("Das KI-Limit ist erreicht. Bitte versuchen Sie es in Kürze erneut.");
  }
  if (status === 402) {
    return new Error("Das KI-Guthaben ist aufgebraucht. Bitte laden Sie Ihr Guthaben auf.");
  }
  if (status === 403) {
    return new Error(
      "Das KI-Kreditlimit des Workspaces ist erreicht. Bitte das Limit erhöhen oder Guthaben aufladen.",
    );
  }
  console.error("AI gateway error", error);
  return new Error("Die KI-Anfrage ist fehlgeschlagen. Bitte erneut versuchen.");
}