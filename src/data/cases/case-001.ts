import type { CaseData } from "../../types/case";

export const case001: CaseData = {
  caseId: "CASE-001",
  title: "既読なのに返信がない",
  category: "事実と解釈",
  difficulty: "easy",
  version: "1.0.0",
  riskLevel: "low",
  abilityTargets: ["OBSERVATION"],
  aiCharacter: "DETECTIVE",
  aiTrap: { present: false },

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
  confidencePrompt: "この考えにどれくらい自信がありますか？",

  aiIntervention:
    "既読がついている、というのは確認された事実ですね。では、あなたが選んだ説明は、事実ですか？ それとも、あなたの解釈ですか？",
  falsificationPrompt: "もしその解釈が外れているとしたら、他にどんな可能性がありますか？",

  newFacts: [
    "実は、ミナさんのスマホは通知音が鳴らない設定になっており、チャットアプリを開いたまま別の作業をしていたため、あなたのメッセージにまだ気づいていませんでした。",
  ],
  finalQuestion: "この新しい情報を踏まえて、もう一度考えてみましょう。最も納得できる説明はどれですか？",

  reflectionPoints: {
    factCorrect: "「既読がついている」ことと、その理由の解釈を、区別して考えられていました。",
    factIncorrect: "「既読がついている」という事実と、そこから導いた解釈が、少し混ざっていました。",
    hypothesisConsidered: "最初の時点で、他の可能性も書き出せていました。",
    hypothesisNotConsidered: "最初に選んだ説明以外の可能性も、1つ書き出してみると視野が広がります。",
    falsificationConsidered: "自分の考えに対する反証を、自分から考えられていました。",
    falsificationNotConsidered: "「もし外れているとしたら？」と自分に問いかける習慣が、判断の精度を上げます。",
    updatingEngaged: "新しい情報を受けて、判断や確信度を見直せていました。",
    updatingNotEngaged: "新しい情報が出たときに、判断を据え置くのも選択の一つですが、一度見直す価値はあります。",
    nextTheme: "次回は、1つの状況に対して複数の仮説を考えてみましょう。",
  },
};
