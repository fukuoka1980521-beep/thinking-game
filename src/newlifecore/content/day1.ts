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

    if (state.flags.shelfFixed) {
      // The shelf thread is over -- reached either by the player's own hands, or by Yohei and
      // Jin finishing it without the player (directive Section 20/21: a trace, never a badge).
      const ambientLine = state.flags.shelfFixedWithPlayer
        ? "洋平は棚を軽く叩いて確かめた。「うん、大丈夫そうだ」"
        : "棚を軽く小突くと、もう安定していた。「さっき相馬が寄ってな」洋平はそれだけ言った。";
      return { location: loc, ambientLine, npcsHere: ["yohei"], specialActions: [] };
    }

    if (jinAlsoHere) {
      // 11:15-13:30 only: Jin is physically here (schedule.ts's world-event override), so helping
      // is a real, present-tense option -- never offered outside this window.
      return {
        location: loc,
        ambientLine: "奥で相馬が棚の様子を見ていた。洋平が脇で見守っている。",
        npcsHere: ["yohei", "jin"],
        specialActions: [{ id: "offer_help_shelf", label: "棚の修理を手伝う" }],
      };
    }

    // Before 11:15: the problem exists but hasn't become anyone's business yet -- a quiet visual
    // hint only, no action attached (nothing to "help" with until Yohei has actually done
    // something about it). After 13:30 with shelfFixed still false should not occur (the
    // world-event auto-resolves it by then) but the fallback below keeps this branch harmless if
    // it ever does.
    const hint = state.time < 11 * 60 + 30 ? "棚の脚が少し傾いているのが、なんとなく目についた。" : "";
    return { location: loc, ambientLine: hint, npcsHere: ["yohei"], specialActions: [] };
  }

  if (loc === "CAFE_NODOKA") {
    const avail = npcAvailabilityAt("miyoko", state.time, state.flags);
    if (avail === "CLOSED") return { location: loc, ambientLine: "喫茶のどかは閉まっていた。", npcsHere: [], specialActions: [] };
    return { location: loc, ambientLine: "", npcsHere: ["miyoko"], specialActions: [{ id: "sit_down", label: "コーヒーを頼んで座る" }] };
  }

  // COMMUNITY_HALL -- must check where Jin actually IS (npcsHere, location-aware), never just
  // whether he is "available" in the abstract: during the 11:30-13:30 shelf-repair window his
  // status is AVAILABLE but his location is YOHEI_STORE, not here. Using raw availability here
  // was a real bug -- it let him appear present in two places in the same instant.
  if (npcsHere.includes("jin")) {
    const jinAvail = npcAvailabilityAt("jin", state.time, state.flags);
    if (jinAvail === "BUSY") {
      // The explicit "on the phone, can't talk" texture -- present, but not a conversation.
      return { location: loc, ambientLine: "相馬は電話中だった。片手を挙げて、待ってろという仕草をした。", npcsHere: [], specialActions: [{ id: "wait_jin", label: "電話が終わるまで待つ" }] };
    }
    return { location: loc, ambientLine: "", npcsHere: ["jin"], specialActions: [] };
  }
  if (state.flags.jinCalledToYohei && !state.flags.shelfFixed && state.time < 13 * 60 + 30) {
    // A trace of where he went, not an announcement (directive Section 20).
    return { location: loc, ambientLine: "掲示板の脇に、相馬の工具袋だけが置かれていた。少し出ているようだった。", npcsHere: [], specialActions: [] };
  }
  return { location: loc, ambientLine: "集会所には誰もいないようだった。掲示板だけが静かに並んでいる。", npcsHere: [], specialActions: [] };
}

/** Directive Section 21: end-of-day must read as a handful of remaining facts in plain sentences
 *  -- never a results list, score, or acquired-abilities panel. Modeled directly on the
 *  directive's own example ("相馬は明日も朝が早いらしい。洋平の棚は直っていた。神谷とは話が途中の
 *  ままだ。そして寝る。"): short, unresolved-feeling, no "you accomplished X" framing. */
export function buildEndOfDayNarrative(state: CoreState): string[] {
  const lines: string[] = [];

  if (state.flags.shelfFixedWithPlayer) {
    lines.push("洋平の店の棚は、手伝って直した。");
  } else if (state.flags.shelfFixed) {
    lines.push("洋平の店の棚は、いつの間にか直っていた。");
  } else if (state.flags.met_yohei) {
    lines.push("洋平の店の棚は、まだ少し傾いたままだった。");
  }

  if (state.flags.met_jin) {
    lines.push(state.npcMemory.jin.length > 0 ? "相馬とは少し話した。明日も朝が早いらしい。" : "相馬とはすれ違っただけだった。");
  }

  if (state.flags.met_miyoko) {
    lines.push(state.npcMemory.miyoko.length > 0 ? "喫茶のどかで、美代子と少し話した。" : "喫茶のどかに、少しだけ顔を出した。");
  }

  if (state.flags.met_kamiya) {
    lines.push(state.npcMemory.kamiya.length > 0 ? "神谷とは話が途中のままだ。" : "神谷とは、まだあまり話していない。");
  }

  if (lines.length === 0) {
    lines.push("誰とも、あまり話さない一日だった。");
  }

  lines.push("そして眠った。");
  return lines;
}
