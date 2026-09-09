/**
 * PHASE 11.13: product-scoped language fixture, layered IN FRONT OF the real captured-Vertex
 * replay adapter for the one packet key whose real captured line leaks the box's contents before
 * the product-repaired scene's physical reveal is supposed to happen.
 *
 * Directive Section 17: "If an old replay now leaks information too early, do not distort Product
 * semantics to preserve it. Use minimal system-authored isolated fixture text for the transition
 * instead." The real captured line for `ASK_WHAT_HELP_NEEDED::KNOWN`
 * ("店先にある祭りの手ぬぐいの箱、値引き用の棚まで運んでくれるか") states 祭り(festival)/手ぬぐい
 * (towels) -- exactly the fact PHASE 11.13 requires stay hidden until the physical reveal after
 * ACCEPT. Rather than edit that captured line's text (which would misrepresent fabricated wording
 * as a genuine Vertex capture -- `raw_vertex_capture.json`'s provenance record for it is untouched,
 * historical evidence), this module provides ONE explicitly-labeled `SYSTEM_AUTHORED_PRODUCT_
 * FIXTURE` line that the product language adapter checks first, falling back to the real captured-
 * replay adapter (unchanged, `languageAdapter.ts`) for every other packet key -- ASK_FESTIVAL,
 * ASK_SALES, and ASK_ABOUT_LEFTOVER_STOCK's real captured lines are reused verbatim; only this one
 * line is fixture text.
 */

import type { YoheiScenePacket } from "./playableSceneContracts";
import { packetKey, type LanguageAdapter } from "./languageAdapter";

export interface ProductFixtureLine {
  packetKey: string;
  text: string;
  source: "SYSTEM_AUTHORED_PRODUCT_FIXTURE";
  reason: string;
}

export const PRODUCT_FIXTURE_LINES: ProductFixtureLine[] = [
  {
    // packetKey = `${authoritativeAction}::KNOWN|UNKNOWN`, where authoritativeAction is the
    // CONTRACT'S playerIntent ("ASK_WHAT"), NOT its actionId ("ASK_WHAT_HELP_NEEDED") -- see
    // buildYoheiPacket's caller in NewlifePlayable11App.tsx / languageAdapter.ts's packetKey().
    packetKey: "ASK_WHAT::KNOWN",
    text: "店先の箱を、値引き用の棚まで運んでくれるか。",
    source: "SYSTEM_AUTHORED_PRODUCT_FIXTURE",
    reason:
      'the real captured Vertex line for this packet key ("店先にある祭りの手ぬぐいの箱、値引き用の棚まで運んでくれるか") names festival/towels before the physical reveal; the repaired product flow requires that fact to stay hidden until after ACCEPT (see docs/research/evaluation/phase-11-13/PRODUCT_SCENE_REPAIR_SPEC_V1.md)',
  },
];

/** Checks the product fixture table first (by the SAME `packetKey` the real replay adapter uses),
 *  falling back to `fallback` (the real captured-replay adapter, unmodified) for every other key. */
export function createProductLanguageAdapter(fixtures: ProductFixtureLine[], fallback: LanguageAdapter): LanguageAdapter {
  const byKey = new Map(fixtures.map((f) => [f.packetKey, f]));
  return (packet: YoheiScenePacket): string => {
    const fixture = byKey.get(packetKey(packet));
    return fixture ? fixture.text : fallback(packet);
  };
}
