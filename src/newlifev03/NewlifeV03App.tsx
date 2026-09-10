import { useState } from "react";
import "./newlifev03.css";
import townImg from "../assets/newlifev02/challenge-town.png";
import yoheiImg from "../assets/newlifev02/yohei.png";
import miyokoImg from "../assets/newlifev02/miyoko.png";
import jinImg from "../assets/newlifev02/soma-jin.png";
import { renderBeat } from "./content/index";
import { applyChoice, applyFreeText, applyOnEnter, daySummaryBundle, startNextDay, visitLocation } from "./engine";
import { npcFreeTextReply } from "./freeTextAi";
import type { FreeTextTopic } from "./freeTextAi";
import { npcDisplayName } from "./npcData";
import type { V03NpcId as _V03NpcId } from "./npcData";
import { createInitialV03State } from "./types";
import type { V03Choice, V03ImageKey, V03LocationId, V03State } from "./types";
import { LOCATIONS } from "../research/bounded-generative-world/canonData";

const IMAGE_SRC: Record<V03ImageKey, string> = { town: townImg, yohei: yoheiImg, miyoko: miyokoImg, jin: jinImg };

function locationDisplayName(id: V03LocationId): string {
  if (id === "CHALLENGE_CENTER") return "チャレンジセンター";
  return LOCATIONS.find((l) => l.id === id)?.displayName ?? id;
}

function HeroImage({ testId }: { testId: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <div className="v03-hero" data-testid={testId} data-image-failed="true" />;
  return <img className="v03-hero-img" src={IMAGE_SRC.town} alt="" data-testid={testId} onError={() => setFailed(true)} />;
}

function Portrait({ npc, testId }: { npc: "yohei" | "miyoko" | "jin"; testId: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="v03-portrait" data-testid={testId} data-image-failed="true" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
        {npcDisplayName(npc).slice(0, 1)}
      </div>
    );
  }
  return <img className="v03-portrait" src={IMAGE_SRC[npc]} alt={npcDisplayName(npc)} data-testid={testId} onError={() => setFailed(true)} />;
}

export function NewlifeV03App({ onExit }: { onExit: () => void }) {
  const [state, setState] = useState<V03State>(() => createInitialV03State());
  const [pendingChoice, setPendingChoice] = useState<V03Choice | null>(null);
  const [freeTextInput, setFreeTextInput] = useState("");
  const [freeTextReply, setFreeTextReply] = useState<{ npc: _V03NpcId; visibleUtterance: string; topic: FreeTextTopic } | null>(null);

  // The choice's result text must be shown BEFORE its effects (including advancing beatId) are
  // applied -- otherwise, whenever `next` happens to be a PICK/FREE_TEXT beat (which render
  // immediately, with no "pendingResult" concept of their own), the result would never appear
  // and the UI would jump straight past it.
  function pick(choice: V03Choice) {
    setPendingChoice(choice);
  }

  function confirmChoice() {
    if (!pendingChoice) return;
    setState((s) => applyChoice(s, pendingChoice));
    setPendingChoice(null);
  }

  function pickLocation(loc: V03LocationId, next: string) {
    setState((s) => visitLocation(s, loc, next));
  }

  function continueScene(next: string, onEnter: Parameters<typeof applyOnEnter>[1]) {
    setState((s) => ({ ...applyOnEnter(s, onEnter), beatId: next }));
  }

  function submitFreeText(npc: _V03NpcId) {
    const reply = npcFreeTextReply(npc, freeTextInput);
    setFreeTextReply({ npc, visibleUtterance: reply.visibleUtterance, topic: reply.topic });
  }

  function continueFromFreeText(next: string) {
    if (!freeTextReply) return;
    setState((s) => applyFreeText(s, freeTextReply.npc, freeTextReply.topic, next));
    setFreeTextInput("");
    setFreeTextReply(null);
  }

  function goNextDay() {
    setState((s) => startNextDay(s));
  }

  if (!state.started) {
    return (
      <div className="v03-frame" data-testid="v03-frame">
        <div className="v03-topbar">
          <span className="v03-topbar-label">チャレンジ町</span>
          <button className="v03-exit" onClick={onExit} data-testid="v03-exit">
            ホームへ戻る
          </button>
        </div>
        <div className="v03-panel">
          <div className="v03-hero" data-testid="v03-opening">
            <HeroImage testId="v03-town-image" />
            <div className="v03-hero-shade" />
            <div className="v03-hero-text">
              <h1 className="v03-hero-title">チャレンジ町</h1>
              <p className="v03-hero-sub">30日以内に、自分の次の生活を決める。</p>
            </div>
          </div>
          <p className="v03-intro-copy">あなたは今日から、この町で暮らし始めます。</p>
          <button className="v03-btn" onClick={() => setState((s) => ({ ...s, started: true }))} data-testid="v03-start">
            町を歩き始める
          </button>
        </div>
      </div>
    );
  }

  const beat = renderBeat(state);
  const daysLeft = 30 - state.day;

  return (
    <div className="v03-frame" data-testid="v03-frame">
      <div className="v03-topbar">
        <span className="v03-topbar-label">チャレンジ町</span>
        <span className="v03-day-counter" data-testid="v03-day-counter">
          DAY {state.day} ・ 残り{daysLeft}日
        </span>
        <button className="v03-exit" onClick={onExit} data-testid="v03-exit">
          ホームへ戻る
        </button>
      </div>
      <div className="v03-panel">
        {beat.kind === "SCENE" && (
          <div className="v03-scene-card" data-testid="v03-step-scene">
            {beat.image === "town" ? (
              <div className="v03-hero" style={{ minHeight: 140 }}>
                <HeroImage testId="v03-scene-town-image" />
              </div>
            ) : (
              <div className="v03-npc-block">
                <Portrait npc={beat.image} testId={`v03-portrait-${beat.image}`} />
                {beat.speaker && <div className="v03-npc-name">{npcDisplayName(beat.speaker)}</div>}
              </div>
            )}
            <span className="v03-time-label" data-testid="v03-time-label">
              {beat.timeLabel}
            </span>
            <div className="v03-lines">
              {beat.lines.map((l, i) => (
                <p key={i} style={{ whiteSpace: "pre-line" }}>
                  {l}
                </p>
              ))}
            </div>
            {beat.choices.length > 0 && !pendingChoice && (
              <div className="v03-choices">
                {beat.choices.map((c) => (
                  <button key={c.id} type="button" className="v03-choice" onClick={() => pick(c)} data-testid={`v03-choice-${c.id}`}>
                    {c.label}
                  </button>
                ))}
              </div>
            )}
            {pendingChoice && (
              <>
                <div className="v03-result" data-testid="v03-result">
                  {pendingChoice.resultText}
                </div>
                <div className="v03-footer-actions">
                  <button className="v03-btn" onClick={confirmChoice} data-testid="v03-continue">
                    続ける
                  </button>
                </div>
              </>
            )}
            {beat.choices.length === 0 && (
              <div className="v03-footer-actions">
                <button className="v03-btn" onClick={() => continueScene(beat.continueNext!, beat.onEnter)} data-testid="v03-continue">
                  {beat.continueLabel ?? "続ける"}
                </button>
              </div>
            )}
          </div>
        )}

        {beat.kind === "PICK" && (
          <div data-testid="v03-step-pick">
            <span className="v03-time-label" data-testid="v03-time-label">
              {beat.timeLabel}
            </span>
            <p className="v03-pick-prompt">{beat.prompt}</p>
            <div className="v03-picklist">
              {beat.options.map((o) => (
                <button key={o.location} type="button" className="v03-pick-btn" onClick={() => pickLocation(o.location, o.next)} data-testid={`v03-pick-${o.location}`}>
                  <strong>{locationDisplayName(o.location)}</strong>
                </button>
              ))}
            </div>
          </div>
        )}

        {beat.kind === "FREE_TEXT" && (
          <div className="v03-scene-card" data-testid="v03-step-freetext">
            <div className="v03-npc-block">
              {beat.npc !== "kamiya" ? <Portrait npc={beat.npc} testId={`v03-portrait-${beat.npc}`} /> : null}
              <div className="v03-npc-name">{npcDisplayName(beat.npc)}</div>
            </div>
            <span className="v03-time-label">{beat.timeLabel}</span>
            <div className="v03-lines">
              {beat.promptLines.map((l, i) => (
                <p key={i}>{l}</p>
              ))}
            </div>
            {!freeTextReply ? (
              <div className="v03-freetext-input-row">
                <input
                  className="v03-freetext-input"
                  data-testid="v03-freetext-input"
                  value={freeTextInput}
                  onChange={(ev) => setFreeTextInput(ev.target.value)}
                  onKeyDown={(ev) => {
                    if (ev.key === "Enter" && freeTextInput.trim()) submitFreeText(beat.npc);
                  }}
                  placeholder={`${npcDisplayName(beat.npc)}に答える`}
                />
                <button className="v03-btn" onClick={() => freeTextInput.trim() && submitFreeText(beat.npc)} disabled={!freeTextInput.trim()} data-testid="v03-freetext-submit">
                  送る
                </button>
              </div>
            ) : (
              <>
                <div className="v03-result" data-testid="v03-freetext-reply">
                  {freeTextReply.visibleUtterance}
                </div>
                <div className="v03-footer-actions">
                  <button className="v03-btn" onClick={() => continueFromFreeText(beat.next)} data-testid="v03-continue">
                    続ける
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {beat.kind === "WRAP" && (
          <div className="v03-scene-card" data-testid="v03-step-wrap">
            {(() => {
              const { today, tomorrow, curious } = daySummaryBundle(state);
              return (
                <>
                  <p className="v03-summary-heading">今日あったこと</p>
                  <ul className="v03-summary-list" data-testid="v03-today-list">
                    {(today.length ? today : ["特にありません"]).map((t, i) => (
                      <li className="v03-summary-item" key={i}>
                        {t}
                      </li>
                    ))}
                  </ul>
                  {tomorrow.length > 0 && (
                    <>
                      <p className="v03-summary-heading">明日の予定</p>
                      <ul className="v03-summary-list" data-testid="v03-tomorrow-list">
                        {tomorrow.map((t, i) => (
                          <li className="v03-summary-item" key={i}>
                            {t}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  {curious.length > 0 && (
                    <>
                      <p className="v03-summary-heading">気になっていること</p>
                      <ul className="v03-summary-list" data-testid="v03-curious-list">
                        {curious.map((t, i) => (
                          <li className="v03-summary-item" key={i}>
                            {t}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </>
              );
            })()}
            <div className="v03-footer-actions">
              {state.day < 7 ? (
                <button className="v03-btn" onClick={goNextDay} data-testid="v03-next-day">
                  翌日へ
                </button>
              ) : (
                <p className="v03-intro-copy" data-testid="v03-ending-note">
                  残り23日。町の続きは、また今度。
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
