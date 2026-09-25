/**
 * NEW LIFE refoundation — minimal vertical-slice UI (V11 order, stage 7 of 8).
 *
 * ISOLATED FEATURE SLICE: reachable only via `?newlife-refoundation=1`
 * (see `App.tsx`), following the exact same pattern as the existing
 * `?newlife30=1` slice (`NewLife30App.tsx`) — not linked from `HomeScreen`
 * or any other screen. Legacy public NEW LIFE (`src/newlife/state.ts`,
 * `src/newlife/npcVoice.ts`, `NewLife30App.tsx`) is untouched; this
 * component imports nothing from them.
 *
 * Wires together the already-validated stage 1-6 modules
 * (`types`/`relationshipReducer`/`ending`/`timeEconomy`/`semanticInterpreter`/
 * `npcGeneration`/`thoughtTools`) into one playable loop for the vertical
 * slice case (`V3_OPENING_COMMUNITY_THEATER_CONFLICT_V1.md`). This is the
 * first stage where a real `SemanticInterpreterAdapter`/`NpcGenerationAdapter`
 * would matter — both are still only the `Null*` implementation this Run
 * (no live model configured anywhere in this repository), so the free-text
 * input below always resolves to the conservative CLARIFY fallback, and NPC
 * lines are always the deterministic per-relationship-state fallback line.
 * That is disclosed on-screen, not hidden: the point of this stage is
 * proving the deterministic state machinery end-to-end (time spend,
 * relationship transitions, boundary/ending derivation, thought tools), not
 * claiming a working AI conversation loop, which stage 4/5's own status
 * (`NullSemanticInterpreterAdapter`/`NullNpcGenerationAdapter` as the only
 * implementations that exist) never promised.
 *
 * HUMAN_VALIDATION_STATUS = PENDING, same as `NewLife30App.tsx`'s own
 * disclosure for its slice. This is not a claim of human playtest
 * validation.
 *
 * LIVE PROVIDER (added after stage 7's initial commit, still undeployed):
 * when `NEWLIFE_REFOUNDATION_AI_ENDPOINT_URL` (`config.ts`) is non-empty
 * AND the player has explicitly accepted the refoundation-scoped consent
 * prompt (`consent.ts`, a separate opt-in from both CASE1's and legacy NEW
 * LIFE's own consent keys, per `docs/DATA_BOUNDARY.md`'s "each purpose
 * needs its own opt-in"), this component switches from the `Null*` adapters
 * to `HttpSemanticInterpreterAdapter`/`HttpNpcGenerationAdapter`
 * (`httpAdapters.ts`), which call `functions/newlife-refoundation-ai/`.
 * With the shipped-empty endpoint constant, or without consent, behavior is
 * unchanged from the original stage 7 commit: `Null*` adapters, no network
 * call, no consent prompt ever shown. There is no third state that looks
 * like a live AI response but isn't — every non-`"ok"` adapter outcome
 * still resolves through the same conservative fallback path
 * (`interpretTurn`/`generateNpcLine`) as the `Null*` adapters always used.
 */
import { useMemo, useState } from "react";
import {
  createInitialRelationshipRecord,
  applyRelationalTurn,
} from "./relationshipReducer";
import {
  createInitialCaseEndingState,
  applyEndingTurn,
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
import { NullSemanticInterpreterAdapter, interpretTurn, type SemanticInterpreterAdapter } from "./semanticInterpreter";
import { NullNpcGenerationAdapter, generateNpcLine, type NpcGenerationAdapter } from "./npcGeneration";
import { HttpSemanticInterpreterAdapter, HttpNpcGenerationAdapter } from "./httpAdapters";
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

const nullSemanticAdapter = new NullSemanticInterpreterAdapter();
const nullNpcAdapter = new NullNpcGenerationAdapter();
// Constructed unconditionally (cheap: just stores a URL string) but only
// ever invoked when LIVE_PROVIDER_CONFIGURED and consent is "accepted" —
// see resolveAdapters() below. With the shipped-empty endpoint constant
// these behave identically to the Null adapters (HttpSemanticInterpreterAdapter's
// own empty-endpoint check returns "unavailable" without a network call).
const httpSemanticAdapter = new HttpSemanticInterpreterAdapter(NEWLIFE_REFOUNDATION_AI_ENDPOINT_URL);
const httpNpcAdapter = new HttpNpcGenerationAdapter(NEWLIFE_REFOUNDATION_AI_ENDPOINT_URL);

/**
 * No silent fallback masquerading as AI success: the live adapters are only
 * ever selected when both the endpoint is configured AND the player has
 * explicitly accepted this feature's own consent prompt. Any other state
 * (declined, not yet asked, or no endpoint at all) uses the same `Null*`
 * adapters this component always used, which `interpretTurn`/
 * `generateNpcLine` route through the identical conservative-fallback path.
 */
function resolveAdapters(consent: RefoundationAiDialogueConsentStatus | null): {
  semantic: SemanticInterpreterAdapter;
  npc: NpcGenerationAdapter;
} {
  if (LIVE_PROVIDER_CONFIGURED && consent === "accepted") {
    return { semantic: httpSemanticAdapter, npc: httpNpcAdapter };
  }
  return { semantic: nullSemanticAdapter, npc: nullNpcAdapter };
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

  const latestNpcLine = useMemo(
    () =>
      [...state.transcript]
        .reverse()
        .find((line) => line.speaker === "MIKA" || line.speaker === "RYO") ?? null,
    [state.transcript],
  );

  async function runTurn(target: TargetNpc | null, turn: { action: ActionType; boundaryMode: BoundaryMode; relationalEvents?: RelationalEvent[] }, costMinutes: number, playerLabel: string) {
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

    const npcLine =
      target === null
        ? null
        : await generateNpcLine(adapters.npc, {
            npc: target,
            relationshipState: target === "MIKA" ? nextMika.relationshipState : nextRyo.relationshipState,
            boundaryStatus: nextEnding.boundaryEstablished
              ? nextEnding.taskLedger.commitment
                ? nextEnding.taskLedger.commitment.boundaryMode === "CROSS_WITHOUT_PERMISSION"
                  ? "OVERRIDDEN"
                  : "RESPECTED"
                : "STATED"
              : "UNKNOWN",
            lastPlayerTurn: { action: turn.action, boundaryMode: turn.boundaryMode, relationalEvents },
            sceneContext: "16:40, rehearsal stopped, the disputed scene",
          });

    setState((prev) => ({
      clock: nextClock,
      ending: nextEnding,
      mika: nextMika,
      ryo: nextRyo,
      turnCounter: prev.turnCounter + 1,
      transcript: [
        ...prev.transcript,
        { speaker: "PLAYER", text: playerLabel },
        ...(npcLine ? [{ speaker: target as SpeakerId, text: npcLine.text }] : []),
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

  async function handleFreeText() {
    if (!freeText.trim() || freeTextTarget === null || ended || pending) return;
    setPending(true);
    const targetLabel = freeTextTarget === "MIKA" ? "美香" : "亮";
    const result = await interpretTurn(adapters.semantic, {
      utterance: freeText,
      speaker: "PLAYER",
      caseContext: `free-text turn, explicitly addressed to ${targetLabel}`,
    });
    const text = freeText;
    const target = freeTextTarget;
    setFreeText("");
    setPending(false);
    await runTurn(
      target,
      { action: result.classification.action, boundaryMode: result.classification.boundaryMode },
      TIME_COSTS.CLARIFY,
      text,
    );
    if (result.status === "fallback") {
      setState((prev) => ({
        ...prev,
        transcript: [
          ...prev.transcript,
          {
            speaker: "SYSTEM",
            text: LIVE_PROVIDER_CONFIGURED
              ? "（AIの意味解釈を取得できなかったため、安全な確認扱いで進めました。NPCの返答は現在の状態に基づく安全なフォールバックです。）"
              : "（このビルドにはまだAIアダプタが接続されていません。自由入力は安全な確認扱いで進み、選んだ相手が状態に応じて応答します。）",
          },
        ],
      }));
    }
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
          あなたが自由入力欄に書いた内容は、そのターンの分類のためだけにサーバーへ送られます。ゲームの状態そのものはこの端末側の確定的な仕組みが管理し、
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
          latestNpcLine?.speaker === "MIKA" || latestNpcLine?.speaker === "RYO"
            ? latestNpcLine.speaker
            : null
        }
        activeText={latestNpcLine?.text ?? null}
        pending={pending}
      />

      <div style={{ border: "1px solid #ccc", borderRadius: 6, padding: 12, margin: "12px 0", maxHeight: 320, overflowY: "auto" }}>
        {state.transcript.map((line, i) => (
          <p key={i} style={{ margin: "4px 0" }}>
            <strong>{speakerLabel(line.speaker)}</strong>
            {line.text}
          </p>
        ))}
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
          </div>
        </>
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
