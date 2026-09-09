/**
 * PHASE 11.13C: the RESPONSE COMMIT POINT -- the narrowest existing seam where the system (a) knows
 * the authoritative semantic response this interaction carries and (b) knows the response delivery
 * actually succeeded, called SEPARATELY from the PLAYER's own ask-action dispatch.
 *
 * PHASE 11.13D (see docs/research/evaluation/phase-11-13d/STRUCTURED_RESPONSE_SEMANTICS_V1.md):
 * the committed material's own `id` (`LEFTOVER_RESPONSE_MATERIAL_IDS[outcome]`, imported from
 * `playableSceneContracts.ts`) IS the authoritative semantic signal now -- a structural fact fixed
 * at commit time, never re-derived from `concreteContent`. `concreteContent` is still written
 * (audit/history display only, per directive Section 5's explicit allowance) but is deliberately
 * NEVER read by `causalUnlockInvariant.ts`'s target-resolution logic anymore, and may freely
 * contain the literal target phrase in ANY outcome's text (including DENY/UNKNOWN) without risk --
 * see `RESPONSE_TRUTH_TABLE_V1.md` for the adversarial proof this no longer matters.
 *
 * Not a ResponseEngine/DialogueEngine/ConversationManager -- one small, explicit registry
 * (`LEFTOVER_QUESTION_RESPONSE_SEMANTICS`, keyed the SAME way `languageAdapter.ts`'s `packetKey`
 * already keys captured lines) plus one commit function reusing the EXISTING State Admission
 * primitives (`admitMaterials`/`mergeMaterials`, unmodified, exported by `engine.ts` since PHASE
 * 11.6R) that `ActionContractV2.stateDelta` already relies on internally.
 *
 * Directive Section 5's required separation, made concrete:
 *   RESPONSE_SEMANTIC (authority): `LEFTOVER_QUESTION_RESPONSE_SEMANTICS[packetKey]` (which
 *     outcome to commit) + the resulting material's `id` (which outcome WAS committed) -- both
 *     structural, authored once by a human reading the real captured text, never derived at
 *     runtime from the displayed string.
 *   VISIBLE_REALIZATION (language): whatever `languageAdapter(packet)` returns for display --
 *     never read by this module at all.
 *
 * A packet key with NO entry here has no known authoritative response outcome -- this IS the
 * NO_RESPONSE case (directive Section 3/9): nothing is committed, `answerReceived` stays false.
 */

import { admitMaterials, mergeMaterials } from "./engine";
import type { ContractV2State } from "./types";
import type { LifeMaterial } from "../life-material-7day/types";
import { packetKey } from "./languageAdapter";
import type { YoheiScenePacket } from "./playableSceneContracts";
import { LEFTOVER_RESPONSE_MATERIAL_IDS, type StructuredResponseOutcome } from "./playableSceneContracts";

export type { StructuredResponseOutcome };

/**
 * Authored independently of any display string. Verified once against the actual captured text:
 * `capturedYoheiLines.ts`'s entry for this exact packet key is "ああ、そうだ。祭りの残りだよ。値引き
 * で出すから、棚に並べるんだ。" -- a genuine confirmation, matching `CONFIRM` (see
 * `RESPONSE_TRUTH_TABLE_V1.md`'s fixture-consistency check for the mechanical proof this pairing
 * is not stale).
 */
export const LEFTOVER_QUESTION_RESPONSE_SEMANTICS: Record<string, StructuredResponseOutcome> = {
  "ASK_ABOUT_LEFTOVER_STOCK::KNOWN": "CONFIRM",
};

/** Display/audit-only prose per outcome. Deliberately allowed to contain the literal target
 *  phrase "祭りの残り" in EVERY branch, including DENY and UNKNOWN -- proving (directive Section
 *  10/11) that no authoritative decision anywhere reads this text. */
const RESPONSE_DISPLAY_PROSE: Record<StructuredResponseOutcome, string> = {
  CONFIRM: "洋平が、この手ぬぐいは祭りの残りだと答えた",
  DENY: "洋平は、これは祭りの残りじゃないと答えた",
  UNKNOWN: "洋平は、これが祭りの残りかどうか分からないと答えた",
};

function leftoverResponseMaterial(state: ContractV2State, outcome: StructuredResponseOutcome): LifeMaterial {
  return {
    id: LEFTOVER_RESPONSE_MATERIAL_IDS[outcome],
    type: "SHARED_EVENT",
    concreteContent: RESPONSE_DISPLAY_PROSE[outcome],
    origin: "NPC_RESPONSE:ASK_ABOUT_LEFTOVER_STOCK",
    dayCreated: state.day,
    authority: "WORLD_EVENT_WITNESSED",
    status: "ACTIVE",
    knownBy: ["player", "yohei"],
    possibleConsumers: [],
  };
}

/** Commits Yohei's response as its own authoritative State Admission event -- reuses the exact
 *  `admitMaterials`/`mergeMaterials` pipeline every other persistent fact in this scene goes
 *  through, just invoked from a second, separate call site rather than from inside the PLAYER's
 *  own ask-contract dispatch. The outcome parameter (not the resulting text) is what determines
 *  which structurally-distinct material id gets admitted. */
export function commitLeftoverQuestionResponse(state: ContractV2State, outcome: StructuredResponseOutcome): ContractV2State {
  const material = leftoverResponseMaterial(state, outcome);
  const { admitted } = admitMaterials("ASK_ABOUT_LEFTOVER_STOCK_NPC_RESPONSE", [material]);
  return { ...state, materials: mergeMaterials(state.materials, admitted) };
}

/**
 * The real orchestration entry point (directive Section 4's "RESPONSE COMMIT POINT"), called from
 * `NewlifePlayable11App.tsx`'s `askQuestion`, AFTER `resolveAction` (the PLAYER's own ask dispatch)
 * has already completed and AFTER the language adapter has been consulted for display -- i.e. at
 * the response-delivery seam, not bundled into the question's own dispatch. A `Record<actionId,
 * handler>` registry (the same declarative-lookup idiom `ASK_ACTION_UI_META` in
 * `NewlifePlayable11App.tsx` already uses), not an `if (actionId === ...)` branch, and not a
 * general engine -- only `ASK_ABOUT_LEFTOVER_STOCK` currently has a registered handler because it
 * is the only question in this scene claiming to confirm a previously-unknown target fact.
 */
const RESPONSE_COMMIT_HANDLERS: Record<string, (state: ContractV2State, packet: YoheiScenePacket) => ContractV2State> = {
  ASK_ABOUT_LEFTOVER_STOCK: (state, packet) => {
    const outcome = LEFTOVER_QUESTION_RESPONSE_SEMANTICS[packetKey(packet)];
    return outcome ? commitLeftoverQuestionResponse(state, outcome) : state; // no entry = NO_RESPONSE, nothing committed
  },
};

export function commitNpcResponseIfApplicable(actionId: string, state: ContractV2State, packet: YoheiScenePacket): ContractV2State {
  const handler = RESPONSE_COMMIT_HANDLERS[actionId];
  return handler ? handler(state, packet) : state;
}
