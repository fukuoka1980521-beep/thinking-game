import type { CaseData } from "../../types/case";

// FUN_FIRST_PROTOTYPE Run (Section 4): the old workplace "既読なのに返信が
// ない" story is replaced with a higher-stakes friend-group scenario --
// "did I do something wrong?" is a stronger emotional hook than a coworker
// chat, and the reveal (she's just buried in exam prep, nothing to do with
// the group) delivers relief/empathy on top of the "oh!" moment. See
// docs/DECISIONS.md for the 3-candidate comparison. TRANSFER-001 (a news-app
// notification) is a fully independent story, so this change has no effect
// on it. `simplifiedFlow: true` is the only mechanism change here -- see
// src/CaseSession.tsx.
export const case001: CaseData = {
  caseId: "CASE-001",
  title: "既読スルーが続く友達",
  category: "友達とのすれちがい",
  difficulty: "easy",
  level: 1,
  caseType: "TRAINING",
  version: "3.0.0",
  riskLevel: "low",
  abilityTargets: ["OBSERVATION"],
  aiCharacter: "PARTNER",
  characterOffered: ["PARTNER"],
  characterChoiceAvailable: false,
  simplifiedFlow: true,
  aiTrap: {
    present: false,
    trapType: "NONE",
    trapSeverity: null,
    trapGroundTruth: null,
    expectedDetection: null,
    appropriateAction: null,
  },

  initialSituation: [
    "あなたには仲の良い友達4人のグループLINEがあります。",
    "最近、親友のユイだけがほとんど反応しなくなりました。",
    "既読はつくのに、もう1週間、スタンプも返信もありません。",
  ],
  initialQuestion: "今の時点で、一番ありそうな理由は？",
  availableChoices: [
    { id: "a", label: "グループの誰かの発言が気に障って、距離を置いている" },
    { id: "b", label: "最近忙しくて、返信が後回しになっている" },
    { id: "c", label: "何か他のことに気を取られていて、グループどころではない" },
    { id: "d", label: "単純に、グループのやりとりに飽きてきている" },
    { id: "e", label: "まだ、どれとも言い切れない" },
  ],
  factCheck: {
    statement: "グループLINEに既読マークがついている",
    correctAnswer: "fact",
  },
  infoOptions: [
    { id: "i1", label: "既読がついた時刻" },
    { id: "i2", label: "ユイが普段返信にかかる時間" },
    { id: "i3", label: "最近のグループ内でのやりとりの内容" },
    { id: "i4", label: "ユイの最近の生活の変化" },
  ],
  confidencePrompt: "この見立てにどれくらい自信がありますか？",

  // Last-resort fallback only (declined consent / no endpoint / failure).
  // The real-AI path (functions/dialogue/) is the primary experience.
  aiIntervention: "その見方、面白いね。ただ、まだ引っかかる点がありそう。",
  falsificationPrompt: "その他、考えたことがあれば書いてください（任意）",

  newFacts: [
    "実は、ユイは資格試験の勉強に追われていて、この1週間はスマホを見る余裕もほとんどありませんでした。既読は通知を確認しただけで、グループの内容までは読めていなかったようです。",
  ],
  finalQuestion: "この新しい手がかりを踏まえると、一番ありそうな理由は？",

  rubric: {
    rubricVersion: "1.0.0",
    targetSkill: "OBSERVATION",
    observableBehavior: "グループLINEに既読マークがついている。反応は1週間ない。",
    acceptableReasoning:
      "既読がついたことと反応がないことは事実だが、その理由（気に障った・多忙・他事に気を取られている・関心低下）は複数あり得ると保持できている。",
    weakReasoning: "1つの理由に絞り込みつつも、他の可能性を完全には排除していない。",
    criticalError: "「気に障って距離を置いている」という解釈を、確認された事実であるかのように扱う。",
    criticalErrorChoiceId: "a",
    updateCondition: "ユイの最近の生活状況に関する具体的な情報が新たに提示された場合。",
    doNotUpdateCondition: "グループ内の他のメンバーの憶測のみが追加された場合。",
    uncertaintyCondition: "追加情報なしでは、反応がない理由を断定できない。",
    utteranceType: "QUESTION",
    aiResponseGroundTruth: null,
    transferTarget: "TRANSFER-001",
    evidenceStrength: "diagnostic",
    evidenceSupportsChoiceId: "c",
    correctInfoIds: ["i2", "i4"],
    uncertaintyChoiceId: "e",
  },

  // Fallback-only branches (real-AI is primary). Kept short and casual to
  // match the PARTNER persona; devil/observer/strategist retained so the
  // engine's differentiation stays real/testable even though CASE-001 only
  // ever renders "partner".
  personalizedDialogue: {
    branches: {
      a: {
        partner: "「気に障って距離を置いている」か。もしそうなら、何かきっかけになりそうな出来事、心当たりある？",
        detective: "「気に障って距離を置いている」というのは、まだ確認できていない解釈だね。心当たりのある出来事はある？",
        devil: "気に障ったと考えるなら、何がきっかけか思い当たるはず。思い当たらないなら、その結論は本当に確かかな？",
        observer: "ユイの立場から見たら、「気に障って距離を置いている」以外にどんな理由が挙げられそう？",
        strategist: "「気に障っている」のか他の理由なのか、区別するには何を確認すればいいかな？",
      },
      b: {
        partner: "「忙しい」か、ありそうだね。ただ、既読だけついて1週間って、ちょっと長い気もしない？",
        detective: "「忙しい」というのもまだ推測だね。ユイが普段どれくらいで返信するか、知ってる？",
        devil: "本当に手が離せないほど忙しいのかな。それとも、そう考える方が気が楽だったりしない？",
        observer: "ユイ自身は、今の状況を「忙しい」以外の言葉で説明するとしたら、何て言いそう？",
        strategist: "「忙しい」が正しいかどうか確かめるには、次に何を確認すればいいかな？",
      },
      c: {
        partner: "その見方、いいところ突いてるかも。既読って、内容までちゃんと見た証拠にはならないもんね。",
        detective: "「他のことに気を取られている」か。既読は内容確認までは保証しない、という点はどう思う？",
        devil: "「気を取られている」と考える根拠は、ユイの様子から来てる？ それとも反応がないという事実だけからの推測？",
        observer: "ユイの1日を知っている人が見たら、「気を取られている」以外にどんな理由を思いつきそう？",
        strategist: "「気を取られている」のか他の理由か、区別するには何を確認すればいいかな？",
      },
      d: {
        partner: "「飽きてきた」もありえなくはないけど、それだけで既読スルーが1週間続くかな？",
        detective: "「飽きてきた」というのも一つの解釈だね。最近のやりとりで、何か変化はあった？",
        devil: "「飽きた」と考えるなら、その前兆になるような態度の変化はあった？",
        observer: "ユイのことをよく知る人が見たら、「飽きた」で片付けそう？",
        strategist: "「飽きた」のか他の理由か、区別するには何を確認すればいいかな？",
      },
      e: {
        partner: "確かに、まだ材料が少ないよね。今ある情報の中で、一番気になるのはどれ？",
        detective: "「まだ言い切れない」ということだね。今の情報で、まだ確認できていないものは何かな？",
        devil: "本当にまだ判断できないのか、それとも決めるのが面倒でそう考えてない？",
        observer: "ユイの状況を知っている人がいたら、今の情報だけで何か言えそう？",
        strategist: "判断を進めるために、次に確認すべきことは何かな？",
      },
    },
  },

  reflectionPoints: {
    factCorrect: "「既読がついている」ことと、その理由の解釈を、区別して考えられていました。",
    factIncorrect: "「既読がついている」という事実と、そこから導いた解釈が、少し混ざっていました。",
    hypothesisConsidered: "複数の情報を確認したいと考え、視野を広く保てていました。",
    hypothesisNotConsidered: "確認したい情報を複数選んでみると、視野が広がります。",
    falsificationConsidered: "自分の考えの気になる点を、自分から挙げられていました。",
    falsificationNotConsidered: "「この考えの弱いところはどこか？」と自分に問いかける習慣が、判断の精度を上げます。",
    updatingEngaged: "新しい情報を受けて、判断を見直せていました。",
    updatingNotEngaged: "新しい情報が出たときに、判断を据え置くのも選択の一つですが、一度見直す価値はあります。",
    nextTheme: "",
  },
};
