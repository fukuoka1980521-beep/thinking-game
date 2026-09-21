/**
 * NEW LIFE 30-day playable candidate — types.
 *
 * SYSTEM OWNS TRUTH: everything in `NewLife30State` is canonical fact, only
 * ever written by `applyAction`/`advanceDay` in `state.ts`. The NPC voice
 * layer (`npcVoice.ts`) reads this state but returns only strings — it has
 * no way to write back into it. See docs/newlife/canonical/phase25-26/
 * NEWLIFE_30DAY_CHARACTER_DERIVED_PLAYABLE_V3.md §2 for the source of every
 * field below.
 */

export type NpcId = "hina" | "yohei" | "daisuke" | "jin" | "miyoko" | "fumiko";

export const NPC_IDS: NpcId[] = ["hina", "yohei", "daisuke", "jin", "miyoko", "fumiko"];

export const NPC_NAMES: Record<NpcId, string> = {
  hina: "陽菜",
  yohei: "洋平",
  daisuke: "大輔",
  jin: "仁",
  miyoko: "美代子",
  fumiko: "文子",
};

/** Daisuke's canonical trade. Tracked as data (not just prose) so a regression test can assert it directly. */
export const DAISUKE_OCCUPATION = "家具・椅子修理" as const;

export type SignVersion = "unposted" | "clear_from_start" | "vague_then_corrected" | "vague_uncorrected";
export type PickupPlan = "unassigned" | "time_split_owned_by_hina";
export type MSeats = "assumed" | "bounded";
export type JWork = "agreed_two_hours" | "extra_with_specific_consent" | "extra_declined";
export type DWorkshop = "pending" | "one_hour_yes" | "no" | "lapsed";
export type FEditor = "unassigned" | "named";
export type HYFactCheck = "avoided" | "direct";
export type PlayerReport = "reliable" | "uncertain_corrected" | "false_unrepaired";
export type PublicBlame = "none" | "repaired" | "unrepaired";

export type Day24Outcome = "JOINT_RETRY" | "SOLO_TRIAL" | "PAUSE" | "SPLIT";

export type Day11Phase = "morning" | "afternoon" | "done";

export interface NewLife30State {
  day: number; // 1-30
  day11Phase: Day11Phase;
  signVersion: SignVersion;
  pickupPlan: PickupPlan;
  mSeats: MSeats;
  jWork: JWork;
  dWorkshop: DWorkshop;
  fEditor: FEditor;
  hyFactCheck: HYFactCheck;
  playerReport: PlayerReport;
  publicBlame: PublicBlame;
  /** Set by warm encouragement without securing any concrete role (keeps Hina attached to the joint idea without enabling it — see NEWLIFE_30DAY_CHARACTER_DERIVED_PLAYABLE_V3.md §2 "たくさん励まされたからという理由だけでJOINT_RETRYにしない"). */
  encouragementOnly: boolean;
  day24Outcome: Day24Outcome | null;
  /** Append-only evidence trail: (day, actionId) pairs actually taken. GM-only; never shown raw to the player. */
  log: string[];
  finished: boolean;
}

export interface DayOption {
  id: string;
  label: string;
}

export interface DayScene {
  day: number;
  phase?: "morning" | "afternoon";
  title: string;
  text: string;
  npcsPresent: NpcId[];
  options: DayOption[];
  /**
   * Days 2/3/7/9 low-engagement mitigation (Phase 26 audit finding, §5): a short,
   * optional, single-word-answerable line addressed directly to a silent player,
   * so a brief/quiet playthrough still gets one concrete hook on these days
   * without forcing engagement or turning the NPC into a customer-service bot.
   */
  lowEngagementHook?: string;
}
