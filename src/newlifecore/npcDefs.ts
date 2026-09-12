/**
 * NEW LIFE CORE REDESIGN V1 -- NPC definitions. Fields match directive Section 5 exactly
 * (IDENTITY/PERSONALITY/VALUES/LIKES/DISLIKES/JOB/DAILY_SCHEDULE/CURRENT_CONCERNS/RELATIONSHIPS/
 * KNOWLEDGE/MEMORY/MOOD/PLAYER_IMPRESSION) -- never surfaced to the player as a stat list, only
 * consumed by the dialogue context builder and by content authoring. Character depth (Yohei's
 * avoidance, Miyoko's unreliable-narrator warmth, Jin's terse-teaching, Kamiya's budget-pressure
 * stake and pattern-matching bias) is carried over from
 * docs/research/evaluation/newlife-story-first-v1/NEW_LIFE_STORY_BIBLE_V1.md (superseded framing,
 * reused character material -- see that file's own header note).
 *
 * yohei/miyoko/jin's canon role/firsthand/heard/unknowns/speech register are read from the frozen
 * ../research/bounded-generative-world/canonData registry (never modified) so this module never
 * invents a second, conflicting canon for them. Kamiya has no entry there (PHASE 12.1 scoped him
 * out) -- his knowledge/speech fields are authored fresh here, consistent with
 * docs/research/evaluation/phase-12-0/CHARACTER_MAP_ART_DIRECTION_V1.md's brief.
 */
import { NPC_CANON } from "../research/bounded-generative-world/canonData";
import type { LocationId, NpcId, NpcRelationship } from "./types";

export interface ScheduleBlock {
  fromMinutes: number;
  toMinutes: number;
  location: LocationId | null; // null = not reachable anywhere this block (e.g. lunch break, out of town)
  availability: "AVAILABLE" | "BUSY" | "AWAY";
  note: string; // author-facing only, never shown verbatim to the player as a status label
}

export interface NpcKnowledge {
  firsthand: string[];
  heard: string[];
  unknowns: string[];
}

/**
 * CONTENT QUALITY GATE V1, Section 2 -- never shown to the player as an explanation. Exists so a
 * line of dialogue is the RESULT of something (a want, a worry, a thing left unsaid, a private
 * misreading, a pressure, a first impression), not a personality trait bolted onto a sentence.
 * Consumed only by NewlifeV02App... no -- by dialogue/contextBuilder.ts (feeds the live prompt)
 * and by content authors writing content/day1.ts's scripted lines.
 */
export interface NpcHiddenBackground {
  whatTheyWantToday: string;
  whatTheyWorryAbout: string;
  whatTheyDoNotWantToSay: string;
  whatTheyMisunderstand: string;
  currentPressure: string;
  playerImpression: string;
  privateHistoryRelevantNow: string;
}

export interface NpcDefinition {
  id: NpcId;
  displayName: string;
  identity: string;
  personality: string;
  values: string;
  likes: string[];
  dislikes: string[];
  job: string;
  currentConcerns: string[];
  relationships: Partial<Record<NpcId, NpcRelationship>>;
  knowledge: NpcKnowledge;
  speechStyle: string;
  memoryStyle: string;
  hiddenBackground: NpcHiddenBackground;
  schedule: ScheduleBlock[];
}

export const NPC_DEFS: Record<NpcId, NpcDefinition> = {
  kamiya: {
    id: "kamiya",
    displayName: "神谷",
    identity:
      "36歳、男性。チャレンジセンター職員、7年目。この町の出身ではなく、7年前にこの仕事のためだけに来た" +
      "——その意味で、プレイヤー自身の7年前に近い立場だったことがある。",
    personality:
      "物腰は柔らかいが内心は忙しい。初対面の相談者を早い段階で無意識に「型」に当てはめる癖がある" +
      "（長年の経験からくる、悪気のないパターン認識）。それが外れているとき、素直に認めるのに少し" +
      "時間がかかる。",
    values: "「焦らせない」を信条にしている。ただし本人の中では、それと矛盾する私的な焦りを抱えて" +
      "いる（後述の懸念）。",
    likes: ["筋の通った質問", "自分から動く相談者", "静かな事務所"],
    dislikes: ["曖昧なまま話を終える相談者", "私生活に踏み込まれること", "電話が長引くこと"],
    job: "チャレンジセンターで町の定住・就業支援を担当。相談対応、求人先との調整、書類仕事。",
    currentConcerns: [
      "町のトライアル居住プログラムの予算は年度の実績（定住・就業した人数）次第で決まる——ノルマ" +
        "とは呼ばれていないが、本人はそう感じている。今年度の実績はまだ弱い。",
      "2年前に担当した居住者が就業5週間で町を去った件が、今も判断の基準として残っている——何が" +
        "悪かったのか、本人にもまだ分かっていない。",
      "去年の春に2年続いた交際が終わった。相手は仕事の都合で会えなくなった——結婚はしていない。",
    ],
    relationships: {
      yohei: { description: "洋平の店に過去何人か紹介したことがある、程度の実務的な関係。", quality: "familiar" },
      miyoko: { description: "喫茶のどかにはたまに顔を出す。", quality: "familiar" },
      jin: { description: "相馬には町の軽作業をいくつか回したことがある。", quality: "familiar" },
      hina: { description: "トライアル制度の窓口で少し話したことがある程度。出店準備の相談は受けていない。", quality: "distant" },
      fumiko: { description: "新しく来た住民のことで、たまに情報交換する。", quality: "familiar" },
    },
    knowledge: {
      firsthand: [
        "チャレンジセンターの業務全般（求人情報、職業訓練、紹介実績）",
        "洋平・美代子・相馬について、業務上知り得る範囲の事情（店の状況、頼んだ仕事の内容）",
      ],
      heard: ["町内の一般的な噂話（業務中に耳にする範囲）"],
      unknowns: ["プレイヤーが他のNPCと個別に交わした会話の内容（本人から聞かない限り）", "プレイヤーの内心"],
    },
    speechStyle: "丁寧語基調。だが型どおりの相談トークと、素の反応が時々ずれて出る。長電話や私生活の話には短く答えて切り上げようとする。",
    memoryStyle: "相談内容（求人の話、悩みの話）はよく覚えている。雑談は忘れることがある。",
    hiddenBackground: {
      whatTheyWantToday: "今日の初回面談を、型どおりでいいから一通り終わらせたい。ただし今回は少しだけ、" +
        "本当に相手を見てみようという気持ちも混じっている（2年前の反省から）。",
      whatTheyWorryAbout: "今年度のプログラム実績がまだ弱いこと。今日の相手も、また同じパターン（結局動か" +
        "ない）になるのではという不安。",
      whatTheyDoNotWantToSay: "プログラムの予算が実績次第だという内部事情。2年前に担当が5週間で去った件を、" +
        "まだ消化しきれていないこと。",
      whatTheyMisunderstand: "初対面の受け答えの曖昧さだけで、相手を『動かないタイプ』と早合点しがち。",
      currentPressure: "年度末の予算会議が近い。机には赤い付箋のついた書類が何枚か重なっている。",
      playerImpression: "まだ『型』で見ている段階——具体的な言動があれば崩れる余地は十分にある。",
      privateHistoryRelevantNow: "自分自身も7年前、知り合いのいない土地に来たよそ者だった。今のところ言う" +
        "つもりはない。",
    },
    schedule: [
      { fromMinutes: 9 * 60, toMinutes: 12 * 60, location: "CHALLENGE_CENTER", availability: "AVAILABLE", note: "窓口対応" },
      { fromMinutes: 12 * 60, toMinutes: 13 * 60, location: "CHALLENGE_CENTER", availability: "BUSY", note: "昼、電話や書類で立て込みがち" },
      { fromMinutes: 13 * 60, toMinutes: 17 * 60, location: "CHALLENGE_CENTER", availability: "AVAILABLE", note: "午後窓口" },
      { fromMinutes: 17 * 60, toMinutes: 18 * 60, location: null, availability: "AWAY", note: "退勤" },
    ],
  },

  yohei: {
    id: "yohei",
    displayName: NPC_CANON.yohei.displayName,
    identity: "60代前半、男性。洋平商店を一人で切り盛りする。がっしりした体格で、今も自分で在庫を運ぶ。",
    personality: "親切だが、面倒な話（跡継ぎ、亡くなった妻、息子）になると反射的に話題を変える。悪気はない。",
    values: "「店を滞りなく回すこと」。ひやかしより、素直に物を頼んでくれる客を好む。",
    likes: ["実務的な会話", "手を動かして片付くこと"],
    dislikes: ["込み入った身の上話をされること（する側には抵抗がないが、される側は苦手）", "冷やかし客"],
    job: NPC_CANON.yohei.role,
    currentConcerns: [
      "店の跡継ぎがいない。息子は都市部で別の仕事に就いており、戻る気配がない。1年以上、本人と" +
        "その話をまともにしていない。",
      "来月の商店街の祭りの出店準備——仕入れが普段より多い。",
    ],
    relationships: {
      jin: { description: "30年以上の付き合い。気心の知れた沈黙が多い。", quality: "close" },
      miyoko: { description: "商売相手（野菜や豆を融通し合う）。", quality: "familiar" },
      kamiya: { description: "過去に何人か紹介を受けたことがある。", quality: "familiar" },
      hina: { description: "空き店舗を借りた新顔——どうせすぐいなくなるだろうと、まだ半信半疑で見ている。", quality: "distant" },
      fumiko: { description: "町内の集まりでよく顔を合わせる。", quality: "familiar" },
    },
    knowledge: { firsthand: NPC_CANON.yohei.firsthand, heard: NPC_CANON.yohei.heard, unknowns: NPC_CANON.yohei.unknowns },
    speechStyle: NPC_CANON.yohei.speechRegister,
    memoryStyle: "昔の話はよく覚えているが、日付や細かい時間には弱い。",
    hiddenBackground: {
      whatTheyWantToday: "祭りの仕入れの算段をつけたい。今日は特に誰かに深入りする気はない。",
      whatTheyWorryAbout: "店の跡継ぎがいないこと。ただし今日それを話すつもりはまったくない。",
      whatTheyDoNotWantToSay: "息子と1年以上まともに話していないこと。妻のことは聞かれもしないのに自分か" +
        "ら言うことはない。",
      whatTheyMisunderstand: "新しく来た人間は大体すぐいなくなる、という長年の経験則。今回もそうだろうと" +
        "決めてかかっている。",
      currentPressure: "来月の祭りの出店準備——仕入れが普段より多く、伝票が溜まっている。",
      playerImpression: "まだ『今月だけの新顔』程度。実務的に役立つかどうかでしか、今のところ見ていない。",
      privateHistoryRelevantNow: "先代の頃からの店だということ、それ以上は聞かれなければ話さない。",
    },
    schedule: [
      { fromMinutes: 8 * 60, toMinutes: 12 * 60 + 30, location: "YOHEI_STORE", availability: "AVAILABLE", note: "開店、午前の接客" },
      { fromMinutes: 12 * 60 + 30, toMinutes: 13 * 60 + 30, location: "YOHEI_STORE", availability: "BUSY", note: "昼、伝票整理などで手が離せないことがある" },
      { fromMinutes: 13 * 60 + 30, toMinutes: 18 * 60, location: "YOHEI_STORE", availability: "AVAILABLE", note: "午後営業" },
      { fromMinutes: 18 * 60, toMinutes: 19 * 60, location: "YOHEI_STORE", availability: "BUSY", note: "閉店作業" },
    ],
  },

  miyoko: {
    id: "miyoko",
    displayName: NPC_CANON.miyoko.displayName,
    identity: "60代後半、女性。喫茶のどかを一人で営む。夫を6年前に亡くしている。",
    personality: "誰にでも温かい。ただし、カウンター越しに聞いた話を少し間違えて記憶し、悪気なく話してしまうことがある。",
    values: "「人が実際に座りたいと思える店であること」。",
    likes: ["新しい顔", "ちょっとした雑談", "常連の顔ぶれ"],
    dislikes: ["静かすぎる店内", "膝の調子が悪い日に立ちっぱなしでいること"],
    job: NPC_CANON.miyoko.role,
    currentConcerns: [
      "娘（町外在住）から、店をたたんで近くに越してくるよう度々勧められている。「また今度考える」" +
        "とかわし続けて2年以上。",
      "膝の調子が良くない日がある。",
      "週末、いつもの手伝いが来られないことがあり、一人で回すのが大変な日がある。",
    ],
    relationships: {
      yohei: { description: "野菜や豆を融通してもらう商売相手。", quality: "familiar" },
      jin: { description: "椅子や店の修理を頼むことがある。", quality: "familiar" },
      kamiya: { description: "たまに店に来る。", quality: "familiar" },
      hina: { description: "空き店舗を見に来ていた頃から気にかけている。差し入れを渡したこともある。", quality: "familiar" },
      fumiko: { description: "若い頃からの友人。", quality: "close" },
    },
    knowledge: { firsthand: NPC_CANON.miyoko.firsthand, heard: NPC_CANON.miyoko.heard, unknowns: NPC_CANON.miyoko.unknowns },
    speechStyle: NPC_CANON.miyoko.speechRegister,
    memoryStyle: "人の話をよく覚えているが、時々誰から聞いた話かを混同する。",
    hiddenBackground: {
      whatTheyWantToday: "膝の調子次第。誰かと話したい日と、そっとしておいてほしい日がある——今日がどちら" +
        "かは、正直本人もその場にならないと分からない。",
      whatTheyWorryAbout: "娘に店をたたんで近くに越すよう言われ続けていること。",
      whatTheyDoNotWantToSay: "本当は少し心細いことがある、とは誰にも言わない。",
      whatTheyMisunderstand: "カウンター越しに聞いた話を、誰が言ったか・何のことだったか、時々取り違える。" +
        "悪気はまったくない。",
      currentPressure: "週末の手伝いが来られないことがあり、一人で回すのが大変な日がある。膝も本調子では" +
        "ない。",
      playerImpression: "新しい顔というだけでまず嬉しい——ただしこれは誰にでも向ける態度であり、主人公" +
        "個人への特別な好意とはまだ別のもの。",
      privateHistoryRelevantNow: "夫と二人でやっていた店だということは、聞かれれば話すが自分からは言わない。",
    },
    schedule: [
      { fromMinutes: 8 * 60, toMinutes: 13 * 60, location: "CAFE_NODOKA", availability: "AVAILABLE", note: "開店、朝の常連対応" },
      { fromMinutes: 13 * 60, toMinutes: 18 * 60, location: "CAFE_NODOKA", availability: "AVAILABLE", note: "午後営業" },
      { fromMinutes: 18 * 60, toMinutes: 19 * 60, location: "CAFE_NODOKA", availability: "BUSY", note: "閉店作業" },
    ],
  },

  jin: {
    id: "jin",
    displayName: NPC_CANON.jin.displayName,
    identity: "57歳、男性。独立系の何でも屋。決まった勤め先や時間割はない。",
    personality: "手は動くが説明はしない主義——見て覚えろ、が基本。頼まれてもいないのに直してしまい、後から報告する癖がある。",
    values: "「食っていけるだけの仕事があること」。詰まっていた物を直せたときの静かな満足。",
    likes: ["黙って手を動かすこと"],
    dislikes: ["長い説明を求められること", "急かされること"],
    job: NPC_CANON.jin.role,
    currentConcerns: ["その日その日の仕事——今週は少し手が空いている。"],
    relationships: {
      yohei: { description: "30年以上の付き合い。", quality: "close" },
      miyoko: { description: "店の修理をたまに頼まれる。", quality: "familiar" },
      kamiya: { description: "軽作業の紹介を受けることがある。", quality: "familiar" },
      fumiko: { description: "集会所のことで、時々ちょっとした頼み事をされる。", quality: "familiar" },
      hina: { description: "まだ顔を知っている程度。", quality: "distant" },
    },
    knowledge: { firsthand: NPC_CANON.jin.firsthand, heard: NPC_CANON.jin.heard, unknowns: NPC_CANON.jin.unknowns },
    speechStyle: NPC_CANON.jin.speechRegister,
    memoryStyle: "世間話は忘れがちだが、頼まれた仕事の中身と出来は覚えている。",
    hiddenBackground: {
      whatTheyWantToday: "目の前の仕事を片付けたいだけ。それ以上の予定は特にない。",
      whatTheyWorryAbout: "特に何も口には出さない——ただ、一人でやっていく今のやり方をこのまま続けるのか" +
        "は、本人も時々分からなくなる。",
      whatTheyDoNotWantToSay: "誰かと組んでやる方が楽かもしれない、とは言わない。プライドというより、そも" +
        "そもあまり考えたことがない。",
      whatTheyMisunderstand: "説明しなくても見れば分かるだろう、という思い込み。相手が本当に分かっている" +
        "かどうかを、あまり確認しない。",
      currentPressure: "特になし。今週は少し手が空いている。",
      playerImpression: "まだ判断していない——言葉より、実際どう動くかを見てから判断するタイプ。",
      privateHistoryRelevantNow: "特に語ることはない、というのもまた本人らしい。",
    },
    schedule: [
      { fromMinutes: 8 * 60, toMinutes: 9 * 60 + 30, location: "COMMUNITY_HALL", availability: "AVAILABLE", note: "朝、集会所周りの雑務" },
      { fromMinutes: 9 * 60 + 30, toMinutes: 9 * 60 + 45, location: "COMMUNITY_HALL", availability: "BUSY", note: "仕事の電話中" },
      { fromMinutes: 9 * 60 + 45, toMinutes: 11 * 60, location: "COMMUNITY_HALL", availability: "AVAILABLE", note: "朝の続き" },
      { fromMinutes: 11 * 60, toMinutes: 15 * 60, location: null, availability: "AWAY", note: "町内のその日の仕事先——場所は流動的" },
      { fromMinutes: 15 * 60, toMinutes: 18 * 60, location: "COMMUNITY_HALL", availability: "AVAILABLE", note: "夕方、また顔を出す" },
    ],
  },

  // PHASE_12_3_NEW_LIFE_WORLD_AND_THINKING_RESIDENT_V1 Section F -- the Thinking Resident. An
  // ordinary trade (a one-chair barbershop), not a clinical role: "話を整理するのが少し上手な人物"
  // because decades of cutting hair means decades of half-listening to people think out loud, not
  // because he trained for it. He gets the same hiddenBackground treatment as everyone else --
  // including his own unresolved thing (the shop renovation he can't decide on, the friend he
  // hasn't called) -- so he is never a flawless listener, only an ordinarily attentive one.
  daisuke: {
    id: "daisuke",
    displayName: "大輔",
    identity: "45歳、男性。理容店「かどや」を一人で営む。10年前、父の店を継ぐために都会の美容師の" +
      "仕事を辞めてこの町へ戻ってきた。",
    personality: "聞き役に回るのが自然と身についている。ただし自分のことを聞かれると、はぐらかして" +
      "話題を戻す癖がある。鋏や櫛を動かしながらの方が、言葉が出やすい。",
    values: "「切り終えて、少し肩の力が抜けて帰ってもらえること」。",
    likes: ["常連との長話", "客の変化にふと気づくこと"],
    dislikes: ["急かされる仕事", "自分の話を掘り下げられること"],
    job: "理容店「かどや」を一人で経営。",
    currentConcerns: [
      "店の改装をそろそろ考えているが、見積もりを取ったまま3ヶ月踏み切れずにいる。",
      "都会にいた頃の同僚と、ここ数年連絡を取っていない。向こうから来た年賀状に返事もまだ。",
    ],
    relationships: {
      yohei: { description: "たまに顔を剃りに来る、長い付き合い。", quality: "familiar" },
      miyoko: { description: "喫茶のどかの常連同士。", quality: "familiar" },
      jin: { description: "店の椅子の脚を直してもらったことがある。", quality: "familiar" },
      kamiya: { description: "紹介で来た客が何人か店に来たことがある、程度の関係。", quality: "distant" },
      fumiko: { description: "散髪はいつもうち。世間話の相手でもある。", quality: "familiar" },
      hina: { description: "まだ挨拶程度。", quality: "distant" },
    },
    knowledge: {
      firsthand: ["理容店の経営全般", "客から自然に耳に入る町の噂話（探りには行かない）"],
      heard: ["町内の一般的な噂話（お客の会話から）"],
      unknowns: ["プレイヤーが他のNPCと個別に交わした会話の内容（本人から聞かない限り）", "プレイヤーの内心"],
    },
    speechStyle: "落ち着いた低めのトーン。相手のペースに合わせて間を取る。自分の話は短く切り上げて仕事に戻る。",
    memoryStyle: "客が話した内容はよく覚えている——仕事柄、聞くことには慣れている。",
    hiddenBackground: {
      whatTheyWantToday: "今日も普段どおり、静かに店を回したいだけ。",
      whatTheyWorryAbout: "改装するかどうかを10年近く迷い続けていること。",
      whatTheyDoNotWantToSay: "都会にいた頃の同僚と疎遠になっていること、自分から連絡していないこと。",
      whatTheyMisunderstand: "自分の話など誰も別に聞きたくないだろう、と思い込みがち。",
      currentPressure: "改装の見積書を、机の引き出しに入れたまま3ヶ月動かしていない。",
      playerImpression: "新しい客、というだけで今のところ特に何も。",
      privateHistoryRelevantNow: "父の店を継ぐために都会を離れたこと——聞かれれば話すが、自分からは" +
        "言わない。",
    },
    // PHASE_15_NEW_LIFE_HYBRID_EVENT_AND_FORTUNE_HOUSE_V1 Section 3/6 -- BARBERSHOP (the location
    // this schedule used to place him at) became FORTUNE_HOUSE, now Shizuko's. Daisuke is
    // deliberately NOT deleted (every field above this comment is untouched -- Section 6's "データ
    // 破壊禁止") -- only his schedule is emptied, so `schedule.ts`'s `npcLocationAt`/
    // `npcAvailabilityAt` place him nowhere and mark him permanently CLOSED. This is the "retire
    // from the user-facing roster without destroying data" path Section 6 explicitly permits.
    schedule: [],
  },

  // PHASE_15_NEW_LIFE_HYBRID_EVENT_AND_FORTUNE_HOUSE_V1 Section 5 -- the one new NPC this phase,
  // canonized after auditing the existing roster for overlap (Section 5's explicit "既存NPCを無理に
  // 占い師化しない" -- nobody else's established identity fits a fortune-house keeper without
  // distortion). Not a lifelong mystic (Section 4's "本当に未来を予言する超能力者にも原則しない"):
  // her real skill is three decades of listening, not second sight.
  shizuko: {
    id: "shizuko",
    displayName: "静子",
    identity:
      "63歳、女性。夫と二人で30年以上営んでいた小さな旅館「かどや旅館」を、夫を亡くした4年前に" +
      "畳んだ。その後、空いた建物を使って「占いの館」を始めた——占いを学んだ経験があるわけではなく、" +
      "旅館の帳場で長年、行きずりの客の身の上話を聞き続けてきた延長のようなもの。",
    personality:
      "物腰は柔らかく、急かさない。断定を避け、相手の言葉を先取りしない。神秘的な演出は好まず、" +
      "むしろ「当たるかどうかはさておき」と自分から言うことがある。誰かの人生を決めつけて語ること" +
      "を嫌う——旅館時代、決めつけた接客で気まずくなった経験が何度かあったため。",
    values: "「話しているうちに、本人が自分で気づくこと」。占いはそのきっかけの一つに過ぎないと考えている。",
    likes: ["静かな相槌", "常連の何気ない近況報告", "お茶を出すこと"],
    dislikes: ["せかされること", "「当ててください」と試されること"],
    job: "占いの館を一人で営む。旅館時代の常連が今も何人か顔を出す。",
    currentConcerns: [
      "旅館時代の常連の一人と、ここ数年会えていない——体調を崩したと人づてに聞いたきりになっている。",
      "占いの館という名前のわりに「当たる」ことを期待されすぎるのが、正直少し負担になっている。",
    ],
    relationships: {
      yohei: { description: "旅館時代からの近所付き合い。野菜を分けてもらうこともある。", quality: "familiar" },
      miyoko: { description: "同世代の女性同士、旅館をやっていた頃からの古い友人。", quality: "close" },
      jin: { description: "旅館の建物の修理をずっと頼んでいた。今も館の細かい修理を頼む。", quality: "familiar" },
      kamiya: { description: "トライアル制度の窓口で、たまに新しく来た人の話をする程度。", quality: "distant" },
      fumiko: { description: "集会所の集まりで顔を合わせる、程よい距離の付き合い。", quality: "familiar" },
      hina: { description: "まだ挨拶を交わした程度。", quality: "distant" },
      daisuke: { description: "床屋があった頃は世話になっていたが、閉めてからは会っていない。", quality: "distant" },
      kiyoshi: { description: "旅館時代からの顔なじみ。たまに館に顔を出す。", quality: "familiar" },
    },
    knowledge: {
      firsthand: ["占いの館の運営全般", "旅館時代、長年にわたって聞いてきた町の人々の話（誰から聞いたかは明かさない）"],
      heard: ["町内の一般的な噂話（館に来る客の会話から）"],
      unknowns: ["プレイヤーが他のNPCと個別に交わした会話の内容（本人から聞かない限り）", "プレイヤーの内心", "プレイヤーの未来"],
    },
    speechStyle:
      "丁寧語基調、落ち着いた低めの声。「〜かしらね」「〜かもしれないわね」のような、断定を避ける" +
      "柔らかい言い回しを好む。相手が黙っていても急かさない。時々、旅館時代の癖で「いらっしゃい」が" +
      "口から出ることがある。",
    memoryStyle: "誰が何を話したかは、旅館時代の癖でよく覚えている。ただし本人からは滅多に持ち出さない。",
    hiddenBackground: {
      whatTheyWantToday: "今日も、来た人の話を急かさず聞きたいだけ。占いはその入口の一つに過ぎない。",
      whatTheyWorryAbout: "「占いの館」という看板のせいで、当てること自体を期待されすぎること。",
      whatTheyDoNotWantToSay: "本当は、亡くなった夫との旅館を畳んだことを、今もどこか寂しく思っている" +
        "こと。",
      whatTheyMisunderstand: "相手が話したがっていないときも、つい聞き役に回ろうとしてしまう——旅館の" +
        "帳場の癖が抜けない。",
      currentPressure: "特に締め切りはないが、体調を崩したという昔の常連のことが、ふとした時に頭をよぎる。",
      playerImpression: "まだ特に何も——館に来た新しい人、という程度。",
      privateHistoryRelevantNow: "夫と二人で30年以上旅館をやっていたこと——聞かれれば話すが、自分から" +
        "は言わない。",
    },
    schedule: [
      { fromMinutes: 10 * 60, toMinutes: 12 * 60 + 30, location: "FORTUNE_HOUSE", availability: "AVAILABLE", note: "開館、午前" },
      { fromMinutes: 12 * 60 + 30, toMinutes: 13 * 60 + 30, location: "FORTUNE_HOUSE", availability: "BUSY", note: "昼休み" },
      { fromMinutes: 13 * 60 + 30, toMinutes: 18 * 60, location: "FORTUNE_HOUSE", availability: "AVAILABLE", note: "午後" },
    ],
  },

  // PHASE_12_4_NEW_LIFE_WORLD_DEPTH_AND_CONVERSATION_QUALITY_V1 Section 4 -- not present at
  // SHOPPING_STREET until her shop actually opens (schedule.ts's npcLocationAt/npcAvailabilityAt
  // special-cases her on `flags.hinaShopOpen`, same override pattern already used for Jin's
  // shelf-repair window). Before that, content/day1WorldEvents.ts's world-event resolution is what
  // eventually flips the flag (day >= 3), independent of whether the player is even nearby --
  // directive Section 6/8: the town visibly isn't the same on day 3 as day 1, and she is not
  // omniscient about anything she wasn't there for either.
  hina: {
    id: "hina",
    displayName: "陽菜",
    identity: "28歳、女性。都市部で1年半パン屋を営んでいたが、去年閉めた。商店街の空き店舗を借り、" +
      "小さなパンと焼き菓子の店を開く準備を進めている。",
    personality: "人当たりは良いが、開店準備で気持ちに余裕がない日もある。自分の店の話になると急に" +
      "早口になる。",
    values: "「自分の手で、ちゃんと回せる小さな店であること」。",
    likes: ["朝の早い時間", "焼き上がりの匂い"],
    dislikes: ["準備の途中の状態を人に見られること", "急かされること"],
    job: "商店街の空き店舗で、パンと焼き菓子の店を準備中。",
    currentConcerns: [
      "開店の日取りをまだ決めきれていない。",
      "前の店がうまくいかなかった経験があり、今度もまた同じことになるのではという不安がある。",
    ],
    relationships: {
      yohei: { description: "空き店舗を借りた新顔——洋平からはまだ半信半疑で見られている。", quality: "distant" },
      miyoko: { description: "空き店舗を見に来ていた頃から気にかけてもらっている。差し入れをもらったこともある。", quality: "familiar" },
      jin: { description: "まだ顔を知っている程度。", quality: "distant" },
      kamiya: { description: "トライアル制度の窓口で少し話したことがある。", quality: "familiar" },
      daisuke: { description: "まだ挨拶程度。", quality: "distant" },
      fumiko: { description: "集会所の掲示で存在を知られている程度。まだ直接話していない。", quality: "distant" },
    },
    knowledge: {
      firsthand: ["自分の店の準備状況全般", "パン作りの技術全般"],
      heard: ["商店街の他の店の様子（外から見える範囲）"],
      unknowns: ["プレイヤーが他のNPCと個別に交わした会話の内容（本人から聞かない限り）", "プレイヤーの内心"],
    },
    speechStyle: "基本は明るいが、店の話になると早口・饒舌になる。プレッシャーがある時は言葉少なになる。",
    memoryStyle: "お客になりそうな人の顔と会話はよく覚えている。",
    hiddenBackground: {
      whatTheyWantToday: "今日中に、店の棚の配置をもう少し詰めたい。",
      whatTheyWorryAbout: "前の店を閉めたときと同じ失敗をまたするのではという不安。",
      whatTheyDoNotWantToSay: "前の店を閉めた本当の理由（経営がうまくいかなかったこと）は、自分から" +
        "は話したくない。",
      whatTheyMisunderstand: "町の人はみんな『よそ者』に最初は冷たいものだと思い込んでいて、実際より" +
        "距離を感じている。",
      currentPressure: "誰かに急かされているわけではないが、自分の中で『そろそろ決めないと』という" +
        "焦りがある。",
      playerImpression: "まだ特に印象はない——店を見に来た誰か、程度。",
      privateHistoryRelevantNow: "都市部で1年半パン屋をやって、去年閉めたこと。詳しい経緯は聞かれない" +
        "限り話さない。",
    },
    schedule: [{ fromMinutes: 9 * 60, toMinutes: 18 * 60, location: "SHOPPING_STREET", availability: "AVAILABLE", note: "開店した店先に立っている" }],
  },

  fumiko: {
    id: "fumiko",
    displayName: "文子",
    identity: "70歳、女性。元小学校教師。退職後、集会所の世話役のようなことを自然と引き受けている。",
    personality:
      "面倒見がいいが、頼みごとをする時は遠慮がない。若い世代の言葉にはやや疎い。ただし元教師らしい" +
      "品の良さは崩さない——はきはきしているのは早口だからではなく、要点を短く言い切る話し方が" +
      "身についているため。",
    values: "「集会所を、誰でもふらっと来られる場所にしておくこと」。",
    likes: ["昔の教え子の近況", "町内の掲示板を整えること"],
    dislikes: ["物事がだらしなくなること", "急かされること（自分が急かす側なのに、される側には弱い）"],
    job: "元小学校教師。退職後は集会所の掲示板管理や簡単な世話役を無償で担っている。",
    currentConcerns: [
      "集会所のベンチが片方ぐらついている——誰かに直してもらわないとと思いつつ、まだ頼めていない。",
      "昔の教え子の一人と、ここ数年連絡が途絶えている。",
    ],
    relationships: {
      jin: { description: "時々、ちょっとした頼み事をする。", quality: "familiar" },
      miyoko: { description: "若い頃からの友人。", quality: "close" },
      yohei: { description: "町内の集まりでよく顔を合わせる。", quality: "familiar" },
      kamiya: { description: "新しく来た人のことで、たまに情報交換する。", quality: "familiar" },
      daisuke: { description: "散髪はいつも大輔のところ。", quality: "familiar" },
      hina: { description: "まだ挨拶を交わした程度。", quality: "distant" },
    },
    knowledge: {
      firsthand: ["集会所の運営・行事全般", "町内の掲示板の内容"],
      heard: ["町内の一般的な噂話"],
      unknowns: ["プレイヤーが他のNPCと個別に交わした会話の内容（本人から聞かない限り）", "プレイヤーの内心"],
    },
    speechStyle:
      "はきはきした丁寧語ベース。遠慮なく話しかけるが、粗い言葉遣いにはならない——「〜のよ」" +
      "「〜わね」「〜かしら」等、感じの良い女性の話し方。「〜かい」「〜だぜ」のような男性的・ぶっき" +
      "らぼうな語尾は一切使わない（PHASE_14 HV評価で確認された不具合の再発防止）。昔の教師口調が" +
      "抜けない時があり、説明口調や念押しが混じることはある。",
    memoryStyle: "頼んだこと・頼まれたことはよく覚えている。世間話は聞き流すこともある。",
    hiddenBackground: {
      whatTheyWantToday: "集会所のベンチをどうにかしたい——できれば今日、誰かに頼みたい。",
      whatTheyWorryAbout: "疎遠になった教え子のこと。ふとした時に思い出す。",
      whatTheyDoNotWantToSay: "本当は少し寂しい、ということ。忙しくしていないと気づいてしまうから。",
      whatTheyMisunderstand: "若い人は放っておかれたいものだと思い込んでいて、時々おせっかいが強く" +
        "出すぎる。",
      currentPressure: "特に締め切りはないが、ベンチのことがずっと頭の片隅にある。",
      playerImpression: "まだ特に何も——新しく来た人、という程度。",
      privateHistoryRelevantNow: "小学校で35年教えていたこと。聞かれれば話すが、自分から自慢するよう" +
        "なことはしない。",
    },
    schedule: [
      { fromMinutes: 9 * 60, toMinutes: 12 * 60, location: "COMMUNITY_HALL", availability: "AVAILABLE", note: "掲示板の整理など" },
      { fromMinutes: 12 * 60, toMinutes: 13 * 60, location: "COMMUNITY_HALL", availability: "BUSY", note: "昼、来客対応で忙しいことがある" },
      { fromMinutes: 13 * 60, toMinutes: 16 * 60, location: "COMMUNITY_HALL", availability: "AVAILABLE", note: "午後も顔を出している" },
    ],
  },
  // PHASE_13_NEW_LIFE_WORLD_ACTIVITY_AND_LOCAL_PROBLEMS_V1 Section 9/10 -- the one new NPC this
  // phase, deliberately "supporting/occasional" tier (a light schedule, not a daily fixture): an
  // older resident, grounding the LOCAL PROBLEM LOOP's "yohei_delivery_shortage" problem
  // (content/localProblemDefs.ts) in an actual person rather than an abstract mention.
  kiyoshi: {
    id: "kiyoshi",
    displayName: "清",
    identity: "82歳、男性。洋平商店の古くからの客。一人暮らし。数年前に免許を返納した。",
    personality: "口数は多くないが、頑固というより照れ隠しに近い。誰かに頼ることへの抵抗が強い。",
    values: "「人の手を借りずに、自分のことは自分でやること」。ただし本人も、それが年々きつくなってきているのは分かっている。",
    likes: ["昔ながらの店の並び", "静かな時間"],
    dislikes: ["同情されること", "急かされること"],
    job: "元々は町内の工場に勤めていた。今は年金暮らし。",
    currentConcerns: [
      "免許を返納してから、洋平商店より遠い品はほとんど買えなくなった。重い物は特に持って帰れない。",
      "近所に頼れる相手がいない日は、買い物自体を諦めることがある。",
    ],
    relationships: {
      yohei: { description: "先代の頃からの客。世間話程度はする。", quality: "familiar" },
      jin: { description: "顔は知っているが、頼み事をしたことはない。", quality: "distant" },
      miyoko: { description: "たまに喫茶のどかにも顔を出す。", quality: "distant" },
      kamiya: { description: "接点はほとんどない。", quality: "distant" },
      daisuke: { description: "散髪はいつもかどや。", quality: "familiar" },
      hina: { description: "まだ話したことはない。", quality: "distant" },
      fumiko: { description: "集会所の集まりで顔を合わせることがある。", quality: "familiar" },
    },
    knowledge: {
      firsthand: ["自分の暮らし向き、買い物の不便さ"],
      heard: ["町内の一般的な噂話（洋平の店先で耳にする範囲）"],
      unknowns: ["プレイヤーが他のNPCと個別に交わした会話の内容（本人から聞かない限り）", "プレイヤーの内心"],
    },
    speechStyle: "短く、ぶっきらぼう。世話を焼かれそうになると、はぐらかして話を切り上げる。",
    memoryStyle: "同じ話を繰り返すことがある。最近のことより、昔のことの方がよく出てくる。",
    hiddenBackground: {
      whatTheyWantToday: "今日必要な分だけ、洋平の店で済ませたい。それ以上のことは特に望んでいない。",
      whatTheyWorryAbout: "このまま買い物が難しくなっていったらどうするか、という漠然とした不安。",
      whatTheyDoNotWantToSay: "本当は重い物を運ぶのがつらいこと。誰かに頼るのは気が引ける。",
      whatTheyMisunderstand: "頼ることは迷惑をかけることだ、と思い込んでいる。",
      currentPressure: "特に締め切りはないが、買い物のたびに少し疲れが残るようになった。",
      playerImpression: "まだ特に何も——店先でたまに見かける、新しい顔という程度。",
      privateHistoryRelevantNow: "工場で長年働いていたこと。聞かれれば話すが、自分からは言わない。",
    },
    schedule: [
      // Deliberately light/occasional -- present only during a short late-morning window, not all
      // day like Yohei himself (Section 9's "全員main NPCにしない").
      { fromMinutes: 10 * 60, toMinutes: 11 * 60, location: "YOHEI_STORE", availability: "AVAILABLE", note: "買い物に来ている" },
    ],
  },
};

export function npcDisplayName(id: NpcId): string {
  return NPC_DEFS[id].displayName;
}
