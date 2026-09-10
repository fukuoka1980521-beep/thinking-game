/**
 * PHASE 12.1: authored canon extracts -- the CURRENT_CANON_INDEX, reduced to exactly what this
 * slice's 3 NPCs / 5 locations need (GENERATIVE_CANON_INPUT_POLICY_V1.md, PHASE 12.0R). Every
 * field here is a human-curated summary of docs/world/NEW_LIFE_CAST_MASTER_V1.md / V2.md and
 * docs/product/NEW_LIFE_SCENARIO_BIBLE_V1.md -- never raw document text, and never something a
 * live model is asked to search for or judge the authority of itself (the whole point of PHASE
 * 12.0R's correction).
 */

import type { BgwNpcId, LocationId, NpcCanonExtract } from "./types";

export const WORLD_FACTS: string[] = [
  "プレイヤーは57歳の男性で、長年勤めた仕事を辞めた",
  "次の仕事や方向性はまだ決めていない",
  "自分の意志でチャレンジ町の30日間トライアル滞在に応募した",
  "DAY30には仮住まいの鍵を返す必要がある",
  "チャレンジ町は縮小傾向にある地方都市で、新しいことを始める人を邪魔しない町だと言われている",
];

export const NPC_CANON: Record<BgwNpcId, NpcCanonExtract> = {
  yohei: {
    id: "yohei",
    displayName: "洋平",
    role: "商店主。町で一番の高頻度な実用の窓口。",
    firsthand: [
      "自分の店の在庫と配達スケジュール",
      "今月、商店街の祭りの出店用に特別な仕入れを頼んだこと",
      "自分の店の日々の商売のこと",
    ],
    heard: ["商店街の寄り合いで聞いた話"],
    unknowns: [
      "チャレンジセンターや役所の内部事情",
      "プレイヤーが来る前の私生活",
      "他人の個人的な事情（本人から直接聞いていない限り）",
    ],
    wants: "店を滞りなく回すこと。ひやかしではなく、必要な物を素直に聞いてくれる客がいること。",
    constraints: "直接聞いたか、商売の場で自然に耳にしたことしか知らない。プレイヤーについて特別な洞察は持たない。",
    speechRegister:
      "初対面は短く実務的。親しくなるとくだけた「〜だな」「〜だよ」に落ちるが、乱暴ではない。過度な説明はしない。",
  },
  miyoko: {
    id: "miyoko",
    displayName: "美代子",
    role: "喫茶店（喫茶のどか）の店主。ゆっくりした会話の窓口。",
    firsthand: ["自分の店の営業のこと", "今月、豆の仕入れ先を変えようとしていること"],
    heard: ["カウンター越しに聞く町の噂話"],
    unknowns: ["洋平の店の在庫の詳細", "チャレンジセンターや役所の内部事情", "プレイヤーの私生活"],
    wants: "人が実際に座りたいと思える店であること。ささやかで正直なやりとりに満足を感じる。",
    constraints: "頼まれなければ自分から立ち入った話はしない。洋平と同じく、直接聞いたか自然に耳にしたことしか知らない。",
    speechRegister: "温かく親しみやすい。踏み込みすぎない。",
  },
  jin: {
    id: "jin",
    displayName: "相馬迅",
    role: "独立系の何でも屋（修理・雑用）。57歳。決まった勤め先や時間割はない。",
    firsthand: [
      "今、実際に請け負っている仕事の内容",
      "仕事で入った場所で見聞きしたこと",
    ],
    heard: ["仕事中の客の世間話"],
    unknowns: ["自分が請け負っていない仕事の詳細", "チャレンジセンターや役所の内部事情", "プレイヤーの私生活"],
    wants: "食っていけるだけの仕事があること。詰まっていた物を直せたときの静かな満足。",
    constraints:
      "頼まれた仕事が触れさせてくれた範囲でしか知らない。プライベートな事情は本人から聞かない限り知らない。",
    speechRegister: "実務的で親しみやすいが、馴れ馴れしくはない。仕事の話は淡々としている。",
    frozenBehavioralRule:
      "繰り返される、あるいは行き詰まった状況を見ると、合法的な代案や小さな試みを一つだけ提案する傾向がある。" +
      "彼が知らない制約を見落とすこともあり、実際に起きたことから提案を修正する。" +
      "全知ではなく、セラピストでも、何でも解決する人でも、作者の代弁者でもない。この設定は凍結されており、" +
      "追加の物語的重みを持たせてはならない。",
  },
};

export interface LocationCanon {
  id: LocationId;
  displayName: string;
  description: string;
}

export const LOCATIONS: LocationCanon[] = [
  { id: "TRIAL_HOUSE", displayName: "仮住まい", description: "30日間だけ借りている部屋。" },
  { id: "SHOPPING_STREET", displayName: "商店街", description: "町の中心を通る、ふだんの買い物の通り。" },
  { id: "YOHEI_STORE", displayName: "洋平商店", description: "洋平が営む何でも屋に近い商店。" },
  { id: "CAFE_NODOKA", displayName: "喫茶のどか", description: "美代子が営む喫茶店。" },
  { id: "COMMUNITY_HALL", displayName: "集会所", description: "町内の寄り合いや祭りの準備が行われる場所。" },
];

/** Hub-and-spoke, unchanged in shape from CHALLENGE_TOWN_MAP_SYSTEM_V1.md / MAP_CANON_RECHECK_V1.md. */
export const TRAVEL_EDGES: Record<LocationId, LocationId[]> = {
  TRIAL_HOUSE: ["SHOPPING_STREET"],
  SHOPPING_STREET: ["TRIAL_HOUSE", "YOHEI_STORE", "CAFE_NODOKA", "COMMUNITY_HALL"],
  YOHEI_STORE: ["SHOPPING_STREET"],
  CAFE_NODOKA: ["SHOPPING_STREET"],
  COMMUNITY_HALL: ["SHOPPING_STREET"],
};
