/**
 * NEW LIFE CORE REDESIGN V1 / PHASE_12_4_NEW_LIFE_WORLD_DEPTH_AND_CONVERSATION_QUALITY_V1 --
 * authored (not AI-generated) world-event seeds, triggered by time, not guaranteed to be witnessed
 * by the player (directive Section 6/18). Called once per time-advance with the state BEFORE and
 * AFTER the advance, so an event whose trigger time falls inside the elapsed window fires exactly
 * once even if the player's action skipped past it. Despite the filename (kept for import-path
 * stability -- renaming would touch every caller for no functional gain), these rules run on every
 * day, not just DAY1; several are gated on `state.day` specifically so the town visibly isn't
 * identical on day 3 as it was on day 1 (directive Section 8).
 */
import type { CoreState } from "../types";

export function resolveWorldEvents(prevTime: number, state: CoreState): CoreState {
  let next = state;

  // Yohei's stockroom shelf gives out and he phones Jin -- an NPC-NPC interaction that happens
  // whether or not the player is at either location to see it (directive Section 6/5).
  // Must match schedule.ts's npcLocationAt/npcAvailabilityAt override window exactly (11:30-13:30)
  // -- a mismatch here previously left a 15-minute gap where the "call already happened" world
  // fact existed but Jin had not actually relocated yet.
  const JIN_CALL_TIME = 11 * 60 + 30;
  const JIN_LEAVES_TIME = 13 * 60 + 30;
  if (!next.flags.jinCalledToYohei && prevTime < JIN_CALL_TIME && next.time >= JIN_CALL_TIME) {
    next = {
      ...next,
      flags: { ...next.flags, jinCalledToYohei: true },
      worldFacts: [
        ...next.worldFacts,
        { id: "jin_called_to_yohei", day: next.day, time: JIN_CALL_TIME, text: "洋平が棚の修理を相馬に頼んだ", knownBy: ["yohei", "jin"], category: "promise" },
      ],
    };
  }

  // If the player never joined in (or wasn't there) while Jin was actually at the store
  // (11:30-13:30, the same window schedule.ts overrides his location for), the two of them finish
  // the job without the player regardless -- directive Section 20: the world resolves whether or
  // not the player witnessed it; other content only ever learns this as a trace afterward, never
  // as an announcement. `shelfFixedWithPlayer` stays false so that trace reads differently from
  // the player's own hands-on result text.
  if (!next.flags.shelfFixed && next.flags.jinCalledToYohei && prevTime < JIN_LEAVES_TIME && next.time >= JIN_LEAVES_TIME) {
    next = {
      ...next,
      flags: { ...next.flags, shelfFixed: true, shelfFixedWithPlayer: false },
      worldFacts: [
        ...next.worldFacts,
        { id: "shelf_fixed_without_player", day: next.day, time: JIN_LEAVES_TIME, text: "相馬が洋平の店の棚を直していった", knownBy: ["yohei", "jin"], category: "pending_task" },
      ],
    };
  }

  // A short rain -- pure ambience/texture, not gating anything mechanically. Directive's own
  // examples ("雨が降って予定を変える") are about texture, not a hard blocker for a DAY1 slice.
  const RAIN_START = 14 * 60 + 30;
  const RAIN_END = 15 * 60 + 30;
  if (!next.flags.rainHappened && prevTime < RAIN_START && next.time >= RAIN_START) {
    next = { ...next, flags: { ...next.flags, rainHappened: true, isRaining: true } };
  }
  if (next.flags.isRaining && next.time >= RAIN_END) {
    next = { ...next, flags: { ...next.flags, isRaining: false } };
  }

  // PHASE_12_4 Section 6/7 -- a SECOND, independent NPC<->NPC unseen-event thread, proving the
  // pattern generalizes beyond the original shelf case. Fumiko asks Jin to fix the community hall
  // bench; this always resolves without the player (no "help" action exists for it, unlike the
  // shelf) -- directive's own example for this section is explicitly a player-absent case. Gated on
  // `state.day >= 2` rather than a specific day number so it fires the first time the player reaches
  // a second day and crosses the trigger time that day, not tied to an exact calendar position.
  const BENCH_ASK_TIME = 9 * 60 + 30;
  const BENCH_FIX_TIME = 14 * 60;
  if (next.day >= 2 && !next.flags.fumikoAskedJin && prevTime < BENCH_ASK_TIME && next.time >= BENCH_ASK_TIME) {
    next = {
      ...next,
      flags: { ...next.flags, fumikoAskedJin: true },
      worldFacts: [
        ...next.worldFacts,
        { id: "fumiko_asked_jin_bench", day: next.day, time: BENCH_ASK_TIME, text: "文子が集会所のベンチの修理を相馬に頼んだ", knownBy: ["jin", "fumiko"], category: "promise" },
      ],
    };
  }
  if (next.flags.fumikoAskedJin && !next.flags.benchFixed && prevTime < BENCH_FIX_TIME && next.time >= BENCH_FIX_TIME) {
    next = {
      ...next,
      flags: { ...next.flags, benchFixed: true },
      worldFacts: [
        ...next.worldFacts,
        { id: "bench_fixed", day: next.day, time: BENCH_FIX_TIME, text: "相馬が集会所のベンチを直していった", knownBy: ["jin", "fumiko"], category: "pending_task" },
      ],
    };
  }

  // PHASE_12_4 Section 4/8 -- Hina's shop opens on day 3, independent of the player (she has been
  // "preparing" since day 1/2 -- content/day1.ts's SHOPPING_STREET branch shows that progression
  // visually even before this fires). `flags.hinaShopOpen` is also what schedule.ts's
  // npcLocationAt/npcAvailabilityAt check to decide whether she's reachable at all.
  const SHOP_OPEN_TIME = 9 * 60;
  if (next.day >= 3 && !next.flags.hinaShopOpen && prevTime < SHOP_OPEN_TIME && next.time >= SHOP_OPEN_TIME) {
    next = {
      ...next,
      flags: { ...next.flags, hinaShopOpen: true },
      worldFacts: [
        ...next.worldFacts,
        { id: "hina_shop_open", day: next.day, time: SHOP_OPEN_TIME, text: "商店街の空き店舗に、新しい店（陽菜のパン屋）が開いた", knownBy: ["yohei", "miyoko"], category: "world_change" },
      ],
    };
  }

  return next;
}
