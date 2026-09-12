/**
 * PHASE_15_NEW_LIFE_HYBRID_EVENT_AND_FORTUNE_HOUSE_V1 Section 25-31 -- EVENT THREADS: 1-5 day
 * mini-stories, structurally distinct from `content/localProblemDefs.ts` (a local problem is
 * something the player can HELP resolve; a thread is something the player can WATCH or nudge through
 * ordinary conversation-shaped actions -- no help/connect grind, no threshold, just a short linear
 * sequence of stages). Section 19's "player is not the hero" applies here exactly as it does to local
 * problems: every thread can reach its own conclusion with the player never touching it again after
 * discovery (`autoProgressAfterDays`, resolved by `content/eventThreadEngine.ts`'s daily tick).
 *
 * V1 ships exactly 2 threads, BOTH non-work/social (Section 25's "at least 1 non-work" minimum is
 * exceeded, not merely met -- neither thread involves a job, shop task, or paid activity, by design,
 * to keep the vertical slice's texture away from the existing work-skewed trajectory content).
 */
import type { LifeMaterialCategory, LocationId, NpcId } from "../types";

export interface EventThreadStage {
  id: string;
  npc: NpcId;
  location: LocationId;
  actionLabel: string;
  resultText: string;
  /** Minimum days since the thread's discovery (stage 0) or its previous stage (stage N>0) before
   *  THIS stage's action is offered -- real elapsed time between beats, never same-day rushable
   *  (Section 27: "1日で全部進めない"). */
  minDaysSincePrev: number;
}

export interface EventThreadDef {
  id: string;
  category: LifeMaterialCategory;
  /** Section 25's own explicit tracking field -- at least one V1 thread must be `false`; both are. */
  isWorkRelated: boolean;
  discoverLocation: LocationId;
  discoverNpc: NpcId;
  minDay: number;
  observationLine: string;
  discoverActionLabel: string;
  discoverResultText: string;
  /** Stage 0 is the FIRST post-discovery beat; the last entry is the thread's resolution beat (its
   *  `resultText` doubles as the canonical worldFact text once reached through real play). */
  stages: EventThreadStage[];
  /** Days since `lastPlayerProgressDay` before the world resolves this thread WITHOUT the player
   *  (Section 19). Anchored to the most recent real advance, not to discovery -- see
   *  `EventThreadRuntimeState`'s own doc comment in types.ts for why this differs from the PHASE A
   *  activity/local-problem anchor semantics without reintroducing that bug. */
  autoProgressAfterDays: number;
  resolvedWithoutPlayerText: string;
  knownBy: NpcId[];
}

export const EVENT_THREAD_DEFS: EventThreadDef[] = [
  {
    id: "kiyoshi_old_colleague",
    category: "shared_event",
    isWorkRelated: false,
    discoverLocation: "YOHEI_STORE",
    discoverNpc: "kiyoshi",
    minDay: 2,
    observationLine: "清が、携帯電話の画面を眺めながら、何か考え込んでいるようだった。",
    // PHASE_16 Section 12 -- names WHO, matching localProblemDefs.ts's same fix.
    discoverActionLabel: "清に、様子を聞く",
    discoverResultText: "清は少し間を置いてから言った。「……昔、工場で一緒だった奴から電話があってな。何年ぶりかも忘れた」それ以上は多く語らなかった。",
    stages: [
      {
        id: "still_hesitating",
        npc: "kiyoshi",
        location: "YOHEI_STORE",
        actionLabel: "その後どうしたか聞いてみる",
        resultText: "清は「まだかけ直してない」と言って、少し気まずそうにした。「今更、何を話せばいいのか分からんし」",
        minDaysSincePrev: 1,
      },
      {
        id: "called_back",
        npc: "kiyoshi",
        location: "YOHEI_STORE",
        actionLabel: "その後どうしたか聞いてみる",
        resultText: "清は、ぽつりと言った。「……かけてみた。向こうも、覚えててくれてな」それ以上は照れくさそうに言わなかったが、心なしか声が明るかった。",
        minDaysSincePrev: 1,
      },
    ],
    autoProgressAfterDays: 4,
    resolvedWithoutPlayerText: "清が、誰かの古い電話番号を眺めていた時期があったが、いつの間にかその話はしなくなっていた。かけ直したのか、それとも諦めたのか、本人以外には分からない。",
    knownBy: ["kiyoshi", "yohei"],
  },
  {
    id: "miyoko_old_photo",
    category: "shared_event",
    isWorkRelated: false,
    discoverLocation: "CAFE_NODOKA",
    discoverNpc: "miyoko",
    minDay: 2,
    observationLine: "美代子が、カウンターの奥で何か古い写真を眺めていた。",
    discoverActionLabel: "美代子に、様子を聞く",
    discoverResultText: "美代子は少し照れたように笑った。「昔の、この店の写真。……もう時効よね、見る?」",
    stages: [
      {
        id: "old_regulars",
        npc: "miyoko",
        location: "CAFE_NODOKA",
        actionLabel: "写真の話の続きを聞く",
        resultText: "美代子は写真を指して、当時の常連客の名前を懐かしそうに挙げていった。「みんな、もうこの町にはいないけどね」",
        minDaysSincePrev: 1,
      },
      {
        id: "closing_the_photo",
        npc: "miyoko",
        location: "CAFE_NODOKA",
        actionLabel: "写真の話の続きを聞く",
        resultText: "美代子は写真をそっとしまいながら言った。「でも、今はあなたたちがいるから。それでいいのよ」少し照れくさそうに、いつもの調子に戻った。",
        minDaysSincePrev: 1,
      },
    ],
    autoProgressAfterDays: 4,
    resolvedWithoutPlayerText: "美代子が古い写真を眺めていたのは、いつの間にかまたカウンターの引き出しの奥にしまわれていた。",
    knownBy: ["miyoko"],
  },
];

export function eventThreadById(id: string): EventThreadDef | undefined {
  return EVENT_THREAD_DEFS.find((d) => d.id === id);
}
