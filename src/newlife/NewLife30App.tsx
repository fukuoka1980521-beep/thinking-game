import { useMemo, useState } from "react";
import "./newlife30.css";
import { advanceDay, applyAction, createInitialState, day11PhaseLabel } from "./state";
import { getScene, TOTAL_DAYS } from "./content";
import { answerFreeText, npcDisplayName } from "./npcVoice";
import { NPC_IDS, type NewLife30State, type NpcId } from "./types";

interface Props {
  onExit: () => void;
}

interface TranscriptLine {
  speaker: string;
  text: string;
}

function dayLabel(state: NewLife30State): string {
  if (state.day === 11 && state.day11Phase !== "done") {
    return `Day 11（${day11PhaseLabel(state.day11Phase)}）`;
  }
  return `Day ${state.day}`;
}

/**
 * NEW LIFE — 30-day playable candidate (Phase 27).
 *
 * Text-first isolated feature slice: reachable only via `?newlife30=1`
 * (see App.tsx), not linked from HomeScreen or any other screen. This
 * component renders state produced by the deterministic engine in
 * state.ts and never itself decides a canonical fact — it only calls
 * applyAction/advanceDay and displays their result, plus free-text lines
 * answered by the read-only npcVoice layer.
 *
 * HUMAN_VALIDATION_STATUS = PENDING. This candidate is not a claim of
 * product/human validation; see docs/newlife/evaluation/
 * PHASE_27_PLAYABLE_IMPLEMENTATION_REPORT_V1.md.
 */
export function NewLife30App({ onExit }: Props) {
  const [state, setState] = useState<NewLife30State>(createInitialState);
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [addressee, setAddressee] = useState<NpcId>("hina");
  const [freeText, setFreeText] = useState("");

  const scene = useMemo(() => getScene(state.day, state.day11Phase, state.day24Outcome), [state.day, state.day11Phase, state.day24Outcome]);

  function resetTranscriptFor(nextState: NewLife30State) {
    setTranscript([]);
    setState(nextState);
  }

  function handleOption(optionId: string) {
    const next = applyAction(state, optionId);
    setState(next);
    setTranscript((prev) => [...prev, { speaker: "あなた", text: `（${scene.options.find((o) => o.id === optionId)?.label ?? optionId}）` }]);
  }

  function handleAdvance() {
    resetTranscriptFor(advanceDay(state));
  }

  function handleAskSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = freeText.trim();
    if (!text) return;
    const reply = answerFreeText(addressee, text, state);
    setTranscript((prev) => [
      ...prev,
      { speaker: "あなた", text },
      { speaker: npcDisplayName(addressee), text: reply },
    ]);
    setFreeText("");
  }

  const npcsForSelect = scene.npcsPresent.length > 0 ? scene.npcsPresent : NPC_IDS;
  const day11NeedsSecondMove = state.day === 11 && state.day11Phase === "afternoon";

  if (state.finished) {
    return (
      <div className="newlife30">
        <span className="newlife30-badge">NEW LIFE — Phase 27 playable candidate（HUMAN_VALIDATION_STATUS: PENDING）</span>
        <h1 className="newlife30-title">30日を終えて</h1>
        <div className="newlife30-scene">
          三十日を終えても、六人それぞれの仕事、拒否する権利、未解決の問いは残ります。ここで一区切りです。延長や続編は、あなたが望むときだけ相談します。
        </div>
        <p className="newlife30-footer">評価スコアはこの画面に表示していません（HUMAN_VALIDATION_STATUS = PENDING）。</p>
        <button className="newlife30-exit" onClick={onExit}>
          ホームへ戻る
        </button>
      </div>
    );
  }

  return (
    <div className="newlife30">
      <span className="newlife30-badge">NEW LIFE — Phase 27 playable candidate（HUMAN_VALIDATION_STATUS: PENDING）</span>
      <p className="newlife30-daylabel">
        {dayLabel(state)} ／ 全{TOTAL_DAYS}日
      </p>
      <h1 className="newlife30-title">{scene.title}</h1>
      <div className="newlife30-scene">
        {scene.text}
        {scene.lowEngagementHook ? <p className="newlife30-hook">{scene.lowEngagementHook}</p> : null}
      </div>

      <div className="newlife30-options">
        {scene.options.map((o) => (
          <button key={o.id} onClick={() => handleOption(o.id)}>
            {o.label}
          </button>
        ))}
      </div>

      <div className="newlife30-transcript">
        {transcript.map((line, i) => (
          <div className="newlife30-line" key={i}>
            <strong>{line.speaker}：</strong>
            {line.text}
          </div>
        ))}
      </div>

      <form className="newlife30-freetalk" onSubmit={handleAskSubmit}>
        <div className="newlife30-freetalk-row">
          <select value={addressee} onChange={(e) => setAddressee(e.target.value as NpcId)}>
            {npcsForSelect.map((npc) => (
              <option key={npc} value={npc}>
                {npcDisplayName(npc)}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="自由に話しかける（例：何を売ってるの？）"
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
          />
          <button type="submit">話す</button>
        </div>
      </form>

      <button className="newlife30-advance" onClick={handleAdvance}>
        {day11NeedsSecondMove ? "この日を終える" : "次の日へ"}
      </button>

      <button className="newlife30-exit" onClick={onExit}>
        ホームへ戻る
      </button>
    </div>
  );
}
