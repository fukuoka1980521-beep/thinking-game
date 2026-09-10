import type { V03Beat, V03LocationId, V03Scene, V03State } from "../types";
import { mat, emptyShopLineFor } from "./shared";

function pick2Options(state: V03State): { location: V03LocationId; next: string }[] {
  const all: { location: V03LocationId; next: string }[] = [
    { location: "YOHEI_STORE", next: "d1_yohei" },
    { location: "CAFE_NODOKA", next: "d1_miyoko" },
    { location: "COMMUNITY_HALL", next: "d1_jin" },
  ];
  return all.filter((o) => !state.visitedTodayLocations.includes(o.location));
}

function afterVisitNext(state: V03State): string {
  return state.visitedTodayLocations.length >= 2 ? "d1_noon" : "d1_pick2";
}

export const DAY1_BEATS: Record<string, (state: V03State) => V03Beat> = {
  d1_wake: () => ({
    kind: "SCENE",
    image: "town",
    speaker: null,
    timeLabel: "朝",
    lines: ["カーテンの隙間から、朝の光が差し込んでいた。", "今日から、この町で暮らしが始まる。"],
    choices: [],
    continueNext: "d1_kamiya_intro",
    continueLabel: "チャレンジセンターへ向かう",
  }),

  d1_kamiya_intro: () => ({
    kind: "FREE_TEXT",
    npc: "kamiya",
    timeLabel: "朝",
    promptLines: ["「ここがチャレンジセンターです。30日間、いつでも相談に来てください」", "神谷はファイルを机に置いた。", "「一つだけ聞かせてください。あなた、本当は何がしたいんです?」"],
    next: "d1_kamiya_after",
  }),

  d1_kamiya_after: (state) => ({
    kind: "SCENE",
    image: "town",
    speaker: "kamiya",
    timeLabel: "朝",
    lines: ["神谷はメモを閉じた。", "「30日、短いようで長いですよ。まずは町を歩いてみてください」"],
    choices: [],
    continueNext: "d1_pick1",
    continueLabel: "町を歩く",
    onEnter: state.flags.metKamiya
      ? undefined
      : {
          applyFlags: { metKamiya: true },
          materialsAdded: [mat("d1_kamiya_meeting", "SHARED_EVENT", "チャレンジセンターで神谷と最初の相談をした", 1, "PLAYER_ACTION:VISIT:CHALLENGE_CENTER", ["player"])],
        },
  }),

  d1_pick1: () => ({
    kind: "PICK",
    timeLabel: "午前",
    prompt: "どこへ行きますか",
    options: [
      { location: "YOHEI_STORE", next: "d1_yohei" },
      { location: "CAFE_NODOKA", next: "d1_miyoko" },
      { location: "COMMUNITY_HALL", next: "d1_jin" },
    ],
  }),

  d1_pick2: (state) => ({ kind: "PICK", timeLabel: "午後", prompt: "もう少し歩いてみますか", options: pick2Options(state) }),

  d1_yohei: (state) => {
    const next = afterVisitNext(state);
    return {
      kind: "SCENE",
      image: "yohei",
      speaker: "yohei",
      timeLabel: state.visitedTodayLocations.length <= 1 ? "午前" : "午後",
      lines: ["店の奥から洋平が出てきた。", "「棚の奥から、こんなものが出てきてな」", "洋平は古い工具箱の蓋を開けて見せた。"],
      choices: [
        {
          id: "borrow",
          label: "借りていいですか",
          resultText: "「好きに使え」洋平はそう言って、工具箱を差し出した。",
          applyFlags: { metYohei: true, borrowedToolbox: true },
          materialsAdded: [mat("d1_yohei_toolbox", "OBJECT", "洋平から借りた古い工具箱", 1, "PLAYER_ACTION:BORROW:YOHEI_STORE", ["player", "yohei"])],
          npcImpressionDelta: { yohei: 1 },
          next,
        },
        {
          id: "ask",
          label: "何に使うものですか",
          resultText: "「昔の仕事道具だ。今はもう使わん」",
          applyFlags: { metYohei: true },
          materialsAdded: [mat("d1_yohei_talk", "SHARED_EVENT", "洋平と工具箱について話した", 1, "PLAYER_ACTION:ASK:YOHEI_STORE", ["player", "yohei"])],
          npcImpressionDelta: { yohei: 1 },
          next,
        },
        {
          id: "leave",
          label: "今日はこれで",
          resultText: "洋平は工具箱を棚に戻した。",
          applyFlags: { metYohei: true },
          materialsAdded: [mat("d1_yohei_visit", "SHARED_EVENT", "洋平の店に立ち寄った", 1, "PLAYER_ACTION:VISIT:YOHEI_STORE", ["player", "yohei"])],
          next,
        },
      ],
    };
  },

  d1_miyoko: (state) => {
    const next = afterVisitNext(state);
    return {
      kind: "SCENE",
      image: "miyoko",
      speaker: "miyoko",
      timeLabel: state.visitedTodayLocations.length <= 1 ? "午前" : "午後",
      lines: ["カウンターの向こうで、美代子がカップを拭いていた。", "「あら、いらっしゃい」"],
      choices: [
        {
          id: "sit",
          label: "少し座っていいですか",
          resultText: "「もちろん。コーヒー、淹れましょうか」",
          applyFlags: { metMiyoko: true },
          materialsAdded: [mat("d1_miyoko_visit", "SHARED_EVENT", "喫茶のどかに立ち寄った", 1, "PLAYER_ACTION:VISIT:CAFE_NODOKA", ["player", "miyoko"])],
          npcImpressionDelta: { miyoko: 1 },
          next,
        },
        {
          id: "history",
          label: "この店、長いんですか",
          resultText: "「もう20年になるかしら」美代子は少し笑った。",
          applyFlags: { metMiyoko: true },
          materialsAdded: [mat("d1_miyoko_history", "PLACE_KNOWLEDGE", "喫茶のどかは20年続いている", 1, "PLAYER_ACTION:ASK:CAFE_NODOKA", ["player", "miyoko"])],
          npcImpressionDelta: { miyoko: 1 },
          next,
        },
        {
          id: "leave",
          label: "また今度来ます",
          resultText: "「気をつけてね」",
          applyFlags: { metMiyoko: true },
          next,
        },
      ],
    };
  },

  d1_jin: (state) => {
    const next = afterVisitNext(state);
    return {
      kind: "SCENE",
      image: "jin",
      speaker: "jin",
      timeLabel: state.visitedTodayLocations.length <= 1 ? "午前" : "午後",
      lines: ["集会所で、相馬が掲示板の前に立っていた。", "「この掲示、古いのが混じってるな」"],
      choices: [
        {
          id: "help",
          label: "手伝いましょうか",
          resultText: "相馬は少し意外そうな顔をした。「そこの10枚だけでいい」",
          applyFlags: { metJin: true },
          materialsAdded: [mat("d1_jin_task", "PENDING_TASK", "集会所の掲示整理を手伝った", 1, "PLAYER_ACTION:OFFER:COMMUNITY_HALL", ["player", "jin"])],
          npcImpressionDelta: { jin: 1 },
          next,
        },
        {
          id: "ask",
          label: "いつもここに?",
          resultText: "「頼まれりゃどこでも行く。今日はここが片付いてなかっただけだ」",
          applyFlags: { metJin: true },
          materialsAdded: [mat("d1_jin_talk", "SHARED_EVENT", "相馬と少し話した", 1, "PLAYER_ACTION:ASK:COMMUNITY_HALL", ["player", "jin"])],
          next,
        },
        {
          id: "leave",
          label: "今日はこれで",
          resultText: "相馬は軽く頷いただけだった。",
          applyFlags: { metJin: true },
          next,
        },
      ],
    };
  },

  d1_noon: (state) => ({
    kind: "SCENE",
    image: "town",
    speaker: null,
    timeLabel: "昼",
    lines: [emptyShopLineFor(state.flags.emptyShopStage)],
    choices: [],
    continueNext: "d1_evening",
    continueLabel: "続ける",
    onEnter: {
      applyFlags: { emptyShopStage: state.flags.emptyShopStage + 1 },
      materialsAdded: [mat("shop_watch", "WORLD_CHANGE", "商店街の空き店舗に新しい張り紙", 1, "WORLD_EVENT:OBSERVE:SHOPPING_STREET", ["player"], "WORLD_EVENT_WITNESSED")],
    },
  }),

  d1_evening: (state) => {
    const met = state.visitedTodayLocations;
    let line: string;
    let onEnter: V03Scene["onEnter"];
    if (!met.includes("CAFE_NODOKA")) {
      line = "喫茶のどかの前を通ると、美代子が一人で忙しそうにしていた。";
      onEnter = { applyFlags: { miyokoShortHandedKnown: true } };
    } else if (!met.includes("YOHEI_STORE")) {
      line = "洋平商店のシャッターが半分下りていた。洋平が中で片付けをしている。";
    } else {
      line = "集会所の前で、相馬が工具袋を担いで歩いていくのが見えた。";
    }
    return { kind: "SCENE", image: "town", speaker: null, timeLabel: "夕方", lines: [line], choices: [], continueNext: "d1_wrap", continueLabel: "今日を終える", onEnter };
  },

  d1_wrap: () => ({ kind: "WRAP" }),
};
