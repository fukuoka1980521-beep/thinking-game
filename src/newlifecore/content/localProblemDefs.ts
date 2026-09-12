/**
 * PHASE_13_NEW_LIFE_WORLD_ACTIVITY_AND_LOCAL_PROBLEMS_V1 Section 4/5/20 -- originally exactly 8
 * local problem definitions (directive's own "8-12, do not mass-produce" ceiling, taken at the low
 * end that phase); now 7, after PHASE_15 removed "daisuke_renovation_indecision" (its owning NPC's
 * location was repurposed into Fortune House -- see that def's own removal note below for why it
 * was dropped, not reassigned). Canon-consistency audited BEFORE writing this file (Section 5's
 * explicit requirement): `content/day1WorldEvents.ts` already fully owns the shelf-repair,
 * community-hall-bench, and Hina shop-opening threads (fixed-time, no player-help path for two of
 * them) -- none of those are reused or duplicated here. 4 of the remaining 7 problems adopt an
 * NPC's own EXISTING `currentConcerns`/`hiddenBackground` entry (npcDefs.ts) that had no mechanic
 * built for it yet: Miyoko's weekend-help shortage, Yohei's missing shop successor, Yohei's
 * festival-prep need, and Jin's unspoken "could use a partner". The remaining 3 are new but
 * grounded: the elderly-customer delivery problem (Kiyoshi, PHASE_13's one new NPC), Hina's
 * post-opening promotion gap (PHASE_13 directive Section 5's own "small business: website/flyer"
 * example), and a second, still-vacant shopping-street unit distinct from the one Hina already
 * rented.
 *
 * Never a quest board (Section 6/23): no def here has an "accept" or "quest start" concept. A
 * problem is DISCOVERED (an ordinary, structural action once an ambient cue has been noticed --
 * Section 13), then the player may HELP, CONNECT it to another NPC, or do nothing at all -- the
 * "listen only / think about it / suggest / ignore" responses in Section 6 require no code of their
 * own: they are simply what happens when the player does not press either button, and are just as
 * valid an outcome as either one (Section 19: the player is never the town's only fixer).
 */
import type { LocationId, NpcId } from "../types";

export interface LocalProblemDef {
  id: string;
  npc: NpcId;
  location: LocationId;
  /** Second NPC who also "knows" this once discovered (Section 4's hearsay discovery path) --
   *  their `knownFacts` gains it too, purely through the ordinary knowledge-boundary mechanism
   *  (WorldFact.knownBy), no separate hearsay system. */
  hearsayNpc?: NpcId;
  minDay: number;
  /** Ambient line shown at `location` once eligible and not yet discovered -- Section 13's
   *  "observation" discovery path. */
  observationLine: string;
  /** The structural action that turns observation into real knowledge -- Section 13's "話す/
   *  再訪する" discovery path, made concrete as an ordinary specialAction, never a dialogue-parsing
   *  guess. Label is deliberately plain, never "詳細を見る"/"クエスト受注" (Section 6/23). */
  discoverActionLabel: string;
  discoverResultText: string;
  /** `undefined` for a problem that has no repeatable labor angle at all (e.g. Yohei's successor
   *  worry, Daisuke's renovation indecision) -- "help" there IS conversation, which needs no
   *  separate action beyond ordinary talk (see `localProblemEngine.ts`'s `listenOnlyEligible`). */
  helpActionLabel?: string;
  helpResultText?: string;
  /** "immediate" -- one help action alone is enough to start the resolution clock. "accumulate" --
   *  needs `helpThreshold` separate days of help first (Section 7's cafe-shelf example implies
   *  repeated help, not a single instance). */
  helpMode?: "immediate" | "accumulate";
  helpThreshold?: number;
  connectNpc?: NpcId;
  connectActionLabel?: string;
  connectResultText?: string;
  /** Shown (as a WorldFact, so it reaches end-of-day narrative and ambient scene text) once the
   *  daily resolution tick actually resolves this problem via the player's own help/connect action --
   *  Section 8's "WORLD CHANGE" reward, never a score or item. */
  worldChangeText: string;
  /** Days after the LAST player help/connect action before the world-change actually lands --
   *  Section 7's "数日後" texture, never instant. */
  resolveAfterDays: number;
  /** If set, and the player never engages at all, the world resolves (or explicitly does NOT
   *  resolve) on its own after this many days from `minDay` -- Section 19's "player is not hero".
   *  Omitted entirely for problems allowed to just persist unresolved indefinitely, which is an
   *  equally valid, honest outcome. */
  autoResolveAfterDays?: number;
  autoResolveText?: string;
}

export const LOCAL_PROBLEM_DEFS: LocalProblemDef[] = [
  {
    id: "miyoko_weekend_help_shortage",
    npc: "miyoko",
    location: "CAFE_NODOKA",
    minDay: 2,
    observationLine: "週末のカウンターに、美代子が一人で立っていた。テイクアウトの注文が重なると、少し手が回らなくなるようだった。",
    discoverActionLabel: "気になったので聞いてみる",
    discoverResultText: "美代子は少し苦笑した。「週末、いつもの手伝いの子が来られないことがあってね。テイクアウトまで一人だと、ちょっと大変なの」",
    helpActionLabel: "テイクアウトの受け渡しを手伝う",
    helpResultText: "カウンターの端に立って、テイクアウトの袋を渡す係をした。美代子は「あら、助かるわ」と何度か言った。",
    helpMode: "accumulate",
    helpThreshold: 3,
    worldChangeText: "喫茶のどかのカウンターの端に、テイクアウト専用の小さな棚ができていた。",
    resolveAfterDays: 3,
  },
  {
    id: "yohei_shop_successor",
    npc: "yohei",
    location: "YOHEI_STORE",
    hearsayNpc: "jin",
    minDay: 3,
    observationLine: "洋平が伝票を見ながら、少しの間、手を止めていた。",
    discoverActionLabel: "様子が気になったので聞いてみる",
    discoverResultText: "洋平は少し間を置いてから言った。「……跡を継ぐ人間がいなくてな。息子は都会だ。まあ、いい」それ以上は続けなかった。",
    // No repeatable "help" grind action -- this resolves (or doesn't) purely through being talked to
    // again, matching Section 6's "聞くだけ/考えてみる" response types exactly.
    worldChangeText: "洋平が、店の帳簿を少しだけ長く息子に電話で話していたらしい。それ以上のことは、まだ誰も知らない。",
    resolveAfterDays: 4,
    autoResolveAfterDays: 10,
    autoResolveText: "洋平の店の跡継ぎの話は、特にどうなるでもなく、いつも通りの毎日が続いていた。",
  },
  {
    id: "yohei_kiyoshi_delivery",
    npc: "yohei",
    location: "YOHEI_STORE",
    hearsayNpc: "kiyoshi",
    minDay: 2,
    observationLine: "常連の清が、重そうな米袋を前に少し困った顔をしていた。",
    discoverActionLabel: "様子が気になったので聞いてみる",
    discoverResultText: "洋平は声を落として言った。「清さん、免許を返してからな。重い物は運べと言われても、うちも配達までは手が回らん」",
    helpActionLabel: "清さんの荷物を届ける",
    helpResultText: "清の家まで、買った物を一緒に運んだ。清は「すまんな」とだけ言ったが、少しほっとした様子だった。",
    helpMode: "immediate",
    connectNpc: "jin",
    connectActionLabel: "相馬に配達を頼めないか聞いてみる",
    connectResultText: "相馬は少し考えてから言った。「まあ、ついでの時ならな」多くは語らなかったが、引き受けてくれたようだった。",
    worldChangeText: "清の家まで、相馬が時々荷物を届けるようになったらしい。",
    resolveAfterDays: 3,
  },
  {
    id: "jin_solo_workload",
    npc: "jin",
    location: "COMMUNITY_HALL",
    minDay: 3,
    observationLine: "相馬が、いくつも重なった仕事の依頼を前に、珍しく少し手を止めていた。",
    discoverActionLabel: "様子が気になったので聞いてみる",
    discoverResultText: "相馬は工具を確かめながら言った。「一人でやってきたからな。今更誰かと組むというのも、考えたことがない」",
    connectNpc: "kiyoshi",
    connectActionLabel: "誰かと組んでみたらどうか話してみる",
    connectResultText: "相馬は少し黙ってから、「……まあ、考えとく」とだけ言った。",
    worldChangeText: "相馬が、頼まれた仕事のいくつかを、以前より少し余裕を持ってこなしているようだった。",
    resolveAfterDays: 4,
    autoResolveAfterDays: 12,
    autoResolveText: "相馬は結局、これまで通り一人でやっているようだった。",
  },
  // PHASE_15_NEW_LIFE_HYBRID_EVENT_AND_FORTUNE_HOUSE_V1 Section 3/6 -- "daisuke_renovation_
  // indecision" (BARBERSHOP) removed here, not reassigned: it was entirely about Daisuke's own
  // shop-renovation dilemma, which does not fit Shizuko or Fortune House thematically, and
  // BARBERSHOP no longer exists as a location. 7 local problems remain (down from 8) -- no
  // replacement was manufactured just to hold the count; Fortune House's own engagement (card
  // selection / Thinking Circuit / Reality Bridge) is a genuinely different kind of content, not a
  // LocalProblemDef-shaped one.
  {
    id: "hina_needs_promotion_help",
    npc: "hina",
    location: "SHOPPING_STREET",
    hearsayNpc: "miyoko",
    minDay: 4,
    observationLine: "陽菜の店の前に、手書きの小さな値札はあるが、外から見える案内はまだ何もなかった。",
    discoverActionLabel: "気になったので聞いてみる",
    discoverResultText: "陽菜は少し早口になった。「棚の準備で手一杯で、お知らせとかチラシとか、そこまで手が回ってなくて」",
    helpActionLabel: "チラシ作りを手伝う",
    helpResultText: "陽菜と一緒に、簡単な手書きのチラシを何枚か作った。陽菜は「こういうの苦手で、助かります」と言った。",
    helpMode: "accumulate",
    helpThreshold: 2,
    worldChangeText: "商店街に、陽菜の店の手書きのチラシが何枚か貼られていた。",
    resolveAfterDays: 2,
  },
  {
    id: "shopping_street_vacant_unit",
    npc: "hina",
    location: "SHOPPING_STREET",
    hearsayNpc: "fumiko",
    minDay: 5,
    observationLine: "陽菜の店の少し先に、別のシャッターが下りたままの区画があった。ずいぶん長く空いているようだった。",
    discoverActionLabel: "気になったので聞いてみる",
    discoverResultText: "陽菜は少し声を落とした。「あそこ、私が来る前からずっとああみたいです。借りる人がいないのかも」",
    connectNpc: "kamiya",
    connectActionLabel: "神谷に空き店舗のことを話してみる",
    connectResultText: "神谷は少し考えるようにメモを取った。「情報としては預かっておきます。すぐにどうこうできる話でもないですが」",
    worldChangeText: "商店街の空き区画に、小さく「相談受付中」という貼り紙が増えていた。",
    resolveAfterDays: 6,
    autoResolveAfterDays: 20,
    autoResolveText: "商店街の空き区画は、相変わらずシャッターが下りたままだった。",
  },
  {
    id: "community_festival_manpower",
    npc: "fumiko",
    location: "COMMUNITY_HALL",
    hearsayNpc: "yohei",
    minDay: 3,
    observationLine: "集会所の掲示板に、来月の商店街祭りの手書きの案内が貼られていた。文子が、その前で少し困った顔をしていた。",
    discoverActionLabel: "気になったので聞いてみる",
    discoverResultText: "文子ははきはきと、でも少し疲れた様子で言った。「祭りの準備、人手が全然足りなくて。洋平さんも仕入れで手一杯みたいだし」",
    helpActionLabel: "祭りの準備を手伝う",
    helpResultText: "集会所で、祭りの飾りつけや案内板の準備を手伝った。文子は「本当に助かるわ」と何度も言った。",
    helpMode: "accumulate",
    helpThreshold: 2,
    worldChangeText: "商店街の祭りが、思ったよりにぎやかに行われたらしい。洋平の店先にも、いつもより多くの人が出ていた。",
    resolveAfterDays: 3,
    autoResolveAfterDays: 15,
    autoResolveText: "商店街の祭りは、いつも通りの規模で、特に何ということもなく行われたようだった。",
  },
];

export function localProblemById(id: string): LocalProblemDef | undefined {
  return LOCAL_PROBLEM_DEFS.find((p) => p.id === id);
}

export function localProblemsAt(location: LocationId): LocalProblemDef[] {
  return LOCAL_PROBLEM_DEFS.filter((p) => p.location === location);
}
