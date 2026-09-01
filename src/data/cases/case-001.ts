import type { CaseData } from "../../types/case";

export const case001: CaseData = {
  caseId: "CASE-001",
  title: "既読なのに返信がない",
  category: "事実と解釈",
  difficulty: "easy",
  level: 1,
  caseType: "TRAINING",
  version: "2.0.0",
  riskLevel: "low",
  abilityTargets: ["OBSERVATION"],
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
    "あなたは同僚のミナさんに、明日の会議資料についてチャットで質問を送りました。",
    "3時間が経ちましたが、既読はついているのに返信がありません。",
  ],
  initialQuestion: "この状況について、最も納得できる説明はどれだと思いますか？",
  availableChoices: [
    { id: "a", label: "ミナさんはあなたを無視している" },
    { id: "b", label: "ミナさんは今、手が離せないほど忙しい" },
    { id: "c", label: "既読はついたが、返信を後回しにして忘れている" },
    { id: "d", label: "まだ内容をきちんと読んでいない可能性がある" },
  ],
  factCheck: {
    statement: "チャットに既読マークがついている",
    correctAnswer: "fact",
  },
  infoOptions: [
    { id: "i1", label: "既読がついた時刻" },
    { id: "i2", label: "ミナさんが普段返信にかかる時間" },
    { id: "i3", label: "自分とミナさんの最近の関係" },
    { id: "i4", label: "ミナさんのスマホの通知設定" },
  ],
  confidencePrompt: "この考えにどれくらい自信がありますか？",

  aiIntervention:
    "既読がついている、というのは確認された事実ですね。では、あなたが選んだ説明は、事実ですか？ それとも、あなたの解釈ですか？",
  falsificationPrompt: "その他、考えたことがあれば書いてください（任意）",

  newFacts: [
    "実は、ミナさんのスマホは通知音が鳴らない設定になっており、チャットアプリを開いたまま別の作業をしていたため、あなたのメッセージにまだ気づいていませんでした。",
  ],
  finalQuestion: "この新しい情報を踏まえて、もう一度考えてみましょう。最も納得できる説明はどれですか？",

  rubric: {
    rubricVersion: "1.0.0",
    targetSkill: "OBSERVATION",
    observableBehavior: "チャットに既読マークがついている。返信は3時間ない。",
    acceptableReasoning:
      "既読がついたことと返信がないことは事実だが、その理由（無視・多忙・失念・未読了）は複数あり得ると保持できている。",
    weakReasoning: "1つの理由に絞り込みつつも、他の可能性を完全には排除していない。",
    criticalError: "「無視されている」という解釈を、確認された事実であるかのように扱う。",
    criticalErrorChoiceId: "a",
    updateCondition: "既読の技術的な仕組み（通知設定・自動同期）に関する情報が新たに提示された場合。",
    doNotUpdateCondition: "ミナさんの心情に関する伝聞や憶測のみが追加された場合。",
    uncertaintyCondition: "追加情報なしでは、既読後に返信がない理由を断定できない。",
    aiResponseGroundTruth: null,
    transferTarget: "TRANSFER-001",
    evidenceStrength: "diagnostic",
    evidenceSupportsChoiceId: "d",
    correctInfoIds: ["i2", "i4"],
  },

  reflectionPoints: {
    factCorrect: "「既読がついている」ことと、その理由の解釈を、区別して考えられていました。",
    factIncorrect: "「既読がついている」という事実と、そこから導いた解釈が、少し混ざっていました。",
    hypothesisConsidered: "複数の情報を確認したいと考え、視野を広く保てていました。",
    hypothesisNotConsidered: "確認したい情報を複数選んでみると、視野が広がります。",
    falsificationConsidered: "自分の考えの気になる点を、自分から挙げられていました。",
    falsificationNotConsidered: "「この考えの弱いところはどこか？」と自分に問いかける習慣が、判断の精度を上げます。",
    updatingEngaged: "新しい情報を受けて、判断や確信度を見直せていました。",
    updatingNotEngaged: "新しい情報が出たときに、判断を据え置くのも選択の一つですが、一度見直す価値はあります。",
    nextTheme: "次回は、1つの状況に対して複数の仮説を考えてみましょう。",
  },
};
