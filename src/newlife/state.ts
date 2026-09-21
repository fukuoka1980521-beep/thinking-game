/**
 * NEW LIFE 30-day playable candidate — deterministic state engine.
 *
 * SYSTEM OWNS TRUTH: this module is the only place `NewLife30State` is
 * written. `applyAction` and `advanceDay` are pure (state in, new state
 * out) so the whole 30-day spine is a reproducible function of the actions
 * taken — no hidden dice, no visit counters standing in for a decision.
 * Source: docs/newlife/canonical/phase25-26/NEWLIFE_30DAY_CHARACTER_DERIVED_PLAYABLE_V3.md §2–§3.
 */
import type { Day24Outcome, Day11Phase, NewLife30State } from "./types";

export function createInitialState(): NewLife30State {
  return {
    day: 1,
    day11Phase: "morning",
    signVersion: "unposted",
    pickupPlan: "unassigned",
    mSeats: "assumed",
    // Canon §2: "初期状態はそれぞれ左端、仁のみ合意済み二時間" — Jin's two-hour
    // setup window is already agreed before Day 1, unlike every other tracked var.
    jWork: "agreed_two_hours",
    dWorkshop: "pending",
    fEditor: "unassigned",
    hyFactCheck: "avoided",
    playerReport: "reliable",
    publicBlame: "none",
    encouragementOnly: false,
    day24Outcome: null,
    log: [],
    finished: false,
  };
}

function withLog(state: NewLife30State, entry: string): NewLife30State {
  return { ...state, log: [...state.log, entry] };
}

/**
 * Day 24 priority rule (canon §2 "Day 24の決め方", priority order preserved):
 * 1. SPLIT — an unrepaired public accusation or an unrepaired false report.
 * 2. JOINT_RETRY — every named role/condition is concretely secured.
 * 3. Encouragement without any secured role leaves Hina attached to the
 *    joint idea but unable to close it → PAUSE (not SOLO_TRIAL; canon
 *    explicitly forbids counting encouragement alone as JOINT_RETRY, and the
 *    Phase 26 audit's own path table distinguishes this from true
 *    non-intervention).
 * 4. Otherwise Hina independently chooses the small solo trial → SOLO_TRIAL.
 */
export function resolveDay24Outcome(state: NewLife30State): Day24Outcome {
  const blameUnresolved = state.publicBlame === "unrepaired" || state.playerReport === "false_unrepaired";
  if (blameUnresolved) return "SPLIT";

  const jointReady =
    state.pickupPlan === "time_split_owned_by_hina" &&
    state.fEditor === "named" &&
    state.jWork !== "extra_declined" &&
    state.mSeats === "bounded" &&
    state.hyFactCheck === "direct" &&
    state.signVersion !== "vague_uncorrected";
  if (jointReady) return "JOINT_RETRY";

  if (state.encouragementOnly) return "PAUSE";

  return "SOLO_TRIAL";
}

/**
 * Applies one player choice (a button press, never free text — see npcVoice.ts)
 * to the state. Pure: returns a new state, never mutates its argument.
 */
export function applyAction(state: NewLife30State, actionId: string): NewLife30State {
  let next = withLog(state, `day${state.day}${state.day11Phase !== "done" && state.day === 11 ? `:${state.day11Phase}` : ""}:${actionId}`);

  switch (actionId) {
    case "press_miyoko_for_boundary":
      if (state.day === 9) next = { ...next, mSeats: "bounded" };
      break;
    case "suggest_time_split":
      if (state.day === 10) next = { ...next, pickupPlan: "time_split_owned_by_hina" };
      break;
    case "fix_sign_before_posting":
      if (state.day === 11 && state.day11Phase === "morning") next = { ...next, signVersion: "clear_from_start" };
      break;
    case "flag_correct_now":
      if (state.day === 11 && state.day11Phase === "afternoon" && state.signVersion === "vague_uncorrected") {
        next = { ...next, signVersion: "vague_then_corrected" };
      }
      break;
    case "publicly_blame_hina":
      if (state.day === 11 && state.day11Phase === "afternoon") {
        next = { ...next, publicBlame: "unrepaired", playerReport: "false_unrepaired" };
      }
      break;
    case "relay_exaggerated_account":
      if (state.day === 13) next = { ...next, playerReport: "false_unrepaired" };
      break;
    case "broker_direct_fact_check":
      if (state.day === 14) next = { ...next, hyFactCheck: "direct" };
      break;
    case "arrange_paid_task_with_consent":
      if (state.day === 16) next = { ...next, jWork: "extra_with_specific_consent" };
      break;
    case "assume_free_help":
      if (state.day === 16) next = { ...next, jWork: "extra_declined" };
      break;
    case "press_daisuke_for_answer":
      if (state.day === 17) next = { ...next, dWorkshop: "one_hour_yes" };
      break;
    case "confirm_editor_role":
      if (state.day === 19) next = { ...next, fEditor: "named" };
      break;
    case "cheer_her_on":
      if (state.day === 21) next = { ...next, encouragementOnly: true };
      break;
    case "facilitate_direct_conversation":
      if (state.day === 22) next = { ...next, hyFactCheck: "direct" };
      break;
    default:
      // Flavor-only option: state unchanged beyond the log entry above.
      break;
  }
  return next;
}

/**
 * Advances the day/phase clock. On Day 11 this steps morning -> afternoon
 * -> Day 12 (never skipping the afternoon input, per canon §3 "必ず二手目の
 * 入力を待ってから Day 12 へ"). Applies the two canon-specified autonomous
 * (no-player-required) resolutions: Miyoko's café-seat boundary becomes
 * explicit by Day 18 regardless of the player, and Fumiko corrects any
 * still-vague sign by Day 19 regardless of the player. Resolves Day 24's
 * outcome the moment Day 24 is left. Never advances past Day 30.
 */
export function advanceDay(state: NewLife30State): NewLife30State {
  if (state.day === 11 && state.day11Phase === "morning") {
    let signVersion = state.signVersion;
    if (signVersion === "unposted") signVersion = "vague_uncorrected";
    return { ...state, day11Phase: "afternoon", signVersion };
  }

  if (state.day === 30) return { ...state, finished: true };

  const nextDay = state.day + 1;
  let next: NewLife30State = { ...state, day: nextDay, day11Phase: nextDay === 11 ? "morning" : "done" };

  // Day 18: Miyoko's boundary becomes explicit either way (canon Day18 "裏").
  if (next.day === 18 && next.mSeats === "assumed") {
    next = { ...next, mSeats: "bounded" };
  }

  // Day 19: Fumiko corrects any still-uncorrected sign on her own authority
  // (canon Day19 "裏": "プレイヤーが訂正せずとも文子は自分の掲示を直す").
  if (next.day === 19 && next.signVersion === "vague_uncorrected") {
    next = { ...next, signVersion: "vague_then_corrected" };
  }

  if (state.day === 24 && next.day === 25) {
    next = { ...next, day24Outcome: resolveDay24Outcome(state) };
  }

  return next;
}

export function day11PhaseLabel(phase: Day11Phase): string {
  if (phase === "morning") return "朝";
  if (phase === "afternoon") return "午後";
  return "";
}
