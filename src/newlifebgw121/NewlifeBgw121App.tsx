import { useState } from "react";
import "../newlife/situation/situation.css";
import { createInitialBgwState, commitConsequence, npcsPresentAt, yoheiCurrentActivity, miyokoCurrentActivity, advanceWorldTick } from "../research/bounded-generative-world/worldState";
import { buildNpcDialoguePacket } from "../research/bounded-generative-world/packet";
import { deterministicTestAdapter } from "../research/bounded-generative-world/testAdapter";
import { liveVertexAdapter } from "../research/bounded-generative-world/liveAdapterClient";
import { LOCATIONS, TRAVEL_EDGES, NPC_CANON } from "../research/bounded-generative-world/canonData";
import type { BgwNpcId, BgwWorldState, LocationId, NpcResponseEnvelope } from "../research/bounded-generative-world/types";

/**
 * PHASE 12.1: Bounded Generative World playable vertical slice -- isolated route
 * `?newlifebgw121=1`. Does not modify or reuse `?newlifeplayable11=1` (the frozen fixed-dialogue
 * baseline). See docs/research/evaluation/phase-12-0/ and phase-12-0r/ for the design this
 * implements, and docs/research/evaluation/phase-12-1/ for this phase's evidence.
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

function activityLinesFor(location: LocationId, state: BgwWorldState): string[] {
  const lines: string[] = [];
  if (location === "YOHEI_STORE") lines.push(yoheiCurrentActivity(state));
  if (location === "CAFE_NODOKA") lines.push(miyokoCurrentActivity(state));
  const present = npcsPresentAt(state, location);
  if (location !== "YOHEI_STORE" && location !== "CAFE_NODOKA" && present.includes("jin")) {
    lines.push("相馬が、ここで修理の仕事をしている。");
  }
  return lines;
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

  function travelTo(location: LocationId) {
    setActiveNpc(null);
    setState((s) => {
      const ticked = advanceWorldTick(s); // Jin's own job progresses independent of whom the player talks to
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
    setLog((prev) => [...prev, { npc: activeNpc, playerUtterance: utterance, envelope }]);
    setPending(false);
  }

  const currentLocationNpcs = npcsPresentAt(state, state.playerLocation);
  const reachable = TRAVEL_EDGES[state.playerLocation] ?? [];

  return (
    <div className="ns-frame" data-testid="bgw121-frame">
      <div className="ns-topbar">
        <span className="ns-topbar-label">チャレンジ町（Bounded Generative World -- 隔離プロトタイプ）</span>
        <button className="ns-exit" onClick={onExit}>
          ホームへ戻る
        </button>
      </div>
      <div className="ns-stage">
        {!started && (
          <div className="ns-choices" data-testid="bgw121-opening">
            <p data-testid="bgw121-opening-text">
              57歳。長年勤めた仕事を辞めた。次の方向はまだ決めていない。自分の意志で、チャレンジ町の30日間トライアル滞在に応募した。
              仮住まいは30日間だけで、DAY30には鍵を返さなければならない。
            </p>
            <button className="ns-choice-button" onClick={() => setStarted(true)} data-testid="bgw121-begin">
              町を歩き始める
            </button>
          </div>
        )}

        {started && (
          <>
            <div className="ns-narration" data-testid="bgw121-location">
              <p data-testid="bgw121-location-name">現在地: {locationName(state.playerLocation)}</p>
              <p>{locationDescription(state.playerLocation)}</p>
              {activityLinesFor(state.playerLocation, state).map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>

            <div className="ns-choices" data-testid="bgw121-map">
              {reachable.map((loc) => (
                <button key={loc} className="ns-choice-button" onClick={() => travelTo(loc)} data-testid={`bgw121-travel-${loc}`}>
                  {locationName(loc)}へ行く
                </button>
              ))}
            </div>

            {currentLocationNpcs.length > 0 && (
              <div className="ns-choices" data-testid="bgw121-npc-list">
                {currentLocationNpcs.map((npc) => (
                  <button key={npc} className="ns-choice-button pw11-secondary" onClick={() => setActiveNpc(npc)} data-testid={`bgw121-talk-${npc}`}>
                    {NPC_CANON[npc].displayName}と話す
                  </button>
                ))}
              </div>
            )}

            {activeNpc && (
              <div className="ns-narration" data-testid="bgw121-conversation">
                <p>
                  <strong>{NPC_CANON[activeNpc].displayName}と話している</strong>
                </p>
                {log
                  .filter((e) => e.npc === activeNpc)
                  .map((e, i) => (
                    <div key={i}>
                      <p data-testid="bgw121-player-line">プレイヤー「{e.playerUtterance}」</p>
                      <p data-testid="bgw121-npc-line">
                        {NPC_CANON[e.npc].displayName}「{e.envelope.visibleUtterance}」
                      </p>
                    </div>
                  ))}
                <input
                  data-testid="bgw121-free-text-input"
                  value={input}
                  onChange={(ev) => setInput(ev.target.value)}
                  onKeyDown={(ev) => {
                    if (ev.key === "Enter") sendUtterance();
                  }}
                  placeholder="話しかける内容を入力"
                />
                <button data-testid="bgw121-free-text-send" onClick={sendUtterance} disabled={pending || !input.trim()}>
                  {pending ? "…" : "話す"}
                </button>
                <button data-testid="bgw121-npc-close" onClick={() => setActiveNpc(null)}>
                  離れる
                </button>
              </div>
            )}

            <div className="ns-restart-row">
              {import.meta.env.DEV && (
                <label data-testid="bgw121-live-toggle-label">
                  <input type="checkbox" data-testid="bgw121-live-toggle" checked={useLive} onChange={(ev) => setUseLive(ev.target.checked)} />
                  ライブAIを使う（開発者用）
                </label>
              )}
              <button className="ns-exit" onClick={() => setShowDebug((v) => !v)} data-testid="bgw121-debug-toggle">
                {showDebug ? "開発者用パネルを隠す" : "開発者用パネルを表示"}
              </button>
            </div>

            {showDebug && (
              <div data-testid="bgw121-debug-panel" style={{ border: "2px dashed #888", padding: "12px", marginTop: "12px", fontFamily: "monospace", fontSize: "12px", whiteSpace: "pre-wrap", background: "#f4f4f4", color: "#111" }}>
                <strong>開発者用パネル（プレイヤー向け画面には表示されません）</strong>
                <pre data-testid="bgw121-debug-state">{JSON.stringify(state, null, 2)}</pre>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
