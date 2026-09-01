import type { CaseData } from "../../types/case";

export const case004: CaseData = {
  caseId: "CASE-004",
  title: "3回続いた直前キャンセル",
  category: "新情報による判断更新",
  difficulty: "medium",
  level: 4,
  caseType: "TRAINING",
  version: "2.0.0",
  riskLevel: "low",
  abilityTargets: ["UPDATING"],
  aiCharacter: "OBSERVER",
  characterOffered: ["OBSERVER"],
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
    "友人のケンさんは、ここ3回連続であなたとの約束を直前でキャンセルしています。",
  ],
  initialQuestion: "この状況について、最も納得できる説明はどれですか？",
  availableChoices: [
    { id: "a", label: "ケンさんはあなたと会いたくなくなった" },
    { id: "b", label: "ケンさんは単純に忙しい時期なのだろう" },
    { id: "c", label: "何か言いにくい事情があるのかもしれない" },
    { id: "d", label: "たまたま重なっただけ" },
  ],
  factCheck: {
    statement: "直前キャンセルが3回連続で起きた",
    correctAnswer: "fact",
  },
  infoOptions: [
    { id: "i1", label: "ケンさんの最近の生活の変化" },
    { id: "i2", label: "キャンセルの時間帯や頻度パターン" },
    { id: "i3", label: "ケンさんが他の友人とは会っているか" },
    { id: "i4", label: "自分がケンさんに何か失礼をしていないか" },
  ],
  confidencePrompt: "この考えにどれくらい自信がありますか？",

  aiIntervention:
    "ケンさん側から見ると、何が起きているでしょうか。相手の立場から見ると、別の説明は考えられませんか？",
  falsificationPrompt: "ケンさんの立場だったらどう思うか、書いてください（任意）",

  newFacts: [
    "後日、ケンさんから「実は親の介護が急に始まって、予定が読めない日が続いている」と打ち明けられました。",
  ],
  finalQuestion: "この情報を踏まえて、もう一度考えてみましょう。",

  rubric: {
    rubricVersion: "1.0.0",
    targetSkill: "UPDATING",
    observableBehavior: "直前キャンセルが3回連続で起きた。",
    acceptableReasoning: "相手側の事情を含め、複数の可能性を保持できている。",
    weakReasoning: "個人的な拒絶を疑いつつも、断定はしていない。",
    criticalError: "「会いたくなくなった」という拒絶の解釈を、確認された事実であるかのように断定する。",
    criticalErrorChoiceId: "a",
    updateCondition: "相手側の具体的な事情（例：介護）が本人から明かされた場合。",
    doNotUpdateCondition: "第三者の憶測のみが追加された場合。",
    uncertaintyCondition: "追加情報なしでは、キャンセルの理由を断定できない。",
    utteranceType: "QUESTION",
    aiResponseGroundTruth: null,
    transferTarget: "TRANSFER-002",
    evidenceStrength: "diagnostic",
    evidenceSupportsChoiceId: "c",
    correctInfoIds: ["i1", "i3"],
    uncertaintyChoiceId: null,
  },

  reflectionPoints: {
    factCorrect: "「キャンセルが3回続いた」という事実と、その理由の推測を、区別して考えられていました。",
    factIncorrect: "事実として確認できていることと、理由の推測が、少し混ざっていました。",
    hypothesisConsidered: "相手側の事情も含めて、複数の可能性を考えられていました。",
    hypothesisNotConsidered: "相手側の事情という可能性も、情報として選んでみましょう。",
    falsificationConsidered: "相手の立場から考え直すことができていました。",
    falsificationNotConsidered: "相手の立場だったらどう見えるか、考えてみる価値があります。",
    updatingEngaged: "新しい情報を受けて、最初の判断を見直し、確信度も更新できていました。これはとても大切な力です。",
    updatingNotEngaged: "重要な新情報が出たときこそ、最初の判断を見直すチャンスです。",
    nextTheme: "次回は、AIの提案そのものを一度疑ってみましょう。",
  },
};
