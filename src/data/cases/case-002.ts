import type { CaseData } from "../../types/case";

export const case002: CaseData = {
  caseId: "CASE-002",
  title: "急に伸びたドリンクの売上",
  category: "複数仮説",
  difficulty: "easy",
  version: "1.0.0",
  riskLevel: "low",
  abilityTargets: ["HYPOTHESIS"],
  aiCharacter: "STRATEGIST",
  aiTrap: { present: false },

  initialSituation: [
    "あなたは小さなカフェを経営しています。",
    "先月、あるドリンクの売上が急に1.5倍になりました。特にキャンペーンや値下げはしていません。",
  ],
  initialQuestion: "この売上増加の理由として、最も可能性が高いと思うものはどれですか？",
  availableChoices: [
    { id: "a", label: "常連客が増えた" },
    { id: "b", label: "近くに競合店ができて、そちらのお客さんが流れてきた" },
    { id: "c", label: "SNSで誰かがそのドリンクを紹介した" },
    { id: "d", label: "たまたまの変動で、特に理由はない" },
  ],
  factCheck: {
    statement: "先月の売上は前月の1.5倍だった",
    correctAnswer: "fact",
  },
  confidencePrompt: "この考えにどれくらい自信がありますか？",

  aiIntervention:
    "面白い変化ですね。ただ、理由はまだ1つに絞れません。何を確認すれば、いくつかの仮説を区別できるでしょうか？",
  falsificationPrompt: "自分が選んだ理由以外に、確認しておきたい仮説はありますか？",

  newFacts: [
    "SNSを確認したところ、地元で人気のアカウントがそのドリンクを紹介する投稿をしており、投稿日から売上が伸び始めていたことがわかりました。",
  ],
  finalQuestion: "この情報を踏まえて、もう一度考えてみましょう。",

  reflectionPoints: {
    factCorrect: "「売上が1.5倍になった」という事実と、その原因の推測を、区別して考えられていました。",
    factIncorrect: "事実として確認できていることと、原因の推測が、少し混ざっていました。",
    hypothesisConsidered: "1つの説明に絞らず、他の可能性も書き出せていました。",
    hypothesisNotConsidered: "最初に浮かんだ理由だけでなく、他の仮説も1つ書き出してみましょう。",
    falsificationConsidered: "自分の仮説以外に確認すべき可能性を、自分から考えられていました。",
    falsificationNotConsidered: "「他にも仮説はないか」と考える一手間が、判断の幅を広げます。",
    updatingEngaged: "新しい情報を受けて、判断や確信度を見直せていました。",
    updatingNotEngaged: "SNSの情報が出た後も、最初の判断のままだったようです。新情報との整合性を見直してみましょう。",
    nextTheme: "次回は、自分の考えに対する反証を1つ考えてみましょう。",
  },
};
