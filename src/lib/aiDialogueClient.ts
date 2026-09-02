import type { AiCharacterKey } from "../types/case";

/**
 * REAL_AI_DIALOGUE Run (Section 12/26): the ONE network call in this entire
 * app. Everything else stays local-only (docs/DATA_BOUNDARY.md). Points at
 * the dialogue Cloud Function (functions/dialogue/) once it is deployed --
 * left empty until then. `PersonalizedAiDialogueGate` checks this before
 * ever showing the consent screen or calling `performDialogueFetch`, so an
 * empty value means zero behavior change from before this Run existed.
 */
export const DIALOGUE_ENDPOINT_URL = "";

const REQUEST_TIMEOUT_MS = 12_000;

export interface AiDialogueRequest {
  situation: string[];
  question: string;
  choiceLabels: string[];
  choiceLabel: string;
  confidence: number;
  reason: string;
  selectedInfoLabels: string[];
  character: AiCharacterKey;
}

export type AiDialogueResult = { ok: true; message: string } | { ok: false; reason: string };

/**
 * Sends exactly the fields needed to generate this one dialogue turn --
 * never the player's full trajectory history, other cases, Growth stats, or
 * any device/user identifier (Section 15, data minimization). Never sends
 * rubric ground truth: the server-side function does not receive it either,
 * so it cannot leak it even by accident (Section 17, evaluation firewall).
 */
export async function performDialogueFetch(url: string, request: AiDialogueRequest): Promise<AiDialogueResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    if (!response.ok) {
      return { ok: false, reason: `http_${response.status}` };
    }

    const data: unknown = await response.json();
    if (
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof (data as { message: unknown }).message === "string" &&
      (data as { message: string }).message.trim().length > 0
    ) {
      return { ok: true, message: (data as { message: string }).message.trim() };
    }
    return { ok: false, reason: "malformed_response" };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return { ok: false, reason: "timeout" };
    }
    return { ok: false, reason: "network_error" };
  } finally {
    clearTimeout(timeout);
  }
}
