import { npcAvailabilityAt, npcsPresentAt } from "../schedule";
import type { CoreState, LocationId, NpcId } from "../types";

export const LOCATION_LABEL: Record<LocationId, string> = {
  TRIAL_HOUSE: "仮住まい",
  CHALLENGE_CENTER: "チャレンジセンター",
  YOHEI_STORE: "洋平商店",
  CAFE_NODOKA: "喫茶のどか",
  COMMUNITY_HALL: "集会所",
  SHOPPING_STREET: "商店街",
};

export const REACHABLE_FROM_TRIAL_HOUSE: LocationId[] = ["CHALLENGE_CENTER", "YOHEI_STORE", "CAFE_NODOKA", "COMMUNITY_HALL", "SHOPPING_STREET"];

/** Every location is reachable from every other -- Challenge Town is small (directive Section 3:
 *  "最初の世界は小さくてよい"). No pathfinding graph needed for a 6-node town. */
export function reachableLocations(from: LocationId): LocationId[] {
  return (Object.keys(LOCATION_LABEL) as LocationId[]).filter((l) => l !== from);
}

export interface NpcOpeningLine {
  npc: NpcId;
  firstVisitLine: string;
  laterVisitLine: string;
}

const OPENING_LINES: Record<NpcId, NpcOpeningLine> = {
  kamiya: {
    npc: "kamiya",
    firstVisitLine: "神谷はファイルを閉じながら、こちらを見た。「ここがチャレンジセンターです。30日間、いつでも相談に来てください」",
    laterVisitLine: "神谷は顔を上げた。「何か?」",
  },
  yohei: {
    npc: "yohei",
    firstVisitLine: "店の奥から洋平が出てきた。「おう」",
    laterVisitLine: "洋平はちらっとこちらを見た。「また来たか」",
  },
  miyoko: {
    npc: "miyoko",
    firstVisitLine: "カウンターの向こうで、美代子がカップを拭いていた。「あら、いらっしゃい」",
    laterVisitLine: "美代子はにっこりした。「また来てくれたのね」",
  },
  jin: {
    npc: "jin",
    firstVisitLine: "相馬はこちらをちらっと見て、軽く顎を上げた。",
    laterVisitLine: "相馬は手を止めずに言った。「よう」",
  },
};

export function openingLineFor(npc: NpcId, alreadyMet: boolean): string {
  const l = OPENING_LINES[npc];
  return alreadyMet ? l.laterVisitLine : l.firstVisitLine;
}

export interface LocationScene {
  location: LocationId;
  ambientLine: string;
  npcsHere: NpcId[];
  /** Location-specific action other than "自由に話す" / "移動する" -- kept to 0-2 per directive
   *  Section 17 ("巨大なコマンド一覧を作らない"). */
  specialActions: { id: string; label: string }[];
}

export function buildLocationScene(state: CoreState): LocationScene {
  const loc = state.playerLocation;
  const npcsHere = npcsPresentAt(loc, state.time, state.flags);

  if (loc === "TRIAL_HOUSE") {
    return { location: loc, ambientLine: state.visitedLocations.length <= 1 ? "仮住まいの部屋。鍵と、返却日を丸く囲んだ紙が置かれている。" : "静かな部屋に戻ってきた。", npcsHere: [], specialActions: [] };
  }

  if (loc === "SHOPPING_STREET") {
    const shopLine = state.flags.isRaining ? "雨が降り出した。軒先で雨宿りする人が何人か見える。" : "シャッターが半分下りた空き店舗に、手書きの貼り紙がある。「近日、何か始めます」";
    return { location: loc, ambientLine: shopLine, npcsHere: [], specialActions: state.flags.isRaining ? [{ id: "wait_out_rain", label: "雨宿りする" }] : [{ id: "notice_shop", label: "貼り紙をよく見る" }] };
  }

  if (loc === "CHALLENGE_CENTER") {
    const avail = npcAvailabilityAt("kamiya", state.time, state.flags);
    if (avail === "CLOSED") return { location: loc, ambientLine: "チャレンジセンターは終業していた。", npcsHere: [], specialActions: [] };
    if (avail === "BUSY") return { location: loc, ambientLine: "神谷は電話で立て込んでいるようだった。", npcsHere: [], specialActions: [{ id: "wait_kamiya", label: "少し待つ" }] };
    return { location: loc, ambientLine: "", npcsHere: ["kamiya"], specialActions: [{ id: "view_jobs", label: "求人票を見る" }] };
  }

  if (loc === "YOHEI_STORE") {
    const avail = npcAvailabilityAt("yohei", state.time, state.flags);
    if (avail === "CLOSED") return { location: loc, ambientLine: "洋平商店のシャッターは下りていた。", npcsHere: [], specialActions: [] };
    if (avail === "BUSY") return { location: loc, ambientLine: "洋平は伝票の整理で手が離せないようだった。", npcsHere: [], specialActions: [] };
    const jinAlsoHere = npcsHere.includes("jin");
    const shelfActions = !state.flags.shelfFixed
      ? [{ id: "offer_help_shelf", label: jinAlsoHere ? "棚の修理を手伝う" : "何か手伝うことは、と聞く" }]
      : [];
    return { location: loc, ambientLine: jinAlsoHere ? "奥で相馬が棚の様子を見ていた。洋平が脇で見守っている。" : "", npcsHere: jinAlsoHere ? ["yohei", "jin"] : ["yohei"], specialActions: shelfActions };
  }

  if (loc === "CAFE_NODOKA") {
    const avail = npcAvailabilityAt("miyoko", state.time, state.flags);
    if (avail === "CLOSED") return { location: loc, ambientLine: "喫茶のどかは閉まっていた。", npcsHere: [], specialActions: [] };
    return { location: loc, ambientLine: "", npcsHere: ["miyoko"], specialActions: [{ id: "sit_down", label: "コーヒーを頼んで座る" }] };
  }

  // COMMUNITY_HALL
  const jinAvail = npcAvailabilityAt("jin", state.time, state.flags);
  if (jinAvail === "AVAILABLE" || jinAvail === "BUSY") {
    return { location: loc, ambientLine: "", npcsHere: ["jin"], specialActions: [] };
  }
  return { location: loc, ambientLine: "集会所には誰もいないようだった。掲示板だけが静かに並んでいる。", npcsHere: [], specialActions: [] };
}
