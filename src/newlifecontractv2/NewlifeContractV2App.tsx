import { useState } from "react";
import "../newlife/situation/situation.css";
import { createInitialState, resolveAction, resolveFollowUp, resolvePendingReplyEvent } from "../research/action-contract-v2/engine";
import {
  VISIT_YOHEI_SIMPLE_PURCHASE,
  VISIT_YOHEI_WITH_BAG_TASK,
  BUY_BAGS_FOLLOW_UP,
  EXPLORE_HALL_JIN_WORKING,
  OFFER_HELP_FOLLOW_UP,
  REST,
  jinContinuesWorkNarration,
} from "../research/action-contract-v2/contracts";
import { resolveFreeTextCandidate, confirmFreeTextAction, resolvePendingFreeTextCandidates, type FreeTextCandidate, type PendingFreeTextCandidate, type PendingIntentId } from "../research/action-contract-v2/freeTextBoundary";
import {
  yoheiAsksForHelp,
  PLAYER_ACCEPTS_REQUEST,
  PLAYER_DECLINES_REQUEST,
  PLAYER_DEFERS_REPLY,
  PLAYER_LEAVES_EVENT,
  YOHEI_SELF_RESOLVES,
  YOHEI_WITHDRAWS_REQUEST,
  SMALL_TALK,
  GREETING,
  ASK_FESTIVAL,
  yoheiContinuesShopWorkNarration,
  customerArrives,
  customerLeaves,
  dispatchConfirmedPendingIntent,
} from "../research/action-contract-v2/pendingReplyContracts";
import type { ActionContractV2, ActionTrace, ContractV2State, PendingReplyTrace } from "../research/action-contract-v2/types";

const PENDING_INTENT_LABELS: Record<PendingIntentId, string> = {
  DEFER_PENDING_REPLY: "さっきの話は後回しにする",
  ASK_FESTIVAL: "昨日の祭りについて聞く",
  ANSWER_ACCEPT: "さっきの話について「いいよ」と答える",
  REQUEST_WITHDRAWAL: "さっきの話はもういいと伝える",
  UNRECOGNIZED: "（うまく伝わらなかったようだ）",
};

/**
 * PHASE 11.6R: isolated Action Contract V2 architecture-validation prototype (`?newlifecontractv2=1`).
 * Reuses `situation.css` verbatim, read-only -- no file under `src/newlife/**` modified.
 *
 * This is METHOD RUNTIME PROTOTYPE ONLY. It does not prove 30-day game integration, free-text
 * product quality, NPC human-likeness, or game fun -- only that the tested Action Contract V2
 * cases resolve as designed. Contract/trace internals render only in the isolated debug panel,
 * never in the player-facing area above it.
 */

type ScenarioId = "SIMPLE_PURCHASE" | "JIN_HELP_NEEDED" | "JIN_HELP_NOT_NEEDED" | "REST" | "TRASH_BAG_REGRESSION" | "FREE_TEXT" | "PENDING_REPLY_YOHEI_HELP";

const SCENARIOS: { id: ScenarioId; label: string }[] = [
  { id: "SIMPLE_PURCHASE", label: "洋平商店で買い物（単純な行動）" },
  { id: "JIN_HELP_NEEDED", label: "公民館で迅を見かける（手伝いが必要な日）" },
  { id: "JIN_HELP_NOT_NEEDED", label: "公民館で迅を見かける（手伝いが不要な日）" },
  { id: "REST", label: "今日は休む" },
  { id: "TRASH_BAG_REGRESSION", label: "洋平商店（ゴミ袋の用事が残っている・回帰テスト）" },
  { id: "FREE_TEXT", label: "自由入力の境界テスト（手伝いの申し出）" },
  { id: "PENDING_REPLY_YOHEI_HELP", label: "洋平に手伝いを頼まれる（未回答の会話・PHASE 11.8）" },
];

function initialStateFor(scenario: ScenarioId): ContractV2State {
  if (scenario === "JIN_HELP_NEEDED" || scenario === "FREE_TEXT") return createInitialState({ world: { jinHelperAbsentToday: true } });
  if (scenario === "JIN_HELP_NOT_NEEDED") return createInitialState({ world: { jinHelperAbsentToday: false } });
  if (scenario === "TRASH_BAG_REGRESSION") {
    return createInitialState({
      day: 6, // deliberately NOT day 4 -- the exact day the confirmed old defect would have failed on
      materials: [
        {
          id: "trash_bags_needed",
          type: "PENDING_TASK",
          concreteContent: "洋平に、燃えるゴミの日は指定の透明袋が必要だと言われたが、まだ持っていない",
          origin: "seed",
          dayCreated: 2,
          authority: "PLAYER_CHOSEN_FACT",
          status: "ACTIVE",
          knownBy: ["player", "yohei"],
          possibleConsumers: [],
        },
      ],
    });
  }
  return createInitialState();
}

export function NewlifeContractV2App({ onExit }: { onExit: () => void }) {
  const [scenario, setScenario] = useState<ScenarioId | null>(null);
  const [state, setState] = useState<ContractV2State>(createInitialState());
  const [traces, setTraces] = useState<ActionTrace[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  const [freeText, setFreeText] = useState("");
  const [freeTextCandidate, setFreeTextCandidate] = useState<FreeTextCandidate | null>(null);
  const [freeTextResponse, setFreeTextResponse] = useState<string[] | null>(null);
  const [started, setStarted] = useState(false);
  // Tracks whether PLAYER has resolved the pending follow-up ONE WAY OR THE OTHER (accept or
  // decline) -- declining legitimately produces no trace (resolveFollowUp returns trace: null,
  // per design: nothing occurred to trace), so this cannot be inferred from `traces` alone.
  // Found via visual QA (PHASE 11.6V): the world-continuity narration previously never rendered
  // after a decline, because it was keyed off trace presence instead of this.
  const [followUpResolved, setFollowUpResolved] = useState(false);

  // PHASE 11.8: PendingReply demo scenario state -- kept separate from the FREE_TEXT scenario's
  // own state above rather than reused, since the shapes/pipelines genuinely differ (single
  // candidate vs. an ordered queue of composite candidates).
  const [pendingTraces, setPendingTraces] = useState<PendingReplyTrace[]>([]);
  const [pendingFreeText, setPendingFreeText] = useState("");
  const [pfCandidates, setPfCandidates] = useState<PendingFreeTextCandidate[] | null>(null);
  const [pfIndex, setPfIndex] = useState(0);
  const [pfNotes, setPfNotes] = useState<string[]>([]);

  function pushTrace(t: ActionTrace | null) {
    if (t) setTraces((prev) => [...prev, t]);
  }

  function pushPendingTrace(t: PendingReplyTrace) {
    setPendingTraces((prev) => [...prev, t]);
  }

  function startScenario(id: ScenarioId) {
    setScenario(id);
    setStarted(false);
    setTraces([]);
    setFreeText("");
    setFreeTextCandidate(null);
    setFreeTextResponse(null);
    setFollowUpResolved(false);
    setPendingTraces([]);
    setPendingFreeText("");
    setPfCandidates(null);
    setPfIndex(0);
    setPfNotes([]);
    setState(initialStateFor(id));
  }

  function beginInitialAction() {
    if (!scenario) return;
    setStarted(true);
    if (scenario === "SIMPLE_PURCHASE") {
      const { state: next, trace } = resolveAction(state, VISIT_YOHEI_SIMPLE_PURCHASE);
      setState(next);
      pushTrace(trace);
    } else if (scenario === "JIN_HELP_NEEDED" || scenario === "JIN_HELP_NOT_NEEDED" || scenario === "FREE_TEXT") {
      const { state: next, trace } = resolveAction(state, EXPLORE_HALL_JIN_WORKING);
      setState(next);
      pushTrace(trace);
    } else if (scenario === "REST") {
      const { state: next, trace } = resolveAction(state, REST);
      setState(next);
      pushTrace(trace);
    } else if (scenario === "TRASH_BAG_REGRESSION") {
      const { state: next, trace } = resolveAction(state, VISIT_YOHEI_WITH_BAG_TASK);
      setState(next);
      pushTrace(trace);
    } else if (scenario === "PENDING_REPLY_YOHEI_HELP") {
      setState(yoheiAsksForHelp(state, "ui"));
    }
  }

  // ---- PHASE 11.8: PendingReply demo handlers ----

  function answerPending(spec: typeof PLAYER_ACCEPTS_REQUEST) {
    const { state: next, trace } = resolvePendingReplyEvent(state, spec);
    setState(next);
    pushPendingTrace(trace);
  }

  function dispatchOrdinary(contract: ActionContractV2) {
    const { state: next, trace } = resolveAction(state, contract);
    setState(next);
    pushTrace(trace);
  }

  function leavePending() {
    const { state: next, trace } = resolvePendingReplyEvent(state, PLAYER_LEAVES_EVENT);
    setState(next);
    pushPendingTrace(trace);
  }

  // Debug-only world/NPC-authored event controls -- these are never PLAYER choices, so they live
  // inside the debug panel, not the player-facing button area (directive Section 23).
  function debugCustomerArrives() {
    setState(customerArrives(state));
  }
  function debugCustomerLeaves() {
    setState(customerLeaves(state));
  }
  function debugYoheiSelfResolves() {
    const { state: next, trace } = resolvePendingReplyEvent(state, YOHEI_SELF_RESOLVES);
    setState(next);
    pushPendingTrace(trace);
  }
  function debugYoheiWithdraws() {
    const { state: next, trace } = resolvePendingReplyEvent(state, YOHEI_WITHDRAWS_REQUEST);
    setState(next);
    pushPendingTrace(trace);
  }

  function submitPendingFreeText() {
    const candidates = resolvePendingFreeTextCandidates(state, pendingFreeText);
    setPfCandidates(candidates);
    setPfIndex(0);
    setPfNotes([]);
  }

  function processCurrentCandidate(confirmed: boolean) {
    if (!pfCandidates) return;
    const candidate = pfCandidates[pfIndex];
    if (!candidate) return;
    if (candidate.legitimate && confirmed) {
      const { state: next, trace } = dispatchConfirmedPendingIntent(state, candidate.intentId);
      setState(next);
      if ("selectedAction" in trace) pushTrace(trace);
      else pushPendingTrace(trace);
      setPfNotes((prev) => [...prev, `「${PENDING_INTENT_LABELS[candidate.intentId]}」を伝えた。`]);
    } else if (candidate.legitimate && !confirmed) {
      setPfNotes((prev) => [...prev, `「${PENDING_INTENT_LABELS[candidate.intentId]}」は取り消した。`]);
    } else {
      setPfNotes((prev) => [...prev, "（今はそれを伝えられる状況ではないようだ）"]);
    }
    const nextIndex = pfIndex + 1;
    if (nextIndex >= pfCandidates.length) {
      setPfCandidates(null);
      setPfIndex(0);
      setPendingFreeText("");
    } else {
      setPfIndex(nextIndex);
    }
  }

  function chooseFollowUp(contract: ActionContractV2 | null) {
    const { state: next, trace } = resolveFollowUp(state, contract);
    setState(next);
    pushTrace(trace);
    setFollowUpResolved(true); // set on BOTH accept and decline -- world continuity is shown either way
  }

  function submitFreeText() {
    const candidate = resolveFreeTextCandidate(state, freeText);
    setFreeTextCandidate(candidate);
    setFreeTextResponse(candidate.legitimate ? null : candidate.ifNotConfirmedOrIllegitimate);
  }

  function confirmFreeText() {
    if (!freeTextCandidate) return;
    const contract = confirmFreeTextAction(freeTextCandidate, { OFFER_HELP: OFFER_HELP_FOLLOW_UP });
    const { state: next, trace } = resolveFollowUp(state, contract, freeTextCandidate.interpretedIntentId);
    setState(next);
    pushTrace(trace);
    setFreeTextCandidate(null);
    setFollowUpResolved(true);
  }

  function declineFreeText() {
    setFreeTextCandidate(null);
    setFreeTextResponse(["（申し出を取り消した）"]);
    setFollowUpResolved(true);
  }

  const pendingAffordances = state.pending?.affordances ?? [];
  const followUpContractFor = (id: string): ActionContractV2 | null => (id === "OFFER_HELP" ? OFFER_HELP_FOLLOW_UP : id === "BUY_BAGS" ? BUY_BAGS_FOLLOW_UP : null);

  return (
    <div className="ns-frame" data-testid="contractv2-frame">
      <div className="ns-topbar">
        <span className="ns-topbar-label">Action Contract V2 — 隔離プロトタイプ</span>
        <button className="ns-exit" onClick={onExit}>
          ホームへ戻る
        </button>
      </div>
      <div className="ns-stage">
        {!scenario && (
          <div className="ns-choices" data-testid="contractv2-scenario-picker">
            {SCENARIOS.map((s) => (
              <button key={s.id} className="ns-choice-button" onClick={() => startScenario(s.id)}>
                {s.label}
              </button>
            ))}
          </div>
        )}

        {scenario && !started && (
          <div className="ns-choices">
            <button className="ns-choice-button" onClick={beginInitialAction} data-testid="contractv2-begin">
              始める
            </button>
          </div>
        )}

        {scenario && started && (
          <>
            <div className="ns-narration" data-testid="contractv2-narration">
              {state.narration.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>

            {/* Ordinary conditional follow-up affordances (explicit buttons -- no confirmation ceremony) */}
            {scenario !== "FREE_TEXT" && pendingAffordances.length > 0 && (
              <div className="ns-choices" data-testid="contractv2-followup-choices">
                {pendingAffordances.map((a) => (
                  <button key={a.id} className="ns-choice-button" onClick={() => chooseFollowUp(followUpContractFor(a.id))}>
                    {a.label}
                  </button>
                ))}
                <button className="ns-choice-button" onClick={() => chooseFollowUp(null)} data-testid="contractv2-decline">
                  何もせず立ち去る
                </button>
              </div>
            )}

            {/* Free-text boundary scenario */}
            {scenario === "FREE_TEXT" && !freeTextCandidate && freeTextResponse === null && pendingAffordances.length > 0 && (
              <div className="ns-choices" data-testid="contractv2-freetext-input">
                <input
                  type="text"
                  value={freeText}
                  onChange={(e) => setFreeText(e.target.value)}
                  placeholder="迅に何と声をかける？"
                  style={{ width: "100%", padding: "8px", marginBottom: "8px" }}
                  data-testid="contractv2-freetext-field"
                />
                <button className="ns-choice-button" onClick={submitFreeText} data-testid="contractv2-freetext-submit">
                  声をかける
                </button>
              </div>
            )}

            {scenario === "FREE_TEXT" && freeTextCandidate?.legitimate && (
              <div className="ns-choices" data-testid="contractv2-freetext-confirm">
                <p>「{freeTextCandidate.matchedAffordance?.label}」でよろしいですか？</p>
                <button className="ns-choice-button" onClick={confirmFreeText} data-testid="contractv2-freetext-confirm-yes">
                  手伝う
                </button>
                <button className="ns-choice-button" onClick={declineFreeText} data-testid="contractv2-freetext-confirm-no">
                  やめておく
                </button>
              </div>
            )}

            {scenario === "FREE_TEXT" && freeTextResponse && (
              <div className="ns-narration" data-testid="contractv2-freetext-response">
                {freeTextResponse.map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            )}

            {/* World continuity, shown once resolved -- Jin's own work continues regardless of PLAYER's choice */}
            {(scenario === "JIN_HELP_NEEDED" || scenario === "FREE_TEXT") && followUpResolved && (
              <div className="ns-narration" data-testid="contractv2-world-continuity">
                {jinContinuesWorkNarration(state).map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            )}

            {/* PHASE 11.8: PendingReply demo -- an unresolved conversational reply-slot. Player-
                facing UI never prints the status enum/id itself, only ordinary narration
                (directive Section 23); the debug panel below shows the raw object. */}
            {scenario === "PENDING_REPLY_YOHEI_HELP" && (
              <>
                <div className="ns-choices" data-testid="contractv2-pending-choices">
                  {state.pendingReply?.status === "OPEN" && state.world.yoheiAvailableForConversation && (
                    <>
                      <button className="ns-choice-button" onClick={() => answerPending(PLAYER_ACCEPTS_REQUEST)} data-testid="contractv2-pending-accept">
                        手伝う
                      </button>
                      <button className="ns-choice-button" onClick={() => answerPending(PLAYER_DECLINES_REQUEST)} data-testid="contractv2-pending-decline">
                        今日はやめておく
                      </button>
                      <button className="ns-choice-button" onClick={() => answerPending(PLAYER_DEFERS_REPLY)} data-testid="contractv2-pending-defer">
                        その話はまた後で
                      </button>
                    </>
                  )}
                  {state.pendingReply?.status === "OPEN" && !state.world.yoheiAvailableForConversation && <p>（洋平は今、接客中で手が離せないようだ）</p>}
                  <button className="ns-choice-button" onClick={() => dispatchOrdinary(SMALL_TALK)} data-testid="contractv2-pending-smalltalk">
                    今日は暑いね
                  </button>
                  <button className="ns-choice-button" onClick={() => dispatchOrdinary(GREETING)} data-testid="contractv2-pending-greeting">
                    よう
                  </button>
                  <button className="ns-choice-button" onClick={() => dispatchOrdinary(ASK_FESTIVAL)} data-testid="contractv2-pending-festival">
                    昨日の祭りどうだった？
                  </button>
                  <button className="ns-choice-button" onClick={leavePending} data-testid="contractv2-pending-leave">
                    その場を離れる
                  </button>
                </div>

                <div className="ns-narration" data-testid="contractv2-pending-shopwork">
                  {yoheiContinuesShopWorkNarration(state).map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>

                <div className="ns-choices" data-testid="contractv2-pending-freetext">
                  <input
                    type="text"
                    value={pendingFreeText}
                    onChange={(e) => setPendingFreeText(e.target.value)}
                    placeholder="洋平に何と声をかける？"
                    style={{ width: "100%", padding: "8px", marginBottom: "8px" }}
                    data-testid="contractv2-pending-freetext-field"
                  />
                  <button className="ns-choice-button" onClick={submitPendingFreeText} data-testid="contractv2-pending-freetext-submit">
                    声をかける
                  </button>
                </div>

                {pfCandidates && pfIndex < pfCandidates.length && (
                  <div className="ns-choices" data-testid="contractv2-pending-freetext-confirm">
                    <p>「{PENDING_INTENT_LABELS[pfCandidates[pfIndex].intentId]}」でよろしいですか？</p>
                    {pfCandidates[pfIndex].requiresConfirmation ? (
                      <>
                        <button className="ns-choice-button" onClick={() => processCurrentCandidate(true)} data-testid="contractv2-pending-freetext-confirm-yes">
                          はい
                        </button>
                        <button className="ns-choice-button" onClick={() => processCurrentCandidate(false)} data-testid="contractv2-pending-freetext-confirm-no">
                          いいえ
                        </button>
                      </>
                    ) : (
                      <button className="ns-choice-button" onClick={() => processCurrentCandidate(true)} data-testid="contractv2-pending-freetext-continue">
                        続ける
                      </button>
                    )}
                  </div>
                )}

                {pfNotes.length > 0 && (
                  <div className="ns-narration" data-testid="contractv2-pending-freetext-notes">
                    {pfNotes.map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                )}
              </>
            )}

            <div className="ns-restart-row">
              <button className="ns-restart-button" onClick={() => setScenario(null)} data-testid="contractv2-back-to-scenarios">
                シナリオ選択に戻る
              </button>
            </div>
          </>
        )}

        <div className="ns-restart-row">
          <button className="ns-exit" onClick={() => setShowDebug((v) => !v)} data-testid="contractv2-debug-toggle">
            {showDebug ? "開発者用トレースを隠す" : "開発者用トレースを表示"}
          </button>
        </div>

        {showDebug && (
          <div
            data-testid="contractv2-debug-panel"
            style={{ border: "2px dashed #888", padding: "12px", marginTop: "12px", fontFamily: "monospace", fontSize: "12px", whiteSpace: "pre-wrap", background: "#f4f4f4", color: "#111" }}
          >
            <strong>開発者用トレース（プレイヤー向け画面には表示されません）</strong>
            {traces.length === 0 ? <p>(まだトレースはありません)</p> : traces.map((t, i) => <pre key={i}>{JSON.stringify(t, null, 2)}</pre>)}

            {scenario === "PENDING_REPLY_YOHEI_HELP" && (
              <>
                <strong>PendingReply（内部状態）</strong>
                <pre>{JSON.stringify(state.pendingReply, null, 2)}</pre>
                <strong>PendingReplyTrace</strong>
                {pendingTraces.length === 0 ? <p>(まだトレースはありません)</p> : pendingTraces.map((t, i) => <pre key={i}>{JSON.stringify(t, null, 2)}</pre>)}
                <strong>デバッグ専用コントロール（NPC/世界イベント -- プレイヤーの選択ではない）</strong>
                <div className="ns-choices" style={{ marginTop: "8px" }}>
                  <button className="ns-choice-button" onClick={debugCustomerArrives} data-testid="contractv2-pending-debug-customer-arrives">
                    客が来た（デモ）
                  </button>
                  <button className="ns-choice-button" onClick={debugCustomerLeaves} data-testid="contractv2-pending-debug-customer-leaves">
                    客の対応が終わった（デモ）
                  </button>
                  <button className="ns-choice-button" onClick={debugYoheiSelfResolves} data-testid="contractv2-pending-debug-self-resolve">
                    洋平が自己解決した（デモ）
                  </button>
                  <button className="ns-choice-button" onClick={debugYoheiWithdraws} data-testid="contractv2-pending-debug-withdraw">
                    洋平が申し出を取り下げた（デモ）
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
