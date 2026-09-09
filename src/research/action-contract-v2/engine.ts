/**
 * PHASE 11.6R: Action Contract V2 resolution engine.
 *
 * Implements exactly the canonical pipeline from
 * `docs/methodology/NEW_LIFE_CANONICAL_RUNTIME_ARCHITECTURE_V1.md`:
 *
 *   ACTION CONTRACT V2 -> [optional conditional affordance] -> [optional PLAYER follow-up] ->
 *   NPC/WORLD RESPONSE -> STATE ADMISSION -> LIFE MATERIAL + ACTOR EXPERIENCE -> FUTURE STATE
 *
 * No Narrative Selection box, no standalone PEU box, no LLM (all narration below is deterministic
 * authored string arrays from `contracts.ts`). Reuses the unmodified PHASE 10.18 State Admission
 * module exactly as every prior research phase has.
 *
 * Scope discipline (PHASE 11.6R): this module proves ONLY the specific tested cases. It does not
 * prove general semantic-drift prevention, full NEW LIFE architecture, 30-day scenario
 * integration, free-text product quality, NPC human-likeness, or game fun.
 */

import { classifyProvenance } from "../state-admission/classifyProvenance";
import { decideAdmission } from "../state-admission/admissionGate";
import type { StructuredPlayerActionInput } from "../state-admission/types";
import type { LifeMaterial } from "../life-material-7day/types";
import type { ActionContractV2, ActionTrace, ContractV2State, ExperienceWrite, PendingReply, PendingReplyStatus, PendingReplyTrace, Precondition } from "./types";

export function createInitialState(overrides?: Partial<Omit<ContractV2State, "world">> & { world?: Partial<ContractV2State["world"]> }): ContractV2State {
  return {
    day: 1,
    materials: [],
    experienceLog: [],
    narration: [],
    pending: null,
    pendingReply: null,
    ...overrides,
    // World merges field-by-field (PHASE 11.8) -- a caller overriding only `jinHelperAbsentToday`
    // (every PHASE 11.6R test/scenario) must not silently lose `yoheiAvailableForConversation`'s
    // default, and vice versa.
    world: { jinHelperAbsentToday: false, yoheiAvailableForConversation: true, ...overrides?.world },
  };
}

interface StateAdmissionTraceEntry {
  sourceEvent: string;
  provenanceClass: string;
  admissionDecision: string;
}

/** Every persistent material passes through the unmodified State Admission module before it is
 *  allowed into `materials` -- no narration string ever mutates state directly (Test M/N).
 *  Exported (PHASE 11.8) so `resolvePendingReplyEvent` below can route PendingReply-triggered
 *  materials (e.g. promise promotion) through the SAME admission path, rather than a second one. */
export function admitMaterials(authoritativeEvent: string, materials: LifeMaterial[]): { admitted: LifeMaterial[]; trace: StateAdmissionTraceEntry[] } {
  const trace: StateAdmissionTraceEntry[] = [];
  const admitted: LifeMaterial[] = [];
  for (const material of materials) {
    const input: StructuredPlayerActionInput = {
      sourceType: "PLAYER_STRUCTURED_ACTION",
      actionLabel: authoritativeEvent,
      factsGrantedByGameRules: [material.id],
      deterministic: true,
    };
    const provenance = classifyProvenance(input);
    const admission = decideAdmission(provenance.provenanceClass, input);
    trace.push({ sourceEvent: authoritativeEvent, provenanceClass: provenance.provenanceClass, admissionDecision: admission.decision });
    if (admission.decision === "ADMIT_AUTOMATICALLY") admitted.push(material);
  }
  return { admitted, trace };
}

export function mergeMaterials(existing: LifeMaterial[], admitted: LifeMaterial[]): LifeMaterial[] {
  const byId = new Map(existing.map((m) => [m.id, m]));
  for (const m of admitted) byId.set(m.id, m);
  return Array.from(byId.values());
}

/** Resolves one Action Contract V2 against the current state. This is the ONLY function that may
 *  change `materials`/`experienceLog` -- narration strings are read-only outputs, never inputs to
 *  a state mutation (Test M).
 *
 *  `interpretedIntentOverride` exists ONLY for the free-text path (`freeTextBoundary.ts`) --
 *  ordinary button dispatch never passes it, and the trace then derives `interpretedIntent` as a
 *  plain alias of `initialIntent`, per PHASE 11.6R Section 3 (never a second, independently-
 *  authored value that could drift). */
export function resolveAction(state: ContractV2State, contract: ActionContractV2, interpretedIntentOverride?: string): { state: ContractV2State; trace: ActionTrace } {
  const eligible = contract.eligibility.every((p) => p.check(state));
  const feedback = contract.visibleFeedback(state);
  const narration: string[] = [];
  let materials = state.materials;
  let experienceLog = state.experienceLog;
  let experienceDelta: ExperienceWrite[] = [];
  const admissionTrace: StateAdmissionTraceEntry[] = [];
  let authoritativeEventFired: string;

  const blocked = eligible && contract.failurePostcondition ? contract.failurePostcondition.check(state) : false;

  if (!eligible) {
    // Not offered at all in the real UI (see NewlifeContractV2App.tsx), but resolved defensively
    // here too: an ineligible contract must never silently succeed. This IS a legitimate,
    // recorded occurrence -- not a null/omitted result (directive Section 2).
    authoritativeEventFired = "ACTION_NOT_ELIGIBLE";
    narration.push(...(feedback.onFailure ?? ["(この行動は現在選べない)"]));
  } else if (blocked) {
    authoritativeEventFired = "ACTION_BLOCKED";
    narration.push(...(feedback.onFailure ?? []));
  } else {
    authoritativeEventFired = contract.authoritativeEvent;
    const rawMaterials = contract.stateDelta(state);
    const { admitted, trace: matTrace } = admitMaterials(contract.authoritativeEvent, rawMaterials);
    admissionTrace.push(...matTrace);
    materials = mergeMaterials(materials, admitted);
    experienceDelta = contract.actorExperienceWrite(state);
    experienceLog = [...experienceLog, ...experienceDelta];
    narration.push(...feedback.onSuccess);
  }

  const followUps = eligible && !blocked ? contract.conditionalFollowUpAffordance(state) : "NONE";
  const nextState: ContractV2State = {
    ...state,
    materials,
    experienceLog,
    narration,
    pending: followUps !== "NONE" ? { affordances: followUps } : null,
  };

  const trace: ActionTrace = {
    contractId: contract.actionId,
    initialIntent: contract.playerIntent,
    interpretedIntent: interpretedIntentOverride ?? contract.playerIntent, // plain alias, no independent authority
    canonicalPreconditionId: contract.eligibility.map((p) => p.id).join("+") || "always",
    eligibilityResult: contract.eligibility.map((p) => ({ id: p.id, passed: p.check(state) })),
    visiblePromise: contract.playerVisiblePromise,
    selectedAction: contract.actionId,
    authoritativeEvent: authoritativeEventFired,
    stateDelta: materials.filter((m) => !state.materials.some((sm) => sm.id === m.id && sm.status === m.status)).map((m) => m.id),
    conditionalAffordances: followUps === "NONE" ? "NONE" : followUps.map((f) => f.id),
    followUpChoice: "NOT_APPLICABLE",
    stateAdmissionDecision: admissionTrace,
    actorExperienceDelta: experienceDelta,
    lifeMaterialDelta: materials.filter((m) => !state.materials.some((sm) => sm.id === m.id && sm.status === m.status)).map((m) => m.id),
    resultingState: { materials: materials.filter((m) => m.status === "ACTIVE").map((m) => m.id), day: nextState.day },
  };

  return { state: nextState, trace };
}

/** Resolves a PLAYER-chosen follow-up (or an explicit decline). Declining produces no
 *  authoritative event, no material, and the world/NPC's own work continues regardless (directive
 *  Section 10/13). Explicit follow-up buttons (e.g. OFFER_HELP) never require confirmation --
 *  confirmation is a free-text-only prototype safety rule (`freeTextBoundary.ts`), never applied
 *  here (directive Section 4). */
export function resolveFollowUp(state: ContractV2State, followUpContract: ActionContractV2 | null, interpretedIntentOverride?: string): { state: ContractV2State; trace: ActionTrace | null } {
  if (!followUpContract) {
    return { state: { ...state, pending: null }, trace: null };
  }
  const { state: resolvedState, trace } = resolveAction({ ...state, pending: null }, followUpContract, interpretedIntentOverride);
  return { state: resolvedState, trace: { ...trace, followUpChoice: followUpContract.actionId } };
}

export function advanceDay(state: ContractV2State): ContractV2State {
  return { ...state, day: state.day + 1, pending: null };
}

// ---------------------------------------------------------------------------
// PHASE 11.8: PendingReply lifecycle. `openPendingReply` and `resolvePendingReplyEvent` are the
// ONLY functions permitted to write `state.pendingReply` -- no contract, narration string, or
// free-text candidate ever sets it directly (Test T).
// ---------------------------------------------------------------------------

/** Opens a new PendingReply -- always NPC-initiated (directive Section 1: created only when the
 *  NPC's own future behavior genuinely depends on PLAYER's answer or non-answer; ordinary
 *  questions/small talk never call this -- see Test S/trivial-question scenario). */
export function openPendingReply(state: ContractV2State, pendingReply: PendingReply, narration: string[]): ContractV2State {
  return { ...state, pendingReply, narration };
}

/** A PendingReply-lifecycle event spec. Deliberately NOT `ActionContractV2` -- see the
 *  `PendingReplyTrace` doc comment in types.ts for why a narrower shape is used here. */
export interface PendingReplyEventSpec {
  event: string;
  /** Reuses the SAME `Precondition` mechanism as ordinary Action Contract V2 eligibility --
   *  directive's own required architecture ("ACTION CONTRACT V2 + PendingReply + ordinary Action
   *  Eligibility"), never a bespoke gating concept. */
  eligibility: Precondition[];
  narration: (state: ContractV2State) => string[];
  /** Pure status mapping. Returning the SAME status unchanged is a legitimate, deliberate result
   *  (PLAYER_LEAVES, PLAYER_REQUESTS_WITHDRAWAL) -- never omitted to "look like" a transition. */
  nextStatus: (current: PendingReplyStatus) => PendingReplyStatus;
  /** CONDITIONAL. Only the promise-promotion scenario uses this (directive Section 18) -- the
   *  created material is routed through the SAME `admitMaterials`/State Admission path as every
   *  other persistent material in this prototype, never a parallel mechanism. */
  material?: (state: ContractV2State) => LifeMaterial | null;
}

/** Resolves one PendingReply-lifecycle event. Ineligible dispatch is a legitimate, recorded
 *  no-op (mirrors `resolveAction`'s own `ACTION_NOT_ELIGIBLE` handling) -- e.g. PLAYER cannot
 *  answer while `YOHEI_AVAILABLE_FOR_CONVERSATION` is false (directive Section 12). */
export function resolvePendingReplyEvent(state: ContractV2State, spec: PendingReplyEventSpec): { state: ContractV2State; trace: PendingReplyTrace } {
  const eligibilityResult = spec.eligibility.map((p) => ({ id: p.id, passed: p.check(state) }));
  const eligible = eligibilityResult.every((r) => r.passed);
  const statusBefore: PendingReplyStatus | "NONE" = state.pendingReply?.status ?? "NONE";

  if (!eligible || !state.pendingReply) {
    return {
      state: { ...state, narration: [] },
      trace: {
        event: eligible ? "NO_PENDING_REPLY" : "EVENT_NOT_ELIGIBLE",
        eligibilityResult,
        pendingReplyId: state.pendingReply?.id ?? null,
        statusBefore,
        statusAfter: statusBefore,
        narration: [],
        stateAdmissionDecision: [],
        lifeMaterialDelta: [],
      },
    };
  }

  const statusAfter = spec.nextStatus(state.pendingReply.status);
  const narration = spec.narration(state);
  const rawMaterial = spec.material ? spec.material(state) : null;
  let materials = state.materials;
  let admissionTrace: StateAdmissionTraceEntry[] = [];
  if (rawMaterial) {
    const { admitted, trace: matTrace } = admitMaterials(spec.event, [rawMaterial]);
    admissionTrace = matTrace;
    materials = mergeMaterials(materials, admitted);
  }

  const nextPendingReply: PendingReply = { ...state.pendingReply, status: statusAfter };
  const nextState: ContractV2State = { ...state, materials, narration, pendingReply: nextPendingReply };

  return {
    state: nextState,
    trace: {
      event: spec.event,
      eligibilityResult,
      pendingReplyId: state.pendingReply.id,
      statusBefore,
      statusAfter,
      narration,
      stateAdmissionDecision: admissionTrace,
      lifeMaterialDelta: rawMaterial && materials.some((m) => m.id === rawMaterial.id && m.status === "ACTIVE") ? [rawMaterial.id] : [],
    },
  };
}

export type { ExperienceWrite };
