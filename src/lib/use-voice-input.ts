import { useCallback, useRef, useState } from "react";

const TARGET_RATE = 16000;

function downsample(chunks: Float32Array[], from: number, to: number) {
  const length = chunks.reduce((sum, c) => sum + c.length, 0);
  const merged = new Float32Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  if (to >= from) return merged;
  const ratio = from / to;
  const out = new Float32Array(Math.floor(merged.length / ratio));
  for (let i = 0; i < out.length; i++) out[i] = merged[Math.floor(i * ratio)] ?? 0;
  return out;
}

function encodeWav(samples: Float32Array, sampleRate: number) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeString = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i++) view.setUint8(offset + i, value.charCodeAt(i));
  };
  writeString(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, samples.length * 2, true);
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i] ?? 0));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }
  return new Blob([buffer], { type: "audio/wav" });
}

type Recorder = {
  stream: MediaStream;
  ctx: AudioContext;
  source: MediaStreamAudioSourceNode;
  node: ScriptProcessorNode;
  chunks: Float32Array[];
};

export function useVoiceInput(options: {
  onTranscript: (text: string) => void;
  onError: (message: string) => void;
}) {
  const { onTranscript, onError } = options;
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const recorderRef = useRef<Recorder | null>(null);

  const start = useCallback(async () => {
    if (recorderRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const node = ctx.createScriptProcessor(4096, 1, 1);
      const chunks: Float32Array[] = [];
      node.onaudioprocess = (event) => {
        chunks.push(new Float32Array(event.inputBuffer.getChannelData(0)));
      };
      source.connect(node);
      node.connect(ctx.destination);
      recorderRef.current = { stream, ctx, source, node, chunks };
      setIsRecording(true);
    } catch {
      onError("Kein Zugriff auf das Mikrofon. Bitte die Berechtigung erlauben.");
    }
  }, [onError]);

  const stop = useCallback(async () => {
    const recorder = recorderRef.current;
    if (!recorder) return;
    recorderRef.current = null;
    setIsRecording(false);

    recorder.stream.getTracks().forEach((track) => track.stop());
    recorder.node.disconnect();
    recorder.source.disconnect();
    recorder.node.onaudioprocess = null;
    const samples = downsample(recorder.chunks, recorder.ctx.sampleRate, TARGET_RATE);
    await recorder.ctx.close();

    const blob = encodeWav(samples, TARGET_RATE);
    if (blob.size < 4096) {
      onError("Die Aufnahme war zu kurz. Bitte erneut sprechen.");
      return;
    }

    setIsTranscribing(true);
    try {
      const body = new FormData();
      body.append("file", blob, "recording.wav");
      const response = await fetch("/api/transcribe", { method: "POST", body });
      if (!response.ok) {
        onError((await response.text().catch(() => "")) || "Transkription fehlgeschlagen.");
        return;
      }
      const data = (await response.json()) as { text?: string };
      const text = (data.text ?? "").trim();
      if (!text) {
        onError("Es wurde nichts erkannt. Bitte erneut sprechen.");
        return;
      }
      onTranscript(text);
    } catch {
      onError("Transkription fehlgeschlagen.");
    } finally {
      setIsTranscribing(false);
    }
  }, [onError, onTranscript]);

  const toggle = useCallback(() => {
    if (isRecording) void stop();
    else void start();
  }, [isRecording, start, stop]);

  return { isRecording, isTranscribing, toggle };
}