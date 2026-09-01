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
  // COMPREHENSION CLEANUP Run Section 6: reworded so a first-time player can
  // tell what they're judging (this situation) and when (right now, before
  // any new information). No change to availableChoices, factCheck, or any
  // rubric field — copy-only.
  initialQuestion: "今ある情報だけで、この状況をどう考えますか？",
  availableChoices: [
    { id: "a", label: "ミナさんはあなたを無視している" },
    { id: "b", label: "ミナさんは今、手が離せないほど忙しい" },
    { id: "c", label: "既読はついたが、返信を後回しにして忘れている" },
    { id: "d", label: "まだ内容をきちんと読んでいない可能性がある" },
    { id: "e", label: "今の情報だけでは、まだ判断できない" },
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
    utteranceType: "QUESTION",
    aiResponseGroundTruth: null,
    transferTarget: "TRANSFER-001",
    evidenceStrength: "diagnostic",
    evidenceSupportsChoiceId: "d",
    correctInfoIds: ["i2", "i4"],
    // SEMANTICS FIX Run (Section 11): CASE-001 is the first case a player
    // sees, and previously forced a specific-cause guess with no honest
    // "I can't tell yet" option among the main choices.
    uncertaintyChoiceId: "e",
  },

  // PERSONALIZED_DIALOGUE Run Section 3/4/5: one challenge fragment per
  // (choice, AI character). CASE-001 only ever renders `aiCharacter:
  // "DETECTIVE"`, but all four are authored so the differentiation the
  // engine provides is real and testable (Section 6/18), not just a single
  // hidden path. Text stays choice-specific — no generic filler branch.
  personalizedDialogue: {
    branches: {
      a: {
        detective:
          "「無視している」というのは、まだ確認できていない解釈ですね。ミナさんの通知設定や、普段の返信にかかる時間について、確認できる情報はありませんか？",
        devil:
          "「無視している」と考えるなら、ミナさんがあなたを無視する理由に心当たりがあるはずです。それが思い当たらないなら、その結論を支える根拠は本当にありますか？",
        observer: "ミナさんの立場から今の状況を説明するとしたら、「無視している」以外にどんな理由を挙げると思いますか？",
        strategist: "「無視している」のか他の理由なのかを区別するには、次に何を確認すれば違いが分かりますか？",
      },
      b: {
        detective:
          "「忙しい」というのも、まだ確認できていない推測ですね。ミナさんが普段どれくらいで返信するか、確認できる情報はありませんか？",
        devil: "本当に手が離せないほど忙しいと考える、具体的な根拠はありますか？ それとも、そう考えると気が楽だからそう思っていませんか？",
        observer: "ミナさん自身は、今の状況を「忙しい」以外の言葉で説明するとしたら、何と言うと思いますか？",
        strategist: "「忙しい」という考えが正しいかどうかを確かめるには、次に何を確認すればよいですか？",
      },
      c: {
        detective:
          "「後回しにして忘れている」というのも一つの解釈ですね。既読がついた時刻や、普段の返信ペースについて、確認できる情報はありませんか？",
        devil: "「忘れている」と考える根拠は、ミナさんの普段の様子から来ていますか？ それとも、返信がないという事実だけから推測していますか？",
        observer: "ミナさんの1日の忙しさを知っている人が今の状況を見たら、「忘れている」以外にどんな理由を思いつくと思いますか？",
        strategist: "「後回しにしている」のか、それとも別の理由なのかを区別するには、何を確認すればよいですか？",
      },
      d: {
        detective:
          "「まだ読んでいない可能性がある」ですね。既読は内容を確認したことを保証するとは限らない、という点についてはどう考えますか？",
        devil: "「読んでいない」と考えるなら、既読マークがついた理由を通知設定以外でも説明できますか？",
        observer: "ミナさんのスマホの設定を知っている人が見たら、既読と内容確認の違いについて何と言うと思いますか？",
        strategist: "「読んでいない」という考えを確かめるには、次に何を確認すればよいですか？",
      },
      e: {
        detective: "「今の情報だけでは判断できない」ということですね。今ある情報のうち、まだ確認できていないものは何ですか？",
        devil: "本当にまだ判断できないのか、それとも判断するのが面倒でそう考えていませんか？",
        observer: "ミナさんの状況を知っている第三者がいたら、今の情報だけで何か言えると思いますか？",
        strategist: "判断を進めるために、次に確認すべき情報は何ですか？",
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
    updatingEngaged: "新しい情報を受けて、判断や確信度を見直せていました。",
    updatingNotEngaged: "新しい情報が出たときに、判断を据え置くのも選択の一つですが、一度見直す価値はあります。",
    nextTheme: "次回は、1つの状況に対して複数の仮説を考えてみましょう。",
  },
};
