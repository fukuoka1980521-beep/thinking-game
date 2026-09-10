/**
 * PHASE 12.1: browser-side live adapter client. Contains NO credential of any kind -- it only
 * ever calls a same-origin, dev-only local endpoint (LIVE_VERTEX_LOCAL_ADAPTER_DESIGN_V1.md,
 * PHASE 12.0). The actual model call, and the only place a bearer token exists, is entirely
 * server-side (a dev-server-only Vite plugin outside this directory, wired in vite.config.ts) --
 * never shipped to this file's bundle, never present in any response this function receives.
 */

import { validateEnvelope } from "./envelope";
import type { BgwAdapter, NpcResponseEnvelope } from "./types";

export const liveVertexAdapter: BgwAdapter = async (packet) => {
  try {
    const res = await fetch("/api/bgw-npc-dialogue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(packet),
    });
    if (!res.ok) {
      return validateEnvelope(null, packet); // fails closed to INSUFFICIENT_CONTEXT -- see NG_RESPONSE_SEMANTICS_V1.md
    }
    const raw = (await res.json()) as Partial<NpcResponseEnvelope>;
    return validateEnvelope(raw, packet);
  } catch {
    // Network/timeout/parse failure -- never a raw error to the player (NG_RESPONSE_SEMANTICS_V1.md).
    return validateEnvelope(null, packet);
  }
};
