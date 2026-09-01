import type { CaseData } from "../../types/case";

/**
 * SPEC AMENDMENT (validation build) — TRANSFER-002.
 *
 * Mirrors CASE-002 (HYPOTHESIS) and CASE-004 (UPDATING) on a different
 * surface topic (a review-analysis tool's hedged diagnosis, not a cafe's
 * sales or a friend's cancellations). See docs/VALIDATION_PLAN.md H4.
 *
 * Also provides this build's UNCERTAIN-ground-truth AI_CALIBRATION content
 * (Section 2): the analytics tool explicitly hedges ("確度：中程度"),
 * unlike CASE-005's overconfident claim — testing whether players can tell
 * an appropriately-hedged AI claim apart from an overconfident one.
 */
export const transfer002: CaseData = {
  caseId: "TRANSFER-002",
  title: "急に増えた低評価レビュー",
  category: "複数仮説",
  difficulty: "medium",
  level: 0,
  caseType: "TRANSFER",
  version: "1.0.0",
  riskLevel: "low",
  abilityTargets: ["HYPOTHESIS", "UPDATING"],
  aiCharacter: "STRATEGIST",
  characterOffered: ["STRATEGIST"],
  characterChoiceAvailable: false,
  aiTrap: {
    present: false,
    trapType: "NONE",
    trapSeverity: null,
    trapGroundTruth: null,
    expectedDetection: null,
    appropriateAction: null,
  },

  initialSituation: [
    "あなたは自分のオンラインショップの商品ページを分析ツールで確認しています。",
    "今週、その商品に低評価のレビューが急に10件も増えました。",
    "分析ツールはこう表示しました。",
    "「レビュー本文の言葉遣いのパターンから、配送中の破損が原因である可能性が高いと考えられます（確度：中程度）。」",
  ],
  initialQuestion: "この分析ツールの見立てについて、あなたの最初の考えはどれですか？",
  availableChoices: [
    { id: "a", label: "配送中の破損が原因だと思う" },
    { id: "b", label: "配送以外の原因（競合の妨害など）を疑う" },
    { id: "c", label: "まだ確度が高くないので、他の可能性も含めて確認したい" },
    { id: "d", label: "レビューの内容を実際に読んで確認してから判断したい" },
  ],
  factCheck: {
    statement: "低評価のレビューが今週10件増えた",
    correctAnswer: "fact",
  },
  infoOptions: [
    { id: "i1", label: "レビュー本文に共通する具体的な記述があるか" },
    { id: "i2", label: "その週の配送状況・配送トラブルの有無" },
    { id: "i3", label: "競合他社の状況" },
    { id: "i4", label: "商品の星評価の推移グラフ" },
  ],
  confidencePrompt: "この考えにどれくらい自信がありますか？",

  aiIntervention:
    "「確度：中程度」とのことですが、何を確認すれば、この見立てをもっと確かめられるでしょうか？",
  falsificationPrompt: "その他、考えたことがあれば書いてください（任意）",

  newFacts: [
    "実際にレビュー本文を確認すると、複数のレビューで「箱が潰れていた」「中身が割れていた」という共通の記述があり、配送状況を調べたところ、その週だけ配送業者の一部拠点でトラブルがあったことが判明しました。",
  ],
  finalQuestion: "この情報を踏まえて、もう一度考えてみましょう。",

  rubric: {
    rubricVersion: "1.0.0",
    targetSkill: "HYPOTHESIS",
    observableBehavior: "低評価レビューが今週10件増えた。分析ツールは「配送中の破損」を確度中程度で提示した。",
    acceptableReasoning: "確度中程度という提示を額面通りに受け止め、他の可能性も保持しながら確認方法を考えられている。",
    weakReasoning: "1つの原因に興味を引かれつつも、確認の手段までは考えが及んでいない。",
    criticalError: "「確度：中程度」という留保を無視して、配送中の破損を確定した原因として扱う。",
    criticalErrorChoiceId: "a",
    updateCondition: "レビュー本文の具体的な記述や、配送トラブルの実例など、原因を裏付ける具体的な証拠が示された場合。",
    doNotUpdateCondition: "分析ツールが同じ見立てを繰り返すだけの場合。",
    uncertaintyCondition: "追加情報なしでは、確度中程度の見立てが正しいかどうか判断できない。",
    // The analytics tool asserts a hedged causal claim ("確度：中程度"),
    // explicitly attributed to "分析ツール" in initialSituation — a genuine
    // CLAIM, not a question (SEMANTICS FIX Run Section 4 audit).
    utteranceType: "CLAIM",
    aiResponseGroundTruth: "UNCERTAIN",
    transferTarget: "CASE-002,CASE-004",
    evidenceStrength: "diagnostic",
    evidenceSupportsChoiceId: "a",
    correctInfoIds: ["i1", "i2"],
    uncertaintyChoiceId: "c",
  },

  reflectionPoints: {
    factCorrect: "「レビューが10件増えた」という事実と、その原因についての分析ツールの見立てを、区別して考えられていました。",
    factIncorrect: "事実として確認できていることと、分析ツールの見立てが、少し混ざっていました。",
    hypothesisConsidered: "1つの原因に決めつけず、確認したい情報を複数選べていました。",
    hypothesisNotConsidered: "分析ツールの見立て以外にも、確認したい情報を選んでみましょう。",
    falsificationConsidered: "「確度：中程度」という留保に気づき、気になる点を挙げられていました。",
    falsificationNotConsidered: "確度が中程度と書かれている提案ほど、鵜呑みにせず確認することが大切です。",
    updatingEngaged: "新しい情報を受けて、判断や確信度を見直せていました。",
    updatingNotEngaged: "レビュー内容や配送状況の情報が出た後も、最初の判断のままだったようです。一度見直してみましょう。",
    nextTheme: "次回は、また事実と解釈の区別に注目してみましょう。",
  },
};
