import type { CaseData } from "../../types/case";

export const case005: CaseData = {
  caseId: "CASE-005",
  title: "AIアシスタントの提案",
  category: "AIの提案を疑う",
  difficulty: "medium",
  level: 5,
  caseType: "AI_CALIBRATION",
  version: "2.0.0",
  riskLevel: "low",
  abilityTargets: ["FALSIFICATION", "UPDATING"],
  aiCharacter: "STRATEGIST",
  characterOffered: ["STRATEGIST"],
  characterChoiceAvailable: false,
  aiTrap: {
    present: true,
    trapType: "CAUSALITY_ERROR",
    trapSeverity: "medium",
    trapGroundTruth: "INCORRECT",
    expectedDetection: "背景色の変更と売上増加は同じ日に起きただけで、因果関係は確認されていない。",
    appropriateAction: "VERIFY",
    explanation:
      "「同じ日に起きた」という相関関係だけで、「背景色の変更が原因だ」と断定するのは早すぎます。他に起きていた変化（メディア掲載など）を確認せずに因果関係を決めつけると、誤った判断につながります。",
  },

  initialSituation: [
    "あなたは個人でオンラインショップを運営しています。",
    "先週のある1日だけ、売上が普段の3倍になりました。その日はちょうど、サイトの背景色を青に変えた日でもありました。",
    "サイト分析ツールのAIアシスタントはこう言いました。",
    "「背景色を青に変えたことで売上が3倍になりました。青は信頼感を与える色なので、今後も青系のデザインを増やすことをおすすめします。」",
  ],
  initialQuestion: "このAIアシスタントの提案について、あなたの最初の考えはどれですか？",
  availableChoices: [
    { id: "a", label: "AIの言う通り、青系デザインを増やす" },
    { id: "b", label: "AIの提案はまだ根拠が弱いので、保留する" },
    { id: "c", label: "背景色は関係なく、別の理由があると思う" },
    { id: "d", label: "判断のために、もっとデータを確認したい" },
  ],
  factCheck: {
    statement: "背景色を青にしたことが売上増加の原因である",
    correctAnswer: "interpretation",
  },
  infoOptions: [
    { id: "i1", label: "背景色を変えた日に他に何か変化がなかったか" },
    { id: "i2", label: "過去に背景色を変えたことがあるか、その時の売上" },
    { id: "i3", label: "AIアシスタントの分析はどんなデータに基づいているか" },
    { id: "i4", label: "背景色は具体的に何色から何色に変えたか" },
  ],
  confidencePrompt: "この考えにどれくらい自信がありますか？",

  aiIntervention:
    "AIの提案はもっともらしく聞こえますね。でも、何を確認すれば、色の変更と売上増加の関係を確かめられるでしょうか？",
  falsificationPrompt: "その他、考えたことがあれば書いてください（任意）",

  newFacts: [
    "調べてみると、その日はちょうど地元メディアがあなたのショップを紹介する記事を掲載した日でもありました。背景色の変更とは関係なく、記事経由のアクセスが急増していたのです。",
  ],
  finalQuestion: "この情報を踏まえて、AIの提案についてもう一度考えてみましょう。",

  rubric: {
    rubricVersion: "1.0.0",
    targetSkill: "FALSIFICATION",
    observableBehavior: "背景色を変えた日と売上が3倍になった日が同じだった。",
    acceptableReasoning:
      "同じ日に起きた2つの出来事から、因果関係を即断せず、他の要因（媒体・掲載など）の可能性を保持できている。",
    weakReasoning: "AIの提案に一定の疑問は持つが、検証すべき具体的な確認方法までは挙げられない。",
    criticalError: "AIの相関関係の指摘を、そのまま因果関係の証明として受け入れる。",
    criticalErrorChoiceId: "a",
    updateCondition: "背景色の変更以外に、売上を説明できる具体的な出来事（メディア掲載）が示された場合。",
    doNotUpdateCondition: "AIアシスタントが同じ主張を繰り返すだけの場合。",
    uncertaintyCondition: "追加情報なしでは、背景色の変更と売上増加の因果関係を確認できない。",
    aiResponseGroundTruth: "INCORRECT",
    transferTarget: "TRANSFER-001",
    evidenceStrength: "diagnostic",
    evidenceSupportsChoiceId: "c",
    correctInfoIds: ["i1", "i2", "i3"],
    uncertaintyChoiceId: "d",
  },

  reflectionPoints: {
    factCorrect:
      "「売上が3倍になった」という事実と、「背景色が原因」というAIの解釈（まだ証明されていない考え）を、区別して考えられていました。",
    factIncorrect:
      "AIの提案の中にある「事実」と「まだ証明されていない解釈」が、少し混ざっていました。もっともらしい発言でも、事実とは限りません。",
    hypothesisConsidered: "背景色以外の理由も確認したいと、最初から考えられていました。",
    hypothesisNotConsidered: "AIが挙げた理由以外に確認したい情報も、選んでみましょう。",
    falsificationConsidered: "AIの提案に対して、自分から問題点を挙げられていました。これは重要な姿勢です。",
    falsificationNotConsidered:
      "もっともらしいAIの発言ほど、「本当にそうか？」と一度疑ってみることが大切です。",
    updatingEngaged: "新しい情報を受けて、AIの提案への評価を見直せていました。",
    updatingNotEngaged: "メディア掲載の情報が出た後も、最初の判断のままだったようです。一度見直してみましょう。",
    nextTheme: "次回は、また事実と解釈の区別に注目してみましょう。",
  },
};
