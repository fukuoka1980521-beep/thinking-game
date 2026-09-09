import { useState } from "react";
import "../newlife/situation/situation.css";
import "./playable11.css";
import { createInitialState, resolveAction, resolvePendingReplyEvent } from "../research/action-contract-v2/engine";
import {
  openYoheiLeftoverStockRequest,
  PLAYER_ACCEPTS_HELP_MOVE_STOCK,
  PLAYER_DECLINES_HELP_MOVE_STOCK,
  ASK_WHAT_HELP_NEEDED,
  ASK_FESTIVAL_SCENE,
  ASK_SALES_SCENE,
  ASK_WEATHER_SCENE,
  ASK_ABOUT_LEFTOVER_STOCK,
  yoheiContinuesLeftoverStockWorkNarration,
  buildYoheiPacket,
} from "../research/action-contract-v2/playableSceneContracts";
import { PLAYER_LEAVES_EVENT } from "../research/action-contract-v2/pendingReplyContracts";
import { createReplayLanguageAdapter } from "../research/action-contract-v2/languageAdapter";
import { CAPTURED_YOHEI_LINES } from "../research/action-contract-v2/capturedYoheiLines";
import { createProductLanguageAdapter, PRODUCT_FIXTURE_LINES } from "../research/action-contract-v2/productFixtureLines";
import type { ActionContractV2, ActionTrace, ContractV2State, PendingReplyTrace } from "../research/action-contract-v2/types";
import { evaluateProductSurface } from "../research/action-contract-v2/productSurface";
import { evaluateRealLeftoverStockCausalClaim, evaluateLeftoverQuestionPrerequisite, type RealCausalClaimEvaluation } from "../research/action-contract-v2/causalUnlockInvariant";
import { commitNpcResponseIfApplicable } from "../research/action-contract-v2/npcResponseCommit";
import { getDevOnlyDisclosureText } from "../research/action-contract-v2/devOnlyDisclosure";

/**
 * PHASE 11.11: small playable Yohei scene -- isolated route `?newlifeplayable11=1`. Post-festival,
 * leftover festival stock. Reuses Action Contract V2 / PendingReply (PHASE 11.6R-11.10) unmodified.
 *
 * PHASE 11.12R: action composition routes through the real Product Surface ownership gate and the
 * real counterfactual causal-unlock gate (docs/research/evaluation/phase-11-12r/).
 *
 * PHASE 11.13: product repair, through those same gates -- see
 * docs/research/evaluation/phase-11-13/PRODUCT_SCENE_REPAIR_SPEC_V1.md. Yohei's lines come from
 * `createProductLanguageAdapter`: the real captured-Vertex replay (`capturedYoheiLines.ts`) for
 * ASK_FESTIVAL/ASK_SALES/ASK_ABOUT_LEFTOVER_STOCK (CAPTURED_REAL_VERTEX_REPLAY, unmodified), and
 * ONE system-authored fixture line for ASK_WHAT (SYSTEM_AUTHORED_PRODUCT_FIXTURE -- the real
 * captured line for that packet key named the box's contents before the physical reveal; see
 * `productFixtureLines.ts`). Never a live call this phase. Provenance disclosed in the developer
 * panel (build/mode-boundary-gated), not on the primary player surface.
 */

const languageAdapter = createProductLanguageAdapter(PRODUCT_FIXTURE_LINES, createReplayLanguageAdapter(CAPTURED_YOHEI_LINES));

type AskActionVisualRole = "secondary";

/** Per-action player-facing utterance/testid/visual-role, kept as data (not scattered across JSX)
 *  so the candidate list and its rendering stay driven by the same source. An action accepted by
 *  `evaluateProductSurface` with no entry here is simply not rendered (defensive; should not occur
 *  in practice since every currently-registered PRODUCT action has an entry). All ASK_* actions
 *  are visually "secondary" (directive Section 18) -- ACCEPT/DECLINE (primary) and LEAVE render
 *  separately, below, with their own visual role. */
const ASK_ACTION_UI_META: Record<string, { utterance: string; testId: string; role: AskActionVisualRole }> = {
  ASK_WHAT_HELP_NEEDED: { utterance: "何を手伝えばいい？", testId: "playable11-ask-what", role: "secondary" },
  ASK_FESTIVAL_SCENE: { utterance: "祭りどうだった？", testId: "playable11-ask-festival", role: "secondary" },
  ASK_SALES_SCENE: { utterance: "売れ行きどうだった？", testId: "playable11-ask-sales", role: "secondary" },
  ASK_WEATHER_SCENE: { utterance: "雨降ってた？", testId: "playable11-ask-weather", role: "secondary" },
  ASK_ABOUT_LEFTOVER_STOCK: { utterance: "これ、祭りの残り？", testId: "playable11-ask-leftover", role: "secondary" },
};

const ALL_ASK_ACTIONS: ActionContractV2[] = [ASK_WHAT_HELP_NEEDED, ASK_FESTIVAL_SCENE, ASK_SALES_SCENE, ASK_WEATHER_SCENE, ASK_ABOUT_LEFTOVER_STOCK];

/**
 * PHASE 11.13 (directive Section 3): the ONE real candidate source. Pure, exported, independent of
 * React state hooks, so an adversarial test can inject a synthetic action into the exact list the
 * live scene builds without touching component internals or creating a second, parallel action
 * list. Generic: every ask-action's OWN `eligibility` (SCENE ELIGIBILITY -- Single Precondition
 * Authority, each contract's own preconditions in `playableSceneContracts.ts`) decides whether it is
 * a candidate at all; `ASK_WHAT_HELP_NEEDED` (one-shot, disappears once answered or once the
 * request is resolved) and `ASK_SALES_SCENE` (contextual, requires ASK_FESTIVAL first) now carry
 * real preconditions, not `ALWAYS`. The separate counterfactual causality gate (`applyCausalityGate`)
 * is applied next, before this list ever reaches the ownership gate.
 */
export function buildAskCandidates(state: ContractV2State): ActionContractV2[] {
  return ALL_ASK_ACTIONS.filter((action) => action.eligibility.every((p) => p.check(state)));
}

/**
 * PHASE 11.12R Section 9/12, still in force in PHASE 11.13: the real counterfactual causality
 * gate, applied to whichever candidates carry a claimed "new possibility" (currently only
 * `ASK_ABOUT_LEFTOVER_STOCK`). Does NOT invent a replacement action or reveal to make the claim
 * pass -- the claim is valid or not based on the actual narrative content in
 * `playableSceneContracts.ts` (PHASE 11.13 changed that content -- the physical reveal no longer
 * pre-empts the follow-up question -- which is why this gate now legitimately passes; this
 * function's own logic is unchanged from PHASE 11.12R).
 */
export function applyCausalityGate(candidates: ActionContractV2[], causalVerdict: RealCausalClaimEvaluation): ActionContractV2[] {
  if (causalVerdict.verdict === "CAUSAL_UNLOCK_VALID") return candidates;
  return candidates.filter((c) => c.actionId !== "ASK_ABOUT_LEFTOVER_STOCK");
}

interface LogEntry {
  narration: string[];
  yoheiLine: string | null;
}

export function NewlifePlayable11App({ onExit }: { onExit: () => void }) {
  const [state, setState] = useState<ContractV2State>(() => openYoheiLeftoverStockRequest(createInitialState(), "ui"));
  const [started, setStarted] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [traces, setTraces] = useState<(ActionTrace | PendingReplyTrace)[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  const [left, setLeft] = useState(false);

  function begin() {
    setStarted(true);
    // PHASE 11.14: single-sourced from `openYoheiLeftoverStockRequest`'s own narration (set at
    // component construction, always populated by then) -- no second, independently hand-typed
    // copy of the opening line here anymore (that duplication is what let the two drift out of
    // sync during the Owner Play language repair).
    setLog([{ narration: state.narration, yoheiLine: null }]);
  }

  function pushLog(narration: string[], yoheiLine: string | null) {
    setLog((prev) => [...prev, { narration, yoheiLine }]);
  }

  function askQuestion(contract: ActionContractV2, playerUtterance: string) {
    // PHASE 11.13C: resolveAction commits ONLY the PLAYER's own ask dispatch (QUESTION DISPATCH).
    const { state: next, trace } = resolveAction(state, contract);
    const packet = buildYoheiPacket(next, playerUtterance, contract.playerIntent);
    const line = languageAdapter(packet);
    // RESPONSE COMMIT POINT: strictly after the ask resolves and after the response-delivery seam
    // (the language adapter call above) -- a genuinely separate NPC RESPONSE EVENT, never bundled
    // into the player's own dispatch. See npcResponseCommit.ts / NPC_RESPONSE_COMMIT_POINT_V1.md.
    const afterResponseCommit = commitNpcResponseIfApplicable(contract.actionId, next, packet);
    setState(afterResponseCommit);
    setTraces((prev) => [...prev, trace]);
    pushLog([], line);
  }

  function acceptHelp() {
    const { state: next, trace } = resolvePendingReplyEvent(state, PLAYER_ACCEPTS_HELP_MOVE_STOCK);
    setState(next);
    setTraces((prev) => [...prev, trace]);
    pushLog(trace.narration, null);
  }

  function declineHelp() {
    const { state: next, trace } = resolvePendingReplyEvent(state, PLAYER_DECLINES_HELP_MOVE_STOCK);
    setState(next);
    setTraces((prev) => [...prev, trace]);
    pushLog(trace.narration, null);
  }

  function leave() {
    const { state: next, trace } = resolvePendingReplyEvent(state, PLAYER_LEAVES_EVENT);
    setState(next);
    setTraces((prev) => [...prev, trace]);
    setLeft(true);
    pushLog(trace.narration, null);
  }

  const pendingOpen = state.pendingReply?.status === "OPEN";

  // PHASE 11.12R: the ONE real composition path -- AUTHORED/ELIGIBLE CANDIDATES -> COUNTERFACTUAL
  // CAUSALITY GATE -> PRODUCT SURFACE OWNERSHIP GATE -> PLAYER-VISIBLE ACTIONS -> RENDER (below).
  const causalVerdict = evaluateRealLeftoverStockCausalClaim(state);
  const candidatesAfterCausalityGate = applyCausalityGate(buildAskCandidates(state), causalVerdict);
  const { accepted: acceptedAskActions, rejected: rejectedAskActions } = evaluateProductSurface(candidatesAfterCausalityGate);

  // PHASE 11.13A: does NOT feed into rendering (directive Section 14 -- product scene stays
  // simple, no knowledge badges/evidence labels on the PLAYER UI). Dev/debug evidence only --
  // see the debug panel below.
  const leftoverQuestionPrerequisite = evaluateLeftoverQuestionPrerequisite(state);

  // PHASE 11.12R Section 6/7: the verified call-site literal `if (import.meta.env.DEV)` pattern --
  // NOT a default parameter (see devOnlyDisclosure.ts's comment on the PHASE 11.12 mistake this
  // avoids repeating). Compiled out of a production bundle entirely; not merely hidden by `showDebug`.
  let devOnlyVertexDisclosure: string | null = null;
  if (import.meta.env.DEV) {
    devOnlyVertexDisclosure = getDevOnlyDisclosureText(
      true,
      "洋平のセリフは `capturedYoheiLines.ts`（実測 Vertex AI gemini-2.5-flash 出力、project=gas-test-runner-20260620-wjxf, location=asia-northeast1、記録日 2026-09-09）の再生です。",
    );
  }

  return (
    <div className="ns-frame" data-testid="playable11-frame">
      <div className="ns-topbar">
        <span className="ns-topbar-label">洋平商店 — 祭りの後で（隔離プロトタイプ）</span>
        <button className="ns-exit" onClick={onExit}>
          ホームへ戻る
        </button>
      </div>
      <div className="ns-stage">
        {!started && (
          <div className="ns-choices" data-testid="playable11-begin-choice">
            <p>祭りの翌日。顔なじみの洋平の店を訪れた。洋平は、値引き用の棚の準備をしている。</p>
            <button className="ns-choice-button" onClick={begin} data-testid="playable11-begin">
              店に入る
            </button>
          </div>
        )}

        {started && (
          <>
            <div className="ns-narration" data-testid="playable11-log">
              {log.map((entry, i) => (
                <div key={i}>
                  {entry.narration.map((line, j) => (
                    <p key={`n-${j}`}>{line}</p>
                  ))}
                  {entry.yoheiLine && <p data-testid="playable11-yohei-line">「{entry.yoheiLine}」</p>}
                </div>
              ))}
            </div>

            <div className="ns-narration" data-testid="playable11-world-continuity">
              {yoheiContinuesLeftoverStockWorkNarration(state).map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>

            {!left && (
              <div className="ns-choices" data-testid="playable11-actions">
                {pendingOpen && (
                  <>
                    <button className="ns-choice-button pw11-primary" onClick={acceptHelp} data-testid="playable11-accept">
                      手伝う
                    </button>
                    <button className="ns-choice-button pw11-primary" onClick={declineHelp} data-testid="playable11-decline">
                      今日はやめておく
                    </button>
                  </>
                )}
                {acceptedAskActions.map((action) => {
                  const meta = ASK_ACTION_UI_META[action.actionId];
                  if (!meta) return null;
                  return (
                    <button
                      key={action.actionId}
                      className={`ns-choice-button pw11-${meta.role}`}
                      onClick={() => askQuestion(action, meta.utterance)}
                      data-testid={meta.testId}
                    >
                      {meta.utterance}
                    </button>
                  );
                })}
                <button className="ns-choice-button pw11-leave" onClick={leave} data-testid="playable11-leave">
                  その場を離れる
                </button>
              </div>
            )}

            {left && <p data-testid="playable11-left-notice">その場を後にした。</p>}
          </>
        )}

        <div className="ns-restart-row">
          <button className="ns-exit" onClick={() => setShowDebug((v) => !v)} data-testid="playable11-debug-toggle">
            {showDebug ? "開発者用トレースを隠す" : "開発者用トレースを表示"}
          </button>
        </div>

        {showDebug && (
          <div
            data-testid="playable11-debug-panel"
            style={{ border: "2px dashed #888", padding: "12px", marginTop: "12px", fontFamily: "monospace", fontSize: "12px", whiteSpace: "pre-wrap", background: "#f4f4f4", color: "#111" }}
          >
            <strong>開発者用パネル（プレイヤー向け画面には表示されません）</strong>
            {devOnlyVertexDisclosure && <p data-testid="playable11-debug-dev-only-disclosure">{devOnlyVertexDisclosure}</p>}
            <strong>PendingReply</strong>
            <pre>{JSON.stringify(state.pendingReply, null, 2)}</pre>
            <strong>Materials</strong>
            <pre>{JSON.stringify(state.materials, null, 2)}</pre>
            <strong>Product Surface gate evidence (PHASE 11.12R)</strong>
            <pre data-testid="playable11-debug-product-surface-evidence">{JSON.stringify({ rejectedAskActions, causalVerdict }, null, 2)}</pre>
            <strong>Question Prerequisite vs Target-Fact evidence (PHASE 11.13A)</strong>
            <pre data-testid="playable11-debug-question-prerequisite-evidence">{JSON.stringify(leftoverQuestionPrerequisite, null, 2)}</pre>
            <strong>Traces</strong>
            {traces.length === 0 ? <p>(まだトレースはありません)</p> : traces.map((t, i) => <pre key={i}>{JSON.stringify(t, null, 2)}</pre>)}
          </div>
        )}
      </div>
    </div>
  );
}
