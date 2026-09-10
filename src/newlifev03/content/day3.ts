import type { V03Beat, V03LocationId, V03State } from "../types";
import { afterVisitNext, mat, emptyShopLineFor } from "./shared";

const ALL_LOCS: { location: V03LocationId; next: string }[] = [
  { location: "YOHEI_STORE", next: "d3_yohei" },
  { location: "CAFE_NODOKA", next: "d3_miyoko" },
  { location: "COMMUNITY_HALL", next: "d3_jin" },
  { location: "CHALLENGE_CENTER", next: "d3_kamiya" },
];

function remainingOptions(state: V03State): { location: V03LocationId; next: string }[] {
  return ALL_LOCS.filter((o) => !state.visitedTodayLocations.includes(o.location));
}

export const DAY3_BEATS: Record<string, (state: V03State) => V03Beat> = {
  d3_wake: (state) => ({
    kind: "SCENE",
    image: "town",
    speaker: null,
    timeLabel: "朝",
    lines: state.flags.jinShadowDone ? ["3日目。残りは27日。", "昨日の現場仕事のせいか、少し体が重かった。"] : ["3日目。残りは27日。"],
    choices: [],
    continueNext: "d3_pick1",
    continueLabel: "出かける",
  }),

  d3_pick1: () => ({ kind: "PICK", timeLabel: "午前", prompt: "どこへ行きますか", options: ALL_LOCS }),
  d3_pick2: (state) => ({ kind: "PICK", timeLabel: "午後", prompt: "もう少し歩いてみますか", options: remainingOptions(state) }),

  d3_yohei: (state) => ({
    kind: "SCENE",
    image: "yohei",
    speaker: "yohei",
    timeLabel: "午前",
    lines: ["洋平は値札を貼り替えながら、ぽつりと言った。", "「この店、継ぐ奴がいないんだよな」"],
    choices: [
      {
        id: "who_takes_over",
        label: "そうなんですか",
        resultText: "「まあ、な」洋平はそれ以上言わず、また手を動かした。",
        applyFlags: { metYohei: true },
        materialsAdded: [mat("d3_yohei_succession", "PLACE_KNOWLEDGE", "洋平の店には後継者がいない", 3, "PLAYER_ACTION:LISTEN:YOHEI_STORE", ["player", "yohei"])],
        careerSignals: { LOCAL_BUSINESS_SUCCESSION: 1 },
        npcImpressionDelta: { yohei: 1 },
        next: afterVisitNext(state, "d3_freetext_yohei", "d3_evening"),
      },
      {
        id: "quiet",
        label: "何も言わず、値札を手伝う",
        resultText: "洋平は少し驚いた顔をして、「まあ、そこまでは頼んでないが」と苦笑した。",
        applyFlags: { metYohei: true },
        npcImpressionDelta: { yohei: 1 },
        next: afterVisitNext(state, "d3_freetext_yohei", "d3_evening"),
      },
    ],
  }),

  d3_miyoko: (state) => ({
    kind: "SCENE",
    image: "miyoko",
    speaker: "miyoko",
    timeLabel: "午前",
    lines: ["美代子は一人でカップを重ねていた。", "「今日、ちょっと人が足りなくて」"],
    choices: [
      {
        id: "help",
        label: "手伝います",
        resultText: "「本当に? ありがとう、助かるわ」\n二人でしばらく忙しく立ち働いた。",
        applyFlags: { miyokoHelped: true, metMiyoko: true },
        materialsAdded: [mat("d3_miyoko_help", "SHARED_EVENT", "美代子の店を手伝った", 3, "PLAYER_ACTION:HELP:CAFE_NODOKA", ["player", "miyoko"])],
        careerSignals: { CAFE_FOOD_SERVICE: 2 },
        npcImpressionDelta: { miyoko: 2 },
        next: afterVisitNext(state, "d3_freetext_miyoko", "d3_evening"),
      },
      {
        id: "no",
        label: "今日は難しいです",
        resultText: "「そう。無理しないで」",
        applyFlags: { metMiyoko: true },
        next: afterVisitNext(state, "d3_freetext_miyoko", "d3_evening"),
      },
    ],
  }),

  d3_jin: (state) => {
    if (state.flags.jinShadowDone) {
      return {
        kind: "SCENE",
        image: "jin",
        speaker: "jin",
        timeLabel: "午前",
        lines: ["相馬は工具の手入れをしていた。", "「昨日は助かった。また頼むかもな」"],
        choices: [
          {
            id: "glad",
            label: "また呼んでください",
            resultText: "「気が向いたらな」相馬は少しだけ口の端を上げた。",
            applyFlags: { metJin: true },
            materialsAdded: [mat("d3_jin_again", "SHARED_EVENT", "相馬にまた声をかけられた", 3, "PLAYER_ACTION:TALK:COMMUNITY_HALL", ["player", "jin"])],
            careerSignals: { REPAIR_BUSINESS_INDEPENDENT: 1 },
            npcImpressionDelta: { jin: 1 },
            next: afterVisitNext(state, "d3_freetext_jin", "d3_evening"),
          },
        ],
      };
    }
    return {
      kind: "SCENE",
      image: "jin",
      speaker: "jin",
      timeLabel: "午前",
      lines: ["相馬は掲示板の前で、腕を組んでいた。", "「前に頼んだやつ、片付いてたな。悪くない」"],
      choices: [
        {
          id: "thanks",
          label: "ありがとうございます",
          resultText: "相馬は軽く頷いただけだった。",
          applyFlags: { metJin: true },
          careerSignals: { HANDYMAN_INDEPENDENT: 1 },
          npcImpressionDelta: { jin: 1 },
          next: afterVisitNext(state, "d3_freetext_jin", "d3_evening"),
        },
      ],
    };
  },

  d3_kamiya: (state) => ({
    kind: "SCENE",
    image: "town",
    speaker: "kamiya",
    timeLabel: "午前",
    lines: ["神谷は求人の紙束をめくっていた。", "「今すぐでなくていいので、気になるものがあれば」"],
    choices: [
      {
        id: "browse",
        label: "少し見せてください",
        resultText: "紙束には、工場、運送、介護、いくつもの求人が並んでいた。",
        applyFlags: { metKamiya: true },
        materialsAdded: [mat("d3_kamiya_listings", "PLACE_KNOWLEDGE", "チャレンジセンターに複数の求人がある", 3, "PLAYER_ACTION:BROWSE:CHALLENGE_CENTER", ["player"])],
        next: afterVisitNext(state, "d3_freetext_kamiya", "d3_evening"),
      },
    ],
  }),

  d3_freetext_yohei: () => ({ kind: "FREE_TEXT", npc: "yohei", timeLabel: "午後", promptLines: ["洋平は手を止めずに聞いた。", "「あんたは、この先どうするつもりだ?」"], next: "d3_pick2" }),
  d3_freetext_miyoko: () => ({ kind: "FREE_TEXT", npc: "miyoko", timeLabel: "午後", promptLines: ["美代子はエプロンを外しながら聞いた。", "「ここでの暮らし、どう?」"], next: "d3_pick2" }),
  d3_freetext_jin: () => ({ kind: "FREE_TEXT", npc: "jin", timeLabel: "午後", promptLines: ["相馬は工具をしまいながら聞いた。", "「体動かすの、嫌いじゃないだろ」"], next: "d3_pick2" }),
  d3_freetext_kamiya: () => ({ kind: "FREE_TEXT", npc: "kamiya", timeLabel: "午後", promptLines: ["神谷は紙束を置いて聞いた。", "「気になったもの、ありました?」"], next: "d3_pick2" }),

  d3_evening: (state) => ({
    kind: "SCENE",
    image: "town",
    speaker: null,
    timeLabel: "夜",
    lines: [emptyShopLineFor(state.flags.emptyShopStage), "宿へ戻る前に、少しパソコンでも触ろうか、迷った。"],
    choices: [
      {
        id: "tinker",
        label: "夜、少しパソコンを触ってみる",
        resultText: "気づけば遅くまで画面を見ていた。",
        careerSignals: { AI_DEVELOPER: 1 },
        next: "d3_wrap",
      },
      { id: "sleep", label: "今日はもう休む", resultText: "早めに布団に入った。", next: "d3_wrap" },
    ],
    onEnter: { applyFlags: { emptyShopStage: state.flags.emptyShopStage + 1 } },
  }),

  d3_wrap: () => ({ kind: "WRAP" }),
};
