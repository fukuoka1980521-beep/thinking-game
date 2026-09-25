/**
 * NEW LIFE refoundation — minimal vertical-slice UI (V11 order, stage 7 of 8;
 * free-conversation path upgraded per V37 GENERATIVE CHARACTER REASONING).
 *
 * ISOLATED FEATURE SLICE: reachable only via `?newlife-refoundation=1`
 * (see `App.tsx`), following the exact same pattern as the existing
 * `?newlife30=1` slice (`NewLife30App.tsx`) — not linked from `HomeScreen`
 * or any other screen. Legacy public NEW LIFE (`src/newlife/state.ts`,
 * `src/newlife/npcVoice.ts`, `NewLife30App.tsx`) is untouched; this
 * component imports nothing from them.
 *
 * Wires together the already-validated deterministic modules
 * (`types`/`relationshipReducer`/`ending`/`timeEconomy`/`thoughtTools`) with
 * the two V37 generative-reasoning modules (`converse`/`thoughtOrganizer`)
 * into one playable loop for the vertical slice case
 * (`V3_OPENING_COMMUNITY_THEATER_CONFLICT_V1.md`). Free text goes straight to
 * `converseTurn` (V37 §4) — one call that understands the raw utterance in
 * context and answers as the character, rather than the earlier two-call
 * "classify with `interpretTurn`, then render with `generateNpcLine`"
 * sequence (`semanticInterpreter.ts`/`npcGeneration.ts` remain for
 * compatibility/testing only, V37 §7). Button/tool actions stay
 * deterministic and still use `generateNpcLine` for their NPC line, per V37
 * §4's "existing button actions may remain deterministic."
 *
 * With no live provider configured (`NullConversationAdapter`/
 * `NullNpcGenerationAdapter`/`NullThoughtOrganizerAdapter`, the only
 * implementations that exist absent a deployed backend), free-text input
 * resolves to the conservative CLARIFY fallback and NPC lines are the
 * deterministic per-relationship-state fallback line — disclosed on-screen,
 * not hidden.
 *
 * HUMAN_VALIDATION_STATUS = PENDING, same as `NewLife30App.tsx`'s own
 * disclosure for its slice. This is not a claim of human playtest
 * validation.
 *
 * LIVE PROVIDER (still undeployed): when `NEWLIFE_REFOUNDATION_AI_ENDPOINT_URL`
 * (`config.ts`) is non-empty AND the player has explicitly accepted the
 * refoundation-scoped consent prompt (`consent.ts`, a separate opt-in from
 * both CASE1's and legacy NEW LIFE's own consent keys, per
 * `docs/DATA_BOUNDARY.md`'s "each purpose needs its own opt-in"), this
 * component switches from the `Null*` adapters to `HttpConversationAdapter`/
 * `HttpNpcGenerationAdapter`/`HttpThoughtOrganizerAdapter` (`httpAdapters.ts`),
 * which call `functions/newlife-refoundation-ai/`. With the shipped-empty
 * endpoint constant, or without consent, behavior is unchanged: `Null*`
 * adapters, no network call, no consent prompt ever shown. There is no third
 * state that looks like a live AI response but isn't — every non-`"ok"`
 * adapter outcome still resolves through the same conservative fallback
 * path (`converseTurn`/`generateNpcLine`/`organizeThought`) as the `Null*`
 * adapters always used.
 */
import { useMemo, useState } from "react";
import {
  createInitialRelationshipRecord,
  applyRelationalTurn,
} from "./relationshipReducer";
import {
  createInitialCaseEndingState,
  applyEndingTurn,
  deriveEndingBoundary,
  deriveEndingVector,
  type CaseEndingState,
  type EndingVector,
} from "./ending";
import {
  TIME_COSTS,
  VERTICAL_SLICE_CASE_001_TOTAL_MINUTES,
  createWorldClock,
  remainingMinutes,
  spendTime,
  type WorldClock,
} from "./timeEconomy";
import { NullNpcGenerationAdapter, generateNpcLine, type NpcGenerationAdapter } from "./npcGeneration";
import {
  NullConversationAdapter,
  converseTurn,
  type ConversationAdapter,
  type RawDialogueLine,
} from "./converse";
import {
  NullThoughtOrganizerAdapter,
  organizeThought,
  type ThoughtOrganizerAdapter,
  type ThoughtOrganizerResult,
} from "./thoughtOrganizer";
import { HttpNpcGenerationAdapter, HttpConversationAdapter, HttpThoughtOrganizerAdapter } from "./httpAdapters";
import { NEWLIFE_REFOUNDATION_AI_ENDPOINT_URL } from "./config";
import {
  getRefoundationAiDialogueConsent,
  setRefoundationAiDialogueConsent,
  type RefoundationAiDialogueConsentStatus,
} from "./consent";
import { useBoundaryCheckTool } from "./thoughtTools";
import { SpeakerPresence } from "./SpeakerPresence";
import type { ActionType, BoundaryMode, NpcRelationshipRecord, RelationalEvent, RelationshipState } from "./types";

interface Props {
  onExit: () => void;
}

const LIVE_PROVIDER_CONFIGURED = NEWLIFE_REFOUNDATION_AI_ENDPOINT_URL.length > 0;

type Phase = "PURPOSE" | "CONSENT" | "PLAY";
type SpeakerId = "SYSTEM" | "PLAYER" | "MIKA" | "RYO";
type TargetNpc = "MIKA" | "RYO";

interface TranscriptLine {
  speaker: SpeakerId;
  text: string;
}

interface GameState {
  clock: WorldClock;
  mika: NpcRelationshipRecord;
  ryo: NpcRelationshipRecord;
  ending: CaseEndingState;
  transcript: TranscriptLine[];
  turnCounter: number;
}

function createInitialGameState(): GameState {
  return {
    clock: createWorldClock(VERTICAL_SLICE_CASE_001_TOTAL_MINUTES),
    mika: createInitialRelationshipRecord(),
    ryo: createInitialRelationshipRecord(),
    ending: createInitialCaseEndingState(),
    turnCounter: 0,
    transcript: [
      {
        speaker: "SYSTEM",
        text: "16:40。市民ホールの小劇場。明日の公演に向けた通し稽古が止まっている。",
      },
      { speaker: "MIKA", text: "この場面、明日はやりません。ここを変えないなら、私は出ません。" },
      { speaker: "RYO", text: "昨日まではやってただろ。今ここで変えたら、全員の段取りが崩れる。" },
      { speaker: "SYSTEM", text: "明日の初回公演は18時。チケットはすでに販売済み。17:30までに決める必要がある。" },
    ],
  };
}

/** Neutral, non-literal-label display phrase for a relationship state (requirement: never surface the raw ontology label). */
const RELATIONSHIP_DISPLAY: Readonly<Record<RelationshipState, string>> = {
  OPEN: "話しやすい様子",
  NEUTRAL: "落ち着いている様子",
  GUARDED: "慎重になっている様子",
  WITHDRAWN: "これ以上話す様子がない",
};

interface ActionButton {
  label: string;
  npcTarget: TargetNpc | null;
  action: ActionType;
  boundaryMode: BoundaryMode;
  relationalEvents?: RelationalEvent[];
  costMinutes: number;
}

const OPENING_ACTIONS: ActionButton[] = [
  {
    label: "美香に何が変わったのか尋ねる",
    npcTarget: "MIKA",
    action: "ASK_FACT",
    boundaryMode: "NOT_RELEVANT",
    costMinutes: TIME_COSTS.OPEN_EXPLORATORY_QUESTION,
  },
  {
    label: "亮に、変えたら何が崩れるのか尋ねる",
    npcTarget: "RYO",
    action: "ASK_FACT",
    boundaryMode: "NOT_RELEVANT",
    costMinutes: TIME_COSTS.OPEN_EXPLORATORY_QUESTION,
  },
  {
    label: "美香と個別に話す",
    npcTarget: "MIKA",
    action: "MOVE_PRIVATE",
    boundaryMode: "NOT_RELEVANT",
    costMinutes: TIME_COSTS.MOVE_CONVERSATION_PRIVATE,
  },
];

const RESOLUTION_ACTIONS: ActionButton[] = [
  {
    label: "その場面をカットして進める",
    npcTarget: null,
    action: "CUT_SCENE",
    boundaryMode: "AVOID",
    costMinutes: TIME_COSTS.CUT_SCENE_OR_BRIDGE_TRANSITIONS,
  },
  {
    label: "代役を立てる",
    npcTarget: null,
    action: "USE_UNDERSTUDY",
    boundaryMode: "AVOID",
    costMinutes: TIME_COSTS.UNDERSTUDY,
  },
];

const nullNpcAdapter = new NullNpcGenerationAdapter();
const nullConversationAdapter = new NullConversationAdapter();
const nullThoughtOrganizerAdapter = new NullThoughtOrganizerAdapter();
// Constructed unconditionally (cheap: just stores a URL string) but only
// ever invoked when LIVE_PROVIDER_CONFIGURED and consent is "accepted" —
// see resolveAdapters() below. With the shipped-empty endpoint constant
// these behave identically to the Null adapters (each Http*Adapter's own
// empty-endpoint check returns "unavailable" without a network call).
const httpNpcAdapter = new HttpNpcGenerationAdapter(NEWLIFE_REFOUNDATION_AI_ENDPOINT_URL);
const httpConversationAdapter = new HttpConversationAdapter(NEWLIFE_REFOUNDATION_AI_ENDPOINT_URL);
const httpThoughtOrganizerAdapter = new HttpThoughtOrganizerAdapter(NEWLIFE_REFOUNDATION_AI_ENDPOINT_URL);

/**
 * No silent fallback masquerading as AI success: the live adapters are only
 * ever selected when both the endpoint is configured AND the player has
 * explicitly accepted this feature's own consent prompt. Any other state
 * (declined, not yet asked, or no endpoint at all) uses the same `Null*`
 * adapters this component always used, which `converseTurn`/
 * `generateNpcLine`/`organizeThought` route through the identical
 * conservative-fallback path.
 */
function resolveAdapters(consent: RefoundationAiDialogueConsentStatus | null): {
  npc: NpcGenerationAdapter;
  conversation: ConversationAdapter;
  thoughtOrganizer: ThoughtOrganizerAdapter;
} {
  if (LIVE_PROVIDER_CONFIGURED && consent === "accepted") {
    return { npc: httpNpcAdapter, conversation: httpConversationAdapter, thoughtOrganizer: httpThoughtOrganizerAdapter };
  }
  return { npc: nullNpcAdapter, conversation: nullConversationAdapter, thoughtOrganizer: nullThoughtOrganizerAdapter };
}

/** V37 §1/§4: bounded, raw (not restructured) recent-dialogue window sent to `converseTurn`/`organizeThought`. `SpeakerId` and `RawDialogueLine`'s `DialogueSpeaker` share the exact same literal members, so no runtime mapping is needed. */
const RECENT_DIALOGUE_WINDOW = 8;
function toRecentDialogue(transcript: TranscriptLine[]): RawDialogueLine[] {
  return transcript.slice(-RECENT_DIALOGUE_WINDOW).map((line) => ({ speaker: line.speaker, text: line.text }));
}

function speakerLabel(speaker: SpeakerId): string {
  switch (speaker) {
    case "SYSTEM":
      return "";
    case "PLAYER":
      return "あなた: ";
    case "MIKA":
      return "美香: ";
    case "RYO":
      return "亮: ";
  }
}

export function RefoundationApp({ onExit }: Props) {
  const [phase, setPhase] = useState<Phase>("PURPOSE");
  const [state, setState] = useState<GameState>(createInitialGameState);
  const [freeText, setFreeText] = useState("");
  const [freeTextTarget, setFreeTextTarget] = useState<TargetNpc | null>(null);
  const [pending, setPending] = useState(false);
  const [thoughtPanel, setThoughtPanel] = useState<ThoughtOrganizerResult | null>(null);
  const [thoughtPending, setThoughtPending] = useState(false);
  const [consent, setConsent] = useState<RefoundationAiDialogueConsentStatus | null>(() =>
    LIVE_PROVIDER_CONFIGURED ? getRefoundationAiDialogueConsent() : "declined",
  );
  const adapters = useMemo(() => resolveAdapters(consent), [consent]);

  function beginPlay() {
    setPhase(LIVE_PROVIDER_CONFIGURED && consent === null ? "CONSENT" : "PLAY");
  }

  function respondToConsent(status: RefoundationAiDialogueConsentStatus) {
    setRefoundationAiDialogueConsent(status);
    setConsent(status);
    setPhase("PLAY");
  }

  const ended = remainingMinutes(state.clock) <= 0 || state.ending.taskLedger.commitment !== null;
  const hasHadConsequence =
    state.clock.elapsedMinutes > 0 ||
    state.ending.boundaryEstablished ||
    state.ending.taskLedger.commitment !== null ||
    state.mika.causalEventHistory.length > 0 ||
    state.ryo.causalEventHistory.length > 0;

  const endingVector: EndingVector | null = useMemo(() => {
    if (!ended) return null;
    return deriveEndingVector({
      state: state.ending,
      requiredRelationshipStates: [state.mika.relationshipState, state.ryo.relationshipState],
      trust: state.mika.relationshipState,
      clock: state.clock,
    });
  }, [ended, state]);

  const latestNpcTurn = useMemo(() => {
    for (let index = state.transcript.length - 1; index >= 0; index -= 1) {
      const line = state.transcript[index];
      if (line.speaker === "MIKA" || line.speaker === "RYO") {
        return { line, index };
      }
    }
    return null;
  }, [state.transcript]);

  async function runTurn(
    target: TargetNpc | null,
    turn: { action: ActionType; boundaryMode: BoundaryMode; relationalEvents?: RelationalEvent[] },
    costMinutes: number,
    playerLabel: string,
    /** V37 §4: when supplied (from `converseTurn`), skip the separate `generateNpcLine` call — one richer call replaces the old two-call sequence. */
    precomputedNpcLine?: string,
  ) {
    if (ended || pending) return;
    setPending(true);
    const turnRef = `t${state.turnCounter + 1}`;
    const relationalEvents = turn.relationalEvents ?? [];

    const nextClock = spendTime(state.clock, costMinutes);
    const nextEnding = applyEndingTurn(state.ending, {
      turnRef,
      action: turn.action,
      boundaryMode: turn.boundaryMode,
    });
    const nextMika =
      target === "MIKA" ? applyRelationalTurn(state.mika, { turnRef, events: relationalEvents, boundaryMode: turn.boundaryMode }) : state.mika;
    const nextRyo =
      target === "RYO" ? applyRelationalTurn(state.ryo, { turnRef, events: relationalEvents, boundaryMode: turn.boundaryMode }) : state.ryo;

    const npcLineText =
      target === null
        ? null
        : precomputedNpcLine !== undefined
          ? precomputedNpcLine
          : (
              await generateNpcLine(adapters.npc, {
                npc: target,
                relationshipState: target === "MIKA" ? nextMika.relationshipState : nextRyo.relationshipState,
                boundaryStatus: deriveEndingBoundary(nextEnding),
                lastPlayerTurn: { action: turn.action, boundaryMode: turn.boundaryMode, relationalEvents },
                sceneContext: "16:40, rehearsal stopped, the disputed scene",
              })
            ).text;

    setState((prev) => ({
      clock: nextClock,
      ending: nextEnding,
      mika: nextMika,
      ryo: nextRyo,
      turnCounter: prev.turnCounter + 1,
      transcript: [
        ...prev.transcript,
        { speaker: "PLAYER", text: playerLabel },
        ...(npcLineText !== null ? [{ speaker: target as SpeakerId, text: npcLineText }] : []),
      ],
    }));
    setPending(false);
  }

  async function handleActionButton(btn: ActionButton) {
    await runTurn(btn.npcTarget, { action: btn.action, boundaryMode: btn.boundaryMode, relationalEvents: btn.relationalEvents }, btn.costMinutes, btn.label);
  }

  async function handleBoundaryCheckTool() {
    const tool = useBoundaryCheckTool();
    await runTurn("MIKA", tool.turn, tool.costMinutes, "（道具）どこまでなら大丈夫か、構造化して尋ねる");
  }

  /**
   * V37 §4. ONE `converseTurn` call replaces the old
   * `interpretTurn` → `generateNpcLine` two-call sequence: the raw
   * utterance + bounded recent dialogue + dynamic state go straight to the
   * model, which understands the player's actual meaning and answers as the
   * character in the same call that proposes a `candidateTurn`. Only the
   * validated (or safely-fallback) `candidateTurn` is applied to state, via
   * the same deterministic reducers every other action already uses.
   */
  async function handleFreeText() {
    if (!freeText.trim() || freeTextTarget === null || ended || pending) return;
    setPending(true);
    const text = freeText;
    const target = freeTextTarget;
    setFreeText("");

    const targetRecord = target === "MIKA" ? state.mika : state.ryo;
    const commitment = state.ending.taskLedger.commitment;
    const result = await converseTurn(adapters.conversation, {
      caseId: "COMMUNITY_THEATER_V1",
      targetNpc: target,
      rawPlayerUtterance: text,
      recentDialogue: toRecentDialogue(state.transcript),
      dynamicState: {
        relationshipState: targetRecord.relationshipState,
        boundaryStatus: deriveEndingBoundary(state.ending),
        remainingMinutes: remainingMinutes(state.clock),
        activeCommitment: commitment ? `${commitment.action} (${commitment.boundaryMode})` : null,
      },
    });

    setPending(false);
    await runTurn(target, result.candidateTurn, TIME_COSTS.CLARIFY, text, result.npcLine);

    if (result.status === "fallback") {
      setState((prev) => ({
        ...prev,
        transcript: [
          ...prev.transcript,
          {
            speaker: "SYSTEM",
            text: LIVE_PROVIDER_CONFIGURED
              ? "（AIとの会話を取得できなかったため、安全な確認扱いで進めました。NPCの返答は現在の状態に基づく安全なフォールバックです。）"
              : "（このビルドにはまだAIアダプタが接続されていません。自由入力は安全な確認扱いで進み、選んだ相手が状態に応じて応答します。）",
          },
        ],
      }));
    }
  }

  /**
   * V37 §5. A separate operation from `converseTurn`: never speaks as Mika
   * or Ryo, never applies anything to state. `worldFacts`/`currentProblem`
   * are opaque summaries built from already-validated client state, not new
   * facts — mirrors the static "思考ボード" section's own content so the two
   * panels never contradict each other.
   */
  async function handleOrganizeThought() {
    if (thoughtPending) return;
    setThoughtPending(true);
    const commitment = state.ending.taskLedger.commitment;
    const worldFacts = [
      "明日18:00が初回公演。チケットは販売済み。17:30までに今日の対応方針を決める必要がある。",
      state.ending.boundaryEstablished ? "美香には譲れない一線があることがすでに明らかになっている。" : "美香の一線はまだ明らかになっていない。",
      commitment ? `対応方針はすでに決まった（${commitment.action}）。` : "対応方針はまだ決まっていない。",
    ].join(" ");
    const result = await organizeThought(adapters.thoughtOrganizer, {
      validatedWorldFacts: worldFacts,
      recentDialogue: toRecentDialogue(state.transcript),
      currentProblem: "この場面をどう扱うか、明日の公演を予定通り進めるかを17:30までに決める必要がある。",
    });
    setThoughtPanel(result);
    setThoughtPending(false);
  }

  if (phase === "PURPOSE") {
    return (
      <div style={{ maxWidth: 640, margin: "40px auto", padding: 24, fontFamily: "sans-serif", lineHeight: 1.7 }}>
        <h1 style={{ fontSize: 20 }}>NEW LIFE — 空き稽古場の50分（試作）</h1>
        <ul>
          <li>NPCが抱えている問題を理解する。</li>
          <li>目の前の状況を動かす。</li>
          <li>必要なら、考えを整理する道具を使う。</li>
          <li>どう対応するかによって、結果は変わる。</li>
        </ul>
        <p style={{ fontSize: 13, color: "#555" }}>
          正解や教訓は用意されていません。（HUMAN_VALIDATION_STATUS = PENDING — このスライスはまだ人による検証を受けていません。）
        </p>
        <button onClick={beginPlay}>はじめる</button>{" "}
        <button onClick={onExit}>戻る</button>
      </div>
    );
  }

  if (phase === "CONSENT") {
    return (
      <div style={{ maxWidth: 640, margin: "40px auto", padding: 24, fontFamily: "sans-serif", lineHeight: 1.7 }}>
        <h1 style={{ fontSize: 20 }}>AIによる会話について</h1>
        <p style={{ fontSize: 14 }}>
          このビルドでは、NPCとの自由な会話とセリフ生成に外部のAIモデル（Vertex AI Gemini）を使うことができます。
          あなたが自由入力欄に書いた内容と直近の会話のやり取りは、その場面の登場人物として応答するためだけにサーバーへ送られます。ゲームの状態そのものはこの端末側の確定的な仕組みが管理し、
          AIの応答が直接ゲーム状態を書き換えることはありません。
        </p>
        <p style={{ fontSize: 13, color: "#555" }}>
          同意しない場合も、あらかじめ用意された選択肢と道具でこのケースを最後まで進められます。
        </p>
        <button onClick={() => respondToConsent("accepted")}>同意してAIを使う</button>{" "}
        <button onClick={() => respondToConsent("declined")}>同意しない（選択肢のみで進める）</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: "24px auto", padding: 16, fontFamily: "sans-serif", lineHeight: 1.6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#555" }}>
        <span>残り時間: {remainingMinutes(state.clock)} 分（17:30 決定期限）</span>
        <button onClick={onExit}>終了</button>
      </div>

      <SpeakerPresence
        activeSpeaker={
          latestNpcTurn?.line.speaker === "MIKA" || latestNpcTurn?.line.speaker === "RYO"
            ? latestNpcTurn.line.speaker
            : null
        }
        activeText={latestNpcTurn?.line.text ?? null}
        pending={pending}
      />

      <div style={{ border: "1px solid #ccc", borderRadius: 6, padding: 12, margin: "12px 0", maxHeight: 320, overflowY: "auto" }}>
        {state.transcript.map((line, i) =>
          i === latestNpcTurn?.index ? null : (
            <p key={i} style={{ margin: "4px 0" }}>
              <strong>{speakerLabel(line.speaker)}</strong>
              {line.text}
            </p>
          ),
        )}
      </div>

      <div style={{ fontSize: 13, color: "#555", marginBottom: 8 }}>
        美香は{RELATIONSHIP_DISPLAY[state.mika.relationshipState]}。亮は{RELATIONSHIP_DISPLAY[state.ryo.relationshipState]}。
      </div>

      {!ended && (
        <>
          <div
            aria-label="自由会話"
            style={{
              marginBottom: 12,
              padding: 10,
              border: "1px solid #bbb",
              borderRadius: 8,
              background: "#fafafa",
            }}
          >
            <div style={{ fontSize: 13, marginBottom: 6 }}>
              <strong>誰に話す？</strong>{" "}
              <button
                type="button"
                aria-pressed={freeTextTarget === "MIKA"}
                onClick={() => setFreeTextTarget("MIKA")}
                disabled={pending}
                style={{
                  margin: "2px",
                  fontWeight: freeTextTarget === "MIKA" ? 700 : 400,
                  border: freeTextTarget === "MIKA" ? "2px solid #444" : "1px solid #aaa",
                }}
              >
                美香に話す
              </button>
              <button
                type="button"
                aria-pressed={freeTextTarget === "RYO"}
                onClick={() => setFreeTextTarget("RYO")}
                disabled={pending}
                style={{
                  margin: "2px",
                  fontWeight: freeTextTarget === "RYO" ? 700 : 400,
                  border: freeTextTarget === "RYO" ? "2px solid #444" : "1px solid #aaa",
                }}
              >
                亮に話す
              </button>
            </div>
            <div>
              <input
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                placeholder={
                  freeTextTarget === null
                    ? "先に話す相手を選んでください"
                    : LIVE_PROVIDER_CONFIGURED && consent === "accepted"
                      ? `${freeTextTarget === "MIKA" ? "美香" : "亮"}に自由に話す`
                      : `${freeTextTarget === "MIKA" ? "美香" : "亮"}に自由に話す（AI未接続時は安全な応答）`
                }
                aria-label="自由入力"
                style={{ width: "70%" }}
                disabled={pending}
              />{" "}
              <button
                onClick={handleFreeText}
                disabled={pending || freeTextTarget === null || !freeText.trim()}
              >
                送る
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 8 }}>
            {OPENING_ACTIONS.map((btn) => (
              <button key={btn.label} onClick={() => handleActionButton(btn)} disabled={pending} style={{ margin: "2px" }}>
                {btn.label}
              </button>
            ))}
            <button onClick={handleBoundaryCheckTool} disabled={pending} style={{ margin: "2px" }}>
              （道具）どこまでなら大丈夫か構造化して尋ねる
            </button>
          </div>

          <div>
            {RESOLUTION_ACTIONS.map((btn) => (
              <button key={btn.label} onClick={() => handleActionButton(btn)} disabled={pending} style={{ margin: "2px" }}>
                {btn.label}
              </button>
            ))}
            {hasHadConsequence && (
              <button onClick={handleOrganizeThought} disabled={thoughtPending} style={{ margin: "2px" }}>
                考えを整理する
              </button>
            )}
          </div>
        </>
      )}

      {thoughtPanel && (
        <div
          aria-label="思考整理"
          style={{ marginTop: 12, border: "1px dashed #4a7", borderRadius: 6, padding: 12, background: "#f3fbf3" }}
        >
          <h3 style={{ fontSize: 13, margin: "0 0 6px" }}>思考整理（キャラクターの発言ではありません）</h3>
          {thoughtPanel.known.length > 0 && (
            <p style={{ fontSize: 13 }}>
              <strong>わかっている:</strong> {thoughtPanel.known.join(" / ")}
            </p>
          )}
          {thoughtPanel.possible.length > 0 && (
            <p style={{ fontSize: 13 }}>
              <strong>そうかもしれない:</strong> {thoughtPanel.possible.join(" / ")}
            </p>
          )}
          {thoughtPanel.unknown.length > 0 && (
            <p style={{ fontSize: 13 }}>
              <strong>まだわからない:</strong> {thoughtPanel.unknown.join(" / ")}
            </p>
          )}
          {thoughtPanel.options.length > 0 && (
            <p style={{ fontSize: 13 }}>
              <strong>選択肢:</strong> {thoughtPanel.options.join(" / ")}
            </p>
          )}
          {thoughtPanel.nextCheck && (
            <p style={{ fontSize: 13 }}>
              <strong>次に確かめること:</strong> {thoughtPanel.nextCheck}
            </p>
          )}
        </div>
      )}

      {hasHadConsequence && (
        <div style={{ marginTop: 16, border: "1px dashed #999", borderRadius: 6, padding: 12 }}>
          <h3 style={{ fontSize: 14, margin: "0 0 6px" }}>思考ボード</h3>
          <p style={{ fontSize: 13 }}>
            <strong>わかっている:</strong> 明日18時が本番。チケットは販売済み。17:30までに決める必要がある。
            {state.ending.boundaryEstablished && " 美香には譲れない一線がある。"}
            {state.ending.taskLedger.commitment && " 対応方針はすでに決まった。"}
          </p>
          <p style={{ fontSize: 13 }}>
            <strong>そうかもしれない:</strong> 亮は美香の理由を知らないまま話している可能性がある。
          </p>
          <p style={{ fontSize: 13 }}>
            <strong>まだわからない:</strong> 美香が本当に嫌がっている部分はどこか。
          </p>
        </div>
      )}

      {ended && endingVector && (
        <div style={{ marginTop: 16, border: "2px solid #333", borderRadius: 6, padding: 12 }}>
          <h3 style={{ fontSize: 14, margin: "0 0 6px" }}>結果（優劣はありません）</h3>
          <ul style={{ fontSize: 13 }}>
            <li>公演: {endingVector.show === "PROCEEDS" ? "予定どおり進行" : "成立しなかった"}</li>
            <li>
              美香の境界:{" "}
              {endingVector.boundary === "RESPECTED"
                ? "尊重された"
                : endingVector.boundary === "OVERRIDDEN"
                  ? "越えられた"
                  : endingVector.boundary === "STATED"
                    ? "示されたが未決着"
                    : "明らかにならなかった"}
            </li>
            <li>美香との関係: {RELATIONSHIP_DISPLAY[endingVector.trust]}</li>
            <li>残り時間: {endingVector.timeLeft} 分</li>
          </ul>
          <button onClick={onExit}>戻る</button>
        </div>
      )}
    </div>
  );
}
