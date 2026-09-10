/**
 * NEW LIFE V0.3 -- 30-day destination design (directive "30-DAY DESTINATIONS" / "CAREER
 * DISCOVERY"). This is the design layer: every career has >=2 discovery routes described here,
 * but only a few are actually wired to state signals within the DAY1-7 slice this Run builds
 * (see `CAREER_SIGNAL_SOURCES` in engine.ts) -- the rest are the seed for a later DAY8+ Run,
 * per the directive's own "don't build all 30 days first" instruction. Career and life-status
 * are deliberately separate axes so they can combine (e.g. AI_DEVELOPER + MOVE_AWAY,
 * LOCAL_BUSINESS_SUCCESSION + MARRY_INTO_FAMILY).
 */

export type CareerId =
  | "FACTORY_WORKER"
  | "TRUCK_DRIVER"
  | "LOGISTICS"
  | "FACILITY_REPAIR"
  | "RETAIL_SHOP"
  | "CAFE_FOOD_SERVICE"
  | "CAREGIVING"
  | "AI_DEVELOPER"
  | "SME_AI_DX_SUPPORT"
  | "HANDYMAN_INDEPENDENT"
  | "REPAIR_BUSINESS_INDEPENDENT"
  | "SMALL_SHOP_OWNER"
  | "LOCAL_BUSINESS_SUCCESSION"
  | "PART_TIME_UNDECIDED"
  | "UNEMPLOYED";

export type LifeStatus = "STAY_IN_TOWN" | "MOVE_AWAY" | "MARRY" | "MARRY_INTO_FAMILY" | "SINGLE";

export interface CareerDef {
  id: CareerId;
  displayName: string;
  /** >=2 authored discovery routes -- named here as design intent, not all playable in DAY1-7. */
  discoveryRoutes: string[];
}

export const CAREERS: CareerDef[] = [
  { id: "FACTORY_WORKER", displayName: "工場・製造職", discoveryRoutes: ["集会所の求人掲示から応募", "洋平の知人の紹介"] },
  { id: "TRUCK_DRIVER", displayName: "トラック運転手", discoveryRoutes: ["チャレンジセンターの求人紹介", "配送で来た業者との会話"] },
  { id: "LOGISTICS", displayName: "配送・物流", discoveryRoutes: ["洋平商店の仕入れ配送を手伝う", "チャレンジセンターの求人紹介"] },
  { id: "FACILITY_REPAIR", displayName: "建物修繕・設備", discoveryRoutes: ["相馬との現場同行", "仮住まいの修理をきっかけに相馬から仕事の話を聞く"] },
  { id: "RETAIL_SHOP", displayName: "商店・小売", discoveryRoutes: ["洋平商店を手伝う", "商店街の空き店舗の噂を追う"] },
  { id: "CAFE_FOOD_SERVICE", displayName: "飲食・喫茶", discoveryRoutes: ["喫茶のどかを手伝う", "美代子から開業の経緯を聞く"] },
  { id: "CAREGIVING", displayName: "介護・生活支援", discoveryRoutes: ["チャレンジセンターの職業訓練紹介", "集会所で高齢者の困りごとを聞く"] },
  { id: "AI_DEVELOPER", displayName: "AI開発者", discoveryRoutes: ["神谷に自分の関心を話す", "地元事業者の業務相談に同席する"] },
  { id: "SME_AI_DX_SUPPORT", displayName: "中小企業AI/DX支援", discoveryRoutes: ["神谷経由で地元企業の業務改善相談に接続", "洋平商店の在庫管理の悩みを聞く"] },
  { id: "HANDYMAN_INDEPENDENT", displayName: "便利屋独立", discoveryRoutes: ["相馬との関係を重ねる", "集会所の雑務を継続して引き受ける"] },
  { id: "REPAIR_BUSINESS_INDEPENDENT", displayName: "修繕業独立", discoveryRoutes: ["相馬の現場に複数回同行", "チャレンジセンターの職業訓練（修繕）"] },
  { id: "SMALL_SHOP_OWNER", displayName: "小規模店舗開業", discoveryRoutes: ["空き店舗の張り紙を追い続ける", "美代子か洋平に開業の実情を聞く"] },
  { id: "LOCAL_BUSINESS_SUCCESSION", displayName: "地元事業承継", discoveryRoutes: ["洋平との関係を重ねる", "チャレンジセンター経由で後継者不足の相談を聞く"] },
  { id: "PART_TIME_UNDECIDED", displayName: "アルバイト等で保留", discoveryRoutes: ["神谷に迷いを話す", "何も決めないまま日を重ねる"] },
  { id: "UNEMPLOYED", displayName: "無職", discoveryRoutes: ["求人・相談のどちらにも動かない", "30日の期限を意識しないまま過ごす"] },
];

export const LIFE_STATUSES: { id: LifeStatus; displayName: string }[] = [
  { id: "STAY_IN_TOWN", displayName: "町に残る" },
  { id: "MOVE_AWAY", displayName: "引っ越す" },
  { id: "MARRY", displayName: "結婚" },
  { id: "MARRY_INTO_FAMILY", displayName: "婿入り" },
  { id: "SINGLE", displayName: "独身" },
];

export function careerDisplayName(id: CareerId): string {
  return CAREERS.find((c) => c.id === id)?.displayName ?? id;
}
