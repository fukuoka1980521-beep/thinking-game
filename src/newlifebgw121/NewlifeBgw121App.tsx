import { useState } from "react";
import "./newlifebgw121.css";
import { createInitialBgwState, commitConsequence, npcsPresentAt, yoheiCurrentActivity, miyokoCurrentActivity, advanceWorldTick, hasActiveMaterial } from "../research/bounded-generative-world/worldState";
import { buildNpcDialoguePacket } from "../research/bounded-generative-world/packet";
import { deterministicTestAdapter } from "../research/bounded-generative-world/testAdapter";
import { liveVertexAdapter } from "../research/bounded-generative-world/liveAdapterClient";
import { LOCATIONS, TRAVEL_EDGES, NPC_CANON } from "../research/bounded-generative-world/canonData";
import { MAP_NODE_POSITION } from "./mapLayout";
import type { BgwNpcId, BgwWorldState, LocationId, NpcResponseEnvelope } from "../research/bounded-generative-world/types";

/**
 * PHASE 12.1: Bounded Generative World playable vertical slice -- isolated route
 * `?newlifebgw121=1`. PHASE 12.2: visual Product surface over the SAME unchanged generative
 * pipeline (classification/prompt/envelope/State Admission/NPC canon/activity rules are frozen
 * this phase -- see docs/research/evaluation/phase-12-2/CODE_SELF_AUDIT_V1.md). Does not modify
 * or reuse `?newlifeplayable11=1` (the frozen fixed-dialogue baseline).
 */

interface LogEntry {
  npc: BgwNpcId;
  playerUtterance: string;
  envelope: NpcResponseEnvelope;
}

function locationName(id: LocationId): string {
  return LOCATIONS.find((l) => l.id === id)?.displayName ?? id;
}

function locationDescription(id: LocationId): string {
  return LOCATIONS.find((l) => l.id === id)?.description ?? "";
}

function activityFor(npc: BgwNpcId, state: BgwWorldState): string {
  if (npc === "yohei") return yoheiCurrentActivity(state);
  if (npc === "miyoko") return miyokoCurrentActivity(state);
  return state.jinJobLocation ? `${locationName(state.jinJobLocation)}で修理の仕事をしている。` : "今日はどこか別の場所で仕事をしているようだ。";
}

/** Engineering placeholder only -- see ART_ASSET_MANIFEST_V1.md. Never a final visual. */
function PortraitPlaceholder({ npc }: { npc: BgwNpcId }) {
  const initial = NPC_CANON[npc].displayName.slice(0, 1);
  return (
    <div className={`bgw-portrait bgw-placeholder bgw-portrait-${npc}`} data-testid={`bgw121-portrait-${npc}`} aria-label={`${NPC_CANON[npc].displayName}（仮画像）`}>
      {initial}
    </div>
  );
}

export function NewlifeBgw121App({ onExit }: { onExit: () => void }) {
  const [started, setStarted] = useState(false);
  const [state, setState] = useState<BgwWorldState>(() => createInitialBgwState());
  const [activeNpc, setActiveNpc] = useState<BgwNpcId | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [input, setInput] = useState("");
  const [useLive, setUseLive] = useState(false);
  const [pending, setPending] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [justCommitted, setJustCommitted] = useState<string | null>(null);

  function travelTo(location: LocationId) {
    setActiveNpc(null);
    setJustCommitted(null);
    setState((s) => {
      const ticked = advanceWorldTick(s);
      return { ...ticked, playerLocation: location, visitedLocations: ticked.visitedLocations.includes(location) ? ticked.visitedLocations : [...ticked.visitedLocations, location] };
    });
  }

  async function sendUtterance() {
    if (!activeNpc || !input.trim() || pending) return;
    const utterance = input.trim();
    setPending(true);
    setInput("");
    const packet = buildNpcDialoguePacket(activeNpc, state, utterance);
    const adapter = useLive ? liveVertexAdapter : deterministicTestAdapter;
    const envelope = await adapter(packet);
    setState((s) => {
      const withLog = { ...s, experienceLog: [...s.experienceLog, { day: s.day, npc: activeNpc, playerUtterance: utterance, classification: envelope.classification, npcResponseIntent: envelope.npcResponseIntent }] };
      return envelope.proposedConsequenceId ? commitConsequence(withLog, envelope.proposedConsequenceId) : withLog;
    });
    setJustCommitted(envelope.proposedConsequenceId);
    setLog((prev) => [...prev, { npc: activeNpc, playerUtterance: utterance, envelope }]);
    setPending(false);
  }

  const currentLocationNpcs = npcsPresentAt(state, state.playerLocation);
  const reachable = TRAVEL_EDGES[state.playerLocation] ?? [];
  const yoheiPromiseActive = hasActiveMaterial(state, "yohei_help_promise");

  return (
    <div className="bgw-frame" data-testid="bgw121-frame">
      <div className="bgw-topbar">
        <span className="bgw-topbar-label">チャレンジ町</span>
        <button className="bgw-exit" onClick={onExit}>
          ホームへ戻る
        </button>
      </div>

      {!started && (
        <div className="bgw-opening" data-testid="bgw121-opening">
          <h1 className="bgw-opening-title">チャレンジ町の30日間</h1>
          <p className="bgw-opening-text" data-testid="bgw121-opening-text">
            57歳。長年勤めた仕事を辞めた。次の方向はまだ決めていない。
            <br />
            自分の意志で、チャレンジ町の30日間トライアル滞在に応募した。
            <br />
            仮住まいは30日間だけで、DAY30には鍵を返さなければならない。
          </p>
          <button className="bgw-opening-begin" onClick={() => setStarted(true)} data-testid="bgw121-begin">
            町を歩き始める
          </button>
        </div>
      )}

      {started && (
        <>
          {!activeNpc && (
          <div className="bgw-map" data-testid="bgw121-map">
            <span className="bgw-map-caption">チャレンジ町</span>
            {LOCATIONS.map((loc) => {
              const pos = MAP_NODE_POSITION[loc.id];
              const isCurrent = loc.id === state.playerLocation;
              const showBadge = loc.id === "YOHEI_STORE" && yoheiPromiseActive;
              const reachableFromHere = reachable.includes(loc.id);
              return (
                <button
                  key={loc.id}
                  className={`bgw-map-node${isCurrent ? " is-current" : ""}`}
                  style={{ left: `${pos.x * 100}%`, top: `${pos.y * 100}%` }}
                  onClick={() => reachableFromHere && travelTo(loc.id)}
                  disabled={!reachableFromHere && !isCurrent}
                  data-testid={`bgw121-node-${loc.id}`}
                >
                  <span className="bgw-map-node-marker">
                    {loc.displayName.slice(0, 1)}
                    {showBadge && <span className="bgw-map-node-badge" data-testid="bgw121-map-badge-yohei" />}
                  </span>
                  <span className="bgw-map-node-label">{loc.displayName}</span>
                </button>
              );
            })}
          </div>
          )}

          {!activeNpc && (
          <div className="bgw-location" data-testid="bgw121-location">
            <p className="bgw-location-name" data-testid="bgw121-location-name">
              現在地: {locationName(state.playerLocation)}
            </p>
            <p className="bgw-location-desc">{locationDescription(state.playerLocation)}</p>

            {currentLocationNpcs.length > 0 && (
              <div className="bgw-npc-presence" data-testid="bgw121-npc-presence">
                {currentLocationNpcs.map((npc) => (
                  <div className="bgw-npc-card" key={npc} data-testid={`bgw121-npc-card-${npc}`}>
                    <PortraitPlaceholder npc={npc} />
                    <div className="bgw-npc-text">
                      <span className="bgw-npc-name">{NPC_CANON[npc].displayName}</span>
                      <span className="bgw-npc-activity" data-testid={`bgw121-activity-${npc}`}>
                        {activityFor(npc, state)}
                      </span>
                    </div>
                    <button className="bgw-npc-talk-button" onClick={() => setActiveNpc(npc)} data-testid={`bgw121-talk-${npc}`}>
                      話しかける
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="bgw-map-nav" data-testid="bgw121-map-nav">
              {reachable.map((loc) => (
                <button key={loc} className="bgw-map-nav-button" onClick={() => travelTo(loc)} data-testid={`bgw121-travel-${loc}`}>
                  {locationName(loc)}へ行く
                </button>
              ))}
            </div>
          </div>
          )}

          {activeNpc && (
            <div className="bgw-conversation" data-testid="bgw121-conversation">
              <div className="bgw-conversation-header">
                <PortraitPlaceholder npc={activeNpc} />
                <span className="bgw-conversation-npc-name">{NPC_CANON[activeNpc].displayName}</span>
              </div>

              {justCommitted && (
                <p className="bgw-consequence-note" data-testid="bgw121-consequence-note">
                  何かが、今日の記憶に残ったようだ。
                </p>
              )}

              <div className="bgw-conversation-log" data-testid="bgw121-conversation-log">
                {log
                  .filter((e) => e.npc === activeNpc)
                  .map((e, i) => (
                    <div key={i} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <p className="bgw-line-player" data-testid="bgw121-player-line">
                        {e.playerUtterance}
                      </p>
                      <p className="bgw-line-npc" data-testid="bgw121-npc-line">
                        {e.envelope.visibleUtterance}
                      </p>
                    </div>
                  ))}
                {pending && (
                  <p className="bgw-line-waiting" data-testid="bgw121-waiting-indicator" aria-label={`${NPC_CANON[activeNpc].displayName}が考えている`}>
                    <span>・</span>
                    <span>・</span>
                    <span>・</span>
                  </p>
                )}
              </div>

              <div className="bgw-conversation-input-row">
                <input
                  className="bgw-free-text-input"
                  data-testid="bgw121-free-text-input"
                  value={input}
                  onChange={(ev) => setInput(ev.target.value)}
                  onKeyDown={(ev) => {
                    if (ev.key === "Enter") sendUtterance();
                  }}
                  placeholder={`${NPC_CANON[activeNpc].displayName}に話しかける`}
                  disabled={pending}
                />
                <button className="bgw-send-button" onClick={sendUtterance} disabled={pending || !input.trim()} data-testid="bgw121-free-text-send" aria-label="送る">
                  送
                </button>
              </div>
              <button className="bgw-leave-button" onClick={() => setActiveNpc(null)} data-testid="bgw121-npc-close">
                地図に戻る
              </button>
            </div>
          )}

          <div className="bgw-dev-row">
            {import.meta.env.DEV && (
              <label data-testid="bgw121-live-toggle-label">
                <input type="checkbox" data-testid="bgw121-live-toggle" checked={useLive} onChange={(ev) => setUseLive(ev.target.checked)} />
                ライブAIを使う（開発者用）
              </label>
            )}
            <button className="bgw-exit" onClick={() => setShowDebug((v) => !v)} data-testid="bgw121-debug-toggle">
              {showDebug ? "開発者用パネルを隠す" : "開発者用パネルを表示"}
            </button>
          </div>

          {showDebug && (
            <div className="bgw-dev-panel" data-testid="bgw121-debug-panel">
              <strong>開発者用パネル（プレイヤー向け画面には表示されません）</strong>
              <pre data-testid="bgw121-debug-state">{JSON.stringify(state, null, 2)}</pre>
            </div>
          )}
        </>
      )}
    </div>
  );
}
