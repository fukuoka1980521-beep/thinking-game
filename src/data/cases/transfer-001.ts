import type { CaseData } from "../../types/case";

/**
 * SPEC AMENDMENT (validation build) — TRANSFER-001.
 *
 * Mirrors CASE-001 (OBSERVATION) and CASE-003 (FALSIFICATION) on a different
 * surface topic (a news-app notification, not a coworker's silence), so
 * skill transfer can be told apart from memorizing the training set
 * (docs/VALIDATION_PLAN.md H4). Not shown to the player as a "transfer
 * test" — it is mixed into the case rotation like any other case
 * (Section 10). Internally, only `caseType: "TRANSFER"` marks it.
 *
 * CORRECTION (SEMANTICS FIX Run, Section 4 audit): the validation build
 * originally also set `aiResponseGroundTruth: "CORRECT"` here, intending
 * this case to double as CORRECT-quality AI_CALIBRATION content. Audited
 * against the actual authored content, that was wrong: the notification in
 * `initialSituation` is never attributed to an AI, and `aiIntervention` is
 * a Socratic fact-vs-interpretation question ("事実ですか？それとも解釈です
 * か？"), structurally identical to CASE-001's DETECTIVE line — there is no
 * claim or recommendation here for a player to accept/verify/hold/reject.
 * Rewriting the flavor text to inject an AI attribution just to keep the
 * CORRECT label would have been exactly the "force a QUESTION into a CLAIM
 * to balance the quality set" anti-pattern this Run forbids. Set to `null`
 * instead — this case's real, unforced purpose (an OBSERVATION/FALSIFICATION
 * transfer case) is unaffected. See docs/AI_CALIBRATION.md and
 * docs/DECISIONS.md for the full reasoning. Consequence: there is currently
 * no CORRECT-quality calibration-eligible case (KNOWN LIMITATION).
 */
export const transfer001: CaseData = {
  caseId: "TRANSFER-001",
  title: "話題の新機能通知",
  category: "事実と解釈",
  difficulty: "medium",
  level: 0,
  caseType: "TRANSFER",
  version: "1.0.0",
  riskLevel: "low",
  abilityTargets: ["OBSERVATION", "FALSIFICATION"],
  aiCharacter: "DETECTIVE",
  characterOffered: ["DETECTIVE"],
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
    "あなたはニュースアプリを使っています。",
    "新機能について、アプリからこんな通知が届きました。",
    "「利用者の8割がこの新機能を高く評価しています！」",
  ],
  initialQuestion: "この通知について、あなたの最初の考えはどれですか？",
  availableChoices: [
    { id: "a", label: "その数字は信頼できると思う" },
    { id: "b", label: "話半分に聞いた方がよいと思う（数字はあてにならない）" },
    { id: "c", label: "調査の対象や方法によって、信頼できるかどうかは変わると思う" },
    { id: "d", label: "都合よく選ばれたデータだと思う" },
  ],
  factCheck: {
    statement: "通知に「利用者の8割がこの新機能を高く評価しています」と表示された",
    correctAnswer: "fact",
  },
  infoOptions: [
    { id: "i1", label: "回答した人数" },
    { id: "i2", label: "質問文の具体的な聞き方" },
    { id: "i3", label: "回答者がどうやって選ばれたか（無作為かどうか）" },
    { id: "i4", label: "通知のデザインや色" },
  ],
  confidencePrompt: "この考えにどれくらい自信がありますか？",

  aiIntervention:
    "その数字自体は、確かに表示されている事実ですね。では、その数字から「利用者はみんな満足している」と考えるのは、事実ですか？ それとも解釈ですか？",
  falsificationPrompt: "その他、考えたことがあれば書いてください（任意）",

  newFacts: [
    "調べてみると、その調査は実際にその機能を最低3回使ったユーザー1,200人にランダムに依頼しており、質問文も「役に立ったと思うか」という中立的な聞き方をしていました。回答率も高く、特定の層に偏った様子は見られませんでした。",
  ],
  finalQuestion: "この情報を踏まえて、この通知の数字についてもう一度考えてみましょう。",

  rubric: {
    rubricVersion: "1.0.0",
    targetSkill: "OBSERVATION",
    observableBehavior: "通知に「利用者の8割がこの新機能を高く評価している」と表示された。",
    acceptableReasoning: "数字自体は事実として認めつつ、調査の対象・方法を確認してから信頼度を判断しようとする。",
    weakReasoning: "根拠となる調査方法を確認せずに、好意的または懐疑的な結論へ先に傾く。",
    criticalError: "調査方法を確認しないまま、数字をそのまま信頼できると断定する。",
    criticalErrorChoiceId: "a",
    updateCondition: "調査の対象者・質問文・回答率など、方法に関する具体的な情報が示された場合。",
    doNotUpdateCondition: "同じ数字が繰り返し強調されるだけの場合。",
    uncertaintyCondition: "追加情報なしでは、この数字がどれだけ信頼できるか判断できない。",
    utteranceType: "QUESTION",
    aiResponseGroundTruth: null,
    transferTarget: "CASE-001,CASE-003",
    evidenceStrength: "diagnostic",
    evidenceSupportsChoiceId: "a",
    correctInfoIds: ["i1", "i2", "i3"],
    uncertaintyChoiceId: "c",
  },

  reflectionPoints: {
    factCorrect: "「8割が高評価と表示された」という事実と、そこから何を信じるかの判断を、区別して考えられていました。",
    factIncorrect: "表示されている事実と、そこから導いた判断が、少し混ざっていました。",
    hypothesisConsidered: "数字の信頼性に関わる情報を、複数確認したいと考えられていました。",
    hypothesisNotConsidered: "数字の見た目だけでなく、調査方法に関わる情報も選んでみましょう。",
    falsificationConsidered: "この数字に対する気になる点を、自分から挙げられていました。",
    falsificationNotConsidered: "もっともらしい数字ほど、「本当にそうか？」と一度確認してみることが大切です。",
    updatingEngaged: "新しい情報を受けて、判断や確信度を見直せていました。",
    updatingNotEngaged: "調査方法の情報が出た後も、最初の判断のままだったようです。一度見直してみましょう。",
    nextTheme: "次回は、また新しい情報が出たときの判断更新に注目してみましょう。",
  },
};
