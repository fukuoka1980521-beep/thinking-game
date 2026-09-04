/**
 * 探偵's lines for "もう一台の自転車" (PHASE 4.4). Deterministic only -- see PHASE 4.3's
 * known-weaknesses note; real-AI wiring is still out of scope for this external-test candidate.
 * Every line is short (<=2 sentences) and reacts to what actually happened -- never a
 * summary/paraphrase of the player's own words.
 */
import type { PredictionChoice } from "./types";

export const LINE_OJISAN_JUMPS_TO_THEFT = "こ、こりゃ泥棒だ！";
export const LINE_DETECTIVE_SLOWS_HIM_DOWN = "まだ分からないだろ、それは。";
export const LINE_BIKE_FOUND = "似てるな……でも、よく見ると微妙に違う。ペダルの色とか。";
export const LINE_BOOK_FOUND = "図書館の貸出シールだ。返却期限、今日じゃないか。";
export const LINE_STICKER_FOUND = "こんなシール、子供が貼ったのかな。";
export const LINE_AFTER_SHOPKEEPER = "同じ型がよく出回ってるのか。じゃあ、盗みってわけでもなさそうだな。";
export const LINE_BEFORE_PREDICTION = "誰か来るぞ。さて、気づいたらどう出るかな。";

/**
 * Section12/13 fix: the reaction compares the player's prediction against what actually
 * happened, never labels it right/wrong, and never changes the underlying truth (the owner
 * always ends up noticing and apologizing -- only 探偵's framing of the moment changes).
 *
 * PHASE 4.5 Owner audit fix: this line must render only AFTER the parent has already spoken
 * their own apology (Case1CApp's REVEAL screen order) -- 探偵 reacting to a moment the player
 * has not seen yet ("すぐにあやまってきたな" landing before the apology text) was flagged as
 * the detective understanding the truth ahead of the player. Wording here now assumes the
 * apology has already been read, so it reads as a callback/reaction, not a spoiler.
 */
export function detectiveReactionToPrediction(choice: PredictionChoice): string {
  switch (choice) {
    case "bow":
      return "思った通り、頭を下げたな。";
    case "grab":
      return "持っていこうとしたな……でも、すぐ気づいたみたいだ。";
    case "freeze":
      return "固まるかと思ったが、案外すぐ謝ってきたな。";
  }
}
