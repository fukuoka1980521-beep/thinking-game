/**
 * PHASE 11.6: Action Contract V2 — isolated runtime types.
 *
 * Direct implementation of `docs/methodology/ACTION_INTENT_RESULT_CONTRACT_V2.md`'s canonical
 * field names -- no renaming, no parallel schema. Reuses `LifeMaterial` (PHASE 10.21) and the
 * unmodified State Admission module (PHASE 10.18) exactly as every prior research phase has.
 *
 * Deliberately excluded, per PHASE 11.6's own directive: a runtime Narrative Selection layer, a
 * standalone PEU layer, a Drama Manager, a storylet engine, a narrative planner, RAG, embeddings,
 * Dynamic State expansion, and LLM generation. `CONDITIONAL_FOLLOW_UP_AFFORDANCE` /
 * `FOLLOW_UP_RESOLUTION` are fields OF this contract (PHASE 11.4/11.5's own finding), not a
 * separate pipeline stage.
 */

import type { LifeMaterial } from "../life-material-7day/types";

export type ActorId = "player" | "yohei" | "jin";
export type ExperienceMode = "PARTICIPATED" | "WITNESSED" | "HEARD" | "READ";

export interface ExperienceWrite {
  actorId: ActorId;
  mode: ExperienceMode;
  concreteContent: string;
}

/** A single, named precondition -- the ONE object both `ELIGIBILITY` and (where applicable)
 *  `SUCCESS_POSTCONDITION` must reference, per PHASE 11.6 Section 5's "single precondition
 *  authority" requirement. Never re-derived independently in two places. */
export interface Precondition {
  id: string;
  check: (state: ContractV2State) => boolean;
}

export interface FollowUpAffordance {
  id: string;
  label: string;
  /** Must reuse the SAME Precondition object(s) the base action (or a prior step) already
   *  established as governing this fact -- never a freshly-authored, independent copy. */
  eligibility: Precondition[];
}

export interface VisibleFeedback {
  onSuccess: string[];
  onPartialSuccess: string[] | null;
  onFailure: string[] | null;
}

/**
 * PHASE 11.6R: the contract is deliberately SPARSE. CORE fields (required, meaningful for every
 * dispatch): actionId, playerIntent, eligibility, playerVisiblePromise, authoritativeEvent,
 * stateDelta, conditionalFollowUpAffordance. Everything else is conditional and may be trivial
 * (`null`/`"NONE"`) without ceremony.
 *
 * `interpretedIntent` is deliberately NOT a field on this struct. For ordinary explicit UI
 * dispatch there is nothing to separately author -- the trace derives it as a plain alias of
 * `playerIntent` (see `engine.ts`'s `buildTrace`), never a second, independently-authored string
 * that could silently drift from it. It becomes a genuinely distinct value only on the free-text
 * path (`freeTextBoundary.ts`), which produces its own `FreeTextCandidate.interpretedIntentId`
 * and is never itself treated as this contract's `playerIntent`.
 */
export interface ActionContractV2 {
  actionId: string;
  /** CORE. PLAYER's intention for this dispatch -- the only intent field this struct carries. */
  playerIntent: string;
  /** CORE. Reused verbatim by `successPostcondition`'s own reachability wherever the two concern
   *  the same underlying fact (Section 5/6) -- see `contracts.ts`'s shared `Precondition`
   *  constants (e.g. `TRASH_BAGS_NEEDED`), never a second, independently-written copy. */
  eligibility: Precondition[];
  /** CORE. */
  playerVisiblePromise: string;
  /** CONDITIONAL -- null when no visible obstacle can occur for this action. */
  failurePostcondition: Precondition | null;
  /** CORE. Records what actually occurred, including a legitimate no-persistent-change result --
   *  never invented merely to populate this field. */
  authoritativeEvent: string;
  /** CONDITIONAL -- a trivial always-true predicate is legitimate when nothing meaningful gates
   *  success beyond eligibility itself (e.g. REST). */
  successPostcondition: Precondition;
  partialSuccessPostcondition: Precondition | null;
  visibleFeedback: (state: ContractV2State) => VisibleFeedback;
  /** CORE. May legitimately return `[]` -- an empty state delta is a real, valid result, not an
   *  omission. */
  stateDelta: (state: ContractV2State) => LifeMaterial[];
  actorExperienceWrite: (state: ContractV2State) => ExperienceWrite[];
  /** CORE. `"NONE"` is a first-class value, not degenerate -- only non-"NONE" when the situation
   *  legitimately, currently reveals a further affordance. */
  conditionalFollowUpAffordance: (state: ContractV2State) => FollowUpAffordance[] | "NONE";
}

// ---------------------------------------------------------------------------
// PHASE 11.8: PendingReply -- an unfilled NPC-opened conversational reply-slot.
// Minimal shape per directive Section 2 -- id/sourceEventId/npcId/status/expectedReplyClass only.
// Deliberately excludes turnOwner, a topic stack, a conversation tree, a relationship score, and
// LLM state, per the same section's explicit prohibition. `PENDING_STATUS_ENUM_FALSIFICATION_V1.md`
// (PHASE 11.7R) is the paper justification this runtime now tests adversarially; DEFERRED remains
// provisional here too -- Section 9 permits this Run to still collapse it if it proves redundant.
// ---------------------------------------------------------------------------

export type PendingReplyStatus = "OPEN" | "DEFERRED" | "RESOLVED" | "WITHDRAWN";

export interface PendingReply {
  id: string;
  sourceEventId: string;
  npcId: ActorId;
  status: PendingReplyStatus;
  expectedReplyClass: string;
}

/** Machine-readable record of one PendingReply-lifecycle event, analogous in spirit to
 *  `ActionTrace` but deliberately narrower -- these events transition (or explicitly do not
 *  transition) `pendingReply.status` only; they never carry the full Action Contract V2 shape
 *  (playerVisiblePromise/failurePostcondition/etc.), since PendingReply events are not general
 *  PLAYER actions (directive Section 2's "narrowest representation" instruction). */
export interface PendingReplyTrace {
  event: string;
  eligibilityResult: { id: string; passed: boolean }[];
  pendingReplyId: string | null;
  statusBefore: PendingReplyStatus | "NONE";
  statusAfter: PendingReplyStatus | "NONE";
  narration: string[];
  stateAdmissionDecision: { sourceEvent: string; provenanceClass: string; admissionDecision: string }[];
  lifeMaterialDelta: string[];
}

export interface ContractV2State {
  day: number;
  materials: LifeMaterial[];
  experienceLog: ExperienceWrite[];
  /** World-truth conditions this prototype's contracts read from -- deliberately minimal, no
   *  Dynamic State expansion. `yoheiAvailableForConversation` (PHASE 11.8) models a third-party
   *  interruption as ordinary eligibility-gating world state -- explicitly NOT a `turnOwner` value
   *  (TURN_OWNER_FALSIFICATION_V2.md's Case 6). */
  world: {
    jinHelperAbsentToday: boolean;
    yoheiAvailableForConversation: boolean;
  };
  narration: string[];
  pending: { affordances: FollowUpAffordance[] } | null;
  /** PHASE 11.8: at most one open conversational reply-slot at a time in this prototype. Distinct
   *  from `pending` above (conditional follow-up affordances, PHASE 11.6R) -- unrelated concept,
   *  kept as a separate field rather than overloaded onto the existing one. */
  pendingReply: PendingReply | null;
}

/** Machine-readable, per directive Section 20 -- produced directly by `engine.ts`, never
 *  reconstructed from prose afterward. `interpretedIntent` is included only where it is a
 *  genuinely distinct value (the free-text path); for ordinary button dispatch it is set equal to
 *  `initialIntent`, a plain derived alias with no independent authority (Section 3). */
export interface ActionTrace {
  contractId: string;
  initialIntent: string;
  interpretedIntent: string;
  /** The id of the canonical Precondition set governing this action's availability -- the SAME
   *  id(s) `eligibilityResult` was computed against, and (where applicable) the same id(s) a
   *  follow-up's own eligibility references (Section 5/6). */
  canonicalPreconditionId: string;
  eligibilityResult: { id: string; passed: boolean }[];
  visiblePromise: string;
  selectedAction: string;
  authoritativeEvent: string;
  stateDelta: string[];
  conditionalAffordances: string[] | "NONE";
  followUpChoice: string | "NOT_APPLICABLE";
  stateAdmissionDecision: { sourceEvent: string; provenanceClass: string; admissionDecision: string }[];
  actorExperienceDelta: ExperienceWrite[];
  lifeMaterialDelta: string[];
  resultingState: { materials: string[]; day: number };
}
