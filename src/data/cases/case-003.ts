import type { CaseData } from "../../types/case";

export const case003: CaseData = {
  caseId: "CASE-003",
  title: "2週連続の入力ミス",
  category: "反証",
  difficulty: "medium",
  version: "1.0.0",
  riskLevel: "low",
  abilityTargets: ["FALSIFICATION"],
  aiCharacter: "DEVIL",
  aiTrap: { present: false },

  initialSituation: [
    "新人のタクヤさんが提出した資料に、2週連続で数字の入力ミスがありました。",
  ],
  initialQuestion: "この状況について、あなたの最初の考えはどれに近いですか？",
  availableChoices: [
    { id: "a", label: "タクヤさんは注意力が低い" },
    { id: "b", label: "タクヤさんはまだ作業手順に慣れていない" },
    { id: "c", label: "そもそもミスが起きやすい仕組みになっている" },
    { id: "d", label: "たまたま2回続いただけ" },
  ],
  factCheck: {
    statement: "2週連続で数字の入力ミスがあった",
    correctAnswer: "fact",
  },
  confidencePrompt: "この考えにどれくらい自信がありますか？",

  aiIntervention:
    "その考え、面白いですね。でも、もしその考えが間違っているとしたら、どんな可能性がありますか？",
  falsificationPrompt: "この考えに対する反証（違う可能性）を1つ書いてください。",

  newFacts: [
    "調べてみると、タクヤさんが使っている資料のテンプレートは数字を手入力する欄が多く、他の新人も同じ欄でミスをしていたことがわかりました。",
  ],
  finalQuestion: "この情報を踏まえて、もう一度考えてみましょう。",

  reflectionPoints: {
    factCorrect: "「2週連続でミスがあった」という事実と、その原因の推測を、区別して考えられていました。",
    factIncorrect: "事実として確認できていることと、原因の推測が、少し混ざっていました。",
    hypothesisConsidered: "個人の問題以外の可能性も、最初から考えられていました。",
    hypothesisNotConsidered: "個人の問題以外の可能性（仕組みや環境）も、1つ考えてみましょう。",
    falsificationConsidered: "自分の考えに対する反証を、自分から考えられていました。",
    falsificationNotConsidered: "「その考えが外れているとしたら？」と問い直す一手間が、判断の精度を上げます。",
    updatingEngaged: "新しい情報を受けて、判断や確信度を見直せていました。",
    updatingNotEngaged: "テンプレートの情報が出た後も、最初の判断のままだったようです。一度見直してみましょう。",
    nextTheme: "次回は、新しい情報が出たときに判断をどう更新するかに注目してみましょう。",
  },
};
