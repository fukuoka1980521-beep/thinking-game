import { useState } from "react";
import "./newlifecore.css";
import townImg from "../assets/newlifev02/challenge-town.png";
import yoheiImg from "../assets/newlifev02/yohei.png";
import miyokoImg from "../assets/newlifev02/miyoko.png";
import jinImg from "../assets/newlifev02/soma-jin.png";
import { STAMP_ASSETS } from "./stampAssets";
import { IntakeForm } from "./IntakeForm";
import { ShoppingPicker } from "./ShoppingPicker";
import { RealityBridgeOffer } from "./RealityBridgeOffer";
import { RealityBridgeCheckIn } from "./RealityBridgeCheckIn";
import { PromiseOffer } from "./PromiseOffer";
import { LifeOpportunityOffer } from "./LifeOpportunityOffer";
import { Day30Retrospective } from "./Day30Retrospective";
import { buildRetrospectiveLines } from "./content/retrospective";
import {
  LOCATION_LABEL,
  buildEndOfDayNarrative,
  buildIntakeFormWorldFacts,
  buildLocationScene,
  buildPurchaseNarration,
  describeBelongings,
  kamiyaIntakeReaction,
  lastFortuneCardLabelFor,
  openingLineFor,
  reachableLocations,
} from "./content/day1";
import { npcsPresentAt } from "./schedule";
import { itemById, menuForLocation, shopNpcForLocation } from "./content/shop";
import { shizukoCheckInAcknowledgement, shizukoIntentConfirmReaction, looksLikeRealLifeConcern } from "./content/realityBridge";
import { eligibleForNewInvitation, invitationLabelFor } from "./content/socialMemory";
import { trajectorySeedById } from "./content/trajectoryDefs";
import { hasAcceptedTrajectory } from "./content/trajectoryEngine";
import { localProblemById } from "./content/localProblemDefs";
import { activityById } from "./content/activityDefs";
import { ActivitySession } from "./ActivitySession";
import { fortuneCardById } from "./content/fortuneCards";
import { FortuneCardPicker } from "./FortuneCardPicker";
import { buildTodaysSigns } from "./content/todaysSigns";
import { detectsCrisisSignal, SAFETY_ROUTE_MESSAGE } from "./content/safetyRoute";
import { buildNpcAiContext } from "./dialogue/contextBuilder";
import { deterministicAdapter } from "./dialogue/deterministicAdapter";
import { liveNpcAdapter } from "./dialogue/liveAdapterClient";
import {
  acceptLifeOpportunity,
  acceptPlayerPromise,
  addWorldFact,
  canSleep,
  checkInRealWorldIntent,
  cookAndEat,
  createRealWorldIntent,
  declineLifeOpportunity,
  declinePlayerPromise,
  discoverEventThread,
  discoverLocalProblem,
  doShortAction,
  moveTo,
  progressEventThread,
  purchaseItems,
  recordConversationTurn,
  recordFortuneCardSelection,
  recordLateConsequence,
  recordTrajectoryEngagement,
  respondToLocalProblemConnect,
  respondToLocalProblemHelp,
  respondToMomentEvent,
  runActivity,
  sleep,
  startNewDay,
  stepBackFromTrajectory,
  submitDay30Reflection,
  timeRemainingLabel,
} from "./engine";
import { MOMENT_EVENT_DEFS } from "./content/momentEventDefs";
import { eventThreadById } from "./content/eventThreadDefs";
import { npcDisplayName, usualLocationFor } from "./npcDefs";
import { getDevConversationLog } from "./dialogue/devObservability";
import { createInitialCoreState, formatClock } from "./types";
import type { CoreState, IntakeForm as IntakeFormData, LocationId, NpcId, RealWorldIntent, UserUpdateResponse } from "./types";

const PORTRAIT_SRC: Partial<Record<NpcId, string>> = { yohei: yoheiImg, miyoko: miyokoImg, jin: jinImg };

// Directive NEW_LIFE_DAY1_ONBOARDING_AND_WORLD_ACTION_FIX_V1 Section 3: shown once automatically,
// reopenable on demand, never a persistent overlay. Deliberately five short operational facts, not
// a tutorial -- the OPENING screen (below) carries what the 30 days mean; this is only mechanics.
const PLAY_GUIDE_ITEMS = ["場所を選んで移動できます", "人がいれば自由に話せます", "その場でできる行動を選べます", "行動すると時間が進みます", "夜になったら一日を終えられます"];

function PlayGuideCard({
  ctaLabel,
  onContinue,
  researchOptIn,
  onToggleResearchOptIn,
}: {
  ctaLabel: string;
  onContinue: () => void;
  researchOptIn: boolean;
  onToggleResearchOptIn: (checked: boolean) => void;
}) {
  return (
    <div className="nlc-scene-card" data-testid="nlc-play-guide">
      <img className="nlc-welcome-img" src={STAMP_ASSETS.duoWelcome} alt="よろしくお願いします" data-testid="nlc-welcome-image" />
      <p className="nlc-summary-heading">この町では</p>
      <ul className="nlc-guide-list">
        {PLAY_GUIDE_ITEMS.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      {/* Section I -- opt-in, off by default, entirely separate from play: gameplay itself never
          reads this flag. Placed here (not a popup mid-conversation) so it's never a condition of
          progressing. */}
      <label className="nlc-dev-toggle" data-testid="nlc-research-optin-label">
        <input
          type="checkbox"
          data-testid="nlc-research-optin"
          checked={researchOptIn}
          onChange={(ev) => onToggleResearchOptIn(ev.target.checked)}
        />
        研究目的でのプレイ内容の観察利用に協力する（任意。しなくても普通に遊べます）
      </label>
      <button className="nlc-btn" onClick={onContinue} data-testid="nlc-guide-continue">
        {ctaLabel}
      </button>
    </div>
  );
}

// PHASE_17 STAGE A -- NPC RECOGNIZABILITY (Section A9): six NPCs still have no portrait ("画像不足
// を嘘の画像で埋めない"). Rather than leave every one of them the exact same grey initial badge
// (hard to tell apart at a glance), each gets a fixed, distinct background color -- still text, no
// fabricated likeness, just enough to stop "everyone with no photo looks identical."
const FALLBACK_BADGE_COLOR: Partial<Record<NpcId, string>> = {
  kamiya: "#8a6bab",
  daisuke: "#4f8a6d",
  shizuko: "#a85d7a",
  hina: "#c07830",
  fumiko: "#3f7a8a",
  kiyoshi: "#7a6a4f",
};

function Portrait({ npc }: { npc: NpcId }) {
  const src = PORTRAIT_SRC[npc];
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div
        className="nlc-portrait nlc-portrait-fallback"
        style={{ background: FALLBACK_BADGE_COLOR[npc] }}
        data-testid={`nlc-portrait-${npc}`}
        data-image-failed={!src ? undefined : "true"}
      >
        {npcDisplayName(npc).slice(0, 1)}
      </div>
    );
  }
  return <img className="nlc-portrait" src={src} alt={npcDisplayName(npc)} data-testid={`nlc-portrait-${npc}`} onError={() => setFailed(true)} />;
}

export function NewlifeCoreApp({ onExit }: { onExit: () => void }) {
  const [state, setState] = useState<CoreState>(() => createInitialCoreState());
  const [activeConversation, setActiveConversation] = useState<NpcId | null>(null);
  const [freeTextInput, setFreeTextInput] = useState("");
  const [pending, setPending] = useState(false);
  // Owner play (directive NEW_LIFE_DAY1_OWNER_REVIEW_READY_V1 Section 4): defaults to live AI
  // conversation whenever this is an actual `vite` dev-server session (the only place the live
  // endpoint exists at all -- see liveAdapterClient.ts's same-origin, dev-only fetch target), so
  // Owner never has to find and check a technical-looking box before NPC conversation works.
  // Deliberately checks MODE, not DEV -- `import.meta.env.DEV` is also true under vitest (MODE
  // "test"), and defaulting live there would make every rendered-UI test attempt a real fetch to a
  // nonexistent endpoint. A production build has MODE "production", so this default is unchanged
  // there -- no behavior change outside local dev. The checkbox below stays, now as an opt-out for
  // troubleshooting rather than a required opt-in.
  const [useLive, setUseLive] = useState<boolean>(() => import.meta.env.MODE === "development");
  const [specialResult, setSpecialResult] = useState<string | null>(null);
  // Directive NEW_LIFE_DAY1_ONBOARDING_AND_WORLD_ACTION_FIX_V1 Section 11: OPENING (what 30 days
  // means) -> PLAY GUIDE (short mechanics, once) -> game. Local UI flow only -- CoreState.started
  // still marks the one thing it always did (left the opening screen); this phase gate sits in
  // front of it, so engine.ts and CoreState's own shape stay untouched.
  const [phase, setPhase] = useState<"opening" | "guide" | "game">("opening");
  const [guideReopened, setGuideReopened] = useState(false);
  const [showIntakeForm, setShowIntakeForm] = useState(false);
  const [showShoppingPicker, setShowShoppingPicker] = useState(false);
  // PHASE_12_3 Section E -- conversation UI rebuild: neither of these ever holds more than a
  // boolean per active conversation (reset whenever the conversation changes), so opening an old
  // conversation never silently carries yesterday's "expanded" state into today's.
  const [showFullTodayLog, setShowFullTodayLog] = useState(false);
  const [showPastLog, setShowPastLog] = useState(false);
  // Section H -- an offer is only ever live for the conversation that produced it; switching NPCs
  // or ending the conversation clears it (see move/closeConversation/openConversation below).
  const [realityBridgeOffer, setRealityBridgeOffer] = useState<{ npc: NpcId; playerStatement: string } | null>(null);
  // PHASE_12_6 Section 6 -- same "cleared whenever the conversation changes" discipline as
  // realityBridgeOffer above; an invitation offer from NPC X should never survive switching to NPC Y.
  const [promiseOffer, setPromiseOffer] = useState<{ npc: NpcId; label: string } | null>(null);
  const [showCheckIn, setShowCheckIn] = useState<RealWorldIntent | null>(null);
  // Section J -- when true, replaces the active conversation's input with the fixed safety message
  // (content/safetyRoute.ts). Never fed through any adapter; nothing here is AI-generated.
  const [safetyRouteActive, setSafetyRouteActive] = useState(false);
  // PHASE_12_7 Section 6/31 -- holds a TrajectorySeed.id while its LifeOpportunityOffer panel is
  // open. Scene-level (like showIntakeForm/showShoppingPicker), not conversation-level -- reset on
  // move, same as those.
  const [showOpportunityOffer, setShowOpportunityOffer] = useState<string | null>(null);
  // PHASE_14 Section 5-10 -- holds an ActivityDef.id while its ActivitySession is open. Same
  // scene-level, reset-on-move discipline as showShoppingPicker/showOpportunityOffer above.
  const [showActivity, setShowActivity] = useState<string | null>(null);
  // PHASE_15 Section 8 -- holds true while the 3-card picker is open; `fortuneOpeningLine` holds the
  // chosen card's own opening question, shown once at the top of the NEXT conversation with Shizuko
  // (see the conversation-panel render below), then cleared. Same reset-on-move/close discipline.
  const [showFortuneCards, setShowFortuneCards] = useState(false);
  const [fortuneOpeningLine, setFortuneOpeningLine] = useState<string | null>(null);
  // PHASE_16 Section 14/15 -- the drawn card's own label, shown as a distinct "reveal" beat right
  // before the opening line (never a separate screen -- Section 14's ritual stays inside the same
  // ordinary conversation panel every other NPC uses).
  const [revealedCardLabel, setRevealedCardLabel] = useState<string | null>(null);

  function startGame() {
    setState((s) => ({ ...s, started: true }));
  }

  function headToChallengeCenter() {
    setState((s) => moveTo(s, "CHALLENGE_CENTER"));
  }

  function move(location: LocationId) {
    setActiveConversation(null);
    setSpecialResult(null);
    setShowIntakeForm(false);
    setShowShoppingPicker(false);
    setShowFullTodayLog(false);
    setShowPastLog(false);
    setRealityBridgeOffer(null);
    setPromiseOffer(null);
    setShowCheckIn(null);
    setSafetyRouteActive(false);
    setShowOpportunityOffer(null);
    setShowActivity(null);
    setShowFortuneCards(false);
    setFortuneOpeningLine(null);
    setRevealedCardLabel(null);
    setState((s) => moveTo(s, location));
  }

  function openConversation(npc: NpcId) {
    setActiveConversation(npc);
    setShowFullTodayLog(false);
    setShowPastLog(false);
    setRealityBridgeOffer(null);
    setPromiseOffer(null);
    setSafetyRouteActive(false);
    setState((s) => (s.flags[`met_${npc}`] ? s : { ...s, flags: { ...s.flags, [`met_${npc}`]: true } }));
  }

  // PHASE_15 Section 8 -- the ONLY place a card is picked. Never decides anything about the future
  // (the card data itself carries no such claim, content/fortuneCards.ts) -- it only picks which
  // opening question Shizuko asks, then proceeds into an ordinary conversation exactly like any
  // other NPC's.
  function selectFortuneCard(cardId: string) {
    const card = fortuneCardById(cardId);
    setShowFortuneCards(false);
    setFortuneOpeningLine(card?.openingLine ?? null);
    setRevealedCardLabel(card?.label ?? null);
    setState((s) => recordFortuneCardSelection(s, cardId));
    openConversation("shizuko");
  }

  function closeConversation() {
    setActiveConversation(null);
    setFreeTextInput("");
    setRealityBridgeOffer(null);
    setPromiseOffer(null);
    setSafetyRouteActive(false);
    setFortuneOpeningLine(null);
    setRevealedCardLabel(null);
  }

  async function submitFreeText() {
    if (!activeConversation || !freeTextInput.trim() || pending) return;
    const npc = activeConversation;
    const text = freeTextInput.trim();
    // Section J -- checked before anything else, for every NPC. A serious signal never reaches an
    // adapter (live or deterministic) at all; no NPC "handles" this in character.
    if (detectsCrisisSignal(text)) {
      setFreeTextInput("");
      setSafetyRouteActive(true);
      return;
    }
    setPending(true);
    setFreeTextInput("");
    setRealityBridgeOffer(null);
    setPromiseOffer(null);
    const context = buildNpcAiContext(npc, state, text);
    const adapter = useLive ? liveNpcAdapter : deterministicAdapter;
    const reply = await adapter(context);
    // Read directly (not via setState's functional updater) so the PHASE_12_6 eligibility check
    // just below sees the POST-turn state (the just-recorded conversation is what `met_${npc}`/
    // promise-keeping/etc. depend on) -- `state` is this render's own closured value, same as the
    // `buildNpcAiContext` call two lines above already reads it.
    const nextState = recordConversationTurn(state, npc, text, reply.visibleUtterance);
    setState(nextState);
    setPending(false);
    // Section H -- offer is scoped to the Thinking Resident only (Section F/G: he alone runs the
    // thinking-circuit register); a heuristic on the PLAYER's own words, never on the NPC reply.
    if (npc === "shizuko" && looksLikeRealLifeConcern(text)) {
      setRealityBridgeOffer({ npc, playerStatement: text });
    } else if (eligibleForNewInvitation(npc, nextState)) {
      // PHASE_12_6 Section 6/15 -- entirely separate from Reality Bridge (never offered to Daisuke,
      // see eligibleForNewInvitation), and gated purely on state (has met, no pending promise
      // already, a day-based cooldown since the last one) -- never on anything the AI said.
      setPromiseOffer({ npc, label: invitationLabelFor(npc) });
    }
  }

  function createIntentFromOffer(intentLabel: string) {
    if (!realityBridgeOffer) return;
    setState((s) => createRealWorldIntent(s, realityBridgeOffer.npc, realityBridgeOffer.playerStatement, intentLabel));
    setSpecialResult(shizukoIntentConfirmReaction());
    setRealityBridgeOffer(null);
  }

  function acceptPromise() {
    if (!promiseOffer) return;
    setState((s) => acceptPlayerPromise(s, promiseOffer.npc, promiseOffer.label));
    setPromiseOffer(null);
  }

  function declinePromise() {
    if (!promiseOffer) return;
    // Section 7/8 -- no "failure" narration; declining is a valid, equally-ordinary outcome.
    setState((s) => declinePlayerPromise(s, promiseOffer.npc, promiseOffer.label));
    setPromiseOffer(null);
  }

  function submitCheckIn(response: UserUpdateResponse, note: string) {
    if (!showCheckIn) return;
    setState((s) => checkInRealWorldIntent(s, showCheckIn.id, response, note));
    setSpecialResult(shizukoCheckInAcknowledgement());
    setShowCheckIn(null);
  }

  function goToNextDay() {
    setState((s) => startNewDay(s));
  }

  function submitDay30ReflectionText(text: string) {
    setState((s) => submitDay30Reflection(s, text));
  }

  function runSpecialAction(actionId: string) {
    // PHASE_12_7 Section 6/13/29 -- dynamic per-seed ids (content/trajectoryDefs.ts). Checked first
    // since these are prefix-matched, not exact-matched like every other branch below.
    if (actionId.startsWith("engage_")) {
      const seed = trajectorySeedById(actionId.slice("engage_".length));
      if (seed) {
        const accepted = hasAcceptedTrajectory(seed, state);
        const minutes = accepted ? seed.workMinutes : seed.engageMinutes;
        const money = accepted ? seed.workMoney : seed.engageMoney;
        const resultText = accepted ? seed.workResultText : seed.engageResultText;
        setState((s) => recordTrajectoryEngagement(s, seed, minutes, money, resultText));
        setSpecialResult(resultText);
      }
      return;
    }
    if (actionId.startsWith("consider_")) {
      const seed = trajectorySeedById(actionId.slice("consider_".length));
      if (seed) {
        setSpecialResult(null);
        setShowOpportunityOffer(seed.id);
      }
      return;
    }
    if (actionId.startsWith("stepback_")) {
      const seed = trajectorySeedById(actionId.slice("stepback_".length));
      if (seed) {
        setState((s) => stepBackFromTrajectory(s, seed));
        setSpecialResult(seed.stepBackResultText);
      }
      return;
    }
    if (actionId.startsWith("late_")) {
      const seed = trajectorySeedById(actionId.slice("late_".length));
      if (seed) {
        setState((s) => recordLateConsequence(s, seed));
        setSpecialResult(seed.lateConsequenceResultText);
      }
      return;
    }
    // PHASE_13 Section 4/6/13 -- dynamic per-problem ids (content/localProblemDefs.ts), same
    // prefix-matched pattern as the trajectory ids above. Never a separate "quest" UI path -- these
    // are ordinary specialActions like everything else in this list.
    if (actionId.startsWith("discover_localproblem_")) {
      const def = localProblemById(actionId.slice("discover_localproblem_".length));
      if (def) {
        setState((s) => discoverLocalProblem(s, def));
        setSpecialResult(def.discoverResultText);
      }
      return;
    }
    if (actionId.startsWith("help_localproblem_")) {
      const def = localProblemById(actionId.slice("help_localproblem_".length));
      if (def && def.helpResultText) {
        setState((s) => respondToLocalProblemHelp(s, def));
        setSpecialResult(def.helpResultText);
      }
      return;
    }
    if (actionId.startsWith("connect_localproblem_")) {
      const def = localProblemById(actionId.slice("connect_localproblem_".length));
      if (def && def.connectResultText) {
        setState((s) => respondToLocalProblemConnect(s, def));
        setSpecialResult(def.connectResultText);
      }
      return;
    }
    // PHASE_15 Section 9-24 -- moment-event choice ids encode BOTH the def id and the choice id
    // (`momentchoice_<defId>_<choiceId>`), so unlike every other prefix-matched id above, resolving
    // this one back requires checking each known (def, choice) pair rather than a single `slice`
    // (see content/day1.ts's `momentEventActionsAt` doc comment for why).
    if (actionId.startsWith("momentchoice_")) {
      const rest = actionId.slice("momentchoice_".length);
      for (const def of MOMENT_EVENT_DEFS) {
        const choice = def.choices.find((c) => rest === `${def.id}_${c.id}`);
        if (choice) {
          setState((s) => respondToMomentEvent(s, def.id, choice.id));
          setSpecialResult(choice.resultText);
          return;
        }
      }
      return;
    }
    // PHASE_15 Section 25-31 -- dynamic per-thread ids (content/eventThreadDefs.ts), same
    // prefix-matched pattern as the local-problem ids above.
    if (actionId.startsWith("discover_thread_")) {
      const def = eventThreadById(actionId.slice("discover_thread_".length));
      if (def) {
        setState((s) => discoverEventThread(s, def));
        setSpecialResult(def.discoverResultText);
      }
      return;
    }
    if (actionId.startsWith("progress_thread_")) {
      const def = eventThreadById(actionId.slice("progress_thread_".length));
      if (def) {
        const runtime = state.eventThreads[def.id];
        const stage = runtime ? def.stages[runtime.stageIndex] : undefined;
        setState((s) => progressEventThread(s, def));
        if (stage) setSpecialResult(stage.resultText);
      }
      return;
    }
    // PHASE_14 Section 5-10 -- dynamic per-activity ids (content/activityDefs.ts), same
    // prefix-matched pattern as the local-problem ids above.
    if (actionId.startsWith("start_activity_")) {
      const def = activityById(actionId.slice("start_activity_".length));
      if (def) {
        setSpecialResult(null);
        setShowActivity(def.id);
      }
      return;
    }
    // PHASE_15 Section 7/8 -- "占ってもらう" starts the 3-card picker, never a bare worries-textbox
    // (Section 7's explicit ban on jumping straight to an input field).
    if (actionId === "start_fortune_telling") {
      setSpecialResult(null);
      setShowFortuneCards(true);
      return;
    }
    if (actionId === "fill_intake_form") {
      setSpecialResult(null);
      setShowIntakeForm(true);
      return;
    }
    if (actionId === "check_in_intent") {
      const openIntent = state.realWorldIntents.find((i) => i.npc === "shizuko" && !i.checkedIn && i.createdOnDay < state.day);
      if (openIntent) {
        setSpecialResult(null);
        setShowCheckIn(openIntent);
      }
      return;
    }
    if (actionId === "offer_help_shelf") {
      setState((s) => {
        const helped = doShortAction(s, 45);
        const withFact = addWorldFact(helped, { id: "shelf_fixed", time: helped.time, text: "主人公が洋平の店の棚を直すのを手伝った", knownBy: ["yohei", "jin"] });
        return { ...withFact, flags: { ...withFact.flags, shelfFixed: true, shelfFixedWithPlayer: true } };
      });
      setSpecialResult(
        "相馬は工具箱から何か取り出して、無言で渡してきた。使い方はよく分からないまま、言われた通り押さえていると、相馬が手早く直してしまった。洋平は棚を軽く叩いて、「まあ、助かった」とだけ言った。",
      );
      return;
    }
    if (actionId === "view_jobs") {
      setState((s) => doShortAction(s, 10));
      setSpecialResult("求人票には、工場の作業員、配送スタッフ、施設の補助といった紙が並んでいた。どれも、まだ自分には遠く感じた。");
      return;
    }
    if (actionId === "notice_shop") {
      setState((s) => addWorldFact(doShortAction(s, 5), { id: "shop_notice_seen", time: s.time, text: "空き店舗の貼り紙を見た", knownBy: [] }));
      setSpecialResult("「近日、何か始めます」——それだけで、誰が何を始めるのかは書かれていない。");
      return;
    }
    if (actionId === "wait_out_rain" || actionId === "wait_kamiya" || actionId === "wait_jin") {
      setState((s) => doShortAction(s, 20));
      const line =
        actionId === "wait_out_rain"
          ? "20分ほど、雨がやむのを待った。特に何も起きなかった。"
          : actionId === "wait_kamiya"
            ? "少し待つと、神谷の電話が終わった。"
            : "相馬はしばらく電話で誰かと言い合っていた。終わると、そのことには触れずに掲示板へ向き直った。";
      setSpecialResult(line);
      return;
    }
    if (actionId === "sit_down") {
      setState((s) => doShortAction(s, 5));
      setSpecialResult("コーヒーを一杯もらって、カウンター脇の椅子に座った。");
      return;
    }
    if (actionId === "shop_here" || actionId === "order_menu") {
      setSpecialResult(null);
      setShowShoppingPicker(true);
      return;
    }
    if (actionId === "cook_and_eat") {
      setState((s) => cookAndEat(s));
      setSpecialResult("買ってきた材料で、簡単に何か作って食べた。少し落ち着いた。");
      return;
    }
    if (actionId === "check_belongings") {
      setSpecialResult(describeBelongings(state.inventory));
      return;
    }
    if (actionId === "think_about_form") {
      setState((s) => doShortAction(s, 5));
      setSpecialResult("チャレンジセンターの用紙のことが、ふと頭をよぎった。まだ出していない。");
      return;
    }
    if (actionId === "rest_a_while") {
      setState((s) => doShortAction(s, 15));
      setSpecialResult("しばらく、何をするでもなく座っていた。");
    }
  }

  // Directive Section 8/9/10 -- the ONLY place a purchase is confirmed. `itemIds` comes straight
  // from the player's own picker selection, never parsed out of AI conversation text.
  function confirmPurchase(itemIds: string[]) {
    const npc = shopNpcForLocation(state.playerLocation);
    if (!npc) return;
    const result = purchaseItems(state, npc, itemIds);
    setState(result.state);
    const allConsumedOnSite = itemIds.length > 0 && itemIds.every((id) => itemById(id)?.consumedOnSite);
    setSpecialResult(buildPurchaseNarration(npc, result.purchasedLabels, allConsumedOnSite));
    setShowShoppingPicker(false);
  }

  // PHASE_14 Section 6/9 -- the ONLY place an activity session resolves. `done` is exactly the
  // subset of tasks ActivitySession.tsx recorded the player actually completing -- never re-derived
  // or second-guessed here.
  function finishActivity(done: { id: string; minutes: number; resultText: string }[]) {
    if (!showActivity) return;
    const def = activityById(showActivity);
    if (!def) return;
    setState((s) => runActivity(s, def, done));
    const reaction = done.length >= def.tasks.length ? def.npcReactionAllDone : done.length >= 2 ? def.npcReactionPartial : def.npcReactionMinimal;
    setSpecialResult(reaction);
    setShowActivity(null);
  }

  // Directive Section 4/7: real UI, not free text pretending. What gets written here is exactly
  // what ends up in Kamiya's known facts (verbatim, via buildIntakeFormWorldFacts) -- no inferred
  // psychological label, no career diagnosis (Section 5).
  function submitIntakeForm(form: IntakeFormData) {
    setState((s) => {
      const advanced = doShortAction(s, 15);
      const withFacts = buildIntakeFormWorldFacts(form, advanced.time).reduce((acc, fact) => addWorldFact(acc, fact), advanced);
      return { ...withFacts, intakeForm: form, flags: { ...withFacts.flags, intakeFormSubmitted: true } };
    });
    setSpecialResult(kamiyaIntakeReaction(form));
    setShowIntakeForm(false);
  }

  function goSleep() {
    setState((s) => sleep(s));
  }

  if (phase === "opening") {
    return (
      <div className="nlc-frame" data-testid="nlc-frame">
        <div className="nlc-topbar">
          <span className="nlc-topbar-label">チャレンジ町</span>
          <button className="nlc-exit" onClick={onExit} data-testid="nlc-exit">
            ホームへ戻る
          </button>
        </div>
        <div className="nlc-panel">
          <div className="nlc-hero">
            <img className="nlc-hero-img" src={townImg} alt="" data-testid="nlc-town-image" />
            <div className="nlc-hero-shade" />
            <div className="nlc-hero-text">
              <h1 className="nlc-hero-title">チャレンジ町</h1>
            </div>
          </div>
          {/* PHASE_14 Section 1/18 -- trimmed from a 5-line, "何者になるか"-framed copy to this
              shorter, theme-aligned version: a small town to settle into, not a job-search pitch or
              a "become someone" countdown. "仕事を探してください"/"困りごとを解決してください" are
              deliberately never written here (Section 18's explicit ban). */}
          <p className="nlc-intro-copy" data-testid="nlc-opening-copy">
            30日、この町で好きに暮らしてみてください。
            <br />
            町を歩き、人と出会い、気の向くまま過ごせます。決まった正解はありません。
          </p>
          <button className="nlc-btn" onClick={() => setPhase("guide")} data-testid="nlc-start">
            町での生活を始める
          </button>
        </div>
      </div>
    );
  }

  if (phase === "guide") {
    return (
      <div className="nlc-frame" data-testid="nlc-frame">
        <div className="nlc-topbar">
          <span className="nlc-topbar-label">チャレンジ町</span>
          <button className="nlc-exit" onClick={onExit} data-testid="nlc-exit">
            ホームへ戻る
          </button>
        </div>
        <div className="nlc-panel">
          <PlayGuideCard
            ctaLabel="町へ出る"
            onContinue={() => {
              startGame();
              setPhase("game");
            }}
            researchOptIn={state.researchOptIn}
            onToggleResearchOptIn={(checked) => setState((s) => ({ ...s, researchOptIn: checked }))}
          />
        </div>
      </div>
    );
  }

  // Reopened on demand from the in-game topbar (directive Section 3: "常時表示は禁止... 後で再確認
  // できるようにしてよい"). Purely a local overlay -- CoreState is untouched, closing it returns to
  // exactly where the player was.
  if (guideReopened) {
    return (
      <div className="nlc-frame" data-testid="nlc-frame">
        <div className="nlc-topbar">
          <span className="nlc-topbar-label">チャレンジ町</span>
          <button className="nlc-exit" onClick={onExit} data-testid="nlc-exit">
            ホームへ戻る
          </button>
        </div>
        <div className="nlc-panel">
          <PlayGuideCard
            ctaLabel="閉じる"
            onContinue={() => setGuideReopened(false)}
            researchOptIn={state.researchOptIn}
            onToggleResearchOptIn={(checked) => setState((s) => ({ ...s, researchOptIn: checked }))}
          />
        </div>
      </div>
    );
  }

  if (state.ended) {
    return (
      <div className="nlc-frame" data-testid="nlc-frame">
        <div className="nlc-topbar">
          <span className="nlc-topbar-label">チャレンジ町</span>
          <button className="nlc-exit" onClick={onExit} data-testid="nlc-exit">
            ホームへ戻る
          </button>
        </div>
        <div className="nlc-panel">
          <div className="nlc-hero nlc-hero--dayend">
            <img className="nlc-hero-img" src={STAMP_ASSETS.scenicEveningSunset} alt="夕暮れの住宅街" data-testid="nlc-dayend-image" />
            <div className="nlc-hero-shade" />
            <div className="nlc-hero-text">
              <h1 className="nlc-hero-title">DAY{state.day}が終わった</h1>
            </div>
          </div>
          <div className="nlc-scene-card" data-testid="nlc-day-end">
            <div className="nlc-summary-list" data-testid="nlc-worldfacts-list">
              {buildEndOfDayNarrative(state).map((line, i) => (
                <p className="nlc-summary-item" key={i}>
                  {line}
                </p>
              ))}
            </div>
            {state.day === 30 && (
              <Day30Retrospective
                lines={buildRetrospectiveLines(state)}
                onSubmitReflection={submitDay30ReflectionText}
                reflectionSubmitted={state.day30ReflectionText !== null}
              />
            )}
            <div className="nlc-footer-actions">
              <button className="nlc-btn" onClick={goToNextDay} data-testid="nlc-next-day">
                次の日へ進む（DAY{state.day + 1}）
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // The only forced beat is "leave the trial house" -- once outside, ignoring Kamiya entirely is
  // a legitimate play path (directive Section 0 explicitly lists "無視する" as a valid action),
  // so this gate must not depend on actually having talked to him (that would softlock a player
  // who walks straight back to the trial house without engaging).
  const hasVenturedOut = state.visitedLocations.length > 1;
  // PHASE_14 Section 4 -- computed once per render; cheap and pure (buildTodaysSigns never mutates
  // state), so no memoization is needed for a scene this small.
  const todaysSigns = buildTodaysSigns(state);
  const scene = state.playerLocation !== "TRIAL_HOUSE" || hasVenturedOut ? buildLocationScene(state) : null;
  // A conversation's own 10-minute time cost can cross a schedule/world-event boundary that moves
  // the npc elsewhere (time progressing through conversation is an intentionally KEPT feature).
  // Without this, the npc's card simply vanishes from the DOM the instant their reply arrives --
  // the just-arrived reply is lost from view, and the move list (gated on !activeConversation)
  // never reappears since nothing ever clears activeConversation on its own. So the currently-open
  // conversation always keeps rendering even once the npc has left; the only real difference is
  // that free-text input closes off (see hasLeftMidConversation below).
  const visibleNpcsHere = scene && activeConversation && !scene.npcsHere.includes(activeConversation) ? [...scene.npcsHere, activeConversation] : (scene?.npcsHere ?? []);
  // PHASE_16 Section 4/29 -- EVENT VISIBILITY: true when this scene is actually hosting a Moment
  // Event choice, an Event Thread discover/progress action, or a local-problem discover/help/connect
  // action -- the cases the directive names as "something is happening now" (never activities/shop/
  // ordinary talk, which are routine, not an event).
  const sceneHasEventAction = Boolean(
    scene?.specialActions.some((a) => a.id.startsWith("momentchoice_") || a.id.startsWith("discover_thread_") || a.id.startsWith("progress_thread_") || a.id.startsWith("discover_localproblem_") || a.id.startsWith("help_localproblem_") || a.id.startsWith("connect_localproblem_")),
  );

  return (
    <div className="nlc-frame" data-testid="nlc-frame">
      <div className="nlc-topbar">
        <span className="nlc-topbar-label">チャレンジ町</span>
        <span className="nlc-clock" data-testid="nlc-clock">
          DAY{state.day} ・ {formatClock(state.time)}
        </span>
        <button className="nlc-exit" onClick={() => setGuideReopened(true)} data-testid="nlc-guide-reopen">
          ？ 遊び方
        </button>
        <button className="nlc-exit" onClick={onExit} data-testid="nlc-exit">
          ホームへ戻る
        </button>
      </div>
      <div className="nlc-panel">
        <p className="nlc-location-label" data-testid="nlc-location-label">
          {LOCATION_LABEL[state.playerLocation]}
        </p>

        {!hasVenturedOut && state.playerLocation === "TRIAL_HOUSE" && (
          <div className="nlc-scene-card" data-testid="nlc-wake-scene">
            <p>カーテンの隙間から、朝の光が差し込んでいた。机の上には鍵と、返却日を丸く囲んだ紙。</p>
            {/* PHASE_14 Section 4/23/30 -- plain sentences, same <p> as the line above, no icon/badge/
                list styling -- deliberately indistinguishable in markup from ordinary ambient text,
                so it can never read as a mission panel. Ignoring all of these and going anywhere else
                is exactly as valid as acting on one. */}
            {todaysSigns.map((sign, i) => (
              <p key={i} data-testid="nlc-todays-sign">
                {sign}
              </p>
            ))}
            <div className="nlc-footer-actions">
              <button className="nlc-btn" onClick={headToChallengeCenter} data-testid="nlc-go-challenge-center">
                チャレンジセンターへ向かう
              </button>
            </div>
          </div>
        )}

        {scene && showIntakeForm && (
          <div className="nlc-scene-card" data-testid="nlc-location-scene">
            <IntakeForm onSubmit={submitIntakeForm} onCancel={() => setShowIntakeForm(false)} />
          </div>
        )}

        {scene && showShoppingPicker && (
          <div className="nlc-scene-card" data-testid="nlc-location-scene">
            <ShoppingPicker items={menuForLocation(state.playerLocation)} money={state.money} onConfirm={confirmPurchase} onCancel={() => setShowShoppingPicker(false)} />
          </div>
        )}

        {scene && showCheckIn && (
          <div className="nlc-scene-card" data-testid="nlc-location-scene">
            <RealityBridgeCheckIn intent={showCheckIn} onSubmit={submitCheckIn} onCancel={() => setShowCheckIn(null)} />
          </div>
        )}

        {scene &&
          showActivity &&
          (() => {
            const def = activityById(showActivity);
            if (!def) return null;
            return (
              <div className="nlc-scene-card" data-testid="nlc-location-scene">
                <ActivitySession def={def} onFinish={finishActivity} />
              </div>
            );
          })()}

        {scene && showFortuneCards && (
          <div className="nlc-scene-card" data-testid="nlc-location-scene">
            <FortuneCardPicker onSelect={selectFortuneCard} onCancel={() => setShowFortuneCards(false)} />
          </div>
        )}

        {scene && !showIntakeForm && !showShoppingPicker && !showCheckIn && !showActivity && !showFortuneCards && (
          <div className={`nlc-scene-card${sceneHasEventAction ? " nlc-scene-card--event" : ""}`} data-testid="nlc-location-scene">
            {scene.ambientLine && <p className="nlc-ambient">{scene.ambientLine}</p>}

            {visibleNpcsHere.map((npc) => {
              const hasLeftMidConversation = activeConversation === npc && !scene.npcsHere.includes(npc);
              return (
                <div className="nlc-npc-card" key={npc} data-testid={`nlc-npc-card-${npc}`}>
                  <div className="nlc-npc-header">
                    <Portrait npc={npc} />
                    <div>
                      <div className="nlc-npc-name">{npcDisplayName(npc)}</div>
                      {usualLocationFor(npc) && (
                        <p className="nlc-npc-place" data-testid={`nlc-npc-place-${npc}`}>
                          {LOCATION_LABEL[usualLocationFor(npc)!]}の人
                        </p>
                      )}
                      {activeConversation !== npc && (
                        <>
                          <p className="nlc-npc-line">{openingLineFor(npc, state)}</p>
                          {lastFortuneCardLabelFor(npc, state) && (
                            <span className="nlc-fortune-memory-chip" data-testid="nlc-fortune-memory-chip">
                              前回のカード：{lastFortuneCardLabelFor(npc, state)}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {activeConversation === npc ? (
                    (() => {
                      // Section E -- CONTINUE (earlier days, collapsed to a one-line summary by
                      // default) vs TODAY (this day's own exchange, live). Neither ever dumps the
                      // full backlog on screen by default -- directive: "画面上に過去全文を常時
                      // 展開しない".
                      const pastTurns = state.npcMemory[npc].filter((t) => t.day < state.day);
                      const todayTurns = state.npcMemory[npc].filter((t) => t.day === state.day);
                      const TODAY_VISIBLE_CAP = 4;
                      const hiddenTodayCount = Math.max(0, todayTurns.length - TODAY_VISIBLE_CAP);
                      const visibleTodayTurns = showFullTodayLog ? todayTurns : todayTurns.slice(-TODAY_VISIBLE_CAP);
                      const lastPastTurn = pastTurns[pastTurns.length - 1];

                      return (
                        <div className="nlc-conversation" data-testid={`nlc-conversation-${npc}`}>
                          {/* PHASE_16 Section 14 -- the "card reveal" beat: names which card was drawn,
                              distinct from (and just before) the opening question itself, still inside
                              the same ordinary conversation panel -- never a separate screen/animation. */}
                          {npc === "shizuko" && revealedCardLabel && todayTurns.length === 0 && (
                            <p className="nlc-fortune-card-reveal" data-testid="nlc-fortune-card-reveal">
                              カードは「{revealedCardLabel}」だった。
                            </p>
                          )}
                          {/* PHASE_15 Section 8 -- the chosen card's own opening question, shown once
                              at the top of this fresh fortune-telling session (before the player's
                              first turn today), never a separate popup/result panel. */}
                          {npc === "shizuko" && fortuneOpeningLine && todayTurns.length === 0 && (
                            <p className="nlc-npc-line" data-testid="nlc-fortune-opening-line">
                              {fortuneOpeningLine}
                            </p>
                          )}
                          {lastPastTurn && (
                            <div className="nlc-past-summary" data-testid={`nlc-past-summary-${npc}`}>
                              {!showPastLog ? (
                                <>
                                  <p className="nlc-npc-line">前回の話：「{lastPastTurn.playerUtterance}」について話した。</p>
                                  <button className="nlc-leave-btn" onClick={() => setShowPastLog(true)} data-testid={`nlc-expand-past-${npc}`}>
                                    会話履歴を見る
                                  </button>
                                </>
                              ) : (
                                <>
                                  <div className="nlc-conversation-log">
                                    {pastTurns.map((t, i) => (
                                      <div key={i} className="nlc-turn">
                                        <p className="nlc-line-player">{t.playerUtterance}</p>
                                        <p className="nlc-line-npc">{t.npcReply}</p>
                                      </div>
                                    ))}
                                  </div>
                                  <button className="nlc-leave-btn" onClick={() => setShowPastLog(false)} data-testid={`nlc-collapse-past-${npc}`}>
                                    閉じる
                                  </button>
                                </>
                              )}
                            </div>
                          )}

                          <div className="nlc-conversation-log" data-testid={`nlc-conversation-log-${npc}`}>
                            {!showFullTodayLog && hiddenTodayCount > 0 && (
                              <button className="nlc-leave-btn" onClick={() => setShowFullTodayLog(true)} data-testid={`nlc-expand-today-${npc}`}>
                                この日の会話をもっと見る（{hiddenTodayCount}件）
                              </button>
                            )}
                            {visibleTodayTurns.map((t, i) => (
                              <div key={i} className="nlc-turn">
                                <p className="nlc-line-player">{t.playerUtterance}</p>
                                <p className="nlc-line-npc">{t.npcReply}</p>
                              </div>
                            ))}
                            {pending && (
                              <p className="nlc-line-waiting" data-testid="nlc-waiting-indicator">
                                <span>・</span>
                                <span>・</span>
                                <span>・</span>
                              </p>
                            )}
                          </div>

                          {safetyRouteActive ? (
                            <div className="nlc-result" data-testid="nlc-safety-route">
                              {SAFETY_ROUTE_MESSAGE.split("\n").map((line, i) => (
                                <p key={i}>{line}</p>
                              ))}
                            </div>
                          ) : hasLeftMidConversation ? (
                            <p className="nlc-npc-line" data-testid={`nlc-npc-departed-${npc}`}>
                              {npcDisplayName(npc)}は、もうそこにいなかった。
                            </p>
                          ) : (
                            <>
                              <div className="nlc-conversation-input-row">
                                <input
                                  className="nlc-freetext-input"
                                  data-testid={`nlc-freetext-input-${npc}`}
                                  value={freeTextInput}
                                  onChange={(ev) => setFreeTextInput(ev.target.value)}
                                  onKeyDown={(ev) => {
                                    if (ev.key === "Enter") submitFreeText();
                                  }}
                                  placeholder={`${npcDisplayName(npc)}に話す`}
                                  disabled={pending}
                                />
                                <button className="nlc-btn" onClick={submitFreeText} disabled={pending || !freeTextInput.trim()} data-testid={`nlc-freetext-submit-${npc}`}>
                                  送る
                                </button>
                              </div>
                              {npc === "shizuko" && realityBridgeOffer && (
                                <RealityBridgeOffer onCreate={createIntentFromOffer} onDismiss={() => setRealityBridgeOffer(null)} />
                              )}
                              {promiseOffer && promiseOffer.npc === npc && <PromiseOffer npc={npc} label={promiseOffer.label} onAccept={acceptPromise} onDecline={declinePromise} />}
                            </>
                          )}
                          <button className="nlc-leave-btn" onClick={closeConversation} data-testid={`nlc-conversation-close-${npc}`}>
                            会話を終える
                          </button>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="nlc-npc-actions">
                      <button className="nlc-choice" onClick={() => openConversation(npc)} data-testid={`nlc-talk-${npc}`}>
                        自由に話す
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {scene.specialActions.length > 0 && !activeConversation && (
              <div className="nlc-choices">
                {scene.specialActions.map((a) => (
                  <button key={a.id} className="nlc-choice" onClick={() => runSpecialAction(a.id)} data-testid={`nlc-action-${a.id}`}>
                    {a.label}
                  </button>
                ))}
              </div>
            )}

            {specialResult && (
              <div className="nlc-result" data-testid="nlc-special-result">
                {specialResult}
              </div>
            )}

            {showOpportunityOffer &&
              (() => {
                const seed = trajectorySeedById(showOpportunityOffer);
                if (!seed) return null;
                return (
                  <LifeOpportunityOffer
                    npc={seed.npc}
                    label={seed.opportunityLabel}
                    onAccept={() => {
                      setState((s) => acceptLifeOpportunity(s, seed));
                      setSpecialResult(seed.acceptedResultText);
                      setShowOpportunityOffer(null);
                    }}
                    onDecline={() => {
                      setState((s) => declineLifeOpportunity(s, seed));
                      setSpecialResult(seed.declinedResultText);
                      setShowOpportunityOffer(null);
                    }}
                  />
                );
              })()}
          </div>
        )}

        {(scene || hasVenturedOut) && !activeConversation && !showIntakeForm && !showShoppingPicker && !showCheckIn && !showActivity && !showFortuneCards && (
          <div className="nlc-movelist" data-testid="nlc-movelist">
            <p className="nlc-summary-heading">どこへ行きますか（残り{timeRemainingLabel(state.time)}）</p>
            <div className="nlc-picklist">
              {reachableLocations(state.playerLocation).map((loc) => {
                // PHASE_17 STAGE A -- WHO/WHERE before committing to a move: +15 is the real travel
                // cost `moveTo` (engine.ts) charges, so this previews who will actually be there on
                // arrival, not just who happens to be there right now.
                const whoThere = npcsPresentAt(loc, state.time + 15, state.flags);
                return (
                  <button
                    key={loc}
                    className={`nlc-pick-btn${loc === "FORTUNE_HOUSE" ? " nlc-pick-btn--fortune" : ""}`}
                    onClick={() => move(loc)}
                    data-testid={`nlc-move-${loc}`}
                  >
                    <span className="nlc-pick-btn-label">{LOCATION_LABEL[loc]}</span>
                    <span className="nlc-pick-btn-who" data-testid={`nlc-move-who-${loc}`}>
                      {whoThere.length ? whoThere.map((npc) => npcDisplayName(npc)).join("・") : "誰もいないかも"}
                    </span>
                  </button>
                );
              })}
            </div>
            {canSleep(state) && (
              <button className="nlc-btn nlc-sleep-btn" onClick={goSleep} data-testid="nlc-sleep">
                今日はもう休む
              </button>
            )}
          </div>
        )}

        {import.meta.env.DEV && (
          <label className="nlc-dev-toggle" data-testid="nlc-live-toggle-label">
            <input type="checkbox" data-testid="nlc-live-toggle" checked={useLive} onChange={(ev) => setUseLive(ev.target.checked)} />
            AIとの会話（オフで簡易応答に切り替え）
          </label>
        )}

        {/* PHASE_18 Section B12 -- dev/test-only, collapsed by default, never shown in a production
            build. Shows which path each recent reply actually took (real model vs. bounded
            fallback) so a stalled/erroring live call is visible during development, not silent. */}
        {import.meta.env.DEV && (
          <details className="nlc-dev-toggle" data-testid="nlc-dev-conversation-log">
            <summary>直近の応答ログ（開発用）</summary>
            {getDevConversationLog()
              .slice()
              .reverse()
              .map((e, i) => (
                <p key={i} style={{ margin: "4px 0", fontSize: "12px" }}>
                  {e.npcId} / DAY{e.day} / {e.source === "live" ? "モデル応答" : `簡易応答（${e.fallbackReason ?? "unknown"}）`} /{" "}
                  {e.latencyMs}ms
                </p>
              ))}
          </details>
        )}
      </div>
    </div>
  );
}
