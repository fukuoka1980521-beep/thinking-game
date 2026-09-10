import { useState } from "react";
import "./newlifecore.css";
import townImg from "../assets/newlifev02/challenge-town.png";
import yoheiImg from "../assets/newlifev02/yohei.png";
import miyokoImg from "../assets/newlifev02/miyoko.png";
import jinImg from "../assets/newlifev02/soma-jin.png";
import { LOCATION_LABEL, buildEndOfDayNarrative, buildLocationScene, openingLineFor, reachableLocations } from "./content/day1";
import { buildNpcAiContext } from "./dialogue/contextBuilder";
import { deterministicAdapter } from "./dialogue/deterministicAdapter";
import { liveNpcAdapter } from "./dialogue/liveAdapterClient";
import { addWorldFact, canSleep, doShortAction, moveTo, recordConversationTurn, sleep, timeRemainingLabel } from "./engine";
import { npcDisplayName } from "./npcDefs";
import { createInitialCoreState, formatClock } from "./types";
import type { CoreState, LocationId, NpcId } from "./types";

const PORTRAIT_SRC: Partial<Record<NpcId, string>> = { yohei: yoheiImg, miyoko: miyokoImg, jin: jinImg };

function Portrait({ npc }: { npc: NpcId }) {
  const src = PORTRAIT_SRC[npc];
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className="nlc-portrait nlc-portrait-fallback" data-testid={`nlc-portrait-${npc}`} data-image-failed={!src ? undefined : "true"}>
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

  function startGame() {
    setState((s) => ({ ...s, started: true }));
  }

  function headToChallengeCenter() {
    setState((s) => moveTo(s, "CHALLENGE_CENTER"));
  }

  function move(location: LocationId) {
    setActiveConversation(null);
    setSpecialResult(null);
    setState((s) => moveTo(s, location));
  }

  function openConversation(npc: NpcId) {
    setActiveConversation(npc);
    setState((s) => (s.flags[`met_${npc}`] ? s : { ...s, flags: { ...s.flags, [`met_${npc}`]: true } }));
  }

  function closeConversation() {
    setActiveConversation(null);
    setFreeTextInput("");
  }

  async function submitFreeText() {
    if (!activeConversation || !freeTextInput.trim() || pending) return;
    const npc = activeConversation;
    const text = freeTextInput.trim();
    setPending(true);
    setFreeTextInput("");
    const context = buildNpcAiContext(npc, state, text);
    const adapter = useLive ? liveNpcAdapter : deterministicAdapter;
    const reply = await adapter(context);
    setState((s) => recordConversationTurn(s, npc, text, reply.visibleUtterance));
    setPending(false);
  }

  function runSpecialAction(actionId: string) {
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
    }
  }

  function goSleep() {
    setState((s) => sleep(s));
  }

  if (!state.started) {
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
          <p className="nlc-intro-copy">あなたは今日から、この町で暮らし始めます。</p>
          <button className="nlc-btn" onClick={startGame} data-testid="nlc-start">
            目を覚ます
          </button>
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
          <div className="nlc-scene-card" data-testid="nlc-day-end">
            <div className="nlc-summary-list" data-testid="nlc-worldfacts-list">
              {buildEndOfDayNarrative(state).map((line, i) => (
                <p className="nlc-summary-item" key={i}>
                  {line}
                </p>
              ))}
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
  const scene = state.playerLocation !== "TRIAL_HOUSE" || hasVenturedOut ? buildLocationScene(state) : null;

  return (
    <div className="nlc-frame" data-testid="nlc-frame">
      <div className="nlc-topbar">
        <span className="nlc-topbar-label">チャレンジ町</span>
        <span className="nlc-clock" data-testid="nlc-clock">
          DAY1 ・ {formatClock(state.time)}
        </span>
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
            <div className="nlc-footer-actions">
              <button className="nlc-btn" onClick={headToChallengeCenter} data-testid="nlc-go-challenge-center">
                チャレンジセンターへ向かう
              </button>
            </div>
          </div>
        )}

        {scene && (
          <div className="nlc-scene-card" data-testid="nlc-location-scene">
            {scene.ambientLine && <p className="nlc-ambient">{scene.ambientLine}</p>}

            {scene.npcsHere.map((npc) => (
              <div className="nlc-npc-card" key={npc} data-testid={`nlc-npc-card-${npc}`}>
                <div className="nlc-npc-header">
                  <Portrait npc={npc} />
                  <div>
                    <div className="nlc-npc-name">{npcDisplayName(npc)}</div>
                    {activeConversation !== npc && <p className="nlc-npc-line">{openingLineFor(npc, Boolean(state.flags[`met_${npc}`]))}</p>}
                  </div>
                </div>

                {activeConversation === npc ? (
                  <div className="nlc-conversation" data-testid={`nlc-conversation-${npc}`}>
                    <div className="nlc-conversation-log" data-testid={`nlc-conversation-log-${npc}`}>
                      {state.npcMemory[npc].map((t, i) => (
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
                    <button className="nlc-leave-btn" onClick={closeConversation} data-testid={`nlc-conversation-close-${npc}`}>
                      会話を終える
                    </button>
                  </div>
                ) : (
                  <div className="nlc-npc-actions">
                    <button className="nlc-choice" onClick={() => openConversation(npc)} data-testid={`nlc-talk-${npc}`}>
                      自由に話す
                    </button>
                  </div>
                )}
              </div>
            ))}

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
          </div>
        )}

        {(scene || hasVenturedOut) && !activeConversation && (
          <div className="nlc-movelist" data-testid="nlc-movelist">
            <p className="nlc-summary-heading">どこへ行きますか（残り{timeRemainingLabel(state.time)}）</p>
            <div className="nlc-picklist">
              {reachableLocations(state.playerLocation).map((loc) => (
                <button key={loc} className="nlc-pick-btn" onClick={() => move(loc)} data-testid={`nlc-move-${loc}`}>
                  {LOCATION_LABEL[loc]}
                </button>
              ))}
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
      </div>
    </div>
  );
}
