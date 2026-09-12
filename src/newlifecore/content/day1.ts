import { npcAvailabilityAt, npcsPresentAt } from "../schedule";
import { canCookMeal } from "../engine";
import { itemById } from "./shop";
import { eventTraceLinesAt } from "./eventEngine";
import { EVENT_DEFS } from "./eventDefs";
import { npcDisplayName } from "../npcDefs";
import { TRAJECTORY_SEEDS } from "./trajectoryDefs";
import type { TrajectorySeed } from "./trajectoryDefs";
import { canStepBackFromTrajectory, engageActionEligible, hasAcceptedTrajectory, lateConsequenceEligible, opportunityEligible } from "./trajectoryEngine";
import { LOCAL_PROBLEM_DEFS } from "./localProblemDefs";
import { localProblemConnectEligible, localProblemDiscoverEligible, localProblemHelpEligible, localProblemObservationEligible } from "./localProblemEngine";
import { ACTIVITY_DEFS } from "./activityDefs";
import { activityEligible } from "./activityEngine";
import type { ClockMinutes, CoreState, IntakeForm, LocationId, NpcId, WorldFact } from "../types";

/**
 * PHASE_12_7_NEW_LIFE_PLAYER_TRAJECTORY_V1 Section 6/31 -- builds this seed's specialActions for
 * whichever scene branch calls it (CAFE_NODOKA/COMMUNITY_HALL below). Never more than 2 actions for
 * a single seed at once (the ordinary engage/work action, plus AT MOST ONE of "consider the
 * opportunity" / "step back from it" -- those two are mutually exclusive by construction, since
 * `opportunityEligible` is already false once accepted). Matches Section 33's "opportunityがクエスト
 * カードに見えない" requirement by staying inside the same plain specialActions list every other
 * scene action already uses -- no separate "opportunities" panel.
 */
function trajectoryActionsFor(seed: TrajectorySeed, state: CoreState): { id: string; label: string }[] {
  const actions: { id: string; label: string }[] = [];
  if (engageActionEligible(seed, state)) {
    const accepted = hasAcceptedTrajectory(seed, state);
    actions.push({ id: `engage_${seed.id}`, label: accepted ? seed.workActionLabel : seed.engageActionLabel });
  }
  if (opportunityEligible(seed, state)) {
    // Short, neutral button label -- the NPC's actual quoted invite (`seed.opportunityLabel`) is
    // shown inside LifeOpportunityOffer.tsx once this is pressed, not on the button itself (Section
    // 31: a button reading a full spoken quote would look like a quest-log entry, not dialogue).
    actions.push({ id: `consider_${seed.id}`, label: "話を聞いてみる" });
  } else if (canStepBackFromTrajectory(seed, state)) {
    actions.push({ id: `stepback_${seed.id}`, label: "この関わり方について考え直す" });
  }
  // PHASE_12_8 Section 6/7 -- late-game consequence, offered alongside the ordinary work action
  // (never replacing it) once the player is genuinely established.
  if (lateConsequenceEligible(seed, state)) {
    actions.push({ id: `late_${seed.id}`, label: seed.lateConsequenceActionLabel });
  }
  return actions;
}

/**
 * PHASE_13_NEW_LIFE_WORLD_ACTIVITY_AND_LOCAL_PROBLEMS_V1 Section 4/6/13 -- whichever NPC the player
 * is currently facing, this surfaces (a) discovering one of THEIR own problems (once the ambient
 * cue has been noticed -- discover/help are mutually exclusive by construction, see
 * `localProblemEngine.ts`), and (b) any OTHER problem that lists this NPC as its connect target,
 * regardless of where that problem itself lives (Section 7's "別NPCにつなぐ" is a conversation with
 * the person being connected TO, not a menu on the original problem's own screen). Labels are
 * always plain, ordinary scene-action phrasing -- never "受注"/"クエスト開始" (Section 6/23).
 */
function localProblemActionsForNpcHere(npc: NpcId, location: LocationId, state: CoreState): { id: string; label: string }[] {
  const actions: { id: string; label: string }[] = [];
  for (const def of LOCAL_PROBLEM_DEFS) {
    if (def.location === location && def.npc === npc) {
      if (localProblemDiscoverEligible(def, state)) {
        actions.push({ id: `discover_localproblem_${def.id}`, label: def.discoverActionLabel });
      } else if (def.helpActionLabel && localProblemHelpEligible(def, state)) {
        actions.push({ id: `help_localproblem_${def.id}`, label: def.helpActionLabel });
      }
    }
    if (def.connectNpc === npc && def.connectActionLabel && localProblemConnectEligible(def, state)) {
      actions.push({ id: `connect_localproblem_${def.id}`, label: def.connectActionLabel });
    }
  }
  return actions;
}

/**
 * PHASE_14_NEW_LIFE_GAMEPLAY_CORE_V1 Section 5/6/21 -- an activity's start button, offered exactly
 * like any other specialAction (never a distinct "quest" widget, Section 26). At most one activity
 * per NPC-at-location is expected in V1's 3 defs, but this loops in case that changes later.
 */
function activityActionsForNpcHere(npc: NpcId, location: LocationId, state: CoreState): { id: string; label: string }[] {
  return ACTIVITY_DEFS.filter((def) => def.location === location && def.npc === npc && activityEligible(def, state)).map((def) => ({
    id: `start_activity_${def.id}`,
    label: def.actionLabel,
  }));
}

/** Section 13 -- at most one ambient local-problem cue per location visit (never a stacked list of
 *  hints), picking the first eligible-and-undiscovered def at this location in authored order. */
function localProblemAmbientLineAt(location: LocationId, state: CoreState): string {
  const def = LOCAL_PROBLEM_DEFS.find((d) => d.location === location && localProblemObservationEligible(d, state));
  return def ? def.observationLine : "";
}

export const LOCATION_LABEL: Record<LocationId, string> = {
  TRIAL_HOUSE: "仮住まい",
  CHALLENGE_CENTER: "チャレンジセンター",
  YOHEI_STORE: "洋平商店",
  CAFE_NODOKA: "喫茶のどか",
  COMMUNITY_HALL: "集会所",
  SHOPPING_STREET: "商店街",
  BARBERSHOP: "理容店かどや",
};

export const REACHABLE_FROM_TRIAL_HOUSE: LocationId[] = ["CHALLENGE_CENTER", "YOHEI_STORE", "CAFE_NODOKA", "COMMUNITY_HALL", "SHOPPING_STREET"];

/** Every location is reachable from every other -- Challenge Town is small (directive Section 3:
 *  "最初の世界は小さくてよい"). No pathfinding graph needed for a 6-node town. */
export function reachableLocations(from: LocationId): LocationId[] {
  return (Object.keys(LOCATION_LABEL) as LocationId[]).filter((l) => l !== from);
}

export interface NpcOpeningLine {
  npc: NpcId;
  firstVisitLine: string;
  laterVisitLine: string;
}

const OPENING_LINES: Record<NpcId, NpcOpeningLine> = {
  kamiya: {
    npc: "kamiya",
    // Directive NEW_LIFE_DAY1_ONBOARDING_AND_WORLD_ACTION_FIX_V1: this used to be a vague welcome,
    // which left the live model free to invent its own "please fill out this form" beat with
    // nothing backing it on screen (the exact bug this directive fixes). Now the request is real
    // and scripted, and a real form (IntakeForm.tsx) answers it.
    firstVisitLine: "神谷はファイルを閉じながら、こちらを見た。「まずは、こちらの用紙にいくつかご記入いただけますか」",
    laterVisitLine: "神谷は顔を上げた。「何か?」",
  },
  yohei: {
    npc: "yohei",
    firstVisitLine: "店の奥から洋平が出てきた。「おう」",
    laterVisitLine: "洋平はちらっとこちらを見た。「また来たか」",
  },
  miyoko: {
    npc: "miyoko",
    firstVisitLine: "カウンターの向こうで、美代子がカップを拭いていた。「あら、いらっしゃい」",
    laterVisitLine: "美代子はにっこりした。「また来てくれたのね」",
  },
  jin: {
    npc: "jin",
    firstVisitLine: "相馬はこちらをちらっと見て、軽く顎を上げた。",
    laterVisitLine: "相馬は手を止めずに言った。「よう」",
  },
  daisuke: {
    npc: "daisuke",
    firstVisitLine: "鋏の音が止んだ。「いらっしゃい。……ああ、見ない顔だ」",
    laterVisitLine: "大輔は鏡越しにちらっと視線をよこした。「よう」",
  },
  hina: {
    npc: "hina",
    firstVisitLine: "陽菜が棚から顔を上げた。「あ、いらっしゃいませ……あの、まだ開店したばかりで」",
    laterVisitLine: "陽菜が顔を上げた。「あ、こんにちは」",
  },
  fumiko: {
    npc: "fumiko",
    firstVisitLine: "文子が掲示板から振り返った。「あら、見ない顔ね。新しく来た人?」",
    laterVisitLine: "文子は片手を挙げた。「あら、また会ったわね」",
  },
  kiyoshi: {
    npc: "kiyoshi",
    firstVisitLine: "レジの脇に立っていた清が、ちらっとこちらを見た。",
    laterVisitLine: "清は軽く頷いた。「ああ」",
  },
};

// PHASE_12_4 Section 1/8 -- "昨日のことが今日につながっている" as a felt, structural thing, not a
// UI label: when an NPC was talked to YESTERDAY specifically (not just "ever"), their first
// encounter TODAY reads as a small continuity beat instead of the generic laterVisitLine. Kept
// deliberately generic/content-free (never references what was actually said) -- a safe, low-risk
// day-bridging cue rather than an attempt to summarize or recall specific conversation content.
const YESTERDAY_BRIDGE_LINES: Record<NpcId, string> = {
  kamiya: "神谷は顔を上げた。「昨日の続き、聞いてなかったですね」",
  yohei: "洋平はちらっとこちらを見た。「昨日も来てたな」",
  miyoko: "美代子は顔を上げた。「あら、昨日も来てくれたわよね」",
  jin: "相馬は手を止めずに言った。「昨日もいたな」",
  daisuke: "大輔は鏡越しに視線をよこした。「昨日も来てましたね」",
  hina: "陽菜が顔を上げた。「あ、昨日も来てくれましたよね」",
  fumiko: "文子は片手を挙げた。「あら、昨日も来てたわね」",
  kiyoshi: "清はちらっとこちらを見た。「昨日も来てたな」",
};

export function openingLineFor(npc: NpcId, state: CoreState): string {
  const alreadyMet = Boolean(state.flags[`met_${npc}`]);
  // Bridges the gap between "form just submitted" and "player opened free chat" -- without this,
  // Kamiya's card would keep showing the request-the-form line even after it was already handed
  // over, which is its own small context-continuity break.
  if (npc === "kamiya" && !alreadyMet && state.flags.intakeFormSubmitted) {
    return "神谷は書類を脇に置いた。「では、少しお話を伺いますね」";
  }
  if (alreadyMet) {
    const talkedToday = state.npcMemory[npc].some((t) => t.day === state.day);
    const talkedYesterday = state.npcMemory[npc].some((t) => t.day === state.day - 1);
    if (!talkedToday && talkedYesterday) return YESTERDAY_BRIDGE_LINES[npc];
  }
  const l = OPENING_LINES[npc];
  return alreadyMet ? l.laterVisitLine : l.firstVisitLine;
}

export interface LocationScene {
  location: LocationId;
  ambientLine: string;
  npcsHere: NpcId[];
  /** Location-specific action other than "自由に話す" / "移動する" -- a handful (2-6, directive
   *  NEW_LIFE_DAY1_LIVING_DEPTH_AND_DIALOGUE_PRECISION_V1 Section 12), driven by real state
   *  (inventory/time/flags), never a fixed giant menu (directive Section 17's original "巨大な
   *  コマンド一覧を作らない" discipline still applies -- this only widens 0-2 to a small,
   *  context-dependent range for the trial house specifically). */
  specialActions: { id: string; label: string }[];
}

/**
 * PHASE_12_5 Section 14 -- thin wrapper around the hand-authored scene logic below. Appends any
 * recurring-engine trace lines (content/eventDefs.ts's `location`-bound events that fired TODAY,
 * via `eventTraceLinesAt`) to whatever ambient line the base scene already produced, so noticing a
 * restocked shelf or a new flyer works purely by visiting -- never a separate log/list UI, and never
 * an internal event id/family name, since `eventTraceLinesAt` only ever returns the already
 * natural-language `worldFact.text` this content authored. Kept as a wrapper (not inlined into
 * `buildLocationSceneBase`) so every one of that function's many early-return branches gets this for
 * free without individually touching each one.
 */
export function buildLocationScene(state: CoreState): LocationScene {
  const base = buildLocationSceneBase(state);
  const traceLines = eventTraceLinesAt(state, EVENT_DEFS, state.playerLocation);
  if (traceLines.length === 0) return base;
  const combined = [base.ambientLine, ...traceLines].filter((s) => s.length > 0).join(" ");
  return { ...base, ambientLine: combined };
}

function buildLocationSceneBase(state: CoreState): LocationScene {
  const loc = state.playerLocation;
  const npcsHere = npcsPresentAt(loc, state.time, state.flags);

  if (loc === "TRIAL_HOUSE") {
    const ambientLine = state.visitedLocations.length <= 1 ? "仮住まいの部屋。鍵と、返却日を丸く囲んだ紙が置かれている。" : "静かな部屋に戻ってきた。";
    // Directive Section 12/13/14 -- real, state-dependent living actions, 2-4 of them, never a
    // fixed giant list. Each either has a real result (cook -> ateMeal) or is a genuine, honest
    // read of the current situation (belongings, the still-open Kamiya form) rather than a
    // do-nothing flavor button pretending to be content.
    const specialActions: { id: string; label: string }[] = [];
    if (canCookMeal(state) && !state.flags.ateMeal) specialActions.push({ id: "cook_and_eat", label: "料理して食べる" });
    specialActions.push({ id: "check_belongings", label: "荷物を確認する" });
    if (state.visitedLocations.length > 1 && !state.flags.intakeFormSubmitted) {
      specialActions.push({ id: "think_about_form", label: "チャレンジセンターの用紙のことを考える" });
    }
    specialActions.push({ id: "rest_a_while", label: "少し休む" });
    return { location: loc, ambientLine, npcsHere: [], specialActions };
  }

  if (loc === "SHOPPING_STREET") {
    if (state.flags.isRaining) {
      return { location: loc, ambientLine: "雨が降り出した。軒先で雨宿りする人が何人か見える。", npcsHere: [], specialActions: [{ id: "wait_out_rain", label: "雨宿りする" }] };
    }
    // Directive Section 8 -- the empty storefront is not the same picture every day it's visited;
    // it visibly changes even before Hina is actually present to talk to (day 2's hint), and she
    // is only ever "here" via schedule.ts's flags.hinaShopOpen gate, never before that regardless
    // of what day it nominally is (directive Section 6: no NPC/state changes just because a day
    // number ticked over with nobody watching a specific trigger condition).
    if (npcsHere.includes("hina")) {
      return {
        location: loc,
        ambientLine: localProblemAmbientLineAt(loc, state),
        npcsHere: ["hina"],
        specialActions: [{ id: "notice_shop", label: "新しい店を覗く" }, ...localProblemActionsForNpcHere("hina", loc, state)],
      };
    }
    if (state.day >= 2) {
      return {
        location: loc,
        ambientLine: "空き店舗のシャッターが半分上がっていた。中で誰かが棚を動かしているのが見える。まだ声はかけられなさそうだ。",
        npcsHere: [],
        specialActions: [{ id: "notice_shop", label: "様子をうかがう" }],
      };
    }
    return {
      location: loc,
      ambientLine: "シャッターが半分下りた空き店舗に、手書きの貼り紙がある。「近日、何か始めます」",
      npcsHere: [],
      specialActions: [{ id: "notice_shop", label: "貼り紙をよく見る" }],
    };
  }

  if (loc === "CHALLENGE_CENTER") {
    const avail = npcAvailabilityAt("kamiya", state.time, state.flags);
    if (avail === "CLOSED") return { location: loc, ambientLine: "チャレンジセンターは終業していた。", npcsHere: [], specialActions: [] };
    if (avail === "BUSY") return { location: loc, ambientLine: "神谷は電話で立て込んでいるようだった。", npcsHere: [], specialActions: [{ id: "wait_kamiya", label: "少し待つ" }] };
    // Directive NEW_LIFE_DAY1_ONBOARDING_AND_WORLD_ACTION_FIX_V1 Section 4/8: the form Kamiya
    // asks for (firstVisitLine, above) must be a real action, not something free text can fake.
    // Offered once, alongside the usual "look at job postings" -- disappears once actually filled,
    // it doesn't reappear as a repeatable action.
    const specialActions = [
      ...(state.flags.intakeFormSubmitted
        ? [{ id: "view_jobs", label: "求人票を見る" }]
        : [{ id: "fill_intake_form", label: "用紙に記入する" }, { id: "view_jobs", label: "求人票を見る" }]),
      ...localProblemActionsForNpcHere("kamiya", loc, state),
    ];
    return { location: loc, ambientLine: "", npcsHere: ["kamiya"], specialActions };
  }

  if (loc === "YOHEI_STORE") {
    const avail = npcAvailabilityAt("yohei", state.time, state.flags);
    if (avail === "CLOSED") return { location: loc, ambientLine: "洋平商店のシャッターは下りていた。", npcsHere: [], specialActions: [] };
    if (avail === "BUSY") return { location: loc, ambientLine: "洋平は伝票の整理で手が離せないようだった。", npcsHere: [], specialActions: [] };
    const jinAlsoHere = npcsHere.includes("jin");

    // Directive Section 19 -- YOHEI_STORE must support more than one kind of action ("1 LOCATION
    // = 1 EVENT を禁止"). Shopping is available in every non-closed/non-busy branch below,
    // alongside whatever else that branch already offers (talk, shelf-help).
    const SHOP_ACTION = { id: "shop_here", label: "買い物をする" };

    // PHASE_13 -- Yohei's own local-problem actions (successor worry, Kiyoshi's delivery need)
    // apply in every non-closed/non-busy branch below, same "always available alongside whatever
    // else this branch offers" pattern SHOP_ACTION already follows. PHASE_14 -- his GAMEPLAY
    // ACTIVITY (shop_helper) joins the same "always available" list.
    const yoheiLocalProblemActions = [...localProblemActionsForNpcHere("yohei", loc, state), ...activityActionsForNpcHere("yohei", loc, state)];

    if (state.flags.shelfFixed) {
      // The shelf thread is over -- reached either by the player's own hands, or by Yohei and
      // Jin finishing it without the player (directive Section 20/21: a trace, never a badge).
      const ambientLine = state.flags.shelfFixedWithPlayer
        ? "洋平は棚を軽く叩いて確かめた。「うん、大丈夫そうだ」"
        : "棚を軽く小突くと、もう安定していた。「さっき相馬が寄ってな」洋平はそれだけ言った。";
      const combined = [ambientLine, localProblemAmbientLineAt(loc, state)].filter((s) => s.length > 0).join(" ");
      return { location: loc, ambientLine: combined, npcsHere, specialActions: [SHOP_ACTION, ...yoheiLocalProblemActions] };
    }

    if (jinAlsoHere) {
      // 11:15-13:30 only: Jin is physically here (schedule.ts's world-event override), so helping
      // is a real, present-tense option -- never offered outside this window.
      return {
        location: loc,
        ambientLine: "奥で相馬が棚の様子を見ていた。洋平が脇で見守っている。",
        npcsHere: ["yohei", "jin"],
        specialActions: [{ id: "offer_help_shelf", label: "棚の修理を手伝う" }, SHOP_ACTION, ...yoheiLocalProblemActions],
      };
    }

    // Before 11:15: the problem exists but hasn't become anyone's business yet -- a quiet visual
    // hint only (nothing to "help" with until Yohei has actually done something about it), but
    // shopping is ordinary daily commerce and stays available regardless. After 13:30 with
    // shelfFixed still false should not occur (the world-event auto-resolves it by then) but the
    // fallback below keeps this branch harmless if it ever does.
    const hint = state.time < 11 * 60 + 30 ? "棚の脚が少し傾いているのが、なんとなく目についた。" : "";
    const combinedHint = [hint, localProblemAmbientLineAt(loc, state)].filter((s) => s.length > 0).join(" ");
    return { location: loc, ambientLine: combinedHint, npcsHere, specialActions: [SHOP_ACTION, ...yoheiLocalProblemActions] };
  }

  if (loc === "CAFE_NODOKA") {
    const avail = npcAvailabilityAt("miyoko", state.time, state.flags);
    if (avail === "CLOSED") return { location: loc, ambientLine: "喫茶のどかは閉まっていた。", npcsHere: [], specialActions: [] };
    // Directive Section 19 -- ordering and simply sitting down are two different, real actions.
    const miyokoSeed = TRAJECTORY_SEEDS.find((s) => s.id === "miyoko_cafe_help")!;
    const specialActions = [
      { id: "order_menu", label: "メニューを注文する" },
      { id: "sit_down", label: "コーヒーを頼んで座る" },
      ...trajectoryActionsFor(miyokoSeed, state),
      ...localProblemActionsForNpcHere("miyoko", loc, state),
      ...activityActionsForNpcHere("miyoko", loc, state),
    ];
    return { location: loc, ambientLine: localProblemAmbientLineAt(loc, state), npcsHere: ["miyoko"], specialActions };
  }

  if (loc === "BARBERSHOP") {
    const avail = npcAvailabilityAt("daisuke", state.time, state.flags);
    if (avail === "CLOSED") return { location: loc, ambientLine: "理容店かどやのシャッターは下りていた。", npcsHere: [], specialActions: [] };
    if (avail === "BUSY") return { location: loc, ambientLine: "大輔は昼休みのようだった。", npcsHere: [], specialActions: [] };
    // Directive Section H/M scenario 5 -- an open (not yet checked-in) intent from an earlier day
    // surfaces here as a real action, not as a pushy notification the moment the day starts. Only
    // offered once the player has actually come back to this location on a later day.
    const hasOpenIntent = state.realWorldIntents.some((i) => i.npc === "daisuke" && !i.checkedIn && i.createdOnDay < state.day);
    const specialActions: { id: string; label: string }[] = [{ id: "shop_here", label: "散髪してもらう" }, ...localProblemActionsForNpcHere("daisuke", loc, state)];
    if (hasOpenIntent) specialActions.unshift({ id: "check_in_intent", label: "その後の話をする" });
    return { location: loc, ambientLine: localProblemAmbientLineAt(loc, state), npcsHere: ["daisuke"], specialActions };
  }

  // COMMUNITY_HALL -- Jin and Fumiko can independently be here at the same time; must check where
  // Jin actually IS (npcsHere, location-aware), never just whether he is "available" in the
  // abstract: during the 11:30-13:30 shelf-repair window his status is AVAILABLE but his location
  // is YOHEI_STORE, not here. Using raw availability here was a real bug -- it let him appear
  // present in two places in the same instant.
  const jinHere = npcsHere.includes("jin");
  const fumikoHere = npcsHere.includes("fumiko");
  const present: NpcId[] = [];
  const hallActions: { id: string; label: string }[] = [];

  if (jinHere) {
    const jinAvail = npcAvailabilityAt("jin", state.time, state.flags);
    if (jinAvail === "BUSY") {
      // The explicit "on the phone, can't talk" texture -- present, but not a conversation.
      hallActions.push({ id: "wait_jin", label: "電話が終わるまで待つ" });
    } else {
      present.push("jin");
      hallActions.push(...trajectoryActionsFor(TRAJECTORY_SEEDS.find((s) => s.id === "jin_odd_job")!, state));
      // PHASE_13 -- Jin's own local problem (jin_solo_workload, origin) PLUS whatever other
      // problem's connect target is Jin (yohei_kiyoshi_delivery) -- both are conversations with
      // Jin himself, so both surface here regardless of which problem they originated from.
      hallActions.push(...localProblemActionsForNpcHere("jin", loc, state));
      hallActions.push(...activityActionsForNpcHere("jin", loc, state));
    }
  }
  if (fumikoHere) {
    present.push("fumiko");
    hallActions.push(...trajectoryActionsFor(TRAJECTORY_SEEDS.find((s) => s.id === "fumiko_community_role")!, state));
    hallActions.push(...localProblemActionsForNpcHere("fumiko", loc, state));
  }

  if (present.length > 0 || hallActions.length > 0) {
    return { location: loc, ambientLine: localProblemAmbientLineAt(loc, state), npcsHere: present, specialActions: hallActions };
  }

  if (state.flags.jinCalledToYohei && !state.flags.shelfFixed && state.time < 13 * 60 + 30) {
    // A trace of where he went, not an announcement (directive Section 20).
    return { location: loc, ambientLine: "掲示板の脇に、相馬の工具袋だけが置かれていた。少し出ているようだった。", npcsHere: [], specialActions: [] };
  }

  // Directive Section 6/7 -- a second, independent unseen-event thread (content/day1WorldEvents.ts:
  // Fumiko asks Jin to fix the community hall bench). Only ever readable as a trace when nobody who
  // knows about it is actually here -- never an announcement.
  const emptyLine = state.flags.benchFixed
    ? "集会所には誰もいないようだった。ベンチはもう、ぐらついていなかった。"
    : state.flags.fumikoAskedJin
      ? "集会所には誰もいないようだった。ベンチが、まだ少しぐらついたままだった。"
      : "集会所には誰もいないようだった。掲示板だけが静かに並んでいる。";
  return { location: loc, ambientLine: emptyLine, npcsHere: [], specialActions: [] };
}

/** Directive Section 21: end-of-day must read as a handful of remaining facts in plain sentences
 *  -- never a results list, score, or acquired-abilities panel. Modeled directly on the
 *  directive's own example ("相馬は明日も朝が早いらしい。洋平の棚は直っていた。神谷とは話が途中の
 *  ままだ。そして寝る。"): short, unresolved-feeling, no "you accomplished X" framing. */
export function buildEndOfDayNarrative(state: CoreState): string[] {
  const lines: string[] = [];
  // PHASE_12_4 Section 8 -- everything below is gated on TODAY specifically (a conversation that
  // happened today, a world fact stamped with today's day number), not "ever" -- the previous
  // version re-announced e.g. "洋平の店の棚は、手伝って直した" on every single day-end screen
  // forever once it became true once, which is exactly the identical-day staleness this Run exists
  // to fix. `engine.ts`'s `addWorldFact` auto-stamps `day`; `recordConversationTurn` auto-stamps
  // `ConversationTurn.day` (PHASE_12_3).
  const talkedToday = (npc: NpcId) => state.npcMemory[npc].some((t) => t.day === state.day);
  const factToday = (id: string) => state.worldFacts.some((f) => f.id === id && f.day === state.day);

  if (factToday("shelf_fixed")) {
    lines.push("洋平の店の棚は、手伝って直した。");
  } else if (factToday("shelf_fixed_without_player")) {
    lines.push("洋平の店の棚は、いつの間にか直っていた。");
  } else if (talkedToday("yohei") && !state.flags.shelfFixed) {
    lines.push("洋平の店の棚は、まだ少し傾いたままだった。");
  }

  if (factToday("bench_fixed")) {
    lines.push("集会所のベンチは、いつの間にか直っていた。");
  } else if (factToday("fumiko_asked_jin_bench")) {
    lines.push("文子が、集会所のベンチのことで相馬に何か頼んでいたようだった。");
  }

  if (factToday("hina_shop_open")) {
    lines.push("商店街の空き店舗に、新しい店が開いていた。");
  }

  // PHASE_12_5 Section 12/19 -- the recurring engine's own facts, same "today, not ever" gating as
  // the legacy block above. Reuses each definition's already-authored, presentation-ready
  // `worldFact.text` directly (directive Section 13: "TEXT IS PRESENTATION") -- never an id, family
  // name, or any other internal term. Shown regardless of whether the player was present for it,
  // matching the exact "洋平の店の棚は、いつの間にか直っていた。" precedent immediately above: an
  // NPC-NPC background event is still something the town remembers happening, not a secret.
  for (const def of EVENT_DEFS) {
    // PHASE_12_6 -- read the actual stored fact's text (may be a presentation variant, Section 13),
    // not `def.worldFact.text` (the template's base wording).
    const fact = state.worldFacts.find((f) => f.id === `${def.worldFact.id}_d${state.day}` && f.day === state.day);
    if (fact) lines.push(fact.text);
  }

  // PHASE_12_7 Section 32 -- exactly one plain sentence for whatever trajectory-related thing
  // happened today, in the same register as every other line here. No stats, no "+1 experience",
  // no "day X of your job" framing -- each seed contributes at most one line per day, since
  // engage/accept/decline/stepback are mutually exclusive actions within a single day in practice.
  for (const seed of TRAJECTORY_SEEDS) {
    for (const suffix of ["engaged", "accepted", "declined", "stepback"] as const) {
      const fact = state.worldFacts.find((f) => f.id === `${seed.id}_${suffix}_d${state.day}` && f.day === state.day);
      if (fact) {
        lines.push(fact.text);
        break;
      }
    }
  }

  // PHASE_13 Section 7/8 -- exactly one plain sentence for whatever LOCAL PROBLEM thing happened
  // today, same register and same "today only" gating as the trajectory block just above.
  // Discovery/help/connect are stamped on the day the player took that action; `resolved`/
  // `resolved_without_player` are stamped by `engine.ts`'s `startNewDay` tick with the NEW day's
  // number (i.e. the day the player is now living through) -- so a world change that lands "a few
  // days later" correctly surfaces on THAT later day's own end-of-day screen, not retroactively on
  // the day the player last took action.
  for (const def of LOCAL_PROBLEM_DEFS) {
    for (const suffix of ["discovered", "helped", "connected", "resolved", "resolved_without_player"] as const) {
      const id = suffix === "discovered" ? `${def.id}_discovered` : `${def.id}_${suffix}_d${state.day}`;
      const fact = state.worldFacts.find((f) => f.id === id && f.day === state.day);
      if (fact) {
        lines.push(fact.text);
        break;
      }
    }
  }

  // PHASE_14 Section 6/9/10 -- one plain sentence for an activity session done today, or a
  // world-change that landed today -- same shape as the LOCAL PROBLEM block just above (session id
  // carries a time suffix for uniqueness, so matched by prefix; world-change id is day-exact).
  for (const def of ACTIVITY_DEFS) {
    const sessionFact = state.worldFacts.find((f) => f.id.startsWith(`${def.id}_session_d${state.day}_`) && f.day === state.day);
    if (sessionFact) {
      lines.push(sessionFact.text);
      continue;
    }
    const worldChangeFact = state.worldFacts.find((f) => f.id === `${def.id}_worldchange_d${state.day}` && f.day === state.day);
    if (worldChangeFact) lines.push(worldChangeFact.text);
  }

  if (talkedToday("jin")) lines.push("相馬とは少し話した。明日も朝が早いらしい。");
  if (talkedToday("miyoko")) lines.push("喫茶のどかで、美代子と少し話した。");
  if (talkedToday("kamiya")) lines.push("神谷とは話が途中のままだ。");
  if (talkedToday("daisuke")) lines.push("大輔とは、少し話した。");
  if (talkedToday("hina")) lines.push("陽菜とは、少し話した。");
  if (talkedToday("fumiko")) lines.push("文子とは、少し話した。");

  // Directive Section 15/16 -- a生活上の事情の結果を、スコアではなく事実の一文として残す。「やらな
  // かったら即ゲームオーバー」でも「やったら加点」でもない、ただの今日あった/なかったこと。 This one
  // stays "ever" (not day-gated) since it's a single DAY1-only obligation, not a recurring daily one.
  if (state.flags.met_kamiya && !state.flags.intakeFormSubmitted) {
    lines.push("チャレンジセンターの用紙は、結局出さなかった。");
  }
  if (state.flags.ateMeal) {
    lines.push("帰って、買ってきた物で何か作って食べた。");
  } else if (state.visitedLocations.length > 1) {
    lines.push("その日は、特に何も食べなかった。");
  }

  // PHASE_12_6 Section 4/6/8 -- checked at the day-end screen itself, BEFORE engine.ts's
  // `startNewDay` sweep flips it to "missed" (this screen is the last one seen before that
  // transition, so "still pending with today as the deadline" already means it will be missed --
  // checking it this way, rather than after the sweep, avoids a one-day lag where the
  // acknowledgement would otherwise land on the FOLLOWING day's screen instead of today's). One
  // plain, factual sentence, same register as every other line here -- never "失敗した"/a penalty
  // framing ("MISSED CONTENT != LOST GAME"). A KEPT promise is not separately announced here; it's
  // already covered by the ordinary talkedToday() line above (Section 6: kept promises fold back
  // into an ordinary conversation, not a special "you succeeded" beat). A DECLINED promise is also
  // not re-announced -- the player just made that choice moments ago via a real UI button.
  for (const p of state.playerPromises) {
    if (p.status === "pending" && p.dueByDay === state.day) {
      lines.push(`${npcDisplayName(p.npc)}と約束していたことは、今日は果たせなかった。`);
    }
  }

  if (lines.length === 0) {
    lines.push("誰とも、あまり話さない一日だった。");
  }

  lines.push("そして眠った。");
  return lines;
}

/** Directive Section 10 -- order -> pay -> receive should read as one short, concrete sentence,
 *  never a long animation. `npc` picks the register (洋平's brusque "重いぞ" vs 美代子's softer
 *  warmth), matching each NPC's own established speech style rather than one generic line. */
export function buildPurchaseNarration(npc: NpcId, labels: string[]): string {
  if (labels.length === 0) return "今は、これだけの持ち合わせがなかった。";
  const joined = labels.join("、");
  if (npc === "yohei") return `洋平は${joined}を袋にまとめた。「はい。重いぞ」`;
  if (npc === "miyoko") return `美代子は${joined}をカウンターに置いた。「はい、どうぞ。気をつけてね」`;
  // PHASE_13 Section 1-A -- "散髪を受け取った" read as unnatural Japanese (HV-01 finding): a haircut
  // is a service done TO you, not an object received. Daisuke-specific branch, matching the
  // yohei/miyoko pattern above instead of falling through to the generic (object-purchase-only)
  // fallback line.
  if (npc === "daisuke") return `大輔に${joined}をしてもらった。「はい、お疲れさま」`;
  return `${joined}を受け取った。`;
}

/** Directive Section 12 -- "荷物を確認する" reads real inventory as plain prose, never a raw list.
 *  Item labels come from content/shop.ts's single catalog (itemById) -- never a second,
 *  independently-authored copy of the same names. */
export function describeBelongings(inventory: Record<string, number>): string {
  const entries = Object.entries(inventory).filter(([, count]) => count > 0);
  if (entries.length === 0) return "特に持ち帰った物はまだない。";
  const parts = entries.map(([id, count]) => {
    const label = itemById(id)?.label ?? id;
    return count > 1 ? `${label}×${count}` : label;
  });
  return `持ち物を確認した：${parts.join("、")}。`;
}

const EMPLOYMENT_STATUS_LABEL: Record<IntakeForm["employmentStatus"], string> = {
  working: "今も仕事をしている",
  not_working: "今は働いていない",
  other: "その他",
};

/** Directive NEW_LIFE_DAY1_ONBOARDING_AND_WORLD_ACTION_FIX_V1 Section 7: what gets recorded is
 *  exactly what the player wrote, quoted -- never an inferred psychological label ("PLAYER is
 *  lazy" etc.). Every fact is `knownBy: ["kamiya"]` only -- the same knowledge-boundary mechanism
 *  contextBuilder.ts already filters on, unchanged; this only adds data through the existing
 *  channel, not a new one. */
export function buildIntakeFormWorldFacts(form: IntakeForm, time: ClockMinutes): WorldFact[] {
  const facts: WorldFact[] = [
    { id: "intake_employment_status", time, text: `PLAYERは用紙の「今の仕事」欄に「${EMPLOYMENT_STATUS_LABEL[form.employmentStatus]}」と記入した。`, knownBy: ["kamiya"] },
  ];
  if (form.name.trim()) facts.push({ id: "intake_name", time, text: `PLAYERは用紙の名前欄に「${form.name.trim()}」と記入した。`, knownBy: ["kamiya"] });
  if (form.cameHereReason.trim()) {
    facts.push({ id: "intake_came_here_reason", time, text: `PLAYERは「この町へ来た理由」に「${form.cameHereReason.trim()}」と書いた。`, knownBy: ["kamiya"] });
  }
  if (form.currentThoughts.trim()) {
    facts.push({ id: "intake_current_thoughts", time, text: `PLAYERは「今のところ考えていること」に「${form.currentThoughts.trim()}」と書いた。`, knownBy: ["kamiya"] });
  }
  if (form.troubles.trim()) {
    facts.push({ id: "intake_troubles", time, text: `PLAYERは「困っていること」に「${form.troubles.trim()}」と書いた。`, knownBy: ["kamiya"] });
  }
  return facts;
}

/** Directive Section 6: Kamiya reads the form and reacts, but never recites every field back --
 *  one short, natural beat, not a form-completion receipt. The one content-dependent branch
 *  (employment status) is flavor, not a diagnosis -- nothing here classifies the player into a
 *  type (Section 5). */
export function kamiyaIntakeReaction(form: IntakeForm): string {
  const remark =
    form.employmentStatus === "working"
      ? "「今もお仕事を？　そうですか」"
      : form.employmentStatus === "not_working"
        ? "「……まだ決めてないんですね」"
        : "「……そうですか」";
  return `神谷は受け取った用紙に、ざっと目を通した。${remark}`;
}
