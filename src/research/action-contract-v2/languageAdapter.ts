/**
 * PHASE 11.11: injectable language-realization boundary (directive Section 17). The engine decides
 * WHAT happened (Action Contract V2 dispatch, deterministic); a LanguageAdapter decides HOW Yohei
 * expresses it, as a plain string -- never anything with write access to state. Swappable: the
 * scene UI is wired to `createReplayLanguageAdapter` (real, captured Vertex output, replayed), not
 * a live call -- see PLAYABLE_SCENE_SPEC_V1.md's "Real LLM language path" section for why live
 * browser-to-Vertex wiring was explicitly out of scope this phase.
 */

import type { YoheiScenePacket } from "./playableSceneContracts";

export type LanguageAdapter = (packet: YoheiScenePacket) => string;

/** Stable key for looking up a captured line -- deliberately coarse (action + whether the pending
 *  request content is KNOWN or UNKNOWN at the time of the call), since that's the only thing that
 *  varies across this scene's automated play paths. */
export function packetKey(packet: YoheiScenePacket): string {
  const requestStatus = packet.pendingRequestContent.startsWith("KNOWN") ? "KNOWN" : "UNKNOWN";
  return `${packet.authoritativeAction}::${requestStatus}`;
}

export interface CapturedLine {
  packetKey: string;
  text: string;
  /** Real capture provenance -- never fabricated. See raw_vertex_capture.json for the full request/response. */
  provenance: { projectId: string; location: string; modelId: string; capturedAt: string };
}

/** Never fabricates a line. If no captured entry matches, returns an explicit, honestly-labeled
 *  placeholder rather than inventing dialogue -- this adapter's whole purpose is to only ever show
 *  genuinely-captured real model output. */
export function createReplayLanguageAdapter(captured: CapturedLine[]): LanguageAdapter {
  const byKey = new Map(captured.map((c) => [c.packetKey, c]));
  return (packet: YoheiScenePacket): string => {
    const hit = byKey.get(packetKey(packet));
    return hit ? hit.text : "（この場面の実測モデル応答はまだ記録されていません -- パケット: " + packetKey(packet) + "）";
  };
}
