/**
 * PHASE_22 vertical slice -- Hina and Yohei's definitions, sourced from
 * `docs/product/NEWLIFE_CHARACTER_ROSTER_V2.md`'s own per-NPC design (Section 11 fields), NOT
 * copied from `newlifecore/npcDefs.ts` (that module's Hina/Yohei belong to the frozen, different
 * `newlifecore` world -- trial-house/Kamiya framing -- that PHASE_21 deliberately moved away from).
 * `NpcHiddenBackground`'s shape is reused as-is (imported, not redefined) since it is a leaf type
 * with no dependency on the rest of `newlifecore`.
 */
import type { NpcHiddenBackground } from "../newlifecore/npcDefs";
import type { Slice7DayLocationId, Slice7DayNpcId } from "./types";

export interface Slice7DayNpcDefinition {
  id: Slice7DayNpcId;
  displayName: string;
  identity: string;
  personality: string;
  speechStyle: string;
  values: string;
  likes: string[];
  dislikes: string[];
  homeLocation: Slice7DayLocationId;
  hiddenBackground: Record<1 | 2, NpcHiddenBackground>;
}

export const SLICE_7DAY_NPCS: Record<Slice7DayNpcId, Slice7DayNpcDefinition> = {
  hina: {
    id: "hina",
    displayName: "陽菜",
    identity: "26歳。パン屋を開くために商店街の空き店舗を借りて、準備を進めている新住民。",
    personality: "temperamentally warm, but visibly not-yet-settled -- talks fast and in detail about the shop, goes quiet the moment anything personal comes up.",
    speechStyle: "店の話になると早口で具体的; 自分のことを聞かれると急に言葉数が減る。",
    values: "今度こそ、前の町と同じ失敗を繰り返さずに店を開くこと。",
    likes: ["焼き菓子の試作", "商店街の人たちの様子"],
    dislikes: ["店が本当に開けるか分からないという不安に触れられること"],
    homeLocation: "SHOPPING_STREET",
    hiddenBackground: {
      1: {
        whatTheyWantToday: "今日中に棚のレイアウトをもう少し進めたい。",
        whatTheyWorryAbout: "また同じように店が続かないんじゃないかということ。",
        whatTheyDoNotWantToSay: "前の店が閉まった本当の理由はお金だったこと(「引っ越しただけ」と説明している)。",
        whatTheyMisunderstand: "洋平がまだ半信半疑で見ていることに、自分では気づいていない。",
        currentPressure: "開店準備がまだ全然終わっていないという焦り。",
        playerImpression: "初日に会ったばかりの、まだよく分からない新しい住民。",
        privateHistoryRelevantNow: "前の町で開いた店が資金繰りで閉まった。",
      },
      2: {
        whatTheyWantToday: "昨日より少しでも準備を前に進めたい。",
        whatTheyWorryAbout: "前の町と同じ失敗を繰り返すこと。",
        whatTheyDoNotWantToSay: "前の店が閉まった本当の理由はお金だったこと。",
        whatTheyMisunderstand: "洋平がまだ半信半疑で見ていることに、自分では気づいていない。",
        currentPressure: "昨日会った人がまた来てくれたことへの、少し照れた嬉しさ。",
        playerImpression: "昨日会った人。もう一度顔を見せてくれたことに少し驚いている。",
        privateHistoryRelevantNow: "前の町で開いた店が資金繰りで閉まった。",
      },
    },
  },
  yohei: {
    id: "yohei",
    displayName: "洋平",
    identity: "63歳。商店街で洋平商店を営む店主。先代から店を継いで長い。",
    personality: "kind but deflects anything past small talk; warms slightly once you're a familiar face.",
    speechStyle: "短く実務的; 世間話は最小限、馴染むと少しだけ砕ける。",
    values: "商店街の商店として、店をきちんと回し続けること。",
    likes: ["馴染みの客と交わす短い世間話", "きちんと届く仕入れ"],
    dislikes: ["新顔をすぐには信用しないが、それを本人には言わない"],
    homeLocation: "YOHEI_STORE",
    hiddenBackground: {
      1: {
        whatTheyWantToday: "今朝届くはずだった配達が、まだ来ていないことが気にかかっている。",
        whatTheyWorryAbout: "配達がこのまま来なかったら、今日の品揃えに響くこと。",
        whatTheyDoNotWantToSay: "新顔の陽菜がすぐいなくなるのではと、まだ半信半疑で見ていること。",
        whatTheyMisunderstand: "特になし。",
        currentPressure: "配達の遅れという、今日その場で起きている実務的な気がかり。",
        playerImpression: "初日に会ったばかりの、まだよく分からない新しい住民。",
        privateHistoryRelevantNow: "先代から店を継いで長い。",
      },
      2: {
        whatTheyWantToday: "昨日の配達が届いたので、それを片付けて今日の商売を回すこと。",
        whatTheyWorryAbout: "特に今日は大きな気がかりはない。",
        whatTheyDoNotWantToSay: "新顔の陽菜への半信半疑は、まだ少し残っている。",
        whatTheyMisunderstand: "特になし。",
        currentPressure: "特に大きな気がかりはない、いつも通りの一日。",
        playerImpression: "昨日会った人。もう一度顔を見せてくれた。",
        privateHistoryRelevantNow: "先代から店を継いで長い。",
      },
    },
  },
};
