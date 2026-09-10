import { afterVisitNext, mat } from "./shared";
import type { V03Beat, V03LocationId, V03State } from "../types";

const ALL_LOCS: { location: V03LocationId; next: string }[] = [
  { location: "YOHEI_STORE", next: "d7_yohei" },
  { location: "CAFE_NODOKA", next: "d7_miyoko" },
  { location: "COMMUNITY_HALL", next: "d7_jin" },
  { location: "CHALLENGE_CENTER", next: "d7_kamiya" },
];

function remainingOptions(state: V03State): { location: V03LocationId; next: string }[] {
  return ALL_LOCS.filter((o) => !state.visitedTodayLocations.includes(o.location));
}

export const DAY7_BEATS: Record<string, (state: V03State) => V03Beat> = {
  d7_wake: () => ({
    kind: "SCENE",
    image: "town",
    speaker: null,
    timeLabel: "朝",
    lines: ["7日目。残りは23日。"],
    choices: [],
    continueNext: "d7_pick1",
    continueLabel: "出かける",
  }),

  d7_pick1: () => ({ kind: "PICK", timeLabel: "午前", prompt: "どこへ行きますか", options: ALL_LOCS }),
  d7_pick2: (state) => ({ kind: "PICK", timeLabel: "午後", prompt: "もう少し歩いてみますか", options: remainingOptions(state) }),

  d7_yohei: (state) => ({
    kind: "SCENE",
    image: "yohei",
    speaker: "yohei",
    timeLabel: "午前",
    lines: state.flags.borrowedToolbox
      ? ["洋平は工具箱をちらりと見た。", "「まだ持っといていいぞ。うちはもう使わん」"]
      : ["洋平は店先で、祭りの提灯を数えていた。", "「来週が本番だ」"],
    choices: [
      {
        id: "nod",
        label: "分かりました",
        resultText: "洋平は軽く頷いて、また作業に戻った。",
        applyFlags: { metYohei: true },
        npcImpressionDelta: { yohei: 1 },
        next: afterVisitNext(state, "d7_freetext_yohei", "d7_evening"),
      },
    ],
  }),

  d7_miyoko: (state) => ({
    kind: "SCENE",
    image: "miyoko",
    speaker: "miyoko",
    timeLabel: "午前",
    lines: ["「花屋さん、来週開くみたいよ」", "美代子は窓の外を見ながら言った。"],
    choices: [
      {
        id: "look_forward",
        label: "楽しみですね",
        resultText: state.flags.miyokoHelped ? "「でしょう。……あなたも、少しはこの町に慣れた?」" : "「そうね」美代子は静かに笑った。",
        applyFlags: { metMiyoko: true },
        materialsAdded: [mat("d7_shop_open_soon", "PLACE_KNOWLEDGE", "空き店舗の花屋は来週開店する", 7, "PLAYER_ACTION:LISTEN:CAFE_NODOKA", ["player", "miyoko"])],
        npcImpressionDelta: { miyoko: 1 },
        next: afterVisitNext(state, "d7_freetext_miyoko", "d7_evening"),
      },
    ],
  }),

  d7_jin: (state) => ({
    kind: "SCENE",
    image: "jin",
    speaker: "jin",
    timeLabel: "午前",
    lines: ["相馬は工具袋を肩にかけ直した。", "「花屋の引っ越し、手伝うことになってな」"],
    choices: [
      {
        id: "join",
        label: "自分も行っていいですか",
        resultText: "「好きにしろ」相馬はそれだけ言って歩き出した。",
        applyFlags: { metJin: true },
        careerSignals: { HANDYMAN_INDEPENDENT: 1, FACILITY_REPAIR: 1 },
        npcImpressionDelta: { jin: 1 },
        next: afterVisitNext(state, "d7_freetext_jin", "d7_evening"),
      },
    ],
  }),

  d7_kamiya: (state) => ({
    kind: "SCENE",
    image: "town",
    speaker: "kamiya",
    timeLabel: "午前",
    lines: state.flags.day5ConnectionAccepted
      ? ["神谷はパソコンの画面を見せた。", "「例の件、来週には返事が来ると思います」"]
      : ["神谷はファイルを閉じた。", "「1週間、経ちましたね。どうでした?」"],
    choices: [
      {
        id: "reply",
        label: "まだ何とも言えません",
        resultText: "「それでいいですよ。あと23日ありますから」",
        applyFlags: { metKamiya: true },
        next: afterVisitNext(state, "d7_freetext_kamiya", "d7_evening"),
      },
    ],
  }),

  d7_freetext_yohei: () => ({ kind: "FREE_TEXT", npc: "yohei", timeLabel: "午後", promptLines: ["洋平は提灯をしまいながら聞いた。", "「1週間経って、どうだ」"], next: "d7_pick2" }),
  d7_freetext_miyoko: () => ({ kind: "FREE_TEXT", npc: "miyoko", timeLabel: "午後", promptLines: ["美代子はカップを片付けながら聞いた。", "「この町、続けられそう?」"], next: "d7_pick2" }),
  d7_freetext_jin: () => ({ kind: "FREE_TEXT", npc: "jin", timeLabel: "午後", promptLines: ["相馬は工具袋を下ろしながら聞いた。", "「この1週間で、何か分かったか」"], next: "d7_pick2" }),
  d7_freetext_kamiya: () => ({ kind: "FREE_TEXT", npc: "kamiya", timeLabel: "午後", promptLines: ["神谷はペンを置いて聞いた。", "「率直に、今どう感じてます?」"], next: "d7_pick2" }),

  d7_evening: () => ({
    kind: "SCENE",
    image: "town",
    speaker: null,
    timeLabel: "夜",
    lines: ["空き店舗の前を通ると、中で誰かが棚を組んでいた。", "花屋になるのは、来週。", "町の一日が、また終わろうとしている。"],
    choices: [],
    continueNext: "d7_wrap",
    continueLabel: "今日を終える",
  }),

  d7_wrap: () => ({ kind: "WRAP" }),
};
