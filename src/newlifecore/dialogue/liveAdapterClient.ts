/**
 * Browser-side live adapter client -- no credential of any kind. Only ever calls a same-origin,
 * dev-only local endpoint; the actual model call and the only place a bearer token exists is
 * entirely server-side (a dev-server-only Vite plugin outside this directory, wired in
 * vite.config.ts -- never bundled into this file's output).
 * Mirrors ../../research/bounded-generative-world/liveAdapterClient.ts's proven shape exactly.
 */
import { validateNpcReply } from "./envelope";
import { deterministicNpcReply } from "./deterministicAdapter";
import type { NpcAiAdapter, NpcReplyEnvelope } from "./types";

/** Directive Section 30: AI/GCP failure must never stop the game or surface a raw technical
 *  error. A connection failure (network/5xx/timeout) falls back to the richer, topic-aware
 *  deterministic responder rather than a single flat "didn't catch that" line every time; a
 *  structurally-invalid-but-200 response still goes through the plain envelope fallback. */
// A live model call that never returns (a stalled network hop, a hung upstream call) would
// otherwise leave the UI's "pending" state stuck forever -- silently freezing conversation even
// though nothing ever surfaced as an error. 20s is generous for a single short reply but still
// bounded, so a stall always resolves into the same graceful fallback as any other failure.
const LIVE_REPLY_TIMEOUT_MS = 20000;

export const liveNpcAdapter: NpcAiAdapter = async (context) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), LIVE_REPLY_TIMEOUT_MS);
  try {
    const res = await fetch("/api/newlifecore-npc-dialogue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(context),
      signal: controller.signal,
    });
    if (!res.ok) return deterministicNpcReply(context);
    const raw = (await res.json()) as Partial<NpcReplyEnvelope>;
    if (!raw || typeof raw.visibleUtterance !== "string" || !raw.visibleUtterance.trim()) return deterministicNpcReply(context);
    return validateNpcReply(raw, context);
  } catch {
    return deterministicNpcReply(context);
  } finally {
    clearTimeout(timeout);
  }
};
