/**
 * PHASE_22 vertical slice -- all scripted (non-AI) text for Day 1 + Day 2, per
 * `docs/product/NEWLIFE_DAY1_DAY2_EVENT_SPEC_V1.md` and `NEWLIFE_DAY1_DAY2_FLOW_V1.md`. Every line
 * here is deterministic and system-owned; the AI (when live) only ever adds the free-talk reply on
 * top of this, never rewrites it (Section 32/PHASE_18-19's boundary, unchanged by this slice).
 */
import type { Core7DayState } from "./types";

export function arrivalOrMorningLine(state: Core7DayState): string {
  if (state.day === 1) {
    return "運び込んだ荷物はまだ半分も片付いていない。今日から、この町での暮らしが始まる。";
  }
  return "二日目の朝。昨日と同じ部屋なのに、少しだけ町に馴染んだ気がする。";
}

/**
 * PHASE_22_5 -- "残り行動があるのに『明日』と出る時間表現修正". Shown at TRIAL_HOUSE when the
 * player still has at least one action left today (`0 < actionsUsedToday < ACTIONS_PER_DAY`) --
 * distinct from `eveningLine`, which is reserved for when the day's budget is actually spent.
 * Reflects on whichever location was visited most recently without any "tomorrow"/"today is done"
 * framing, since the day plainly is not done yet.
 */
export function midDayLine(state: Core7DayState): string {
  const lastVisited = state.visitedToday[state.visitedToday.length - 1];
  if (lastVisited === "YOHEI_STORE") {
    return "洋平商店の様子を見てきた。まだ今日は動けそうだ。";
  }
  if (lastVisited === "SHOPPING_STREET") {
    return "陽菜さんの店の様子を見てきた。まだ今日は動けそうだ。";
  }
  return "まだ今日は動けそうだ。";
}

export function eveningLine(state: Core7DayState): string {
  const sawYohei = state.visitedToday.includes("YOHEI_STORE");
  const sawHina = state.visitedToday.includes("SHOPPING_STREET");
  if (state.day === 1) {
    if (sawYohei && state.keptEyeOutForDelivery) {
      return "洋平商店の荷物、明日には届くだろうか。少し気になりながら、今日は休むことにした。";
    }
    if (sawYohei) {
      return "洋平商店の荷物はまだ届いていなかった。明日はどうなっているだろう。";
    }
    if (sawHina) {
      return "陽菜さんの店、少しずつ形になってきている。明日はどんな一日になるだろう。";
    }
    return "特に何をしたわけでもないが、今日一日でこの町の輪郭が少しだけ見えた気がする。";
  }
  if (sawYohei && sawHina) {
    return "今日は二人と顔を合わせた。この町での二日目が、静かに終わっていく。";
  }
  if (sawYohei) {
    return "配達のことも片付いて、洋平商店はいつも通りに戻っていた。今日はそれで十分な気がした。";
  }
  if (sawHina) {
    return "陽菜さんの店は、また少し準備が進んでいた。今日はそれを見られただけで十分だった。";
  }
  return "今日はどこにも寄らなかった。それでも、町はいつも通り動いていたはずだ。";
}

export function yoheiOpeningLine(state: Core7DayState): string {
  if (state.day === 1) {
    return "洋平はちらっとこちらを見て、軽く頷いた。「おう。……今朝来るはずの荷物が、まだ届いてなくてな」";
  }
  if (state.keptEyeOutForDelivery === true) {
    return "洋平は箱を一つ棚に置きながら言った。「おう、お前が気にしてくれてたやつ、届いたよ」";
  }
  return "洋平は棚に並んだ箱を指した。「さっきの荷物、さっき届いたよ。もう片付いた」";
}

export const YOHEI_AMBIENT_LINE_DAY1 = "店の隅に、空の台車が置かれたままになっている。配達を待っているようだ。";
export const YOHEI_AMBIENT_LINE_DAY2 = "昨日まで空だった棚に、届いたばかりの箱が積まれている。";

export function hinaOpeningLine(state: Core7DayState): string {
  if (state.day === 1) {
    return "陽菜は棚を拭く手を止めて顔を上げた。「あ、こんにちは。……すみません、まだ全然片付いてなくて」";
  }
  if (!state.firstTimeAtCurrentLocation) {
    return "陽菜は顔を上げて、少し嬉しそうに言った。「あ、また来てくれたんですね。……見てください、棚、少し進んだんです」";
  }
  return "陽菜は棚の位置を確かめながら言った。「昨日より少しだけ、形になってきた気がします」";
}

/** PHASE_22_5 -- "Day2陽菜の世界変化文をDay1と変える": Day 1's ambient line described the shop as
 *  not-yet-open; Day 2's must show it has moved forward since, mirroring Yohei's own
 *  DAY1/DAY2 ambient-line split above (this was previously a single, day-independent constant --
 *  the exact staleness the player review's Q4/raw evidence screenshot 11 flagged). */
export const HINA_AMBIENT_LINE_DAY1 = "棚には商品がまだ半分も並んでいない。開店はもう少し先のようだ。";
export const HINA_AMBIENT_LINE_DAY2 = "棚には、焼き菓子の型がいくつか並び始めている。昨日より、少しだけ店らしくなってきた。";

export const YOHEI_BUY_RESULT = "洋平は野菜をいくつか袋に入れて渡した。「まいど。安いもんだけどな」";
export const YOHEI_KEEP_EYE_OUT_RESULT = "「分かった、気にかけとくよ」と言うと、洋平は少し意外そうな顔をした。「……そうか、悪いな」";
export const YOHEI_FAREWELL = "洋平は片手を挙げた。「おう、また来いよ」";

export const HINA_WATCH_RESULT = "棚には、焼き菓子の型がいくつか並べられていた。まだ商品はないが、少しずつ形になっているのが分かる。";
export const HINA_HELP_RESULT = "重い箱をひとつ運ぶのを手伝うと、陽菜は少し驚いた顔をしてから、「……ありがとうございます」と言った。";
export const HINA_FAREWELL = "陽菜は軽く頭を下げた。「また来てくださいね」";

export const TEMP_HOME_LABEL = "仮住まい";
export const YOHEI_STORE_LABEL = "洋平商店";
export const SHOPPING_STREET_LABEL = "商店街";

/** PHASE_22_5 -- "『体験版はここで終わりです』を削除": the previous line spoke as the product
 *  ("trial version") rather than the story -- the one moment the player review's Q9 flagged as
 *  breaking the fiction. This line stays entirely in-world and does not promise or imply Day 3. */
export const SLICE_END_LINE = "二日目が終わった。この町での暮らしは、まだ始まったばかりだ。";

/** PHASE_22_5 -- "買い物に実ゲーム状態を持たせる": a plain, checkable readout of `money`/
 *  `boughtItems`, shown at the home screen so the consequence of a purchase is visible without
 *  having to revisit the shop to remember it happened. */
export function moneyStatusLine(money: number, boughtItems: string[]): string {
  if (boughtItems.length === 0) return `所持金: ¥${money}`;
  const counts = new Map<string, number>();
  for (const item of boughtItems) counts.set(item, (counts.get(item) ?? 0) + 1);
  const itemsText = Array.from(counts.entries())
    .map(([label, count]) => `${label}×${count}`)
    .join("、");
  return `所持金: ¥${money} ｜ 持ち物: ${itemsText}`;
}
