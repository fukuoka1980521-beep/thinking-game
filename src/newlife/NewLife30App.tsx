import { useEffect, useMemo, useRef, useState } from "react";
import "./newlife30.css";
import { advanceDay, applyAction, createInitialState, day11PhaseLabel } from "./state";
import { getScene, TOTAL_DAYS } from "./content";
import { npcDisplayName } from "./npcVoice";
import { NPC_IDS, type NewLife30State, type NpcId } from "./types";
import { NEWLIFE_DIALOGUE_ENDPOINT_URL } from "./semantic/config";
import { getNewLifeAiDialogueConsent, setNewLifeAiDialogueConsent, type NewLifeAiDialogueConsentStatus } from "./semantic/consent";
import { HttpSemanticInterpreter } from "./semantic/httpInterpreter";
import { resolveFreeText } from "./semantic/coordinator";
import { resolveFreeAction } from "./freeAction";
import hinaArt from "../assets/newlife/characters/hina.png";
import yoheiArt from "../assets/newlife/characters/yohei.png";
import daisukeArt from "../assets/newlife/characters/daisuke.jpg";
import jinArt from "../assets/newlife/characters/jin.jpg";
import miyokoArt from "../assets/newlife/characters/miyoko.png";
import fumikoArt from "../assets/newlife/characters/fumiko.jpg";
import tempHomeArt from "../assets/newlife/locations/temp-home.png";
import cafeInteriorArt from "../assets/newlife/locations/cafe-interior.png";
import shoppingStreetArt from "../assets/newlife/locations/shopping-street.png";
import yoheiShopArt from "../assets/newlife/locations/yohei-shop.png";
import { NewLifeAiConsentPrompt } from "./semantic/NewLifeAiConsentPrompt";
import { createEmptyLedger, syncLedgerWithState, type FactLedger } from "./semantic/factLedger";
import { converseWithRefoundation, supportsRefoundation } from "./refoundationDialogue";
import { applyConversationEffectGate } from "./conversationEffectGate";

const NPC_ART: Partial<Record<NpcId, string>> = {
  hina: hinaArt,
  yohei: yoheiArt,
  daisuke: daisukeArt,
  jin: jinArt,
  miyoko: miyokoArt,
  fumiko: fumikoArt,
};
const NPC_ROLE: Record<NpcId, string> = {
  hina: "焼き菓子の試売を始める人",
  yohei: "数字と事実を確かめる店主",
  daisuke: "家具修理の職人",
  jin: "設営と家具仕事を引き受ける人",
  miyoko: "喫茶の店主",
  fumiko: "会館と掲示を見ている人",
};

const NPC_SHORT: Record<NpcId, string> = {
  hina: "作る人",
  yohei: "確かめる人",
  daisuke: "直す人",
  jin: "支える人",
  miyoko: "迎える人",
  fumiko: "整える人",
};
const SAVE_KEY = "newlife30_save_v1";
const CAFE_DAYS = new Set([2, 5, 9, 12, 13, 16, 18, 20, 21, 26, 28]);
const SHOP_DAYS = new Set([4, 6, 8, 14, 15, 17, 22, 23, 27, 29]);

function sceneArtFor(day: number): string {
  if (day === 1) return tempHomeArt;
  if (CAFE_DAYS.has(day)) return cafeInteriorArt;
  if (SHOP_DAYS.has(day)) return yoheiShopArt;
  return shoppingStreetArt;
}

function sceneLocationFor(day: number): string {
  if (day === 1) return "仮住まい";
  if (CAFE_DAYS.has(day)) return "美代子の喫茶";
  if (SHOP_DAYS.has(day)) return "店先・工房";
  return "商店街・会館前";
}

function sceneMomentFor(state: NewLife30State): string {
  if (state.day === 11) return state.day11Phase === "afternoon" ? "午後" : "朝";
  if (state.day <= 5) return "午前";
  if (state.day <= 10) return "昼前";
  if (state.day <= 18) return "午後";
  if (state.day <= 24) return "夕方";
  return "それぞれの一日";
}

function speakerNpc(speaker: string): NpcId | null {
  return NPC_IDS.find((npc) => npcDisplayName(npc) === speaker) ?? null;
}

interface Props {
  onExit: () => void;
}

interface TranscriptLine {
  speaker: string;
  text: string;
}

interface SavedSession {
  state: NewLife30State;
  transcript: TranscriptLine[];
  memory: TranscriptLine[];
  addressee: NpcId;
  previousDayTrace: string | null;
  thinking: { important: string; unknown: string; next: string };
}

function dayLabel(state: NewLife30State): string {
  if (state.day === 11 && state.day11Phase !== "done") {
    return `Day 11（${day11PhaseLabel(state.day11Phase)}）`;
  }
  return `Day ${state.day}`;
}

/**
 * NEW LIFE — 30-day playable candidate (Phase 27).
 *
 * Text-first isolated feature slice: reachable only via `?newlife30=1`
 * (see App.tsx), not linked from HomeScreen or any other screen. This
 * component renders state produced by the deterministic engine in
 * state.ts and never itself decides a canonical fact. Consented ordinary
 * free conversation is generation-first; structured proposals then pass
 * through conversationEffectGate.ts before any canonical state mutation.
 * No-consent/offline continuity may still use the legacy deterministic
 * fallback path.
 *
 * HUMAN_VALIDATION_STATUS = PARTIAL. V42/V45 are preserved human-accepted
 * scene evidence, but the 30-day chat-first + free-text-consequence loop
 * still requires the no-choice human product gate defined by the current
 * Product Constitution.
 */
export function NewLife30App({ onExit }: Props) {
  const [state, setState] = useState<NewLife30State>(createInitialState);
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [memory, setMemory] = useState<TranscriptLine[]>([]);
  const [addressee, setAddressee] = useState<NpcId>("hina");
  const [freeText, setFreeText] = useState("");
  const [thinkingOpen, setThinkingOpen] = useState(false);
  const [thinking, setThinking] = useState({ important: "", unknown: "", next: "" });
  const [thinkingNote, setThinkingNote] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [previousDayTrace, setPreviousDayTrace] = useState<string | null>(null);
  const immediateActionTrace = useRef<string | null>(null);
  const optionDetailsRef = useRef<HTMLDetailsElement | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  const [pending, setPending] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [savedSession, setSavedSession] = useState<SavedSession | null>(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      return raw ? JSON.parse(raw) as SavedSession : null;
    } catch {
      return null;
    }
  });
  // Phase 25.2: compact who-said/did/offered/permitted/owns ledger carried across turns
  // (short attributed facts, never a transcript). Re-synced with canonical state each turn.
  const [ledger, setLedger] = useState<FactLedger>(() => syncLedgerWithState(createEmptyLedger(), createInitialState()));
  const [consentStatus, setConsentStatus] = useState<NewLifeAiDialogueConsentStatus | null>(() => getNewLifeAiDialogueConsent());
  const [pendingSubmission, setPendingSubmission] = useState<{ npc: NpcId; text: string } | null>(null);

  // Legacy semantic interpreter remains available only for the explicit
  // fallback path. Normal consented conversation uses the refoundation
  // chat-first engine first; deterministic phrase routing no longer runs
  // before that live conversation path.
  const interpreter = useMemo(
    () => (NEWLIFE_DIALOGUE_ENDPOINT_URL ? new HttpSemanticInterpreter(NEWLIFE_DIALOGUE_ENDPOINT_URL) : null),
    [],
  );
  const showConsentPrompt = Boolean(NEWLIFE_DIALOGUE_ENDPOINT_URL) && pendingSubmission !== null && consentStatus === null;

  const scene = useMemo(() => getScene(state.day, state.day11Phase, state.day24Outcome), [state.day, state.day11Phase, state.day24Outcome]);

  useEffect(() => {
    if (scene.npcsPresent.length > 0 && !scene.npcsPresent.includes(addressee)) {
      setAddressee(scene.npcsPresent[0]);
    }
  }, [scene, addressee]);

  useEffect(() => {
    if (transcript.length === 0) return;
    transcriptEndRef.current?.scrollIntoView?.({ behavior: "smooth", block: "nearest" });
  }, [transcript]);

  useEffect(() => {
    if (showIntro) return;
    const save: SavedSession = { state, transcript, memory, addressee, previousDayTrace, thinking };
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(save));
      setSavedSession(save);
    } catch {
      // Saving is convenience only; gameplay must continue if storage is unavailable.
    }
  }, [state, transcript, memory, addressee, previousDayTrace, thinking, showIntro]);

  function resetTranscriptFor(nextState: NewLife30State) {
    setTranscript([]);
    setState(nextState);
  }

  function appendMemory(lines: TranscriptLine[]) {
    setMemory((prev) => [...prev, ...lines].slice(-12));
  }

  function startFresh() {
    const fresh = createInitialState();
    setState(fresh);
    setTranscript([]);
    setMemory([]);
    setAddressee("hina");
    setPreviousDayTrace(null);
    setThinking({ important: "", unknown: "", next: "" });
    setThinkingNote(null);
    setLedger(syncLedgerWithState(createEmptyLedger(), fresh));
    immediateActionTrace.current = null;
    setSavedSession(null);
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {
      // A fresh run still works if storage is unavailable.
    }
    setShowIntro(false);
  }

  function continueSaved() {
    if (!savedSession) return startFresh();
    setState(savedSession.state);
    setTranscript(savedSession.transcript ?? []);
    setMemory(savedSession.memory ?? []);
    setAddressee(savedSession.addressee ?? "hina");
    setPreviousDayTrace(savedSession.previousDayTrace ?? null);
    setThinking(savedSession.thinking ?? { important: "", unknown: "", next: "" });
    setShowIntro(false);
  }

  function handleOption(optionId: string) {
    if (pending) return;
    const label = scene.options.find((o) => o.id === optionId)?.label ?? optionId;
    const next = applyAction(state, optionId);
    const target = scene.npcsPresent.includes(addressee) ? addressee : (scene.npcsPresent[0] ?? addressee);
    setState(next);
    setActionNotice(`行動を実行しました：${label}`);
    optionDetailsRef.current?.removeAttribute("open");
    void submitFreeText(target, label, consentStatus === "accepted", {
      stateOverride: next,
      displayText: `（${label}）`,
      skipFreeAction: true,
    });
  }

  function handleAdvance() {
    setActionNotice(null);
    const lastPlayerLine = [...transcript].reverse().find((line) => line.speaker === "あなた");
    const latestAction = state.log[state.log.length - 1];
    const actionTrace = latestAction ? scene.options.find((o) => latestAction.endsWith(`:${o.id}`))?.label : undefined;
    setPreviousDayTrace(lastPlayerLine?.text ?? immediateActionTrace.current ?? actionTrace ?? null);
    immediateActionTrace.current = null;
    resetTranscriptFor(advanceDay(state));
  }

  async function submitFreeText(
    npc: NpcId,
    text: string,
    consentAccepted: boolean,
    options?: { stateOverride?: NewLife30State; displayText?: string; skipFreeAction?: boolean },
  ) {
    setPending(true);
    try {
      const baseState = options?.stateOverride ?? state;
      const playerText = options?.displayText ?? text;

      // CHAT-FIRST normal path:
      // understand/respond first, then let a deterministic authority gate
      // decide whether the semantic proposal may change canonical state.
      // No keyword/regex free-action routing runs before this model call.
      if (consentAccepted && supportsRefoundation(npc)) {
        try {
          const live = await converseWithRefoundation(npc, text, [...memory, ...transcript].slice(-12), {
            day: baseState.day,
            title: scene.title,
            text: scene.text,
            sceneFocus: scene.sceneFocus,
            canonicalState: {
              signVersion: baseState.signVersion,
              pickupPlan: baseState.pickupPlan,
              mSeats: baseState.mSeats,
              jWork: baseState.jWork,
              dWorkshop: baseState.dWorkshop,
              fEditor: baseState.fEditor,
              hyFactCheck: baseState.hyFactCheck,
              playerReport: baseState.playerReport,
              publicBlame: baseState.publicBlame,
              encouragementOnly: baseState.encouragementOnly,
              day24Outcome: baseState.day24Outcome,
            },
            interactionKind: options?.skipFreeAction ? "ACTION" : "SPEECH",
          });

          if (!options?.skipFreeAction) {
            const effect = applyConversationEffectGate(baseState, npc, live);
            if (effect.applied) setState(effect.state);
          }

          const lines: TranscriptLine[] = [
            { speaker: "\u3042\u306a\u305f", text: playerText },
            { speaker: npcDisplayName(npc), text: live.text },
            ...live.continuations.map((turn) => ({ speaker: npcDisplayName(turn.npc), text: turn.text })),
          ];
          setTranscript((prev) => [...prev, ...lines]);
          appendMemory(lines);
          return;
        } catch {
          // Never disguise a transient live-AI outage as an in-character deterministic answer.
          const lines: TranscriptLine[] = [
            { speaker: "\u3042\u306a\u305f", text: playerText },
            { speaker: "システム", text: "返事の途中で通信が途切れました。入力は残してあります。少し待って、もう一度「話す」を押してください。" },
          ];
          setTranscript((prev) => [...prev, ...lines]);
          setFreeText(text);
          return;
        }
      }

      // Explicit fallback / no-consent path only. Phrase routing remains here
      // for continuity and offline resilience, but it is no longer the owner
      // of normal live conversation.
      const freeAction = options?.skipFreeAction ? null : resolveFreeAction(baseState, npc, text);
      const responseState = freeAction ? applyAction(baseState, freeAction) : baseState;
      const result = await resolveFreeText(npc, text, responseState, { interpreter, consentAccepted, ledger });
      if (result.ledger) setLedger(result.ledger);
      if (freeAction) setState(responseState);
      const lines: TranscriptLine[] = [
        { speaker: "\u3042\u306a\u305f", text: playerText },
        { speaker: npcDisplayName(npc), text: result.text },
      ];
      setTranscript((prev) => [...prev, ...lines]);
      appendMemory(lines);
    } finally {
      setPending(false);
    }
  }

  function handleAskSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    const text = freeText.trim();
    if (!text) return;
    setFreeText("");

    if (NEWLIFE_DIALOGUE_ENDPOINT_URL && consentStatus === null) {
      setPendingSubmission({ npc: addressee, text });
      return;
    }
    void submitFreeText(addressee, text, consentStatus === "accepted");
  }

  function handleConsentAccept() {
    setNewLifeAiDialogueConsent("accepted");
    setConsentStatus("accepted");
    if (pendingSubmission) {
      void submitFreeText(pendingSubmission.npc, pendingSubmission.text, true);
      setPendingSubmission(null);
    }
  }

  function handleConsentDecline() {
    setNewLifeAiDialogueConsent("declined");
    setConsentStatus("declined");
    if (pendingSubmission) {
      void submitFreeText(pendingSubmission.npc, pendingSubmission.text, false);
      setPendingSubmission(null);
    }
  }

  const npcsForSelect = scene.npcsPresent.length > 0 ? scene.npcsPresent : NPC_IDS;
  const day11NeedsSecondMove = state.day === 11 && state.day11Phase === "afternoon";

  if (state.finished) {
    return (
      <div className="newlife30">
        <span className="newlife30-badge">NEW LIFE</span>
        <h1 className="newlife30-title">{"\u0033\u0030\u65e5\u3092\u7d42\u3048\u3066"}</h1>
        <div className="newlife30-ending-art">
          <img src={sceneArtFor(30)} alt="30日後の町" />
          <span>30 DAYS LATER</span>
        </div>
        <div className="newlife30-scene">
          <strong>{state.day24Outcome === "JOINT_RETRY" ? "\u5171\u540c\u3067\u3001\u3082\u3046\u4e00\u5ea6\u8a66\u305b\u308b\u5f62\u304c\u6b8b\u3063\u305f\u3002" : state.day24Outcome === "SOLO_TRIAL" ? "\u967d\u83dc\u306f\u3001\u81ea\u5206\u3067\u6c7a\u3081\u3089\u308c\u308b\u5c0f\u3055\u306a\u8a66\u884c\u3092\u9078\u3093\u3060\u3002" : state.day24Outcome === "PAUSE" ? "\u6025\u3044\u3067\u7b54\u3048\u3092\u4f5c\u3089\u305a\u3001\u3044\u3063\u305f\u3093\u6b62\u307e\u308b\u4f59\u5730\u3092\u6b8b\u3057\u305f\u3002" : "\u5171\u540c\u6848\u306f\u7d42\u308f\u3063\u305f\u3002\u305d\u308c\u3067\u3082\u753a\u3067\u306e\u95a2\u4fc2\u3068\u6b21\u306e\u884c\u52d5\u306f\u6b8b\u3063\u3066\u3044\u308b\u3002"}</strong>
          <p>{"\u0033\u0030\u65e5\u524d\u3001\u3042\u306a\u305f\u306f\u3053\u306e\u753a\u3067\u4f55\u304c\u8d77\u304d\u308b\u304b\u77e5\u308a\u307e\u305b\u3093\u3067\u3057\u305f\u3002\u4eca\u306f\u3001\u8ab0\u306b\u78ba\u8a8d\u3059\u308b\u304b\u3001\u4f55\u3092\u4e8b\u5b9f\u3068\u3057\u3066\u6271\u3046\u304b\u3001\u3069\u3053\u307e\u3067\u5f15\u304d\u53d7\u3051\u308b\u304b\u3092\u81ea\u5206\u3067\u9078\u3093\u3067\u304d\u307e\u3057\u305f\u3002"}</p>
          <p>{"\u7b54\u3048\u3092\u5f53\u3066\u305f\u306e\u3067\u306f\u306a\u304f\u3001\u8003\u3048\u3092\u6574\u7406\u3057\u3066\u884c\u52d5\u306b\u5909\u3048\u305f\u7d50\u679c\u304c\u3001\u3053\u306e\u0033\u0030\u65e5\u5f8c\u3067\u3059\u3002"}</p>
        </div>
        <div className="newlife30-world-state" aria-label={"\u0033\u0030\u65e5\u5f8c\u306b\u6b8b\u3063\u305f\u3082\u306e"}>
          <strong>{"\u0033\u0030\u65e5\u5f8c\u306b\u6b8b\u3063\u305f\u3082\u306e"}</strong>
          <span>{"\u55ab\u8336\u306e\u5e2d\uff1a"}{state.mSeats === "bounded" ? "\u4f7f\u3048\u308b\u7bc4\u56f2\u3092\u78ba\u8a8d\u3057\u305f" : "\u66d6\u6627\u3055\u304c\u6b8b\u3063\u305f"}</span>
          <span>{"\u4e8b\u5b9f\u78ba\u8a8d\uff1a"}{state.hyFactCheck === "direct" ? "\u672c\u4eba\u540c\u58eb\u3067\u76f4\u63a5\u78ba\u304b\u3081\u305f" : "\u76f4\u63a5\u7167\u5408\u3057\u306a\u3044\u307e\u307e\u9032\u3093\u3060"}</span>
          <span>{"\u4ed5\u4e8b\u306e\u5883\u754c\uff1a"}{state.jWork === "extra_with_specific_consent" ? "\u8ffd\u52a0\u5185\u5bb9\u3068\u6642\u9593\u3092\u5408\u610f\u3057\u305f" : state.jWork === "extra_declined" ? "\u8ffd\u52a0\u3092\u5f15\u304d\u53d7\u3051\u306a\u3044\u5224\u65ad\u3092\u5c0a\u91cd\u3057\u305f" : "\u6700\u521d\u306e\u4e8c\u6642\u9593\u3060\u3051\u304c\u5408\u610f\u6e08\u307f"}</span>
          <span>{"\u6700\u7d42\u78ba\u8a8d\uff1a"}{state.fEditor === "named" ? "\u62c5\u5f53\u8005\u3092\u6c7a\u3081\u305f" : "\u62c5\u5f53\u304c\u66d6\u6627\u306a\u307e\u307e\u6b8b\u3063\u305f"}</span>
        </div>
        <p className="newlife30-footer">{"\u3053\u3053\u307e\u3067\u306e\u9078\u629e\u3068\u4f1a\u8a71\u304c\u3001\u3042\u306a\u305f\u306e\u0033\u0030\u65e5\u3067\u3057\u305f\u3002\u6210\u529f\u30fb\u5931\u6557\u3067\u306f\u306a\u304f\u3001\u3042\u306a\u305f\u304c\u4f5c\u3063\u305f\u7d4c\u8def\u3067\u3059\u3002"}</p>
        <div className="newlife30-ending-actions">
          <button className="newlife30-advance" onClick={startFresh}>もう一度 Day 1 から始める</button>
          <button className="newlife30-exit" onClick={onExit}>
            {"\u30db\u30fc\u30e0\u3078\u623b\u308b"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="newlife30">
      <span className="newlife30-badge">NEW LIFE</span>
      {showIntro ? (
        <section className="newlife30-intro" aria-label={"\u30b2\u30fc\u30e0\u306e\u59cb\u3081\u65b9"}>
          <div className="newlife30-intro-hero">
            <img src={shoppingStreetArt} alt="これから30日を過ごす町" />
            <div className="newlife30-intro-hero-copy">
              <span className="newlife30-intro-kicker">30 DAYS LIFE SIMULATION</span>
              <strong>この町で、もう一度。</strong>
              <small>話す・手伝う・断る・何もしない。町は、あなたの選び方を覚えていきます。</small>
            </div>
          </div>
          <strong>{"\u3053\u306e\u753a\u306b\u8d8a\u3057\u3066\u304d\u3066\u300130\u65e5\u3002"}</strong>
          <p>{"6\u4eba\u306e\u96a3\u4eba\u3068\u4e00\u304b\u6708\u3092\u904e\u3054\u3057\u307e\u3059\u3002\u4f1a\u8a71\u3059\u308b\u3001\u624b\u4f1d\u3046\u3001\u65ad\u308b\u3001\u4f55\u3082\u3057\u306a\u3044\u3002\u3069\u3046\u904e\u3054\u3059\u304b\u306f\u81ea\u7531\u3067\u3059\u3002"}</p>
          <p>{"\u3042\u306a\u305f\u304c\u4f55\u3082\u3057\u306a\u304f\u3066\u3082\u3001\u753a\u306e\u4e2d\u3067\u51fa\u6765\u4e8b\u306f\u9032\u307f\u307e\u3059\u3002\u6b63\u89e3\u3092\u63a2\u3059\u5fc5\u8981\u306f\u3042\u308a\u307e\u305b\u3093\u3002"}</p>
          <small>{"\u666e\u901a\u306e\u8a00\u8449\u3067\u3001\u305d\u306e\u307e\u307e\u4eba\u7269\u306b\u8a71\u3057\u304b\u3051\u3066\u304f\u3060\u3055\u3044\u3002"}</small>
          <div className="newlife30-intro-cast" aria-label="この町の6人">
            {NPC_IDS.map((npc) => (
              <div key={npc} className="newlife30-intro-cast-person">
                <span className={"newlife30-intro-cast-avatar newlife30-character-" + npc}>
                  {NPC_ART[npc] ? <img src={NPC_ART[npc]} alt="" /> : npcDisplayName(npc).slice(0, 1)}
                </span>
                <span><strong>{npcDisplayName(npc)}</strong><small>{NPC_SHORT[npc]}</small></span>
              </div>
            ))}
          </div>
          <div className="newlife30-intro-actions">
            <button type="button" onClick={startFresh}>Day 1から始める</button>
            {savedSession && savedSession.state.day > 1 ? <button type="button" className="is-secondary" onClick={continueSaved}>Day {savedSession.state.day}から続ける</button> : null}
          </div>
        </section>
      ) : null}
      <header className="newlife30-statusbar">
        <div>
          <span className="newlife30-daylabel">{dayLabel(state)} ／ 全{TOTAL_DAYS}日</span>
          <strong>{sceneLocationFor(state.day)}</strong>
        </div>
        <div className="newlife30-status-progress">
          <div className="newlife30-progress" aria-label={"30日間の進行度"}><span style={{ width: Math.min(100, (state.day / TOTAL_DAYS) * 100) + "%" }} /></div>
          <small>{sceneMomentFor(state)} ・ 自動保存</small>
        </div>
      </header>
      <h1 className="newlife30-title">{scene.title}</h1>
      {previousDayTrace && state.day >= 2 ? (
        <div className="newlife30-yesterday" aria-label="&#x524D;&#x65E5;&#x306E;&#x3042;&#x306A;&#x305F;&#x306E;&#x884C;&#x52D5;">
          <span>&#x6628;&#x65E5;&#x306E;&#x3042;&#x306A;&#x305F;</span>
          <strong>{previousDayTrace}</strong>
          <small>&#x305D;&#x306E;&#x884C;&#x52D5;&#x3092;&#x899A;&#x3048;&#x305F;&#x307E;&#x307E;&#x3001;&#x4ECA;&#x65E5;&#x304C;&#x59CB;&#x307E;&#x308A;&#x307E;&#x3059;&#x3002;</small>
        </div>
      ) : null}
      {state.day >= 9 && state.day <= 24 ? (
        <div className="newlife30-world-state" aria-label="いま積み上がっていること">
          <strong>いま積み上がっていること</strong>
          <span>喫茶の席：{state.mSeats === "bounded" ? "使える範囲を確認した" : "まだ曖昧"}</span>
          <span>受け渡し：{state.pickupPlan === "time_split_owned_by_hina" ? "時間を分ける案が具体化した" : "担当がまだ決まっていない"}</span>
          {state.day >= 11 ? <span>掲示：{state.signVersion === "clear_from_start" ? "最初から内訳が明確" : state.signVersion === "vague_then_corrected" ? "途中で訂正された" : state.signVersion === "vague_uncorrected" ? "内訳が曖昧なまま" : "まだ掲示前"}</span> : null}
          {state.day >= 13 ? <span>伝え方：{state.playerReport === "reliable" ? "事実の範囲を保っている" : "話を盛った内容が残っている"}</span> : null}
          {state.day >= 14 ? <span>陽菜と洋平：{state.hyFactCheck === "direct" ? "二人で直接確かめた" : "まだ直接照合していない"}</span> : null}
          {state.day >= 16 ? <span>仁への追加依頼：{state.jWork === "extra_with_specific_consent" ? "内容と時間を決めて合意した" : state.jWork === "extra_declined" ? "追加は引き受けないことになった" : "最初の二時間だけ合意済み"}</span> : null}
          {state.day >= 17 ? <span>&#x5927;&#x8F14;&#x306E;&#x5DE5;&#x623F;&#xFF1A;{state.dWorkshop === "one_hour_yes" ? "1\u6642\u9593\u306a\u3089\u4f7f\u3048\u308b" : "\u8fd4\u4e8b\u306f\u307e\u3060\u4fdd\u7559"}</span> : null}
          {state.day >= 19 ? <span>&#x6587;&#x5B50;&#x306E;&#x7DE8;&#x96C6;&#xFF1A;{state.fEditor === "named" ? "\u6700\u7d42\u78ba\u8a8d\u306e\u62c5\u5f53\u304c\u6c7a\u307e\u3063\u305f" : "\u6700\u7d42\u78ba\u8a8d\u306e\u62c5\u5f53\u304c\u66d6\u6627"}</span> : null}
          {state.day >= 21 ? <span>&#x967D;&#x83DC;&#x3078;&#x306E;&#x95A2;&#x308F;&#x308A;&#xFF1A;{state.encouragementOnly ? "\u5fdc\u63f4\u3060\u3051\u3092\u6e21\u3057\u305f" : "\u672c\u4eba\u306e\u5224\u65ad\u3092\u5f85\u3063\u3066\u3044\u308b"}</span> : null}
          {state.day >= 24 ? <span>&#x5171;&#x540C;&#x6848;&#x306E;&#x6E96;&#x5099;&#xFF1A;{state.pickupPlan === "time_split_owned_by_hina" && state.fEditor === "named" && state.jWork !== "extra_declined" && state.mSeats === "bounded" && state.hyFactCheck === "direct" && state.signVersion !== "vague_uncorrected" ? "\u5f79\u5272\u3068\u6761\u4ef6\u304c\u5177\u4f53\u5316\u3057\u3066\u3044\u308b" : "\u307e\u3060\u57cb\u307e\u3063\u3066\u3044\u306a\u3044\u5f79\u5272\u3084\u6761\u4ef6\u304c\u3042\u308b"}</span> : null}
        </div>
      ) : null}
      <div className="newlife30-cast" aria-label={"\u3053\u306e\u5834\u306b\u3044\u308b\u4eba\u7269"}>
        {scene.npcsPresent.map((npc) => (
          <button type="button" key={npc} className={`newlife30-character ${addressee === npc ? "is-active" : ""}`} onClick={() => setAddressee(npc)} aria-pressed={addressee === npc}>
            <span className={`newlife30-character-avatar newlife30-character-${npc}`} aria-hidden="true">{NPC_ART[npc] ? <img src={NPC_ART[npc]} alt="" /> : npcDisplayName(npc).slice(0, 1)}</span>
            <span>{npcDisplayName(npc)}</span>
          </button>
        ))}
      </div>
      <div className="newlife30-stage">
        <div className="newlife30-scene-art">
          <img src={sceneArtFor(state.day)} alt={sceneLocationFor(state.day) + "の場面"} />
          <div className="newlife30-scene-art-meta">
            <span>{sceneMomentFor(state)}</span>
            <strong>{sceneLocationFor(state.day)}</strong>
          </div>
        </div>
        <aside className="newlife30-focus-card" aria-label="いま話している相手">
          <span className="newlife30-focus-kicker">いま話している相手</span>
          <div className="newlife30-focus-person">
            <span className={"newlife30-focus-avatar newlife30-character-" + addressee} aria-hidden="true">
              {NPC_ART[addressee] ? <img src={NPC_ART[addressee]} alt="" /> : npcDisplayName(addressee).slice(0, 1)}
            </span>
            <div>
              <strong>{npcDisplayName(addressee)}</strong>
              <small>{NPC_ROLE[addressee]}</small>
            </div>
          </div>
          <p>人物を選び直しても、直近の会話と今日の状況を引き継いで話します。</p>
        </aside>
      </div>
      {scene.sceneFocus ? (
        <section className="newlife30-situation-guide" aria-label="いまの状況">
          <strong>いま何が問題？</strong>
          <span>{scene.sceneFocus.issue}</span>
          <strong>今ここで決めたいこと</strong>
          <span>{scene.sceneFocus.decision}</span>
          <strong>誰が決める？</strong>
          <span>{scene.sceneFocus.authority}</span>
        </section>
      ) : null}

      <div className="newlife30-scene">
        {scene.text}
      </div>

      <div className="newlife30-primary-guide">
        <strong>あなたなら、どうする？</strong>
        <span>下の入力欄から自由に話してください。決めにくい時だけ候補や「思考を整理する」を使えます。</span>
      </div>

      {actionNotice ? <div className="newlife30-action-notice" role="status">{actionNotice}</div> : null}

      <details className="newlife30-options" ref={optionDetailsRef}>
        <summary>迷ったときの行動候補</summary>
        <div className="newlife30-option-list">
          {scene.options.map((o) => (
            <button key={o.id} onClick={() => handleOption(o.id)} disabled={pending}>
              {o.label}
            </button>
          ))}
        </div>
      </details>

      <div className="newlife30-conversation-heading">
        <span>会話</span>
        <small>{scene.npcsPresent.map((npc) => npcDisplayName(npc)).join("・")} がこの場にいます</small>
      </div>
      <div className="newlife30-transcript" aria-live="polite">
        {transcript.length === 0 ? <p className="newlife30-transcript-empty">まだ会話はありません。人物を選んで、普通の言葉で話しかけてください。</p> : null}
        {transcript.map((line, i) => {
          const lineNpc = speakerNpc(line.speaker);
          const isPlayer = line.speaker === "あなた";
          const isSystem = line.speaker === "システム";
          return (
            <div className={"newlife30-line " + (isPlayer ? "is-player" : isSystem ? "is-system" : "is-npc")} key={i}>
              {!isPlayer && !isSystem ? <span className={"newlife30-line-avatar newlife30-character-" + lineNpc} aria-hidden="true">
                {lineNpc && NPC_ART[lineNpc] ? <img src={NPC_ART[lineNpc]} alt="" /> : line.speaker.slice(0, 1)}
              </span> : null}
              <div className="newlife30-bubble">
                <strong>{line.speaker}</strong>
                <span>{line.text}</span>
              </div>
            </div>
          );
        })}
        <div ref={transcriptEndRef} aria-hidden="true" />
      </div>

      {showConsentPrompt ? (
        <NewLifeAiConsentPrompt onAccept={handleConsentAccept} onDecline={handleConsentDecline} />
      ) : null}

      <form className="newlife30-freetalk" onSubmit={handleAskSubmit}>
        <div className="newlife30-freetalk-row">
          <select value={addressee} onChange={(e) => setAddressee(e.target.value as NpcId)} disabled={pending}>
            {npcsForSelect.map((npc) => (
              <option key={npc} value={npc}>
                {npcDisplayName(npc)}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="自由に話しかける（例：何を売ってるの？）"
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            disabled={pending}
          />
          <button type="submit" disabled={pending}>
            話す
          </button>
        </div>
        {pending ? <p className="newlife30-pending"><span className="newlife30-thinking-dot" aria-hidden="true" />考え中…</p> : null}
      </form>

      <section className="newlife30-thinking">
        <button type="button" className="newlife30-thinking-toggle" onClick={() => setThinkingOpen((v) => !v)}>
          {thinkingOpen ? "思考整理を閉じる" : "思考を整理する"}
        </button>
        {thinkingOpen ? (
          <div className="newlife30-thinking-body">
            <p>正解を出す場所ではありません。いま考えていることを、次の行動まで小さくします。</p>
            <label>いま大事にしたいこと
              <textarea value={thinking.important} onChange={(e) => setThinking((v) => ({ ...v, important: e.target.value }))} />
            </label>
            <label>まだ分からないこと
              <textarea value={thinking.unknown} onChange={(e) => setThinking((v) => ({ ...v, unknown: e.target.value }))} />
            </label>
            <label>次に一つだけやること
              <textarea value={thinking.next} onChange={(e) => setThinking((v) => ({ ...v, next: e.target.value }))} />
            </label>
            <button type="button" onClick={() => {
              const next = thinking.next.trim();
              if (!next) {
                setThinkingNote("次の一歩を一つ書いてください。");
                return;
              }
              setThinkingNote("次の一歩：" + next);
              setFreeText(next);
              setThinkingOpen(false);
            }}>この一歩をゲームで試す</button>
            {thinkingNote ? <p className="newlife30-thinking-note" aria-live="polite">{thinkingNote}</p> : null}
          </div>
        ) : null}
      </section>

      <button className="newlife30-advance" onClick={handleAdvance}>
        {day11NeedsSecondMove ? "この日を終える" : "次の日へ"}
      </button>

      <button className="newlife30-exit" onClick={onExit}>
        ホームへ戻る
      </button>
    </div>
  );
}
