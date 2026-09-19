/**
 * PHASE_22 vertical slice -- Day 1 + Day 2 only, Hina + Yohei only, 3 locations only. A new,
 * isolated module (not a change to the frozen `newlifecore`), per this codebase's established
 * convention of giving each New Life iteration its own src/newlife-prefixed directory. Reuses `newlifecore`'s
 * proven AI-responsibility-boundary dialogue stack as-is (`liveNpcAdapter`/`deterministicNpcReply`/
 * `validateNpcReply`) -- SYSTEM OWNS TRUTH (this file), AI OWNS EXPRESSION (free-talk replies only).
 */
import { useState } from "react";
import { deterministicNpcReply } from "../newlifecore/dialogue/deterministicAdapter";
import { liveNpcAdapter } from "../newlifecore/dialogue/liveAdapterClient";
import type { ConversationTurn } from "../newlifecore/types";
import { buildNpc7DayAiContext } from "./dialogue/contextBuilder";
import {
  HINA_AMBIENT_LINE,
  HINA_FAREWELL,
  HINA_HELP_RESULT,
  HINA_WATCH_RESULT,
  SHOPPING_STREET_LABEL,
  TEMP_HOME_LABEL,
  YOHEI_AMBIENT_LINE_DAY1,
  YOHEI_AMBIENT_LINE_DAY2,
  YOHEI_BUY_RESULT,
  YOHEI_FAREWELL,
  YOHEI_KEEP_EYE_OUT_RESULT,
  YOHEI_STORE_LABEL,
  arrivalOrMorningLine,
  eveningLine,
  hinaOpeningLine,
  yoheiOpeningLine,
} from "./content";
import { advanceToDay2, canAdvanceToDay2, canEndSlice, canReach, endSlice, moveTo, recordConversationTurn, setKeptEyeOutForDelivery } from "./engine";
import { createInitial7DayState, type Core7DayState, type Slice7DayLocationId } from "./types";

import hinaImg from "../assets/newlife7day/hina.png";
import shoppingStreetImg from "../assets/newlife7day/shopping-street.png";
import tempHomeImg from "../assets/newlife7day/temp-home.png";
import yoheiImg from "../assets/newlife7day/yohei.png";
import yoheiShopImg from "../assets/newlife7day/yohei-shop.png";

import "./newlife7day.css";

const LOCATION_IMAGE: Record<Slice7DayLocationId, string> = {
  TRIAL_HOUSE: tempHomeImg,
  YOHEI_STORE: yoheiShopImg,
  SHOPPING_STREET: shoppingStreetImg,
};

const LOCATION_LABEL: Record<Slice7DayLocationId, string> = {
  TRIAL_HOUSE: TEMP_HOME_LABEL,
  YOHEI_STORE: YOHEI_STORE_LABEL,
  SHOPPING_STREET: SHOPPING_STREET_LABEL,
};

/** Live network calls only run outside vitest, mirroring `NewlifeCoreApp.tsx`'s own guard --
 *  the deterministic adapter is the actual, real CI-safe path, not a test-only stub. */
const USE_LIVE = typeof import.meta.env !== "undefined" && import.meta.env.MODE !== "test";

interface FreeTalkTurn {
  who: "player" | "npc";
  text: string;
}

export function Newlife7DayApp({ onExit }: { onExit: () => void }) {
  const [state, setState] = useState<Core7DayState>(createInitial7DayState);
  const [sceneLog, setSceneLog] = useState<string[]>([]);
  const [freeTalkOpen, setFreeTalkOpen] = useState(false);
  const [freeTalkTurns, setFreeTalkTurns] = useState<FreeTalkTurn[]>([]);
  const [freeTalkInput, setFreeTalkInput] = useState("");
  const [freeTalkPending, setFreeTalkPending] = useState(false);
  const [structuralActionTaken, setStructuralActionTaken] = useState(false);
  const [leaving, setLeaving] = useState(false);

  function pushLine(line: string) {
    setSceneLog((prev) => [...prev, line]);
  }

  function resetSceneUiState() {
    setFreeTalkOpen(false);
    setFreeTalkTurns([]);
    setFreeTalkInput("");
    setStructuralActionTaken(false);
    setLeaving(false);
  }

  function goTo(location: Slice7DayLocationId) {
    if (!canReach(state, location)) return;
    setState((prev) => moveTo(prev, location));
    resetSceneUiState();
    setSceneLog([]);
  }

  function handleAdvanceDay() {
    if (!canAdvanceToDay2(state)) return;
    setState((prev) => advanceToDay2(prev));
    resetSceneUiState();
    setSceneLog([]);
  }

  function handleEndSlice() {
    if (!canEndSlice(state)) return;
    setState((prev) => endSlice(prev));
  }

  async function sendFreeTalk(npcId: "hina" | "yohei") {
    const text = freeTalkInput.trim();
    if (!text || freeTalkPending) return;
    setFreeTalkTurns((prev) => [...prev, { who: "player", text }]);
    setFreeTalkInput("");
    setFreeTalkPending(true);
    const context = buildNpc7DayAiContext(state, npcId, text);
    const envelope = USE_LIVE ? await liveNpcAdapter(context) : deterministicNpcReply(context);
    setFreeTalkTurns((prev) => [...prev, { who: "npc", text: envelope.visibleUtterance }]);
    const turn: ConversationTurn = { day: state.day, time: 0, playerUtterance: text, npcReply: envelope.visibleUtterance };
    setState((prev) => recordConversationTurn(prev, npcId, turn));
    setFreeTalkPending(false);
  }

  if (state.playerLocation === "TRIAL_HOUSE") {
    const canGoYohei = canReach(state, "YOHEI_STORE");
    const canGoStreet = canReach(state, "SHOPPING_STREET");
    return (
      <div className="n7d-app">
        <button className="n7d-exit" onClick={onExit}>
          ← ホームへ
        </button>
        <img className="n7d-hero" src={tempHomeImg} alt={TEMP_HOME_LABEL} />
        <h2 className="n7d-location-name">{TEMP_HOME_LABEL}</h2>
        <p className="n7d-line">{state.actionsUsedToday === 0 ? arrivalOrMorningLine(state) : eveningLine(state)}</p>
        <div className="n7d-day-badge">
          DAY {state.day} / 残りの行動: {2 - state.actionsUsedToday}
        </div>
        {!state.ended && state.actionsUsedToday < 2 && (
          <div className="n7d-choices">
            <button disabled={!canGoYohei} onClick={() => goTo("YOHEI_STORE")}>
              {YOHEI_STORE_LABEL}へ行く
            </button>
            <button disabled={!canGoStreet} onClick={() => goTo("SHOPPING_STREET")}>
              {SHOPPING_STREET_LABEL}へ行く
            </button>
          </div>
        )}
        {state.day === 1 && canAdvanceToDay2(state) && (
          <button className="n7d-advance" onClick={handleAdvanceDay}>
            今日はもう休む(翌日へ)
          </button>
        )}
        {state.day === 2 && canEndSlice(state) && !state.ended && (
          <button className="n7d-advance" onClick={handleEndSlice}>
            今日はもう休む
          </button>
        )}
        {state.ended && <p className="n7d-line n7d-ended">今日はここまで。(体験版はここで終わりです)</p>}
      </div>
    );
  }

  const npcId = state.playerLocation === "YOHEI_STORE" ? "yohei" : "hina";
  const openingLine = npcId === "yohei" ? yoheiOpeningLine(state) : hinaOpeningLine(state);
  const ambientLine =
    npcId === "yohei" ? (state.day === 1 ? YOHEI_AMBIENT_LINE_DAY1 : YOHEI_AMBIENT_LINE_DAY2) : HINA_AMBIENT_LINE;

  return (
    <div className="n7d-app">
      <button className="n7d-exit" onClick={onExit}>
        ← ホームへ
      </button>
      <img className="n7d-hero" src={LOCATION_IMAGE[state.playerLocation]} alt={LOCATION_LABEL[state.playerLocation]} />
      <h2 className="n7d-location-name">{LOCATION_LABEL[state.playerLocation]}</h2>
      <div className="n7d-npc-row">
        <img className="n7d-npc-portrait" src={npcId === "yohei" ? yoheiImg : hinaImg} alt={npcId === "yohei" ? "洋平" : "陽菜"} />
        <p className="n7d-line n7d-ambient">{ambientLine}</p>
      </div>
      <p className="n7d-line n7d-npc-speech">{openingLine}</p>

      {sceneLog.map((line, i) => (
        <p key={i} className="n7d-line n7d-result">
          {line}
        </p>
      ))}

      {!structuralActionTaken && !leaving && npcId === "yohei" && (
        <div className="n7d-choices">
          <button
            onClick={() => {
              pushLine(YOHEI_BUY_RESULT);
              setStructuralActionTaken(true);
            }}
          >
            買い物をする
          </button>
          {state.day === 1 && (
            <button
              onClick={() => {
                pushLine(YOHEI_KEEP_EYE_OUT_RESULT);
                setState((prev) => setKeptEyeOutForDelivery(prev, true));
                setStructuralActionTaken(true);
              }}
            >
              配達のことを気にかけておく
            </button>
          )}
        </div>
      )}

      {!structuralActionTaken && !leaving && npcId === "hina" && (
        <div className="n7d-choices">
          <button
            onClick={() => {
              pushLine(HINA_WATCH_RESULT);
              setStructuralActionTaken(true);
            }}
          >
            様子を見る
          </button>
          <button
            onClick={() => {
              pushLine(HINA_HELP_RESULT);
              setStructuralActionTaken(true);
            }}
          >
            手伝う
          </button>
        </div>
      )}

      {structuralActionTaken && !freeTalkOpen && !leaving && (
        <div className="n7d-choices">
          <button onClick={() => setFreeTalkOpen(true)}>もう少し話す</button>
        </div>
      )}

      {freeTalkOpen && !leaving && (
        <div className="n7d-free-talk">
          {freeTalkTurns.map((t, i) => (
            <p key={i} className={t.who === "player" ? "n7d-line n7d-player-turn" : "n7d-line n7d-npc-speech"}>
              {t.text}
            </p>
          ))}
          <div className="n7d-free-talk-input">
            <input
              value={freeTalkInput}
              onChange={(e) => setFreeTalkInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendFreeTalk(npcId);
              }}
              placeholder="話しかける"
              disabled={freeTalkPending}
            />
            <button onClick={() => sendFreeTalk(npcId)} disabled={freeTalkPending}>
              話す
            </button>
          </div>
        </div>
      )}

      {!leaving && (
        <div className="n7d-choices">
          <button
            className="n7d-leave"
            onClick={() => {
              pushLine(npcId === "yohei" ? YOHEI_FAREWELL : HINA_FAREWELL);
              setLeaving(true);
            }}
          >
            立ち去る
          </button>
        </div>
      )}
      {leaving && (
        <div className="n7d-choices">
          <button onClick={() => goTo("TRIAL_HOUSE")}>{TEMP_HOME_LABEL}へ戻る</button>
        </div>
      )}
    </div>
  );
}
