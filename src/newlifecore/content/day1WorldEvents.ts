/**
 * NEW LIFE CORE REDESIGN V1 -- DAY1 world event seeds (directive Section 18). Authored, not
 * AI-generated; triggered by time, not guaranteed to be witnessed by the player. Called once per
 * time-advance with the state BEFORE and AFTER the advance, so an event whose trigger time falls
 * inside the elapsed window fires exactly once even if the player's action skipped past it.
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
        { id: "jin_called_to_yohei", time: JIN_CALL_TIME, text: "洋平が棚の修理を相馬に頼んだ", knownBy: ["yohei", "jin"] },
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
      worldFacts: [...next.worldFacts, { id: "shelf_fixed_without_player", time: JIN_LEAVES_TIME, text: "相馬が洋平の店の棚を直していった", knownBy: ["yohei", "jin"] }],
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

  return next;
}
