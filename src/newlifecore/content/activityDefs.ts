/**
 * PHASE_14_NEW_LIFE_GAMEPLAY_CORE_V1 Section 3/5-10 -- the GAMEPLAY CORE's own content: short
 * (30s-2min real time), town-life-grounded activities. Exactly 3, per Section 5's own "V1では3種類
 * 程度", using the EXISTING 7 locations/8 NPCs only -- zero new NPCs or locations were needed for
 * this (see the phase CLOSE report's Section 19/20 audit).
 *
 * One shared shape for all 3 (a time-budgeted list of tasks the player picks from, in any order,
 * never required to finish all of them -- Section 6/8's own "時間内に全部処理する必要なし"/
 * "全部できないことを許可" apply structurally here, not just as flavor text) rather than 3 bespoke
 * subsystems: `repair_with_jin`'s "judgment shapes the result, not a quiz" requirement (Section 7)
 * is satisfied by its tasks being alternative APPROACHES rather than a strict checklist -- no single
 * combination is "correct," each just produces different, equally valid flavor/consequence text.
 * This is a deliberate V1 simplification, recorded honestly rather than claiming 3 fully bespoke
 * systems were built.
 *
 * No score anywhere (Section 9): completion is tracked only as "how many sessions has the player
 * ever done this activity" (`CoreState.activityHelpCount`, an internal gate exactly like
 * `PlayerExperience.count` and `LocalProblemDef`'s help count -- never displayed, never a percentage).
 */
import type { LocationId, NpcId } from "../types";

export interface ActivityTask {
  id: string;
  label: string;
  minutes: number;
  resultText: string;
}

export interface ActivityDef {
  id: string;
  npc: NpcId;
  location: LocationId;
  /** The specialAction button label that starts the session -- an ordinary scene action, never a
   *  "START MISSION" style label (Section 26). */
  actionLabel: string;
  introText: string;
  /** PHASE_14 Section 4 -- the short, non-spoiler flavor line TODAY'S SIGNS may surface on a
   *  morning this activity will be reachable later that day. Deliberately distinct from
   *  `introText` (shown only once the player actually starts the session) -- a sign hints, it never
   *  narrates the scene itself. */
  todaysSignText: string;
  /** Deliberately less than the sum of every task's minutes, in at least one combination, so
   *  finishing everything is possible only with an efficient pick, and skipping something is the
   *  normal outcome, not a rare one -- Section 21's opportunity cost, made structural rather than
   *  a hard lock. */
  timeBudgetMinutes: number;
  tasks: ActivityTask[];
  minDay: number;
  eligibleFromMinutes: number;
  eligibleToMinutes: number;
  /** Days between repeat sessions, mirrors `TrajectorySeed.engageCooldownDays`. */
  cooldownDays: number;
  npcReactionAllDone: string;
  npcReactionPartial: string;
  npcReactionMinimal: string;
  completionThreshold: number;
  resolveAfterDays: number;
  worldChangeText: string;
}

export const ACTIVITY_DEFS: ActivityDef[] = [
  {
    id: "cafe_busy_hour",
    npc: "miyoko",
    location: "CAFE_NODOKA",
    actionLabel: "忙しい時間帯を手伝う",
    introText: "昼どきの喫茶のどかに、客が立て込んでいた。美代子が一人でカウンターを回している。",
    todaysSignText: "喫茶のどかは昼から少し忙しそうだ。",
    timeBudgetMinutes: 35,
    tasks: [
      { id: "serve_coffee", label: "コーヒーを運ぶ", minutes: 10, resultText: "コーヒーを席まで運んだ。" },
      { id: "serve_hot_sandwich", label: "ホットサンドを運ぶ", minutes: 15, resultText: "ホットサンドを運んだ。少し焦げていたが、まあ大丈夫だろう。" },
      { id: "handle_checkout", label: "会計をする", minutes: 10, resultText: "会計を済ませた。" },
      { id: "clear_tables", label: "テーブルを片付ける", minutes: 10, resultText: "空いたテーブルを片付けた。" },
    ],
    minDay: 2,
    eligibleFromMinutes: 11 * 60 + 30,
    eligibleToMinutes: 14 * 60,
    cooldownDays: 2,
    npcReactionAllDone: "美代子は額の汗を拭いながら笑った。「助かったわ、本当に」",
    npcReactionPartial: "美代子は少し息をついた。「ありがとう、だいぶ楽になったわ」",
    npcReactionMinimal: "美代子は軽く頷いた。「少しでも助かったわ」",
    completionThreshold: 3,
    resolveAfterDays: 3,
    worldChangeText: "喫茶のどかのカウンターの端に、テイクアウト用の小さな棚ができていた。",
  },
  {
    id: "repair_with_jin",
    npc: "jin",
    location: "COMMUNITY_HALL",
    actionLabel: "相馬の修理仕事を手伝う",
    introText: "相馬が集会所の設備を前に、腕を組んでいた。「ちょっと見てくれ」",
    todaysSignText: "集会所で、相馬が何かの修理をしているようだ。",
    timeBudgetMinutes: 30,
    tasks: [
      { id: "check_situation", label: "状況を確認する", minutes: 10, resultText: "壊れた箇所をよく見てみた。相馬は黙って見守っていた。" },
      { id: "get_tool", label: "道具を取ってくる", minutes: 10, resultText: "工具箱から道具を取ってきた。「おう」と相馬が受け取った。" },
      { id: "quick_fix", label: "応急処置をする", minutes: 15, resultText: "言われた通り、応急処置をした。ひとまず動くようにはなった。" },
      { id: "suggest_replacement", label: "交換を提案する", minutes: 10, resultText: "「もう交換した方が早いのでは」と言ってみた。相馬は少し考える顔をした。" },
      { id: "ask_jin", label: "相馬に聞いてみる", minutes: 5, resultText: "やり方を聞いてみた。「まあ、見りゃ分かる」とだけ返ってきたが、少し手元を見せてくれた。" },
    ],
    minDay: 2,
    eligibleFromMinutes: 8 * 60,
    eligibleToMinutes: 11 * 60,
    cooldownDays: 2,
    npcReactionAllDone: "相馬は工具をしまいながら、珍しく「助かった」と言った。",
    npcReactionPartial: "相馬は軽く頷いた。「まあ、今日はここまでだな」",
    npcReactionMinimal: "相馬は特に気にした様子もなく、「そうか」とだけ言った。",
    completionThreshold: 3,
    resolveAfterDays: 3,
    worldChangeText: "集会所の設備が、いつの間にかきちんと動くようになっていた。",
  },
  {
    id: "shop_helper",
    npc: "yohei",
    location: "YOHEI_STORE",
    actionLabel: "洋平商店の仕事を手伝う",
    introText: "洋平が店先で、積み上がった段ボールを前に少し困った顔をしていた。",
    todaysSignText: "洋平商店に、荷物がたくさん届いているようだ。",
    timeBudgetMinutes: 30,
    tasks: [
      { id: "restock_shelf", label: "棚に品出しをする", minutes: 15, resultText: "段ボールから商品を出して、棚に並べた。" },
      { id: "quick_delivery", label: "近所へ配達する", minutes: 20, resultText: "近所の家まで、注文の品を届けた。" },
      { id: "serve_customer", label: "店先で客の対応をする", minutes: 10, resultText: "店先に来た客に応対した。洋平の代わりに、少し愛想よく。" },
      { id: "prepare_flyer", label: "貼り紙の準備をする", minutes: 10, resultText: "セールの貼り紙を書いて、店先に貼った。" },
    ],
    minDay: 2,
    eligibleFromMinutes: 9 * 60,
    eligibleToMinutes: 17 * 60,
    cooldownDays: 2,
    npcReactionAllDone: "洋平は段ボールの山を見て、少し驚いたように言った。「おう、早いな」",
    npcReactionPartial: "洋平は軽く頷いた。「まあ、助かった」",
    npcReactionMinimal: "洋平は「おう」とだけ言って、また自分の作業に戻った。",
    completionThreshold: 3,
    resolveAfterDays: 3,
    worldChangeText: "洋平商店の店先が、前より少し片付いて見えるようになっていた。",
  },
];

export function activityById(id: string): ActivityDef | undefined {
  return ACTIVITY_DEFS.find((a) => a.id === id);
}

export function activitiesAt(location: LocationId): ActivityDef[] {
  return ACTIVITY_DEFS.filter((a) => a.location === location);
}
