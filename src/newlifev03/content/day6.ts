import { afterVisitNext, mat } from "./shared";
import type { V03Beat, V03LocationId, V03State } from "../types";

const ALL_LOCS: { location: V03LocationId; next: string }[] = [
  { location: "YOHEI_STORE", next: "d6_yohei" },
  { location: "CAFE_NODOKA", next: "d6_miyoko" },
  { location: "COMMUNITY_HALL", next: "d6_jin" },
  { location: "CHALLENGE_CENTER", next: "d6_kamiya" },
];

function remainingOptions(state: V03State): { location: V03LocationId; next: string }[] {
  return ALL_LOCS.filter((o) => !state.visitedTodayLocations.includes(o.location));
}

export const DAY6_BEATS: Record<string, (state: V03State) => V03Beat> = {
  d6_wake: () => ({
    kind: "SCENE",
    image: "town",
    speaker: null,
    timeLabel: "朝",
    lines: ["6日目。残りは24日。"],
    choices: [],
    continueNext: "d6_pick1",
    continueLabel: "出かける",
  }),

  d6_pick1: () => ({ kind: "PICK", timeLabel: "午前", prompt: "どこへ行きますか", options: ALL_LOCS }),
  d6_pick2: (state) => ({ kind: "PICK", timeLabel: "午後", prompt: "もう少し歩いてみますか", options: remainingOptions(state) }),

  d6_miyoko: (state) => {
    const lines = state.flags.miyokoHelped
      ? ["美代子はコーヒーを一杯、黙って出してくれた。", "「お代はいいから」"]
      : ["美代子はカウンターを拭きながら、ちらりとこちらを見た。", "「最近、忙しそうね」"];
    return {
      kind: "SCENE",
      image: "miyoko",
      speaker: "miyoko",
      timeLabel: "午前",
      lines,
      choices: [
        {
          id: "thanks_or_chat",
          label: state.flags.miyokoHelped ? "ありがとうございます" : "少しだけ",
          resultText: state.flags.miyokoHelped ? "美代子は何も言わず、ただ笑った。" : "美代子はそれ以上聞かず、コーヒーを淹れ直した。",
          applyFlags: { metMiyoko: true },
          npcImpressionDelta: { miyoko: 1 },
          next: afterVisitNext(state, "d6_freetext_miyoko", "d6_evening"),
        },
      ],
    };
  },

  d6_yohei: (state) => ({
    kind: "SCENE",
    image: "yohei",
    speaker: "yohei",
    timeLabel: "午前",
    lines: ["洋平は棚の整理をしながら言った。", "「そういや、祭りの手伝い、興味あるか」"],
    choices: [
      {
        id: "interested",
        label: "興味あります",
        resultText: "「なら来週な」洋平はそれだけ言った。",
        applyFlags: { metYohei: true },
        materialsAdded: [mat("d6_yohei_festival_invite", "PENDING_TASK", "来週の祭りの手伝いに誘われている", 6, "PLAYER_ACTION:ACCEPT:YOHEI_STORE", ["player", "yohei"])],
        careerSignals: { RETAIL_SHOP: 1 },
        npcImpressionDelta: { yohei: 1 },
        next: afterVisitNext(state, "d6_freetext_yohei", "d6_evening"),
      },
      {
        id: "not_sure",
        label: "考えておきます",
        resultText: "「まあ、気が向いたらでいい」",
        applyFlags: { metYohei: true },
        next: afterVisitNext(state, "d6_freetext_yohei", "d6_evening"),
      },
    ],
  }),

  d6_jin: (state) => ({
    kind: "SCENE",
    image: "jin",
    speaker: "jin",
    timeLabel: "午前",
    lines: ["相馬は喫茶のどかの椅子を運んでいた。", "「美代子さんとこの椅子、ガタがきてたからな」"],
    choices: [
      {
        id: "carry",
        label: "運ぶの、手伝います",
        resultText: "「おう」二人で椅子を運んだ。",
        applyFlags: { metJin: true },
        careerSignals: { FACILITY_REPAIR: 1, HANDYMAN_INDEPENDENT: 1 },
        npcImpressionDelta: { jin: 1 },
        next: afterVisitNext(state, "d6_freetext_jin", "d6_evening"),
      },
    ],
  }),

  d6_kamiya: (state) => ({
    kind: "SCENE",
    image: "town",
    speaker: "kamiya",
    timeLabel: "午前",
    lines: ["神谷は電話を切ったところだった。", "「今のは、地元の会社さんからでした」"],
    choices: [
      {
        id: "who",
        label: "どんな会社ですか",
        resultText: "「詳しくは今度話します。まだ確定じゃないので」神谷は少し笑った。",
        applyFlags: { metKamiya: true },
        materialsAdded: [mat("d6_kamiya_lead", "PLACE_KNOWLEDGE", "神谷が地元企業から連絡を受けていた", 6, "PLAYER_ACTION:ASK:CHALLENGE_CENTER", ["player"])],
        next: afterVisitNext(state, "d6_freetext_kamiya", "d6_evening"),
      },
    ],
  }),

  d6_freetext_miyoko: () => ({ kind: "FREE_TEXT", npc: "miyoko", timeLabel: "午後", promptLines: ["美代子はふと聞いた。", "「あなた、ここに知り合いっていないのよね。寂しくない?」"], next: "d6_pick2" }),
  d6_freetext_yohei: () => ({ kind: "FREE_TEXT", npc: "yohei", timeLabel: "午後", promptLines: ["洋平は棚を叩きながら聞いた。", "「一人で決めるの、苦手なタイプか」"], next: "d6_pick2" }),
  d6_freetext_jin: () => ({ kind: "FREE_TEXT", npc: "jin", timeLabel: "午後", promptLines: ["相馬は汗を拭きながら聞いた。", "「毎日同じことするの、平気なタイプか」"], next: "d6_pick2" }),
  d6_freetext_kamiya: () => ({ kind: "FREE_TEXT", npc: "kamiya", timeLabel: "午後", promptLines: ["神谷は資料を片付けながら聞いた。", "「あと24日、どう過ごしたいです?」"], next: "d6_pick2" }),

  d6_evening: (state) => ({
    kind: "SCENE",
    image: "town",
    speaker: null,
    timeLabel: "夕方",
    lines: ["空き店舗の窓に、花の絵が描かれた紙が貼られていた。「まもなく開店」"],
    choices: [],
    continueNext: "d6_wrap",
    continueLabel: "今日を終える",
    onEnter: { applyFlags: { emptyShopStage: state.flags.emptyShopStage + 1 }, materialsAdded: [mat("d6_shop_soon", "WORLD_CHANGE", "空き店舗が近く開店するらしい", 6, "WORLD_EVENT:OBSERVE:SHOPPING_STREET", ["player"], "WORLD_EVENT_WITNESSED")] },
  }),

  d6_wrap: () => ({ kind: "WRAP" }),
};
