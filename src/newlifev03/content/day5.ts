import { careerDisplayName } from "../careers";
import { afterVisitNext, mat, emptyShopLineFor } from "./shared";
import { topCareerSignals } from "../engine";
import type { V03Beat, V03LocationId, V03State } from "../types";

const ALL_LOCS: { location: V03LocationId; next: string }[] = [
  { location: "YOHEI_STORE", next: "d5_yohei" },
  { location: "CAFE_NODOKA", next: "d5_miyoko" },
  { location: "COMMUNITY_HALL", next: "d5_jin" },
  { location: "CHALLENGE_CENTER", next: "d5_kamiya_major" },
];

function remainingOptions(state: V03State): { location: V03LocationId; next: string }[] {
  return ALL_LOCS.filter((o) => !state.visitedTodayLocations.includes(o.location));
}

export const DAY5_BEATS: Record<string, (state: V03State) => V03Beat> = {
  d5_wake: () => ({
    kind: "SCENE",
    image: "town",
    speaker: null,
    timeLabel: "朝",
    lines: ["5日目。残りは25日。"],
    choices: [],
    continueNext: "d5_pick1",
    continueLabel: "出かける",
  }),

  d5_pick1: () => ({ kind: "PICK", timeLabel: "午前", prompt: "どこへ行きますか", options: ALL_LOCS }),
  d5_pick2: (state) => ({ kind: "PICK", timeLabel: "午後", prompt: "もう少し歩いてみますか", options: remainingOptions(state) }),

  d5_kamiya_major: (state) => {
    const top = topCareerSignals(state, 2);
    const line = top.length
      ? `「ここ数日の動き、見えてますよ。${top.map(careerDisplayName).join("や")}のあたり、興味あります?」`
      : "「まだ、これといった動きは見えないですね。焦る必要はないですけど」";
    return {
      kind: "SCENE",
      image: "town",
      speaker: "kamiya",
      timeLabel: "午前",
      lines: ["神谷はファイルを広げた。", "「5日経ちましたね。残り25日です」", line],
      choices: top.length
        ? [
            {
              id: "connect",
              label: "詳しく聞かせてください",
              resultText: "「分かりました。話をつけてみます」神谷はメモを取った。",
              applyFlags: { metKamiya: true, day5ConnectionOffered: true, day5ConnectionAccepted: true },
              materialsAdded: [
                mat("d5_kamiya_connection", "PENDING_TASK", `神谷が${careerDisplayName(top[0])}方面の紹介を進めている`, 5, "PLAYER_ACTION:ACCEPT:CHALLENGE_CENTER", ["player"]),
              ],
              npcImpressionDelta: { kamiya: 1 },
              next: "d5_kamiya_freetext",
            },
            {
              id: "not_yet",
              label: "もう少し考えます",
              resultText: "「いいですよ、急ぎません」",
              applyFlags: { metKamiya: true, day5ConnectionOffered: true },
              next: "d5_kamiya_freetext",
            },
          ]
        : [
            {
              id: "unsure",
              label: "正直、まだ分かりません",
              resultText: "「それでいいですよ。あと25日、色々見てください」",
              applyFlags: { metKamiya: true },
              next: "d5_kamiya_freetext",
            },
          ],
    };
  },

  d5_kamiya_freetext: () => ({
    kind: "FREE_TEXT",
    npc: "kamiya",
    timeLabel: "午前",
    promptLines: ["神谷はペンを置いた。", "「あなた、本当は何がしたいんです? ──前にも聞きましたけど、また聞かせてください」"],
    next: "d5_pick2",
  }),

  d5_yohei: (state) => ({
    kind: "SCENE",
    image: "yohei",
    speaker: "yohei",
    timeLabel: "午前",
    lines: ["洋平は店先の掃除をしていた。", "「もう5日か。早いもんだな」"],
    choices: [
      {
        id: "ask_how_it_looks",
        label: "自分、どう見えますか",
        resultText: "「悪くはないさ。まだ何も決まってないだけで」",
        applyFlags: { metYohei: true },
        npcImpressionDelta: { yohei: 1 },
        next: afterVisitNext(state, "d5_freetext_yohei", "d5_evening"),
      },
    ],
  }),

  d5_miyoko: (state) => ({
    kind: "SCENE",
    image: "miyoko",
    speaker: "miyoko",
    timeLabel: "午前",
    lines: ["美代子はカウンターを拭きながら言った。", "「最近、よく顔を見るわね」"],
    choices: [
      {
        id: "smile",
        label: "そうですね",
        resultText: "美代子は少し嬉しそうに笑った。",
        applyFlags: { metMiyoko: true },
        npcImpressionDelta: { miyoko: 1 },
        next: afterVisitNext(state, "d5_freetext_miyoko", "d5_evening"),
      },
    ],
  }),

  d5_jin: (state) => ({
    kind: "SCENE",
    image: "jin",
    speaker: "jin",
    timeLabel: "午前",
    lines: ["相馬は工具袋を肩にかけていた。", "「今日は喫茶のどかの椅子を見に行く」"],
    choices: [
      {
        id: "come_along",
        label: "また一緒に行っても?",
        resultText: state.flags.jinShadowDone ? "「好きにしろ」相馬は軽く笑った。" : "「初めてか。まあ、いいさ」",
        applyFlags: { metJin: true },
        careerSignals: { FACILITY_REPAIR: 1 },
        npcImpressionDelta: { jin: 1 },
        next: afterVisitNext(state, "d5_freetext_jin", "d5_evening"),
      },
    ],
  }),

  d5_freetext_yohei: () => ({ kind: "FREE_TEXT", npc: "yohei", timeLabel: "午後", promptLines: ["洋平はほうきを止めて聞いた。", "「なあ、店やる気とかあるのか」"], next: "d5_pick2" }),
  d5_freetext_miyoko: () => ({ kind: "FREE_TEXT", npc: "miyoko", timeLabel: "午後", promptLines: ["美代子はふと聞いた。", "「この町、住んでみてどう?」"], next: "d5_pick2" }),
  d5_freetext_jin: () => ({ kind: "FREE_TEXT", npc: "jin", timeLabel: "午後", promptLines: ["相馬は歩きながら聞いた。", "「こういう仕事、向いてると思うか」"], next: "d5_pick2" }),

  d5_evening: (state) => ({
    kind: "SCENE",
    image: "town",
    speaker: null,
    timeLabel: "夕方",
    lines: [emptyShopLineFor(state.flags.emptyShopStage), "残り25日。まだ何も決めなくていい、と自分に言い聞かせた。"],
    choices: [],
    continueNext: "d5_wrap",
    continueLabel: "今日を終える",
    onEnter: { applyFlags: { emptyShopStage: state.flags.emptyShopStage + 1 } },
  }),

  d5_wrap: () => ({ kind: "WRAP" }),
};
