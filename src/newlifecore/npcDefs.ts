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
import type { LocationId, NpcId } from "./types";

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
  relationships: Partial<Record<NpcId, string>>;
  knowledge: NpcKnowledge;
  speechStyle: string;
  memoryStyle: string;
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
      yohei: "洋平の店に過去何人か紹介したことがある、程度の実務的な関係。",
      miyoko: "喫茶のどかにはたまに顔を出す。",
      jin: "相馬には町の軽作業をいくつか回したことがある。",
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
      jin: "30年以上の付き合い。気心の知れた沈黙が多い。",
      miyoko: "商売相手（野菜や豆を融通し合う）。",
      kamiya: "過去に何人か紹介を受けたことがある。",
    },
    knowledge: { firsthand: NPC_CANON.yohei.firsthand, heard: NPC_CANON.yohei.heard, unknowns: NPC_CANON.yohei.unknowns },
    speechStyle: NPC_CANON.yohei.speechRegister,
    memoryStyle: "昔の話はよく覚えているが、日付や細かい時間には弱い。",
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
      yohei: "野菜や豆を融通してもらう商売相手。",
      jin: "椅子や店の修理を頼むことがある。",
      kamiya: "たまに店に来る。",
    },
    knowledge: { firsthand: NPC_CANON.miyoko.firsthand, heard: NPC_CANON.miyoko.heard, unknowns: NPC_CANON.miyoko.unknowns },
    speechStyle: NPC_CANON.miyoko.speechRegister,
    memoryStyle: "人の話をよく覚えているが、時々誰から聞いた話かを混同する。",
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
    relationships: { yohei: "30年以上の付き合い。", miyoko: "店の修理をたまに頼まれる。", kamiya: "軽作業の紹介を受けることがある。" },
    knowledge: { firsthand: NPC_CANON.jin.firsthand, heard: NPC_CANON.jin.heard, unknowns: NPC_CANON.jin.unknowns },
    speechStyle: NPC_CANON.jin.speechRegister,
    memoryStyle: "世間話は忘れがちだが、頼まれた仕事の中身と出来は覚えている。",
    schedule: [
      { fromMinutes: 8 * 60, toMinutes: 11 * 60, location: "COMMUNITY_HALL", availability: "AVAILABLE", note: "朝、集会所周りの雑務" },
      { fromMinutes: 11 * 60, toMinutes: 15 * 60, location: null, availability: "AWAY", note: "町内のその日の仕事先——場所は流動的" },
      { fromMinutes: 15 * 60, toMinutes: 18 * 60, location: "COMMUNITY_HALL", availability: "AVAILABLE", note: "夕方、また顔を出す" },
    ],
  },
};

export function npcDisplayName(id: NpcId): string {
  return NPC_DEFS[id].displayName;
}
