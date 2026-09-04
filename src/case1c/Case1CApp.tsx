import { useEffect, useRef, useState } from "react";
import "./case1c.css";
import type {
  Case1CScreen,
  ClueKey,
  PredictionChoice,
  CaseFileRecord,
  FeedbackAnswers,
  TesterType,
} from "./types";
import { CLUES } from "./types";
import {
  OjisanFigure,
  DetectiveFigure,
  MinagawaFigure,
  TaishouFigure,
  BikeFigure,
  BookVisual,
  StickerVisual,
  ShopkeeperFigure,
  ParentChildFigure,
  NoticeboardVisual,
  TownBackdrop,
  ParkBackdrop,
} from "./visuals";
import {
  LINE_OJISAN_JUMPS_TO_THEFT,
  LINE_DETECTIVE_SLOWS_HIM_DOWN,
  LINE_BIKE_FOUND,
  LINE_BOOK_FOUND,
  LINE_STICKER_FOUND,
  LINE_AFTER_SHOPKEEPER,
  LINE_BEFORE_PREDICTION,
  detectiveReactionToPrediction,
} from "./companionLines";
import type { Case1CMetricType } from "./metrics";
import { recordCase1CMetric, newCase1CSessionId } from "./metrics";
import { saveCase1CRecord, saveCase1CFeedback } from "./storage";
import { buildCase1TestResultCopyText } from "./testResults";
import { copyTextToClipboard } from "./clipboard";

interface Props {
  onExit: () => void;
  /**
   * PHASE 4.7 (Section5): true only when this play-through was opened via the `?case1test`
   * external-test direct link (see App.tsx). An external tester's own device never syncs to
   * Owner's `?case1results` view (Section7 -- localStorage is per-device), so in this mode the
   * DONE screen skips "ホームに戻る" (which would otherwise land the tester on the full
   * HomeScreen and its other half-finished prototypes) and instead ends the session in place.
   */
  standalone?: boolean;
}

interface State {
  screen: Case1CScreen;
  testerId: string;
  testerType: TesterType | null;
  clues: ClueKey[];
  seenTheftGag: boolean;
  talkedShopkeeper: boolean;
  talkedMinagawa: boolean;
  talkedTaishou: boolean;
  shopRecordCompared: boolean;
  predictionChoice: PredictionChoice | null;
  ownerAssistCount: number;
  feedback: { q1: number; q2: number; q3: number; q4: number; q5: number; free: string; characterMemory: string };
}

const initialState: State = {
  screen: "TITLE",
  testerId: "",
  testerType: null,
  clues: [],
  seenTheftGag: false,
  talkedShopkeeper: false,
  talkedMinagawa: false,
  talkedTaishou: false,
  shopRecordCompared: false,
  predictionChoice: null,
  ownerAssistCount: 0,
  feedback: { q1: 0, q2: 0, q3: 0, q4: 0, q5: 0, free: "", characterMemory: "" },
};

/**
 * CASE1 external-test candidate ("もう一台の自転車", PHASE 4.4). Same scene-based engine as the
 * PHASE 4.3 slice; scenario content fully replaced per
 * docs/product/CASE1_EXTERNAL_TEST_REVISION_V1.md. No dev/meta language is ever shown to the
 * player (Section20) -- everything here is in-fiction text only.
 */
export function Case1CApp({ onExit, standalone = false }: Props) {
  const [state, setState] = useState<State>(initialState);
  const [resultCopied, setResultCopied] = useState(false);
  const startFired = useRef(false);
  const firstInteractionFired = useRef(false);
  const orderLogged = useRef<Set<string>>(new Set());
  // PHASE 4.6: one id per mount (one tester's play-through) so the Owner result view can group
  // this session's metrics/case-file/feedback rows together (src/case1c/testResults.ts).
  const sessionId = useRef(newCase1CSessionId()).current;

  function metric(type: Case1CMetricType, detail?: string) {
    recordCase1CMetric(type, detail, sessionId);
  }

  async function handleCopyResult() {
    const text = buildCase1TestResultCopyText(sessionId);
    const ok = await copyTextToClipboard(text);
    setResultCopied(ok);
  }

  /**
   * PHASE 4.7 independent-review fix: the topbar quit control was calling `onExit`
   * unconditionally, so a tester who quit mid-test (not just from the DONE screen) still landed
   * on the full public HomeScreen -- exactly what `standalone` exists to prevent (Section5). In
   * standalone mode this now ends the session in place (DONE's closing text, with whatever
   * partial data exists still copyable) instead of navigating away.
   */
  function handleQuit() {
    if (standalone) {
      goto("DONE");
    } else {
      onExit();
    }
  }

  useEffect(() => {
    if (!startFired.current) {
      metric("CASE1_START");
      startFired.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function markInteraction() {
    if (!firstInteractionFired.current) {
      metric("FIRST_INTERACTION");
      firstInteractionFired.current = true;
    }
  }

  function logInvestigationOrder(target: string) {
    if (orderLogged.current.has(target)) return;
    orderLogged.current.add(target);
    metric("INVESTIGATION_ORDER", target);
  }

  /** PHASE 4.6 Section6/7: Owner-only manual marker -- never inferred, never shown to the tester. */
  function handleOwnerAssist() {
    metric("OWNER_ASSIST");
    setState((s) => ({ ...s, ownerAssistCount: s.ownerAssistCount + 1 }));
  }

  function goto(screen: Case1CScreen) {
    setState((s) => ({ ...s, screen }));
  }

  function addClue(key: ClueKey) {
    setState((s) => {
      if (s.clues.includes(key)) return s;
      metric("CLUE_FOUND", key);
      return { ...s, clues: [...s.clues, key] };
    });
  }

  function handleStart() {
    goto("PARK_A");
  }

  function handleDismissTheftGag() {
    setState((s) => ({ ...s, seenTheftGag: true }));
  }

  function handleTapBike() {
    markInteraction();
    logInvestigationOrder("bike");
    addClue("primary");
    goto("BIKE_CLOSEUP");
  }

  function handleTapBook() {
    markInteraction();
    logInvestigationOrder("book");
    addClue("secondary");
    goto("BOOK_CLOSEUP");
  }

  function handleTapSticker() {
    markInteraction();
    logInvestigationOrder("sticker");
    metric("OPTIONAL_OBJECT_INTERACTION", "sticker");
    addClue("sticker");
    goto("STICKER_CLOSEUP");
  }

  function handleTapNoticeboard() {
    markInteraction();
    logInvestigationOrder("noticeboard");
    metric("OPTIONAL_OBJECT_INTERACTION", "noticeboard");
    goto("NOTICEBOARD");
  }

  function handleTalkShopkeeper() {
    markInteraction();
    logInvestigationOrder("shopkeeper");
    goto("TALK_SHOPKEEPER");
  }

  function handleCompareShopRecord() {
    setState((s) => ({ ...s, shopRecordCompared: true, talkedShopkeeper: true }));
    addClue("human");
  }

  function handleTalkMinagawa() {
    markInteraction();
    logInvestigationOrder("minagawa");
    metric("OPTIONAL_NPC_INTERACTION", "minagawa");
    setState((s) => ({ ...s, talkedMinagawa: true }));
    goto("TALK_MINAGAWA");
  }

  function handleTalkTaishou() {
    markInteraction();
    logInvestigationOrder("taishou");
    metric("OPTIONAL_NPC_INTERACTION", "taishou");
    setState((s) => ({ ...s, talkedTaishou: true }));
    goto("TALK_TAISHOU");
  }

  function handlePredict(choice: PredictionChoice) {
    setState((s) => ({ ...s, predictionChoice: choice }));
    metric("HUMAN_PREDICTION", choice);
    goto("REVEAL");
  }

  function handleFinishCase() {
    const record: CaseFileRecord = {
      caseId: "CASE1C",
      caseTitle: "もう一台の自転車",
      cluesFound: state.clues,
      firstHypothesis: "泥棒に盗まれたのでは（おじさんの早合点）",
      humanPrediction: state.predictionChoice,
      actualBehavior: "少し様子を見ていたが、違いに気づいてすぐ頭を下げに来た",
      ending: "図書館の返却期限に急いでいた親子が、同じ型のよく似た自転車と間違えて停めていた。",
      companion: "探偵",
      completedAt: new Date().toISOString(),
      sessionId,
      testerCode: state.testerId.trim(),
      testerType: state.testerType,
    };
    saveCase1CRecord(record);
    metric("CASE1_COMPLETE");
    goto("CLOSED");
  }

  function handleNextCaseIntent() {
    metric("NEXT_CASE_INTENT");
    goto("NEXT_PENDING");
  }

  function handleSubmitFeedback() {
    const answers: FeedbackAnswers = {
      testerId: state.testerId.trim(),
      q1Fun: state.feedback.q1,
      q2Curiosity: state.feedback.q2,
      q3SelfInvestigated: state.feedback.q3,
      q4Aha: state.feedback.q4,
      q5WantNext: state.feedback.q5,
      freeText: state.feedback.free,
      submittedAt: new Date().toISOString(),
      characterMemory: state.feedback.characterMemory.trim(),
      sessionId,
      testerType: state.testerType,
    };
    saveCase1CFeedback(answers);
    metric("FEEDBACK_SUBMITTED");
    goto("DONE");
  }

  const satchel = (
    <div className="c1c-satchel">
      {state.clues.length === 0 ? (
        <span style={{ color: "#98a0b3" }}>手掛かりなし</span>
      ) : (
        state.clues.map((k) => (
          <span key={k}>
            {CLUES[k].icon} {CLUES[k].label}
          </span>
        ))
      )}
    </div>
  );

  function hotspot(opts: {
    style: React.CSSProperties;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    done?: boolean;
    ariaLabel: string;
  }) {
    return (
      <button
        type="button"
        className={"c1c-hotspot" + (opts.done ? " c1c-done" : "")}
        style={opts.style}
        onClick={opts.onClick}
        aria-label={opts.ariaLabel}
      >
        <span className="c1c-hotspot-ring" />
        {opts.icon}
        <span className="c1c-hotspot-tag">{opts.label}</span>
      </button>
    );
  }

  function ratingRow(label: string, key: "q1" | "q2" | "q3" | "q4" | "q5") {
    return (
      <div className="c1c-rating-row">
        <div style={{ fontSize: 12.5 }}>{label}</div>
        <div className="c1c-rating-scale">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              className={"c1c-rating-btn" + (state.feedback[key] === n ? " selected" : "")}
              onClick={() => setState((s) => ({ ...s, feedback: { ...s.feedback, [key]: n } }))}
              aria-label={`${label}：${n}`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    );
  }

  function renderScreen() {
    switch (state.screen) {
      case "TITLE":
        return (
          <div className="c1c-title-card">
            <div style={{ fontSize: 44 }}>🚲</div>
            <h2>もう一台の自転車</h2>
            <p style={{ fontSize: 12.5, color: "#5b6272", margin: 0 }}>テスト版 CASE1・事件簿係、はじめます</p>
            <input
              type="text"
              placeholder="テスターコード（任意）"
              value={state.testerId}
              onChange={(e) => setState((s) => ({ ...s, testerId: e.target.value }))}
              className="c1c-input"
              style={{ width: "70%" }}
            />
            <div style={{ fontSize: 12, color: "#5b6272" }}>前のバージョンを遊んだことがありますか？（任意）</div>
            <div className="c1c-rating-scale" style={{ width: "70%" }}>
              <button
                type="button"
                className={"c1c-rating-btn" + (state.testerType === "NEW" ? " selected" : "")}
                onClick={() => setState((s) => ({ ...s, testerType: s.testerType === "NEW" ? null : "NEW" }))}
              >
                ない
              </button>
              <button
                type="button"
                className={"c1c-rating-btn" + (state.testerType === "RETURNING" ? " selected" : "")}
                onClick={() =>
                  setState((s) => ({ ...s, testerType: s.testerType === "RETURNING" ? null : "RETURNING" }))
                }
              >
                ある
              </button>
            </div>
            <button className="c1c-btn" style={{ width: "70%" }} onClick={handleStart}>
              はじめる
            </button>
          </div>
        );

      case "PARK_A":
        if (!state.seenTheftGag) {
          return (
            <div className="c1c-scene">
              <div className="c1c-scene-visual">
                <ParkBackdrop />
                <div className="c1c-figure-slot" style={{ left: "30%" }}>
                  <OjisanFigure size={58} pose="listening" />
                </div>
                <div className="c1c-figure-slot" style={{ left: "56%" }}>
                  <DetectiveFigure size={64} />
                </div>
              </div>
              <div className="c1c-panel">
                <div className="c1c-line">
                  自転車を停めていた場所に、見慣れない自転車が代わりに停まっています。カゴには、知らない絵本が1冊。
                </div>
                <div className="c1c-line detective" style={{ color: "#14213d", fontStyle: "normal", fontWeight: 700 }}>
                  おじさん：「{LINE_OJISAN_JUMPS_TO_THEFT}」
                </div>
                <div className="c1c-line detective">探偵：「{LINE_DETECTIVE_SLOWS_HIM_DOWN}」</div>
                <button className="c1c-btn" onClick={handleDismissTheftGag}>
                  とりあえず調べてみよう
                </button>
              </div>
            </div>
          );
        }
        return (
          <div className="c1c-scene">
            <div className="c1c-scene-visual">
              <ParkBackdrop />
              {hotspot({
                style: { left: "58%", top: "50%" },
                onClick: handleTapBike,
                icon: <BikeFigure size={56} variant="other" />,
                label: "自転車",
                done: state.clues.includes("primary"),
                ariaLabel: "自転車を調べる",
              })}
              {hotspot({
                style: { left: "40%", top: "58%" },
                onClick: handleTapBook,
                icon: <span style={{ fontSize: 24 }}>📕</span>,
                label: "絵本",
                done: state.clues.includes("secondary"),
                ariaLabel: "絵本を調べる",
              })}
              {hotspot({
                style: { left: "70%", top: "38%" },
                onClick: handleTapSticker,
                icon: <span style={{ fontSize: 20 }}>✨</span>,
                label: "ハンドルの何か",
                done: state.clues.includes("sticker"),
                ariaLabel: "ハンドルのシールを調べる",
              })}
              {hotspot({
                style: { left: "12%", top: "30%" },
                onClick: handleTapNoticeboard,
                icon: <span style={{ fontSize: 22 }}>📋</span>,
                label: "掲示板",
                ariaLabel: "公園の掲示板を見る",
              })}
            </div>
            <div className="c1c-panel">
              <div className="c1c-line">気になるものをタップしてみましょう。すべて調べる必要はありません。</div>
              {state.clues.includes("primary") && state.clues.includes("secondary") && (
                <button className="c1c-btn" onClick={() => goto("TOWN")}>
                  商店街へ行ってみよう
                </button>
              )}
              {satchel}
            </div>
          </div>
        );

      case "BIKE_CLOSEUP":
        return (
          <div className="c1c-panel c1c-detail-bg" style={{ height: "100%", justifyContent: "center" }}>
            <span className="c1c-tag">CLUE FOUND</span>
            <div className="c1c-visual-row">
              <BikeFigure size={100} variant="other" />
            </div>
            <div className="c1c-line">自分の自転車とそっくりですが、よく見るとペダルの色が違います。持ち主が誰かは分かりません。</div>
            <div className="c1c-line detective">探偵：「{LINE_BIKE_FOUND}」</div>
            <button className="c1c-btn" onClick={() => goto("PARK_A")}>
              戻る
            </button>
          </div>
        );

      case "BOOK_CLOSEUP":
        return (
          <div className="c1c-panel c1c-detail-bg" style={{ height: "100%", justifyContent: "center" }}>
            <span className="c1c-tag">CLUE FOUND</span>
            <div className="c1c-visual-row">
              <BookVisual />
            </div>
            <div className="c1c-line">子供向けの絵本です。図書館の貸出シールがあり、返却期限は今日になっています。</div>
            <div className="c1c-line detective">探偵：「{LINE_BOOK_FOUND}」</div>
            <button className="c1c-btn" onClick={() => goto("PARK_A")}>
              戻る
            </button>
          </div>
        );

      case "STICKER_CLOSEUP":
        return (
          <div className="c1c-panel c1c-detail-bg" style={{ height: "100%", justifyContent: "center" }}>
            <span className="c1c-tag">CLUE FOUND</span>
            <div className="c1c-visual-row">
              <StickerVisual />
            </div>
            <div className="c1c-line">ハンドルに、キラキラのシールが貼ってあります。持ち主が自分の自転車と見分けるための目印かもしれません。</div>
            <div className="c1c-line detective">探偵：「{LINE_STICKER_FOUND}」</div>
            <button className="c1c-btn" onClick={() => goto("PARK_A")}>
              戻る
            </button>
          </div>
        );

      case "NOTICEBOARD":
        return (
          <div className="c1c-panel c1c-detail-bg" style={{ height: "100%", justifyContent: "center" }}>
            <div className="c1c-visual-row">
              <NoticeboardVisual />
            </div>
            <div className="c1c-line">「秋の焼き芋会、10月開催予定」と書かれています。今回のこととは関係なさそうです。</div>
            <button className="c1c-btn" onClick={() => goto("PARK_A")}>
              戻る
            </button>
          </div>
        );

      case "TOWN":
        return (
          <div className="c1c-scene">
            <div className="c1c-scene-visual">
              <TownBackdrop />
              <div className="c1c-figure-slot" style={{ left: "44%", bottom: "6%" }}>
                <DetectiveFigure size={52} />
              </div>
              {hotspot({
                style: { left: "20%", top: "48%" },
                onClick: handleTalkShopkeeper,
                icon: <ShopkeeperFigure size={64} />,
                label: "自転車店の店主",
                done: state.talkedShopkeeper,
                ariaLabel: "自転車店の店主に話しかける",
              })}
              {hotspot({
                style: { left: "68%", top: "50%" },
                onClick: handleTalkTaishou,
                icon: <TaishouFigure size={60} />,
                label: "大将",
                done: state.talkedTaishou,
                ariaLabel: "大将に話しかける",
              })}
              {hotspot({
                style: { left: "44%", top: "62%" },
                onClick: handleTalkMinagawa,
                icon: <MinagawaFigure size={56} />,
                label: "皆川さん",
                done: state.talkedMinagawa,
                ariaLabel: "皆川さんに話しかける",
              })}
            </div>
            <div className="c1c-panel">
              <div className="c1c-line">商店街です。誰に話を聞いてみますか？</div>
              {state.talkedShopkeeper && (
                <button className="c1c-btn" onClick={() => goto("PARK_C")}>
                  公園に戻ってみよう
                </button>
              )}
              {satchel}
            </div>
          </div>
        );

      case "TALK_SHOPKEEPER":
        return (
          <div className="c1c-panel c1c-detail-bg" style={{ height: "100%", justifyContent: "center" }}>
            <div className="c1c-visual-row">
              <ShopkeeperFigure size={76} />
            </div>
            <div className="c1c-line">「ん？　ああ、それうちで売ってるやつだな。去年のセールで同じ色ばっかり出てさ」</div>
            {!state.shopRecordCompared ? (
              <button className="c1c-btn-secondary" onClick={handleCompareShopRecord}>
                販売記録と見比べてもらう
              </button>
            ) : (
              <>
                <span className="c1c-tag">CLUE FOUND</span>
                <div className="c1c-compare-slots">
                  <div className="c1c-compare-slot filled">残された自転車<br />型番 TB-220</div>
                  <div className="c1c-compare-slot filled">販売記録<br />型番 TB-220</div>
                </div>
                <div className="c1c-line">型番が一致——このあたりでよく見る自転車のようです。「よく間違えられるんだよ」</div>
                <div className="c1c-line detective">探偵：「{LINE_AFTER_SHOPKEEPER}」</div>
              </>
            )}
            <button className="c1c-btn" onClick={() => goto("TOWN")}>
              戻る
            </button>
          </div>
        );

      case "TALK_MINAGAWA":
        return (
          <div className="c1c-panel c1c-detail-bg" style={{ height: "100%", justifyContent: "center" }}>
            <div className="c1c-visual-row">
              <MinagawaFigure size={76} />
            </div>
            <div className="c1c-line">「あ、おじさん。最近パン、焼くの上手くなったんですよ……って、それより自転車どうしたんですか？」</div>
            <div className="c1c-line" style={{ fontSize: 12, color: "#5b6272" }}>
              （事件そのものには心当たりがなさそうです）
            </div>
            <button className="c1c-btn" onClick={() => goto("TOWN")}>
              戻る
            </button>
          </div>
        );

      case "TALK_TAISHOU":
        return (
          <div className="c1c-panel c1c-detail-bg" style={{ height: "100%", justifyContent: "center" }}>
            <div className="c1c-visual-row">
              <TaishouFigure size={76} />
            </div>
            <div className="c1c-line">「今朝、小さい子連れの人が、えらく急いだ様子で公園の方に走ってったな。関係あるかは知らんけど」</div>
            <button className="c1c-btn" onClick={() => goto("TOWN")}>
              戻る
            </button>
          </div>
        );

      case "PARK_C":
        return (
          <div className="c1c-scene">
            <div className="c1c-scene-visual">
              <ParkBackdrop />
              <div className="c1c-figure-slot" style={{ left: "16%" }}>
                <OjisanFigure size={50} pose="cheerful" />
              </div>
              <div className="c1c-figure-slot" style={{ left: "34%" }}>
                <DetectiveFigure size={52} />
              </div>
            </div>
            <div className="c1c-panel">
              <div className="c1c-line">元の場所に戻り、少し待ってみることにしました。</div>
              <button className="c1c-btn" onClick={() => goto("PREDICTION")}>
                しばらく待ってみる
              </button>
              {satchel}
            </div>
          </div>
        );

      case "PREDICTION":
        return (
          <div className="c1c-panel c1c-detail-bg" style={{ height: "100%", justifyContent: "center" }}>
            <div className="c1c-line">息を切らした親子が、小走りで近づいてきます。</div>
            <div className="c1c-line detective">探偵：「{LINE_BEFORE_PREDICTION}」</div>
            <div className="c1c-line" style={{ fontSize: 12 }}>気づいたら、どう動く？</div>
            <div className="c1c-icon-choices">
              <button className="c1c-icon-choice" onClick={() => handlePredict("bow")}>
                <span style={{ fontSize: 26 }}>🙇</span>
                頭を下げる
              </button>
              <button className="c1c-icon-choice" onClick={() => handlePredict("grab")}>
                <span style={{ fontSize: 26 }}>🏃</span>
                気づかず持っていく
              </button>
              <button className="c1c-icon-choice" onClick={() => handlePredict("freeze")}>
                <span style={{ fontSize: 26 }}>😳</span>
                固まる
              </button>
            </div>
          </div>
        );

      case "REVEAL":
        return (
          <div className="c1c-panel c1c-detail-bg" style={{ height: "100%", justifyContent: "center" }}>
            <div className="c1c-visual-row">
              <ParentChildFigure size={80} />
            </div>
            <div className="c1c-line">
              自転車に手をかけたところで、ふと止まりました。「あれ……ペダル、こんな色だったっけ」
            </div>
            <div className="c1c-line">
              「すみません、図書館の返却が今日までで、急いでて……うちのとそっくりで、間違えました」
            </div>
            {state.clues.includes("sticker") && (
              <div className="c1c-line">「あ、シールも……子供が貼ったんです、見分けるために。今日は焦ってて見落としました」</div>
            )}
            {state.predictionChoice && (
              <div className="c1c-line detective">探偵：「{detectiveReactionToPrediction(state.predictionChoice)}」</div>
            )}
            <button className="c1c-btn" onClick={() => goto("SHIFT")}>
              次へ
            </button>
          </div>
        );

      case "SHIFT":
        return (
          <div className="c1c-panel c1c-detail-bg" style={{ height: "100%", justifyContent: "center" }}>
            <div className="c1c-visual-row">
              <OjisanFigure size={72} pose="cheerful" />
            </div>
            <div className="c1c-line">おじさんは、少しばつが悪そうに笑いました。「いやあ、泥棒は言い過ぎたな」</div>
            <div className="c1c-line detective">探偵：「ほら、言った通りだろ。」</div>
            <button className="c1c-btn" onClick={handleFinishCase}>
              次へ
            </button>
          </div>
        );

      case "CLOSED":
        return (
          <div className="c1c-panel" style={{ height: "100%", justifyContent: "center" }}>
            <span className="c1c-tag">CASE CLOSED</span>
            <div className="c1c-line">「もう一台の自転車」の事件は、ここで一区切り。</div>
            {satchel}
            <div className="c1c-line" style={{ fontSize: 12 }}>
              🚲そっくりな自転車＋📕絵本と返却期限＋🔧自転車店の証言——すべて、急いでいた親子へつながっていました。
            </div>
            <button className="c1c-btn" onClick={() => goto("HOOK")}>
              次へ
            </button>
          </div>
        );

      case "HOOK":
        return (
          <div className="c1c-panel" style={{ height: "100%", justifyContent: "center" }}>
            <div className="c1c-line">
              帰り道、三日月珈琲の前を通ると「本日臨時休業」の張り紙が——でも、いつもと違う、ずいぶん急いで書いたような字でした。
            </div>
            <div className="c1c-line" style={{ fontSize: 12, color: "#5b6272" }}>
              マスターが窓の奥で、いつもは触らない古い写真立てを片付けている姿がちらっと見えました。
            </div>
            <button className="c1c-btn-secondary" onClick={handleNextCaseIntent}>
              気になるので見てみる
            </button>
            <button className="c1c-btn" onClick={() => goto("FEEDBACK")}>
              気にせず進む
            </button>
          </div>
        );

      case "NEXT_PENDING":
        return (
          <div className="c1c-panel" style={{ height: "100%", justifyContent: "center" }}>
            <div className="c1c-line">続きは、ただいま準備中です。できあがったら、ここでお知らせします。</div>
            <button className="c1c-btn" onClick={() => goto("FEEDBACK")}>
              つづける
            </button>
          </div>
        );

      case "FEEDBACK":
        return (
          <div className="c1c-panel" style={{ height: "100%", justifyContent: "center", gap: 10 }}>
            <div className="c1c-line" style={{ fontSize: 12.5 }}>いくつか感想を聞かせてください（1〜5でタップ）。</div>
            {ratingRow("ゲームとして面白かった？", "q1")}
            {ratingRow("途中で真相を知りたいと思った？", "q2")}
            {ratingRow("自分で調べている感じがした？", "q3")}
            {ratingRow("「なるほど」と思う瞬間があった？", "q4")}
            {ratingRow("また別の事件をやりたい？", "q5")}
            <textarea
              className="c1c-textarea"
              placeholder="分かりにくかったところ、つまらなかったところ、変だと思ったところがあれば、そのまま書いてください（任意）"
              value={state.feedback.free}
              onChange={(e) => setState((s) => ({ ...s, feedback: { ...s.feedback, free: e.target.value } }))}
            />
            <textarea
              className="c1c-textarea"
              placeholder="印象に残った人物がいたら教えてください（任意）"
              value={state.feedback.characterMemory}
              onChange={(e) =>
                setState((s) => ({ ...s, feedback: { ...s.feedback, characterMemory: e.target.value } }))
              }
            />
            <button className="c1c-btn" onClick={handleSubmitFeedback}>
              送信する
            </button>
          </div>
        );

      case "DONE": {
        const resultText = buildCase1TestResultCopyText(sessionId);
        return (
          <div className="c1c-panel" style={{ height: "100%", justifyContent: "center", gap: 10 }}>
            <div className="c1c-line">
              {standalone ? "テストは以上です。ご協力ありがとうございました。" : "ご協力ありがとうございました。"}
            </div>
            <div className="c1c-line" style={{ fontSize: 12 }}>
              下のボタンで結果をコピーして、送っていただけると助かります。
            </div>
            <button className="c1c-btn" onClick={handleCopyResult}>
              {resultCopied ? "コピーしました" : "結果をコピー"}
            </button>
            <textarea className="c1c-textarea" readOnly value={resultText} onFocus={(e) => e.target.select()} />
            {!standalone && (
              <button className="c1c-btn-secondary" onClick={onExit}>
                ホームに戻る
              </button>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  }

  return (
    <div className="c1c-root">
      <div className="c1c-topbar">
        <span>テスト版 CASE1</span>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button
            type="button"
            onClick={handleOwnerAssist}
            aria-label="運営メモ：ここで補助した"
            style={{ opacity: 0.5, fontSize: 11, padding: "5px 8px" }}
          >
            🛟{state.ownerAssistCount > 0 ? state.ownerAssistCount : ""}
          </button>
          <button type="button" onClick={handleQuit}>
            やめる
          </button>
        </div>
      </div>
      <div className="c1c-frame">{renderScreen()}</div>
    </div>
  );
}
