import type { V03Beat, V03LocationId, V03State } from "../types";
import { afterVisitNext, mat, emptyShopLineFor } from "./shared";

const ALL_LOCS: { location: V03LocationId; next: string }[] = [
  { location: "YOHEI_STORE", next: "d2_yohei" },
  { location: "CAFE_NODOKA", next: "d2_miyoko" },
  { location: "COMMUNITY_HALL", next: "d2_jin_invite" },
  { location: "CHALLENGE_CENTER", next: "d2_kamiya_checkin" },
];

function remainingOptions(state: V03State): { location: V03LocationId; next: string }[] {
  return ALL_LOCS.filter((o) => !state.visitedTodayLocations.includes(o.location));
}

export const DAY2_BEATS: Record<string, (state: V03State) => V03Beat> = {
  d2_wake: () => ({
    kind: "SCENE",
    image: "town",
    speaker: null,
    timeLabel: "朝",
    lines: ["チャレンジ町、2日目。残りは28日。", "昨日会った人たちの顔を、少し思い出した。"],
    choices: [],
    continueNext: "d2_pick1",
    continueLabel: "出かける",
  }),

  d2_pick1: () => ({ kind: "PICK", timeLabel: "午前", prompt: "どこへ行きますか", options: ALL_LOCS }),
  d2_pick2: (state) => ({ kind: "PICK", timeLabel: "午後", prompt: "もう少し歩いてみますか", options: remainingOptions(state) }),

  d2_yohei: (state) => ({
    kind: "SCENE",
    image: "yohei",
    speaker: "yohei",
    timeLabel: "午前",
    lines: ["洋平は在庫の段ボールを数えていた。", "「来月の祭りの出店でな。仕入れが少し多くなる」"],
    choices: [
      {
        id: "help_count",
        label: "数えるの、手伝いましょうか",
        resultText: "「おう、助かる」二人で箱の数を確認した。",
        applyFlags: { metYohei: true },
        materialsAdded: [mat("d2_yohei_count", "SHARED_EVENT", "洋平の在庫数えを手伝った", 2, "PLAYER_ACTION:HELP:YOHEI_STORE", ["player", "yohei"])],
        careerSignals: { RETAIL_SHOP: 1, LOCAL_BUSINESS_SUCCESSION: 1 },
        npcImpressionDelta: { yohei: 1 },
        next: afterVisitNext(state, "d2_freetext_yohei", "d2_evening"),
      },
      {
        id: "ask_festival",
        label: "祭りって、毎年やるんですか",
        resultText: "「先代の頃からずっとだ」洋平は箱の陰から答えた。",
        applyFlags: { metYohei: true },
        materialsAdded: [mat("d2_yohei_festival", "PLACE_KNOWLEDGE", "洋平の店の祭りの出店は先代から続いている", 2, "PLAYER_ACTION:ASK:YOHEI_STORE", ["player", "yohei"])],
        next: afterVisitNext(state, "d2_freetext_yohei", "d2_evening"),
      },
    ],
  }),

  d2_miyoko: (state) => ({
    kind: "SCENE",
    image: "miyoko",
    speaker: "miyoko",
    timeLabel: "午前",
    lines: ["「豆の仕入れ先、変えようか迷ってるの」", "美代子はカウンター越しに小さくため息をついた。"],
    choices: [
      {
        id: "which_better",
        label: "どっちがいいんですか",
        resultText: "「味は好き。でも今より少し高いのよね」美代子は少し笑った。",
        applyFlags: { metMiyoko: true },
        materialsAdded: [mat("d2_miyoko_beans", "SHARED_EVENT", "美代子と豆の仕入れの話をした", 2, "PLAYER_ACTION:TALK:CAFE_NODOKA", ["player", "miyoko"])],
        careerSignals: { CAFE_FOOD_SERVICE: 1 },
        npcImpressionDelta: { miyoko: 1 },
        next: afterVisitNext(state, "d2_freetext_miyoko", "d2_evening"),
      },
      {
        id: "just_listen",
        label: "黙って話を聞く",
        resultText: "美代子はしばらく一人で考えてから、「まあ、決めるのは私だものね」と笑った。",
        applyFlags: { metMiyoko: true },
        next: afterVisitNext(state, "d2_freetext_miyoko", "d2_evening"),
      },
    ],
  }),

  d2_kamiya_checkin: (state) => ({
    kind: "SCENE",
    image: "town",
    speaker: "kamiya",
    timeLabel: "午前",
    lines: state.flags.metKamiya ? ["神谷はパソコンから顔を上げた。", "「昨日はどうでした?」"] : ["チャレンジセンターに立ち寄った。", "神谷がファイルを開いた。"],
    choices: [
      {
        id: "report",
        label: "町を少し歩きました",
        resultText: "「いいですね。焦らず、でいいですよ」",
        applyFlags: { metKamiya: true },
        materialsAdded: [mat("d2_kamiya_checkin", "SHARED_EVENT", "神谷に近況を話した", 2, "PLAYER_ACTION:VISIT:CHALLENGE_CENTER", ["player"])],
        next: afterVisitNext(state, "d2_freetext_kamiya", "d2_evening"),
      },
    ],
  }),

  d2_jin_invite: (state) => ({
    kind: "SCENE",
    image: "jin",
    speaker: "jin",
    timeLabel: "午前",
    lines: ["相馬はこちらをちらっと見た。", "「働いてないの?」"],
    choices: [
      {
        id: "not_yet",
        label: "今は",
        resultText: "「へえ」\n相馬は道具袋から軍手を取り出すと、無造作に差し出した。\n「これ持って。午後、現場について来るか」",
        applyFlags: { metJin: true, jinShadowOffered: true },
        next: "d2_jin_shadow_offer",
      },
      {
        id: "some_work",
        label: "少しだけ手伝いの仕事を",
        resultText: "「そうか」相馬はそれ以上聞かず、掲示板の作業に戻った。",
        applyFlags: { metJin: true },
        materialsAdded: [mat("d2_jin_talk", "SHARED_EVENT", "相馬と少し話した", 2, "PLAYER_ACTION:TALK:COMMUNITY_HALL", ["player", "jin"])],
        next: afterVisitNext(state, "d2_freetext_jin", "d2_evening"),
      },
    ],
  }),

  d2_jin_shadow_offer: (state) => ({
    kind: "SCENE",
    image: "jin",
    speaker: "jin",
    timeLabel: "午前",
    lines: ["軍手を受け取ると、意外と重かった。"],
    choices: [
      {
        id: "accept",
        label: "ついて行きます",
        resultText: "「なら早い方がいい」相馬はもう歩き出していた。",
        applyFlags: { jinShadowAccepted: true },
        careerSignals: { FACILITY_REPAIR: 2, REPAIR_BUSINESS_INDEPENDENT: 1, HANDYMAN_INDEPENDENT: 1 },
        npcImpressionDelta: { jin: 2 },
        // The shadow path always ends the day at evening regardless of visit order --
        // it consumes the whole afternoon by design (directive's own opportunity-cost example).
        next: "d2_shadow_freetext",
      },
      {
        id: "decline",
        label: "今日はやめておきます",
        resultText: "「そうか。まあ、気が向いたらな」相馬は軍手を袋に戻した。",
        next: afterVisitNext(state, "d2_freetext_jin", "d2_evening"),
      },
    ],
  }),

  d2_shadow_freetext: () => ({
    kind: "FREE_TEXT",
    npc: "jin",
    timeLabel: "午後",
    promptLines: ["現場までの道すがら、相馬がふと聞いた。", "「にしても、何でこの町に来たんだ?」"],
    next: "d2_shadow_result",
  }),

  d2_shadow_result: () => ({
    kind: "SCENE",
    image: "jin",
    speaker: "jin",
    timeLabel: "午後",
    lines: ["午後まで、相馬について現場を回った。", "重い物を運び、埃をかぶり、思ったより体を使った。", "「今日はこんなもんだな」"],
    choices: [],
    continueNext: "d2_evening",
    continueLabel: "夕方になる",
    onEnter: { applyFlags: { jinShadowDone: true }, materialsAdded: [mat("d2_jin_shadow", "SHARED_EVENT", "相馬の現場に半日同行した", 2, "PLAYER_ACTION:ACCOMPANY:COMMUNITY_HALL", ["player", "jin"])] },
  }),

  d2_freetext_yohei: () => ({ kind: "FREE_TEXT", npc: "yohei", timeLabel: "午後", promptLines: ["洋平はふと手を止めて言った。", "「あんた、前は何の仕事してたんだ?」"], next: "d2_pick2" }),
  d2_freetext_miyoko: () => ({ kind: "FREE_TEXT", npc: "miyoko", timeLabel: "午後", promptLines: ["美代子はカップを置いて、少し身を乗り出した。", "「差し支えなければ、前は何を?」"], next: "d2_pick2" }),
  d2_freetext_jin: () => ({ kind: "FREE_TEXT", npc: "jin", timeLabel: "午後", promptLines: ["相馬は掲示板をしまいながら言った。", "「で、これからどうすんだ?」"], next: "d2_pick2" }),
  d2_freetext_kamiya: () => ({ kind: "FREE_TEXT", npc: "kamiya", timeLabel: "午後", promptLines: ["神谷はメモを取る手を止めた。", "「率直に聞きますけど、今どんな気分です?」"], next: "d2_pick2" }),

  d2_evening: (state) => {
    if (state.flags.jinShadowDone) {
      return {
        kind: "SCENE",
        image: "town",
        speaker: null,
        timeLabel: "夕方",
        lines: ["体はくたびれていたが、悪い気はしなかった。", emptyShopLineFor(state.flags.emptyShopStage)],
        choices: [],
        continueNext: "d2_wrap",
        continueLabel: "今日を終える",
        onEnter: { applyFlags: { emptyShopStage: state.flags.emptyShopStage + 1 } },
      };
    }
    const unmet = ALL_LOCS.map((o) => o.location).find((l) => !state.visitedTodayLocations.includes(l));
    const line =
      unmet === "COMMUNITY_HALL"
        ? "集会所の前を、相馬が工具袋を担いで通り過ぎるのが見えた。"
        : unmet === "CHALLENGE_CENTER"
          ? "チャレンジセンターの窓に、まだ明かりがついていた。"
          : unmet === "CAFE_NODOKA"
            ? "喫茶のどかから、美代子の笑い声が漏れていた。"
            : "洋平商店のシャッターが下り始めていた。";
    return { kind: "SCENE", image: "town", speaker: null, timeLabel: "夕方", lines: [line], choices: [], continueNext: "d2_wrap", continueLabel: "今日を終える" };
  },

  d2_wrap: () => ({ kind: "WRAP" }),
};
