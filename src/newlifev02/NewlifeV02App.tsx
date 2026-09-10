import { useMemo, useState } from "react";
import "./newlifev02.css";
import townImg from "../assets/newlifev02/challenge-town.png";
import yoheiImg from "../assets/newlifev02/yohei.png";
import miyokoImg from "../assets/newlifev02/miyoko.png";
import jinImg from "../assets/newlifev02/soma-jin.png";
import { LOCATION_ORDER, afternoonScene, daySummaryLines, eveningScene, introScene, npcSceneFor } from "./content";
import { applyAutoEffect, applyChoice, materialsCreatedOnDay, startNextDay } from "./engine";
import { createInitialV02State } from "./types";
import type { SceneChoice, V02ImageKey, V02LocationId, V02State } from "./types";
import { LOCATIONS, NPC_CANON } from "../research/bounded-generative-world/canonData";

const IMAGE_SRC: Record<V02ImageKey, string> = { town: townImg, yohei: yoheiImg, miyoko: miyokoImg, jin: jinImg };

function locationDisplayName(id: V02LocationId): string {
  return LOCATIONS.find((l) => l.id === id)?.displayName ?? id;
}

function SceneImage({ image, testId }: { image: V02ImageKey; testId: string }) {
  const [failed, setFailed] = useState(false);
  const src = IMAGE_SRC[image];
  if (failed) {
    return <div className="v02-hero" data-testid={testId} data-image-failed="true" style={{ background: "#d8cfbf" }} />;
  }
  return <img className="v02-hero-img" src={src} alt="" data-testid={testId} onError={() => setFailed(true)} />;
}

function PortraitImage({ npc, testId }: { npc: "yohei" | "miyoko" | "jin"; testId: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <div className="v02-npc-portrait" data-testid={testId} data-image-failed="true" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>{NPC_CANON[npc].displayName.slice(0, 1)}</div>;
  }
  return <img className="v02-npc-portrait" src={IMAGE_SRC[npc]} alt={NPC_CANON[npc].displayName} data-testid={testId} onError={() => setFailed(true)} />;
}

export function NewlifeV02App({ onExit }: { onExit: () => void }) {
  const [state, setState] = useState<V02State>(() => createInitialV02State());
  const [pendingResult, setPendingResult] = useState<string | null>(null);
  const [resolvedChoiceId, setResolvedChoiceId] = useState<string | null>(null);

  const scene = useMemo(() => {
    if (!state.started) return null;
    if (state.step === "INTRO") return introScene(state);
    if (state.step === "NPC_SCENE" && state.pickedLocation) return npcSceneFor(state, state.pickedLocation);
    if (state.step === "AFTERNOON") return afternoonScene(state);
    if (state.step === "EVENING") return eveningScene(state);
    return null;
  }, [state]);

  function pickChoice(choice: SceneChoice) {
    setState((s) => applyChoice(s, choice));
    setPendingResult(choice.resultText);
    setResolvedChoiceId(choice.id);
  }

  function proceedFromChoiceScene(nextStep: V02State["step"]) {
    setPendingResult(null);
    setResolvedChoiceId(null);
    setState((s) => ({ ...s, step: nextStep }));
  }

  function continueNoChoiceScene(nextStep: V02State["step"]) {
    setState((s) => {
      const withEffect = state.step === "EVENING" ? applyAutoEffect(s, scene?.autoApply) : s;
      return { ...withEffect, step: nextStep };
    });
  }

  function pickLocation(loc: V02LocationId) {
    setPendingResult(null);
    setResolvedChoiceId(null);
    setState((s) => ({ ...s, pickedLocation: loc, step: "NPC_SCENE" }));
  }

  function goNextDay() {
    setPendingResult(null);
    setResolvedChoiceId(null);
    setState((s) => startNextDay(s));
  }

  if (!state.started) {
    return (
      <div className="v02-frame" data-testid="v02-frame">
        <div className="v02-topbar">
          <span className="v02-topbar-label">チャレンジ町</span>
          <button className="v02-exit" onClick={onExit} data-testid="v02-exit">
            ホームへ戻る
          </button>
        </div>
        <div className="v02-panel">
          <div className="v02-hero" data-testid="v02-opening">
            <SceneImage image="town" testId="v02-town-image" />
            <div className="v02-hero-shade" />
            <div className="v02-hero-text">
              <h1 className="v02-hero-title">チャレンジ町</h1>
              <p className="v02-hero-sub">今日どこへ行き、誰と関わり、何を残すか。小さな選択が、明日の町を少しずつ変えていく。</p>
            </div>
          </div>
          <p className="v02-intro-copy">あなたは今日から、この町で暮らし始めます。</p>
          <button className="v02-btn" onClick={() => setState((s) => ({ ...s, started: true }))} data-testid="v02-start">
            町を歩き始める
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="v02-frame" data-testid="v02-frame">
      <div className="v02-topbar">
        <span className="v02-topbar-label">チャレンジ町</span>
        <button className="v02-exit" onClick={onExit} data-testid="v02-exit">
          ホームへ戻る
        </button>
      </div>
      <div className="v02-panel">
        <div className="v02-day-label" data-testid="v02-day-label">
          DAY {state.day}
        </div>

        {state.step === "INTRO" && scene && (
          <div data-testid="v02-step-intro">
            <div className="v02-hero">
              <SceneImage image="town" testId="v02-intro-image" />
            </div>
            <div className="v02-scene-card">
              <div className="v02-lines">
                {scene.lines.map((l, i) => (
                  <p key={i}>{l}</p>
                ))}
              </div>
              {scene.choices.length > 0 ? (
                <div className="v02-choices">
                  {scene.choices.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className="v02-choice"
                      disabled={resolvedChoiceId !== null}
                      onClick={() => pickChoice(c)}
                      data-testid={`v02-choice-${c.id}`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              ) : null}
              {pendingResult && (
                <>
                  <div className="v02-result" data-testid="v02-result">
                    {pendingResult}
                  </div>
                  <div className="v02-footer-actions">
                    <button className="v02-btn" onClick={() => proceedFromChoiceScene("PICK")} data-testid="v02-continue">
                      出かける
                    </button>
                  </div>
                </>
              )}
              {scene.choices.length === 0 && (
                <div className="v02-footer-actions">
                  <button className="v02-btn" onClick={() => proceedFromChoiceScene("PICK")} data-testid="v02-continue">
                    {scene.continueLabel ?? "続ける"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {state.step === "PICK" && (
          <div data-testid="v02-step-pick">
            <p className="v02-summary-heading">どこへ行きますか</p>
            <div className="v02-picklist">
              {LOCATION_ORDER.map((loc) => (
                <button key={loc} type="button" className="v02-pick-btn" onClick={() => pickLocation(loc)} data-testid={`v02-pick-${loc}`}>
                  <strong>{locationDisplayName(loc)}</strong>
                </button>
              ))}
            </div>
          </div>
        )}

        {state.step === "NPC_SCENE" && scene && state.pickedLocation && (
          <div className="v02-scene-card" data-testid="v02-step-npc-scene">
            <div className="v02-npc-block">
              {scene.speaker && <PortraitImage npc={scene.speaker} testId={`v02-portrait-${scene.speaker}`} />}
              <div>
                {scene.speaker && <div className="v02-npc-name">{NPC_CANON[scene.speaker].displayName}</div>}
              </div>
            </div>
            <div className="v02-lines">
              {scene.lines.map((l, i) => (
                <p key={i}>{l}</p>
              ))}
            </div>
            {!pendingResult && (
              <div className="v02-choices">
                {scene.choices.map((c) => (
                  <button key={c.id} type="button" className="v02-choice" onClick={() => pickChoice(c)} data-testid={`v02-choice-${c.id}`}>
                    {c.label}
                  </button>
                ))}
              </div>
            )}
            {pendingResult && (
              <>
                <div className="v02-result" data-testid="v02-result">
                  {pendingResult}
                </div>
                <div className="v02-footer-actions">
                  <button className="v02-btn" onClick={() => proceedFromChoiceScene("AFTERNOON")} data-testid="v02-continue">
                    町へ戻る
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {state.step === "AFTERNOON" && scene && (
          <div className="v02-scene-card" data-testid="v02-step-afternoon">
            {scene.speaker && (
              <div className="v02-npc-block">
                <PortraitImage npc={scene.speaker} testId={`v02-portrait-${scene.speaker}`} />
                <div className="v02-npc-name">{NPC_CANON[scene.speaker].displayName}</div>
              </div>
            )}
            <div className="v02-lines">
              {scene.lines.map((l, i) => (
                <p key={i}>{l}</p>
              ))}
            </div>
            {!pendingResult && scene.choices.length > 0 && (
              <div className="v02-choices">
                {scene.choices.map((c) => (
                  <button key={c.id} type="button" className="v02-choice" onClick={() => pickChoice(c)} data-testid={`v02-choice-${c.id}`}>
                    {c.label}
                  </button>
                ))}
              </div>
            )}
            {pendingResult && (
              <div className="v02-result" data-testid="v02-result">
                {pendingResult}
              </div>
            )}
            {(scene.choices.length === 0 || pendingResult) && (
              <div className="v02-footer-actions">
                <button className="v02-btn" onClick={() => proceedFromChoiceScene("EVENING")} data-testid="v02-continue">
                  夕方になる
                </button>
              </div>
            )}
          </div>
        )}

        {state.step === "EVENING" && scene && (
          <div className="v02-scene-card" data-testid="v02-step-evening">
            <div className="v02-hero" style={{ minHeight: 160 }}>
              <SceneImage image="town" testId="v02-evening-image" />
            </div>
            <div className="v02-lines">
              {scene.lines.map((l, i) => (
                <p key={i}>{l}</p>
              ))}
            </div>
            <div className="v02-footer-actions">
              <button className="v02-btn" onClick={() => continueNoChoiceScene("SUMMARY")} data-testid="v02-continue">
                {scene.continueLabel ?? "続ける"}
              </button>
            </div>
          </div>
        )}

        {state.step === "SUMMARY" && (
          <div className="v02-scene-card" data-testid="v02-step-summary">
            {state.day > 1 && (
              <>
                <p className="v02-summary-heading">昨日から続いていること</p>
                <ul className="v02-summary-list" data-testid="v02-carried-list">
                  {(() => {
                    const priorActive = state.materials.filter((m) => m.dayCreated < state.day && m.status === "ACTIVE");
                    const items = priorActive.slice(-3).map((m) => m.concreteContent);
                    return items.length ? (
                      items.map((t, i) => (
                        <li className="v02-summary-item" key={i}>
                          {t}
                        </li>
                      ))
                    ) : (
                      <li className="v02-summary-item">特にありません</li>
                    );
                  })()}
                </ul>
              </>
            )}
            <p className="v02-summary-heading">今日、残ったこと</p>
            <ul className="v02-summary-list" data-testid="v02-today-list">
              {(() => {
                const items = daySummaryLines(materialsCreatedOnDay(state, state.day));
                return items.length ? (
                  items.map((t, i) => (
                    <li className="v02-summary-item" key={i}>
                      {t}
                    </li>
                  ))
                ) : (
                  <li className="v02-summary-item">特にありません</li>
                );
              })()}
            </ul>
            <div className="v02-footer-actions">
              {state.day < 3 ? (
                <button className="v02-btn" onClick={goNextDay} data-testid="v02-next-day">
                  翌日へ
                </button>
              ) : (
                <p className="v02-intro-copy" data-testid="v02-ending-note">
                  続きは、また今度。
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
