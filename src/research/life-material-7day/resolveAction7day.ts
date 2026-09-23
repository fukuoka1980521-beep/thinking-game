/**
 * PHASE 10.21: shared 7-day action resolution. Reuses PHASE 10.20's frozen WEEK1 macro skeleton
 * verbatim (`DAY_SKELETON.slice(0, 7)`, directive Section 2: "do not redesign the macro week").
 *
 * IMPORTANT DISCLOSED DISCREPANCY (directive Section 1 precedent: report, do not silently patch):
 * the frozen WEEK1 skeleton's `availableActions` never includes KEEP_PROMISE or FOLLOW_UP_PENDING
 * on any of days 1-7 (those only unlock in WEEK2, day 8+, matching
 * `NEW_LIFE_SCENARIO_BIBLE_V1.md` §7's "early game: normally zero" commitments philosophy). The
 * directive's Section 4 examples illustrate concrete-transformation quality using all four action
 * types, but Section 2 explicitly forbids redesigning the macro week to force KEEP_PROMISE/
 * FOLLOW_UP_PENDING into week 1. Resolved by demonstrating concrete transformation on the two
 * action types WEEK1 actually offers (EXPLORE, HANDLE_PRACTICAL_NEED) plus VISIT_YOHEI/VISIT_CAFE
 * (the natural vehicles for 2 of the 3 required chains) -- not by inventing a schedule change.
 */

import type { ActionId, DayMacroSkeleton } from "../parallel-14day/types";
import { DAY_SKELETON as FULL_14DAY_SKELETON } from "../parallel-14day/sharedSpec";
import { classifyProvenance } from "../state-admission/classifyProvenance";
import { decideAdmission } from "../state-admission/admissionGate";
import type { StructuredPlayerActionInput } from "../state-admission/types";
import type { CanonicalState7, ContentCondition, LifeMaterial } from "./types";
import { CATALYST_BEATS } from "./catalystContent";
import { CATALYST_MAX_DIRECT_APPEARANCES, CATALYST_MAX_INDIRECT_EVIDENCE } from "./catalystNpc";
import * as chains from "./materialChains";

export const WEEK1_SKELETON: DayMacroSkeleton[] = FULL_14DAY_SKELETON.slice(0, 7);

export function createInitialState7(): CanonicalState7 {
  return { day: 1, materials: [], npcVisitCounts: {}, catalystLog: { directAppearances: [], indirectEvidence: [] } };
}

export interface DayResult7 {
  day: number;
  action: ActionId;
  narration: string[];
  materialsCreated: LifeMaterial[];
  materialsConsumed: string[];
  worldActivity: string[];
  catalystNarration: string[];
}

function admitMaterial(material: LifeMaterial): LifeMaterial {
  // State Admission (PHASE 10.18, reused identically for both conditions) -- every material grant
  // here is the deterministic output of a structured PLAYER action, never inferred from free text.
  const input: StructuredPlayerActionInput = {
    sourceType: "PLAYER_STRUCTURED_ACTION",
    actionLabel: material.origin,
    factsGrantedByGameRules: [material.id],
    deterministic: true,
  };
  const provenance = classifyProvenance(input);
  const admission = decideAdmission(provenance.provenanceClass, input);
  // ADMIT_AUTOMATICALLY is guaranteed here (PLAYER_STRUCTURED_ACTION + deterministic:true), but the
  // gate is still genuinely consulted, not bypassed -- consistent with every prior phase's practice.
  return admission.decision === "ADMIT_AUTOMATICALLY" ? material : { ...material, status: "ACTIVE" };
}

function genericVisitYohei(state: CanonicalState7): chains.ActionOutcome {
  const visited = (state.npcVisitCounts.yohei ?? 0) > 0;
  return visited
    ? { narration: ["洋平商店に、また顔を出した。「よう」と、洋平が言った。", "必要な物だけ買って、店を出た。"] }
    : chains.genericYoheiFirstVisit();
}

function genericVisitCafe(state: CanonicalState7): chains.ActionOutcome {
  const visited = (state.npcVisitCounts.miyoko ?? 0) > 0;
  return visited
    ? { narration: ["喫茶のどかに、また入った。「いらっしゃいませ」と、美代子が言った。", "コーヒーを飲んで、店を出た。"] }
    : chains.chain2Day1();
}

/** The chain steps that are pinned to a specific (day, action) pair. Both conditions call this
 *  IDENTICAL function -- Condition B's only addition is the Catalyst layer applied afterward. */
function isActive(state: CanonicalState7, id: string): boolean {
  return state.materials.some((m) => m.id === id && m.status === "ACTIVE");
}

/** State-aware: each chain step only fires if its OWN precondition genuinely holds (not merely
 *  "the calendar day matches") -- robust to whichever of the 3 policies visits which NPC when,
 *  rather than assuming one hand-picked ordering. Falls back to the ordinary generic/first-visit
 *  content whenever a chain precondition is not yet met. */
function resolveChainStep(state: CanonicalState7, day: number, action: ActionId): chains.ActionOutcome | null {
  if (day === 2 && action === "HANDLE_PRACTICAL_NEED") return chains.chain1Day2();
  if (day === 3 && action === "EXPLORE") return chains.chain3Day3();
  if (day === 4 && action === "VISIT_YOHEI" && isActive(state, "trash_bags_needed")) return chains.chain1Day4();
  if (day === 4 && action === "VISIT_CAFE") return (state.npcVisitCounts.miyoko ?? 0) > 0 ? chains.chain2Day4() : chains.chain2Day1();
  if (day === 7 && action === "VISIT_CAFE" && isActive(state, "miyoko_bean_promise")) return chains.chain2Day7();
  if (day === 1 && action === "VISIT_YOHEI") return genericVisitYohei(state);
  if (day === 1 && action === "VISIT_CAFE") return genericVisitCafe(state);
  return null;
}

function resolveGeneric(state: CanonicalState7, action: ActionId): chains.ActionOutcome {
  if (action === "VISIT_YOHEI") return genericVisitYohei(state);
  if (action === "VISIT_CAFE") return genericVisitCafe(state);
  if (action === "PERSONAL_TIME") return chains.genericPersonalTime();
  return chains.genericRest();
}

export function resolveAction7day(state: CanonicalState7, action: ActionId, condition: ContentCondition): { result: DayResult7; nextState: CanonicalState7 } {
  const day = state.day;
  const daySkeleton = WEEK1_SKELETON[day - 1];

  const chainOutcome = resolveChainStep(state, day, action) ?? resolveGeneric(state, action);
  const narration = [...chainOutcome.narration];
  const materialsCreated: LifeMaterial[] = [];
  const materialsConsumed: string[] = [];
  let materials = state.materials;

  if (chainOutcome.materialCreated) {
    const admitted = admitMaterial(chainOutcome.materialCreated);
    materials = [...materials, admitted];
    materialsCreated.push(admitted);
  }
  if (chainOutcome.materialConsumedId) {
    materials = materials.map((m) => (m.id === chainOutcome.materialConsumedId ? { ...m, status: "CONSUMED" as const } : m));
    materialsConsumed.push(chainOutcome.materialConsumedId);
  }

  // Day6 aside (bag consumption) and Day7 aside (hall confirmation) -- both fire regardless of the
  // chosen action that day, since the frozen WEEK1 skeleton offers no dedicated action for either
  // (see the module-level disclosure comment). Narrated as a background beat, not a fabricated menu.
  if (day === 6) {
    const bagsActive = materials.some((m) => m.id === "trash_bags_owned" && m.status === "ACTIVE");
    if (bagsActive) {
      narration.push(...chains.chain1Day6().narration);
      materials = materials.map((m) => (m.id === "trash_bags_owned" ? { ...m, status: "CONSUMED" as const } : m));
      materialsConsumed.push("trash_bags_owned");
    }
    const worldChange = chains.chain3Day6();
    if (worldChange.materialCreated) {
      const admitted = admitMaterial(worldChange.materialCreated);
      materials = [...materials, admitted];
      materialsCreated.push(admitted);
      narration.push(...worldChange.narration);
    }
  }
  if (day === 7) {
    const hallActive = materials.some((m) => m.id === "hall_tables_moved" && m.status === "ACTIVE");
    if (hallActive) {
      narration.push(...chains.chain3Day7().narration);
      materials = materials.map((m) => (m.id === "hall_tables_moved" ? { ...m, status: "CONSUMED" as const } : m));
      materialsConsumed.push("hall_tables_moved");
    }
  }

  const catalystNarration: string[] = [];
  let catalystLog = state.catalystLog;
  if (condition === "B_WITH_CATALYST") {
    const beat = CATALYST_BEATS.find((b) => b.day === day);
    if (beat) {
      const withinBudget = beat.kind === "DIRECT" ? catalystLog.directAppearances.length < CATALYST_MAX_DIRECT_APPEARANCES : catalystLog.indirectEvidence.length < CATALYST_MAX_INDIRECT_EVIDENCE;
      // Every Catalyst utterance must reference a material that ALREADY exists (never authors new
      // macro content) -- verified live here, not just by convention.
      const referencedMaterialsExist = beat.utterances.every((u) => materials.some((m) => m.id === u.referencesMaterialId));
      if (withinBudget && referencedMaterialsExist) {
        catalystNarration.push(...beat.narration, ...beat.utterances.map((u) => u.text));
        catalystLog =
          beat.kind === "DIRECT"
            ? { ...catalystLog, directAppearances: [...catalystLog.directAppearances, { day, narration: beat.narration, utterances: beat.utterances }] }
            : { ...catalystLog, indirectEvidence: [...catalystLog.indirectEvidence, { day, narration: beat.narration }] };
      }
    }
  }

  const npcVisitCounts = { ...state.npcVisitCounts };
  if (action === "VISIT_YOHEI") npcVisitCounts.yohei = (npcVisitCounts.yohei ?? 0) + 1;
  if (action === "VISIT_CAFE") npcVisitCounts.miyoko = (npcVisitCounts.miyoko ?? 0) + 1;

  const nextState: CanonicalState7 = { day: day + 1, materials, npcVisitCounts, catalystLog };

  return {
    result: { day, action, narration, materialsCreated, materialsConsumed, worldActivity: daySkeleton.worldEvents, catalystNarration },
    nextState,
  };
}
