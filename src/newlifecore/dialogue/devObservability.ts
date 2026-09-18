/**
 * PHASE_18_NEW_LIFE_AI_RESPONSIBILITY_BOUNDARY_V1 Section B12 -- development/test-only visibility
 * into which path a conversation turn actually took (real model vs. bounded fallback), never
 * shown in a production build and never read by any gameplay logic (a pure side-channel log, not
 * state). Kept intentionally tiny: an in-memory ring buffer, no persistence, no network call of
 * its own. Guarded by `import.meta.env.DEV` at the call site, not here, so this module stays a
 * plain data structure with no environment branching of its own.
 */
export interface DevConversationLogEntry {
  npcId: string;
  day: number;
  location: string;
  currentEvent: string | null;
  recentMemoryCount: number;
  /** "live" = a real model reply was used; "fallback" = the bounded deterministic responder ran
   *  instead, either because live was off or because the live call failed/timed out/was malformed. */
  source: "live" | "fallback";
  fallbackReason?: string;
  latencyMs: number;
  at: number;
}

const MAX_ENTRIES = 30;
const log: DevConversationLogEntry[] = [];

export function recordDevConversationTurn(entry: DevConversationLogEntry): void {
  log.push(entry);
  if (log.length > MAX_ENTRIES) log.shift();
}

export function getDevConversationLog(): readonly DevConversationLogEntry[] {
  return log;
}
