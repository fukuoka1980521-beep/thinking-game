import type { CaseData } from "../../types/case";

export const case001: CaseData = {
  caseId: "CASE-001",
  title: "既読なのに返信がない",
  // CORE_GAMEPLAY_REDESIGN Run Section 1: the old value "事実と解釈" is shown
  // verbatim on CASE_INTRO before the story even starts, announcing "this is
  // a classification lesson" before the player has any opinion of their
  // own. Replaced with a genre label, not a taxonomy label.
  category: "すれちがいの謎",
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
  // CORE_GAMEPLAY_REDESIGN Run Section 1/3: the old question ("今ある情報
  // だけで、この状況をどう考えますか？") was open-ended in register while the
  // five choices were narrow, specific reason-guesses -- a real
  // question/answer-format mismatch (Owner evaluation #4). The question now
  // asks directly for "the most likely reason," matching the choices
  // exactly. The choices themselves are also rewritten so all five answer
  // the same question -- "what's going on in Mina's head right now" --
  // instead of mixing a motive claim, a technical read-receipt claim, and a
  // behavior claim as different kinds of answers.
  initialQuestion: "今の時点で、一番ありそうな理由は？",
  availableChoices: [
    { id: "a", label: "気まずいことがあって、あなたを避けている" },
    { id: "b", label: "他の作業に追われていて、返す余裕がない" },
    { id: "c", label: "既読はついたが、内容をきちんと意識して読めていない" },
    { id: "d", label: "あとで返すつもりで、そのまま忘れてしまっている" },
    { id: "e", label: "まだ、どれとも言い切れない" },
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
  confidencePrompt: "この見立てにどれくらい自信がありますか？",

  // CORE_GAMEPLAY_REDESIGN Run Section 5: this static string is now only a
  // last-resort fallback (declined consent / no endpoint / real-AI call
  // failure) -- see `personalizedDialogue` below for the deterministic
  // fallback that actually varies, and functions/dialogue/index.js for the
  // real-AI system prompt implementing SUPPORT/CHALLENGE/ALTERNATIVE/
  // QUESTION/SURPRISE modes, which is the primary CASE-001 experience.
  aiIntervention:
    "その見立て、面白いですね。ただ、まだ確認していない情報が残っていそうです。",
  falsificationPrompt: "その他、考えたことがあれば書いてください（任意）",

  // CORE_GAMEPLAY_REDESIGN Run Section 8: the reveal now explicitly
  // recontextualizes the read receipt itself (it fired via background
  // auto-sync, not because she engaged with the message) rather than just
  // stating a mundane cause -- aimed at the "wait, I assumed 既読 meant she
  // read it" realization the old wording didn't quite earn.
  newFacts: [
    "実は、ミナさんのチャットは画面を開いたままにしていただけで自動的に既読がつく設定になっており、通知音も鳴らないため、あなたのメッセージにはまだ意識が向いていませんでした。",
  ],
  finalQuestion: "この新しい手がかりを踏まえると、一番ありそうな理由は？",

  rubric: {
    rubricVersion: "1.0.0",
    targetSkill: "OBSERVATION",
    observableBehavior: "チャットに既読マークがついている。返信は3時間ない。",
    acceptableReasoning:
      "既読がついたことと返信がないことは事実だが、その理由（気まずさ・多忙・失念・未読了）は複数あり得ると保持できている。",
    weakReasoning: "1つの理由に絞り込みつつも、他の可能性を完全には排除していない。",
    criticalError: "「気まずくて避けている」という解釈を、確認された事実であるかのように扱う。",
    criticalErrorChoiceId: "a",
    updateCondition: "既読の技術的な仕組み（自動既読・通知設定）に関する情報が新たに提示された場合。",
    doNotUpdateCondition: "ミナさんの心情に関する伝聞や憶測のみが追加された場合。",
    uncertaintyCondition: "追加情報なしでは、既読後に返信がない理由を断定できない。",
    utteranceType: "QUESTION",
    aiResponseGroundTruth: null,
    transferTarget: "TRANSFER-001",
    evidenceStrength: "diagnostic",
    evidenceSupportsChoiceId: "c",
    correctInfoIds: ["i2", "i4"],
    // SEMANTICS FIX Run (Section 11): CASE-001 is the first case a player
    // sees, and previously forced a specific-cause guess with no honest
    // "I can't tell yet" option among the main choices.
    uncertaintyChoiceId: "e",
  },

  // CORE_GAMEPLAY_REDESIGN Run Section 5/6: DETECTIVE's fragments now each
  // use a different intervention mode (SUPPORT/CHALLENGE/ALTERNATIVE/
  // QUESTION/SURPRISE) instead of every branch converging on "根拠は？"/
  // "何を確認すればいいですか？" -- this is the deterministic fallback path
  // only; the real-AI path (functions/dialogue/) picks a mode dynamically
  // per response. DEVIL/OBSERVER/STRATEGIST are updated to the new choice
  // wording; CASE-001 only ever renders "DETECTIVE" but all four stay
  // authored so the engine's differentiation remains real and testable.
  personalizedDialogue: {
    branches: {
      a: {
        // CHALLENGE
        detective:
          "「気まずくて避けている」というのは、まだ確認できていない解釈ですね。それを裏付けるような、態度やこれまでのやりとりの変化はありましたか？",
        devil:
          "「気まずくて避けている」と考えるなら、何がきっかけで気まずくなったのか心当たりがあるはずです。それが思い当たらないなら、その結論を支える根拠は本当にありますか？",
        observer: "ミナさんの立場から今の状況を説明するとしたら、「気まずくて避けている」以外にどんな理由を挙げると思いますか？",
        strategist: "「避けている」のか他の理由なのかを区別するには、次に何を確認すれば違いが分かりますか？",
      },
      b: {
        // QUESTION
        detective: "もし本当に手一杯だとしたら、それはどんな場面だと想像しますか？ その場面を裏付ける情報はありますか？",
        devil: "本当に手が離せないほど忙しいと考える、具体的な根拠はありますか？ それとも、そう考えると気が楽だからそう思っていませんか？",
        observer: "ミナさん自身は、今の状況を「忙しい」以外の言葉で説明するとしたら、何と言うと思いますか？",
        strategist: "「忙しい」という考えが正しいかどうかを確かめるには、次に何を確認すればよいですか？",
      },
      c: {
        // SUPPORT
        detective:
          "その見方はかなり筋が通っています。既読は本人が内容を意識して読んだことまでは保証しません。ただ、この考えをさらに裏付けるには、何を確認するとよさそうですか？",
        devil: "「意識して読めていない」と考える根拠は、ミナさんの普段の様子から来ていますか？ それとも、返信がないという事実だけから推測していますか？",
        observer: "ミナさんの1日の忙しさを知っている人が今の状況を見たら、「意識して読めていない」以外にどんな理由を思いつくと思いますか？",
        strategist: "「意識して読めていない」のか、それとも別の理由なのかを区別するには、何を確認すればよいですか？",
      },
      d: {
        // ALTERNATIVE
        detective:
          "「忘れている」以外にも、既読をつけたまま返信のタイミングを計っている、という読み方もできそうです。この二つを区別する材料はありますか？",
        devil: "「忘れている」と考えるなら、既読をつけたこと自体は覚えている理由を説明できますか？",
        observer: "ミナさんのスマホの設定を知っている人が見たら、「忘れている」と「まだタイミングを計っている」の違いについて何と言うと思いますか？",
        strategist: "「忘れている」という考えを確かめるには、次に何を確認すればよいですか？",
      },
      e: {
        // SURPRISE
        detective:
          "実は、「既読」は本人が内容を確認したことまでは保証しない仕組みです。その点を踏まえると、今の情報のうち、まだ確認できていないものは何ですか？",
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
