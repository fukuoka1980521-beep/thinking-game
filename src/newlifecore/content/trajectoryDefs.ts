/**
 * PHASE_12_7_NEW_LIFE_PLAYER_TRAJECTORY_V1 Section 18/25 -- three concrete, playable trajectory
 * seeds, all from EXISTING NPCs (no roster addition this phase -- see the CLOSE report's Section 17
 * audit). Each seed follows the exact Section 6 shape: an ordinary, unlabeled "help again" action
 * (`engageActionLabel`/`workActionLabel`) that the player can repeat with no commitment attached,
 * and only once repeated enough (`opportunityThreshold`) does an actual "want to take this on"
 * choice (`opportunityLabel`) become offered -- LABEL IS ALWAYS THE RESULT, never the entry point.
 *
 * Family spread (Section 7): Jin = INDEPENDENT (odd jobs, no fixed employer), Miyoko = SHOP_BUSINESS
 * (an existing small business), Fumiko = COMMUNITY (an unpaid civic role, deliberately the one seed
 * with `opportunityMoney: 0` -- Section 14: money is one constraint among several, not the measure
 * of a valid life).
 */
import type { LocationId, NpcId, TrajectoryFamily } from "../types";

export interface TrajectorySeed {
  id: string;
  family: TrajectoryFamily;
  npc: NpcId;
  location: LocationId;
  minDayForHelp: number;
  /** Cooldown (days) between repeats of the SAME seed's engage/work action -- Section 15's
   *  opportunity-cost requirement falls out of this for free: the action consumes real minutes,
   *  competing with everything else the player could do that day, without any separate "energy"
   *  system needed. */
  engageCooldownDays: number;
  engageActionLabel: string;
  engageResultText: string;
  engageMinutes: number;
  engageMoney: number;
  workActionLabel: string;
  workResultText: string;
  workMinutes: number;
  workMoney: number;
  opportunityThreshold: number;
  opportunityWindowDays: number;
  declineCooldownDays: number;
  opportunityLabel: string;
  opportunityMinutes: number;
  opportunityMoney: number;
  acceptedFlag: string;
  acceptedResultText: string;
  declinedResultText: string;
  stepBackResultText: string;
  /**
   * PHASE_12_8_NEW_LIFE_30_DAY_ARC_AND_RETROSPECTIVE_V1 Section 6/7 -- late-game consequence for an
   * already-accepted trajectory: not a promotion/rank, one occasional textured beat once the player
   * has been genuinely established for a while. Never eligible before `lateConsequenceMinDay`, never
   * before at least `lateConsequenceMinWorkCount` real work sessions, and gated by its own cooldown
   * so it stays occasional, not a new daily habit.
   */
  lateConsequenceMinDay: number;
  lateConsequenceMinWorkCount: number;
  lateConsequenceCooldownDays: number;
  lateConsequenceActionLabel: string;
  lateConsequenceResultText: string;
  lateConsequenceMoney: number;
}

export const TRAJECTORY_SEEDS: TrajectorySeed[] = [
  {
    id: "jin_odd_job",
    family: "INDEPENDENT",
    npc: "jin",
    location: "COMMUNITY_HALL",
    minDayForHelp: 2,
    engageCooldownDays: 2,
    engageActionLabel: "相馬の仕事を手伝いに行く",
    engageResultText: "相馬について、町内のちょっとした修理を手伝った。多くは語らなかったが、道具の使い方だけは一つずつ教えてくれた。",
    engageMinutes: 90,
    engageMoney: 800,
    workActionLabel: "相馬の仕事をする",
    workResultText: "相馬と一緒に、頼まれていた修理を片付けた。前より少し手際よくできた気がする。",
    // PHASE_12_8 Section 8/33 -- bumped from the PHASE_12_7 baseline (90 -> 140): once actually
    // "working" (not just occasionally helping), a real half-day-ish time commitment is what makes
    // running all 3 accepted trajectories in a single day cost something felt, without hard-locking
    // any of them against each other (directive's own explicit "no artificial exclusivity", Section 9).
    workMinutes: 140,
    workMoney: 1000,
    opportunityThreshold: 2,
    opportunityWindowDays: 5,
    declineCooldownDays: 6,
    opportunityLabel: "相馬「お前、筋がいいな。……定期的に手伝う気はあるか」",
    opportunityMinutes: 10,
    opportunityMoney: 0,
    acceptedFlag: "trajectory_jin_active",
    acceptedResultText: "「じゃあ、頼むわ」相馬はそれだけ言うと、また工具袋を担いだ。何か始まったというより、続いていくことになった、という感じだった。",
    declinedResultText: "「そうか」相馬は特に気にする様子もなく言った。「気が向いたら、また声かけろ」",
    stepBackResultText: "「しばらく、これは控えておこうと思う」と伝えた。相馬は「そうか」とだけ言って、それ以上は聞かなかった。",
    lateConsequenceMinDay: 22,
    lateConsequenceMinWorkCount: 5,
    lateConsequenceCooldownDays: 6,
    lateConsequenceActionLabel: "相馬に任された仕事をこなす",
    lateConsequenceResultText: "「これ、お前一人でやってみるか」相馬は工具を渡すと、少し離れたところで見ているだけだった。任されて一人でやり切った。",
    lateConsequenceMoney: 500,
  },
  {
    id: "miyoko_cafe_help",
    family: "SHOP_BUSINESS",
    npc: "miyoko",
    location: "CAFE_NODOKA",
    minDayForHelp: 2,
    engageCooldownDays: 2,
    engageActionLabel: "喫茶のどかの手伝いをする",
    engageResultText: "洗い物とカップ拭きを手伝った。美代子は「あら、助かるわ」と言いながら、常連の名前を一人ずつ教えてくれた。",
    engageMinutes: 60,
    engageMoney: 600,
    workActionLabel: "喫茶のどかで働く",
    workResultText: "カウンターに立って、注文取りと片付けをこなした。美代子の動きを見よう見まねでなぞった。",
    workMinutes: 110, // PHASE_12_8 Section 8/33 -- bumped from 60, same completionist-risk rationale as Jin's.
    workMoney: 800,
    opportunityThreshold: 2,
    opportunityWindowDays: 5,
    declineCooldownDays: 6,
    opportunityLabel: "美代子「よかったら、時間があるときだけでも店番手伝ってくれない？」",
    opportunityMinutes: 10,
    opportunityMoney: 0,
    acceptedFlag: "trajectory_miyoko_active",
    acceptedResultText: "美代子は嬉しそうに頷いた。「無理のない範囲でいいのよ」しばらくは、この店に自分の居場所が一つ増えたことになる。",
    declinedResultText: "美代子は残念そうにしたが、すぐにいつもの調子に戻った。「そう。まあ、また気が向いたらね」",
    stepBackResultText: "「しばらく店の手伝いは控えようと思って」と伝えた。美代子は「あら、そう。無理しないでね」と言った。",
    lateConsequenceMinDay: 22,
    lateConsequenceMinWorkCount: 5,
    lateConsequenceCooldownDays: 6,
    lateConsequenceActionLabel: "美代子の代わりに店番をする",
    lateConsequenceResultText: "「ちょっと用事があるから、少しだけ任せていい？」美代子は出かけていった。短い時間だったが、一人で店番をこなした。",
    lateConsequenceMoney: 500,
  },
  {
    id: "fumiko_community_role",
    family: "COMMUNITY",
    npc: "fumiko",
    location: "COMMUNITY_HALL",
    minDayForHelp: 2,
    engageCooldownDays: 2,
    engageActionLabel: "集会所の用事を手伝う",
    engageResultText: "掲示板の張り替えと、椅子の片付けを手伝った。文子は掲示物の一つ一つについて、由来をひとしきり説明してくれた。",
    engageMinutes: 60,
    engageMoney: 0,
    workActionLabel: "集会所の役を務める",
    workResultText: "掲示板の管理と、来訪者への簡単な案内を引き受けた。無償だが、誰かの役に立っている実感はあった。",
    workMinutes: 90, // PHASE_12_8 Section 8/33 -- bumped from 60, same rationale (lighter than the paid seeds, still real).
    workMoney: 0,
    opportunityThreshold: 2,
    opportunityWindowDays: 5,
    declineCooldownDays: 6,
    opportunityLabel: "文子「あなた、こういうの向いてるかもしれないわね。掲示板の管理、少し任せてみようかしら」",
    opportunityMinutes: 10,
    opportunityMoney: 0,
    acceptedFlag: "trajectory_fumiko_active",
    acceptedResultText: "文子は満足そうに頷いた。「無給だけどね。……でも、誰かがやらなきゃいけないことだから」",
    declinedResultText: "文子は少し肩をすくめた。「そう、まあいいわ。気が変わったらいつでも言って」",
    stepBackResultText: "「集会所の役は、しばらく控えさせてください」と伝えた。文子は「あら。まあ、無理しないで」と言った。",
    lateConsequenceMinDay: 22,
    lateConsequenceMinWorkCount: 5,
    lateConsequenceCooldownDays: 6,
    lateConsequenceActionLabel: "文子の紹介を受ける",
    lateConsequenceResultText: "「今度、掲示板の件で知り合いを紹介するわね」文子はそう言って、町内の別の世話役を紹介してくれた。少し顔の広さが増えた気がした。",
    lateConsequenceMoney: 0,
  },
];

export function trajectorySeedById(id: string): TrajectorySeed | undefined {
  return TRAJECTORY_SEEDS.find((s) => s.id === id);
}
