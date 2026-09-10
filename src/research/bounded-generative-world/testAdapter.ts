/**
 * PHASE 12.1: deterministic test adapter -- CI-safe, never touches the network
 * (WORLD_NPC_PLAYER_AUTHORITY_FLOW_V1.md's "test adapter vs live adapter" split, PHASE 12.0).
 * Fixture responses are explicitly authored fixtures for exercising the PIPELINE (classification
 * routing, hard validation, consequence commit) -- they are NEVER cited as the AI-necessity
 * experiment's evidence (that requires the live adapter's real, uncontrolled output; see
 * docs/research/evaluation/phase-12-1/ai_necessity_live_experiment.mjs).
 */

import type { BgwAdapter, NpcResponseEnvelope } from "./types";

interface Fixture {
  match: (utterance: string) => boolean;
  envelope: NpcResponseEnvelope;
}

const YOHEI_FIXTURES: Fixture[] = [
  {
    // Directive Section 7 case: false PLAYER world assertion. Checked BEFORE the generic
    // help-offer fixture below since "さっき手伝うって言った" also contains the substring "手伝う" --
    // order matters here the same way WORLD-scope-before-NPC-scope ordering matters in the real
    // classification pipeline (ADVERSARIAL_PAPER_SIMULATION_V1.md's own ordering discipline).
    match: (u) => u.includes("さっき手伝うって言った") || u.includes("約束したよね"),
    envelope: {
      classification: "IN_SCOPE",
      npcResponseIntent: "CORRECT_MISREMEMBERED_CLAIM",
      proposedConsequenceId: null,
      visibleUtterance: "（フィクスチャ）いや、そんな話はしてないが。",
    },
  },
  {
    // Directive Section 7 case: unauthored feasible suggestion.
    match: (u) => u.includes("手伝おうか") || u.includes("手伝う"),
    envelope: {
      classification: "IN_SCOPE",
      npcResponseIntent: "ACCEPT_HELP_OFFER",
      proposedConsequenceId: "YOHEI_HELP_PROMISE",
      visibleUtterance: "（フィクスチャ）おう、悪いな。じゃあ運ぶの手伝ってくれ。",
    },
  },
  {
    // Directive Section 7 case: outside NPC scope (Challenge-Center-style administrative detail).
    match: (u) => u.includes("チャレンジセンター") || u.includes("役所"),
    envelope: {
      classification: "NPC_KNOWLEDGE_GAP",
      npcResponseIntent: "EXPRESS_IGNORANCE",
      proposedConsequenceId: null,
      visibleUtterance: "（フィクスチャ）そういうのは俺に聞かれても分からんな。",
    },
  },
  {
    // Directive Section 7 case: wildly out-of-world question.
    match: (u) => u.includes("宇宙人") || u.includes("株価"),
    envelope: {
      classification: "OUT_OF_WORLD_SCOPE",
      npcResponseIntent: "DEFLECT_OUT_OF_SCOPE",
      proposedConsequenceId: null,
      visibleUtterance: "（フィクスチャ）そいつは俺の話す事じゃないな。",
    },
  },
];

const MIYOKO_FIXTURES: Fixture[] = [
  {
    // Directive Section 7 case: NPC does not know (Yohei's specific stock detail is outside her channel).
    match: (u) => u.includes("洋平") && (u.includes("在庫") || u.includes("仕入れ")),
    envelope: {
      classification: "NPC_KNOWLEDGE_GAP",
      npcResponseIntent: "EXPRESS_IGNORANCE",
      proposedConsequenceId: null,
      visibleUtterance: "（フィクスチャ）それは洋平さんに聞いてみて。私はよく知らないの。",
    },
  },
];

const JIN_FIXTURES: Fixture[] = [];

const FIXTURES_BY_NPC: Record<string, Fixture[]> = { yohei: YOHEI_FIXTURES, miyoko: MIYOKO_FIXTURES, jin: JIN_FIXTURES };

const GENERIC_FALLBACK: Record<string, NpcResponseEnvelope> = {
  yohei: { classification: "INSUFFICIENT_CONTEXT", npcResponseIntent: "ASK_FOR_CLARIFICATION", proposedConsequenceId: null, visibleUtterance: "（フィクスチャ）悪い、もう少しはっきり言ってくれ。" },
  miyoko: { classification: "INSUFFICIENT_CONTEXT", npcResponseIntent: "ASK_FOR_CLARIFICATION", proposedConsequenceId: null, visibleUtterance: "（フィクスチャ）ごめんなさい、もう一度言ってもらえる？" },
  jin: { classification: "INSUFFICIENT_CONTEXT", npcResponseIntent: "ASK_FOR_CLARIFICATION", proposedConsequenceId: null, visibleUtterance: "（フィクスチャ）悪い、もう一回頼む。" },
};

export const deterministicTestAdapter: BgwAdapter = async (packet) => {
  const fixtures = FIXTURES_BY_NPC[packet.npcId] ?? [];
  const hit = fixtures.find((f) => f.match(packet.playerUtterance));
  if (hit) {
    // Even fixture output goes through the same shape the live adapter would produce; the
    // consequence id is still checked by the caller's hard-validation step, never trusted here.
    return hit.envelope;
  }
  return GENERIC_FALLBACK[packet.npcId] ?? { classification: "INSUFFICIENT_CONTEXT", npcResponseIntent: "UNKNOWN_NPC", proposedConsequenceId: null, visibleUtterance: "……。" };
};
