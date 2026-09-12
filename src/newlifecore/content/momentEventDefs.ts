/**
 * PHASE_15_NEW_LIFE_HYBRID_EVENT_AND_FORTUNE_HOUSE_V1 Section 9-24 -- MOMENT EVENTS: the "something
 * happens when you move" anticipation the directive borrows from board-game/jinsei-game pacing,
 * WITHOUT the sugoroku/roulette mechanic itself (Section 1's explicit ban -- there is no dice roll,
 * no fixed board, no forced route; every def below is an ordinary, ignorable, one-shot flavor
 * encounter gated by real state, exactly like every other content table in this codebase).
 *
 * Deliberately lighter-weight than `content/localProblemDefs.ts` (no multi-session help/connect
 * mechanic, no NPC ownership required) and lighter than `content/eventThreadDefs.ts` (resolves in
 * ONE exchange, never carries state across days) -- this is the small, town-texture layer: a dropped
 * glove, a stranger asking directions, a crowded café, a new notice on the board. Section 2's own
 * worked examples (落とし物/知らない人/雨/店混雑/困っている人/違う掲示/軽いトラブル) are the model;
 * 雨 (rain) is deliberately NOT reimplemented here since `day1WorldEvents.ts` already owns weather.
 */
import type { LocationId } from "../types";

export interface MomentEventChoice {
  id: string;
  /** Plain scene-action phrasing, never "選択肢A/B" or any quest-UI label (Section 23). */
  label: string;
  resultText: string;
  setFlags?: Record<string, boolean>;
}

export interface MomentEventDef {
  id: string;
  location: LocationId;
  minDay: number;
  /** Minimum days between two separate SHOWINGS of this same def (whether or not the player actually
   *  responded the first time) -- the mechanism that keeps an ignored moment event from reappearing
   *  the very next visit/day (Section 23: fully ignorable, never nags). */
  cooldownDays: number;
  /** 0..1, `pseudoChance(`${id}_${day}`)` gate (content/eventEngine.ts's existing deterministic hash)
   *  -- even once otherwise eligible, most days nothing fires. This is what makes "something might
   *  happen" a real anticipation rather than a guaranteed per-visit trigger, without resorting to
   *  Math.random (Section 2's ban on true randomness applies here exactly as it does to
   *  content/eventEngine.ts's own `occurrenceChance`). */
  occurrenceChance: number;
  /** The "something happened" line itself -- shown as ambient scene text, exactly like
   *  `content/localProblemDefs.ts`'s `observationLine`, never a popup/card. */
  observationLine: string;
  /** Always exactly 2: an engaged response and a plain "let it be" response -- Section 23's
   *  ignorability requirement made structural (the second choice is never a worse outcome, just a
   *  different, equally valid one). */
  choices: [MomentEventChoice, MomentEventChoice];
}

export const MOMENT_EVENT_DEFS: MomentEventDef[] = [
  {
    id: "moment_dropped_glove",
    location: "SHOPPING_STREET",
    minDay: 1,
    cooldownDays: 6,
    occurrenceChance: 0.55,
    observationLine: "足元に、片方だけの手袋が落ちているのに気づいた。",
    choices: [
      {
        id: "pick_up",
        label: "拾って、近くの店に預けておく",
        resultText: "手袋を拾って、近くの店先に預けておいた。持ち主が気づいてくれるといいのだが。",
        setFlags: { moment_dropped_glove_picked_up: true },
      },
      {
        id: "leave_it",
        label: "そのままにしておく",
        resultText: "特に自分に関係のあることでもないと思い、そのまま通り過ぎた。",
      },
    ],
  },
  {
    id: "moment_stranger_asks_direction",
    location: "COMMUNITY_HALL",
    minDay: 1,
    cooldownDays: 5,
    occurrenceChance: 0.5,
    observationLine: "見覚えのない人に、道を尋ねられた。",
    choices: [
      {
        id: "help_direction",
        label: "知っている範囲で教える",
        resultText: "覚えたての道順で説明すると、相手は「助かります、ありがとうございます」と言って去っていった。少しだけ、この町に詳しくなった気がした。",
        setFlags: { moment_stranger_direction_helped: true },
      },
      {
        id: "cant_help",
        label: "あまり詳しくないと伝える",
        resultText: "「すみません、まだこの辺りに詳しくなくて」と伝えると、相手は特に気にする様子もなく、別の方へ歩いていった。",
      },
    ],
  },
  {
    id: "moment_crowded_cafe",
    location: "CAFE_NODOKA",
    minDay: 2,
    cooldownDays: 6,
    occurrenceChance: 0.45,
    observationLine: "喫茶のどかが、いつになく混み合っていた。",
    choices: [
      {
        id: "wait_for_seat",
        label: "少し待ってみる",
        resultText: "少し待つと席が空いた。美代子が通りすがりに「今日は珍しく忙しくて」と苦笑いした。",
      },
      {
        id: "come_back_later",
        label: "また今度にする",
        resultText: "混み合っているのを見て、今日は店に入らず引き返すことにした。",
      },
    ],
  },
  {
    id: "moment_bulletin_notice",
    location: "COMMUNITY_HALL",
    minDay: 1,
    cooldownDays: 5,
    occurrenceChance: 0.5,
    observationLine: "掲示板に、見覚えのない紙が新しく貼られていた。",
    choices: [
      {
        id: "read_notice",
        label: "読んでみる",
        resultText: "近くの公園の清掃活動を知らせる紙だった。特に参加を求める書き方ではなさそうだ。",
        setFlags: { moment_bulletin_notice_read: true },
      },
      {
        id: "ignore_notice",
        label: "気にせず通り過ぎる",
        resultText: "特に気に留めず、そのまま通り過ぎた。",
      },
    ],
  },
];

export function momentEventById(id: string): MomentEventDef | undefined {
  return MOMENT_EVENT_DEFS.find((d) => d.id === id);
}
