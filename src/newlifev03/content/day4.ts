import type { V03Beat, V03LocationId, V03State } from "../types";
import { afterVisitNext, mat, emptyShopLineFor } from "./shared";

const ALL_LOCS: { location: V03LocationId; next: string }[] = [
  { location: "YOHEI_STORE", next: "d4_yohei" },
  { location: "CAFE_NODOKA", next: "d4_miyoko" },
  { location: "COMMUNITY_HALL", next: "d4_jin" },
  { location: "CHALLENGE_CENTER", next: "d4_kamiya_offer" },
];

function remainingOptions(state: V03State): { location: V03LocationId; next: string }[] {
  return ALL_LOCS.filter((o) => !state.visitedTodayLocations.includes(o.location));
}

export const DAY4_BEATS: Record<string, (state: V03State) => V03Beat> = {
  d4_wake: () => ({
    kind: "SCENE",
    image: "town",
    speaker: null,
    timeLabel: "朝",
    lines: ["4日目。残りは26日。"],
    choices: [],
    continueNext: "d4_pick1",
    continueLabel: "出かける",
  }),

  d4_pick1: () => ({ kind: "PICK", timeLabel: "午前", prompt: "どこへ行きますか", options: ALL_LOCS }),
  d4_pick2: (state) => ({ kind: "PICK", timeLabel: "午後", prompt: "もう少し歩いてみますか", options: remainingOptions(state) }),

  d4_kamiya_offer: (state) => ({
    kind: "SCENE",
    image: "town",
    speaker: "kamiya",
    timeLabel: "午前",
    lines: ["「ちょうど今日、施設の職業体験があるんです。半日だけですが、行ってみます?」"],
    choices: [
      {
        id: "accept_training",
        label: "行ってみます",
        resultText: "「では、これを」神谷は案内の紙を渡した。",
        applyFlags: { metKamiya: true },
        careerSignals: { CAREGIVING: 2 },
        npcImpressionDelta: { kamiya: 1 },
        // Accepting consumes the whole afternoon regardless of visit order -- the second
        // opportunity-cost example (directive: "現場体験 -> 半日消費").
        next: "d4_training_freetext",
      },
      {
        id: "decline_training",
        label: "今日はやめておきます",
        resultText: "「そうですか。また今度」",
        applyFlags: { metKamiya: true },
        next: afterVisitNext(state, "d4_freetext_kamiya", "d4_evening"),
      },
    ],
  }),

  d4_training_freetext: () => ({
    kind: "FREE_TEXT",
    npc: "kamiya",
    timeLabel: "午後",
    promptLines: ["施設への道すがら、神谷が聞いた。", "「体力仕事も、人と話す仕事も両方ありますけど、どちらが気になります?」"],
    next: "d4_training_result",
  }),

  d4_training_result: () => ({
    kind: "SCENE",
    image: "town",
    speaker: null,
    timeLabel: "午後",
    lines: ["午後いっぱい、施設のスタッフと一緒に過ごした。", "思っていたより、人と話す時間が長かった。"],
    choices: [],
    continueNext: "d4_evening",
    continueLabel: "夕方になる",
    onEnter: { materialsAdded: [mat("d4_training", "SHARED_EVENT", "半日、介護施設の職業体験をした", 4, "PLAYER_ACTION:ACCEPT:CHALLENGE_CENTER", ["player"])] },
  }),

  d4_yohei: (state) => ({
    kind: "SCENE",
    image: "yohei",
    speaker: "yohei",
    timeLabel: "午前",
    lines: ["洋平は納品書を睨んでいた。", "「数字、苦手でな」"],
    choices: [
      {
        id: "offer_help",
        label: "見ましょうか",
        resultText: "「頼めるか」洋平は少しほっとした顔をした。",
        applyFlags: { metYohei: true },
        materialsAdded: [mat("d4_yohei_paperwork", "SHARED_EVENT", "洋平の納品書の計算を手伝った", 4, "PLAYER_ACTION:HELP:YOHEI_STORE", ["player", "yohei"])],
        careerSignals: { SME_AI_DX_SUPPORT: 1, RETAIL_SHOP: 1 },
        npcImpressionDelta: { yohei: 1 },
        next: afterVisitNext(state, "d4_freetext_yohei", "d4_evening"),
      },
      {
        id: "leave_it",
        label: "大変そうですね",
        resultText: "「まあ、毎度のことだ」洋平は苦笑した。",
        applyFlags: { metYohei: true },
        next: afterVisitNext(state, "d4_freetext_yohei", "d4_evening"),
      },
    ],
  }),

  d4_miyoko: (state) => ({
    kind: "SCENE",
    image: "miyoko",
    speaker: "miyoko",
    timeLabel: "午前",
    lines: ["美代子は空き店舗の方を見ていた。", "「あそこ、花屋さんになるみたいよ」"],
    choices: [
      {
        id: "react",
        label: "そうなんですか",
        resultText: "「聞いた話だけどね」美代子は少し嬉しそうだった。",
        applyFlags: { metMiyoko: true },
        materialsAdded: [mat("d4_shop_flower", "PLACE_KNOWLEDGE", "空き店舗は花屋になるらしい", 4, "PLAYER_ACTION:LISTEN:CAFE_NODOKA", ["player", "miyoko"])],
        next: afterVisitNext(state, "d4_freetext_miyoko", "d4_evening"),
      },
    ],
  }),

  d4_jin: (state) => ({
    kind: "SCENE",
    image: "jin",
    speaker: "jin",
    timeLabel: "午前",
    lines: ["相馬は脚立に乗って、集会所の屋根を見ていた。", "「雨漏りだとよ」"],
    choices: [
      {
        id: "watch",
        label: "手伝うことは?",
        resultText: "「今日はいい。危ないからな」相馬はそう言って、脚立を降りた。",
        applyFlags: { metJin: true },
        careerSignals: { FACILITY_REPAIR: 1 },
        npcImpressionDelta: { jin: 1 },
        next: afterVisitNext(state, "d4_freetext_jin", "d4_evening"),
      },
    ],
  }),

  d4_freetext_yohei: () => ({ kind: "FREE_TEXT", npc: "yohei", timeLabel: "午後", promptLines: ["洋平はレジを閉めながら聞いた。", "「機械とか、苦手な方じゃないのか」"], next: "d4_pick2" }),
  d4_freetext_miyoko: () => ({ kind: "FREE_TEXT", npc: "miyoko", timeLabel: "午後", promptLines: ["美代子はふと聞いた。", "「ここに来る前は、どんな毎日だったの?」"], next: "d4_pick2" }),
  d4_freetext_jin: () => ({ kind: "FREE_TEXT", npc: "jin", timeLabel: "午後", promptLines: ["相馬は脚立をしまいながら聞いた。", "「高いところ、平気か」"], next: "d4_pick2" }),
  d4_freetext_kamiya: () => ({ kind: "FREE_TEXT", npc: "kamiya", timeLabel: "午後", promptLines: ["神谷はファイルを整理しながら聞いた。", "「何か困ってること、ないです?」"], next: "d4_pick2" }),

  d4_evening: (state) => ({
    kind: "SCENE",
    image: "town",
    speaker: null,
    timeLabel: "夕方",
    lines: [emptyShopLineFor(state.flags.emptyShopStage)],
    choices: [],
    continueNext: "d4_wrap",
    continueLabel: "今日を終える",
    onEnter: { applyFlags: { emptyShopStage: state.flags.emptyShopStage + 1 } },
  }),

  d4_wrap: () => ({ kind: "WRAP" }),
};
