import { useCallback, useRef, useState } from "react";

export type ChatMessage = { id: string; role: "user" | "assistant"; text: string };

/**
 * Minimal chat client for /api/chat.
 * Deliberately avoids @ai-sdk/react so the AI SDK (and its zod/v4 internals)
 * never enter the browser bundle.
 */
export function useSimpleChat(onError?: (message: string) => void) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const busy = useRef(false);

  const send = useCallback(
    async (text: string, setup: string) => {
      if (busy.current || !text.trim()) return;
      busy.current = true;
      setIsLoading(true);

      const history: ChatMessage[] = [
        ...messages,
        { id: crypto.randomUUID(), role: "user" as const, text },
      ];
      const assistantId = crypto.randomUUID();
      setMessages([...history, { id: assistantId, role: "assistant", text: "" }]);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            setup,
            messages: history.map((m) => ({
              id: m.id,
              role: m.role,
              parts: [{ type: "text", text: m.text }],
            })),
          }),
        });

        if (!response.ok || !response.body) {
          throw new Error((await response.text()) || "Anfrage fehlgeschlagen");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let acc = "";

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const payload = trimmed.slice(5).trim();
            if (!payload || payload === "[DONE]") continue;
            try {
              const event = JSON.parse(payload) as { type?: string; delta?: string; text?: string; errorText?: string };
              if (event.type === "text-delta" && typeof event.delta === "string") {
                acc += event.delta;
              } else if (event.type === "text" && typeof event.text === "string") {
                acc += event.text;
              } else if (event.type === "error") {
                throw new Error(event.errorText ?? "Fehler beim Generieren");
              }
            } catch {
              // ignore malformed chunk
            }
            setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, text: acc } : m)));
          }
        }

        if (!acc) {
          setMessages((prev) => prev.filter((m) => m.id !== assistantId));
          throw new Error("Keine Antwort erhalten");
        }
      } catch (error) {
        onError?.(error instanceof Error ? error.message : "Unbekannter Fehler");
      } finally {
        busy.current = false;
        setIsLoading(false);
      }
    },
    [messages, onError],
  );

  return { messages, send, isLoading };
}