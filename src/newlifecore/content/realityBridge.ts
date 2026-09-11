/**
 * PHASE_12_3_NEW_LIFE_WORLD_AND_THINKING_RESIDENT_V1 Section H -- the Reality Bridge Loop's
 * content layer. Deliberately separate from the "did the model use listen/reflect/question/
 * reframe/suggest" question (Section I) -- that lives in the live prompt only (directive Section G)
 * and is NOT reliably derivable from state alone, so this file does not attempt to classify it.
 * What lives here is only what can be decided deterministically, client-side, without another
 * model call: (a) whether a player's own free-text turn reads as a real-life concern worth
 * *offering* the bridge for, and (b) the scripted, non-judgmental beats around creating/checking in
 * a RealWorldIntent -- same pattern as Kamiya's intake form (a short scripted line, then the live
 * model picks up the actual nuance in free conversation once it knows the fact).
 */
import type { RealWorldIntent, UserUpdateResponse } from "../types";

/**
 * Heuristic, not a diagnosis, and NOT semantic understanding -- a keyword offer trigger only. This
 * only decides whether to SHOW an optional offer button; it never creates a RealWorldIntent by
 * itself, and getting it wrong in either direction is low-stakes (a missed offer costs nothing, an
 * unwanted offer is just as easy to dismiss as any other choice -- directive Section H: "現実行動を
 * 強制しない").
 *
 * PHASE_12_4 Section 12's own 12-case live test found concrete misses in the original list
 * (断れない/イライラ/辞めるか迷う were all real concerns that got no offer at all) -- expanded from
 * that evidence, not speculatively. A LATER false-positive pass (Section D of the same directive,
 * 12 ordinary-small-talk phrases) found bare "迷って" alone matched 4/12 -- "which way to walk",
 * "what to eat", "whether to get a haircut", "whether to leave town" all triggered the offer just
 * for containing ANY indecision, not personal-growth indecision specifically. Removed it (and the
 * separately-redundant "言いたいことがある") because the one case each was added FOR is already
 * covered independently by another pattern already in this list (辞めるか handles "仕事を辞めるか
 * どうか迷ってます"; 言えな handles "上司に言いたいことがあるけど言えなくて") -- this is narrowing
 * for evidenced precision, not the "keep adding words forever" pattern the directive warns against.
 * Two known remaining false-positive sources are KEPT deliberately because they are each the only
 * thing catching a real Section 12 case with no cheaper alternative: イライラ (needed for "最近なんか
 * イライラすることが多くて") also matches "昨日の試合はイライラしたな"; 続かな (needed for "運動
 * しようと思ってるけど全然続かない", which does NOT contain "運動しない"/"運動してない" as a
 * contiguous substring so the more specific 運動して?ない pattern alone misses it) also matches
 * "この商品続かないね". See the CLOSE report for the measured false-positive rate.
 */
const REAL_LIFE_CONCERN_RE =
  /先延ばし|言えな|気まず|運動して?ない|できてない|できていない|やらなきゃ|やらないと|やれてない|やれていない|悩んで|不安|疲れて|伝えられ|怒られ|喧嘩|揉めて|自信がな|向き合え|変わりたい|続かな|続けられな|断れな|イライラ|辞めるか|やりたいことが分から|やりたいことが正直/;

export function looksLikeRealLifeConcern(playerText: string): boolean {
  return REAL_LIFE_CONCERN_RE.test(playerText);
}

export const USER_UPDATE_OPTIONS: { value: UserUpdateResponse; label: string }[] = [
  { value: "did_it", label: "やってみた" },
  { value: "did_not", label: "やらなかった" },
  { value: "partially", label: "少しだけやった" },
  { value: "changed", label: "状況が変わった" },
  { value: "undecided", label: "まだ決めていない" },
  { value: "other", label: "自由記述" },
];

/** Directive Section H: shown right after the player confirms creating the intent. Deliberately
 *  flat/non-cheerleading -- no "頑張って!", no congratulation, matching Daisuke's own established
 *  register (short, not effusive) and the broader "AI依存を促さない" / no praise-as-reward
 *  discipline already established elsewhere in this project. */
export function daisukeIntentConfirmReaction(): string {
  return "大輔は軽く頷いた。「そうか。……まあ、無理しない範囲でな」";
}

/** Directive Section H: the return visit's opening beat, shown once the check-in panel opens --
 *  references the ORIGINAL intent by the player's own words, never a summary/diagnosis of it. */
export function daisukeCheckInPrompt(intent: RealWorldIntent): string {
  return `大輔は鏡越しにちらっと見た。「そういえば……前に言ってた「${intent.intentLabel}」、その後どうだった？」`;
}

/** Directive Section H: the scripted beat right after the player answers -- deliberately the SAME
 *  neutral line regardless of which of the 6 categories was picked (no success/failure framing;
 *  ACTION_RESULT is explicitly not a thing this codebase computes). Any category-specific nuance is
 *  left to the live model's next free-text reply, which by then already knows the fact (via
 *  engine.ts's checkInRealWorldIntent -> addWorldFact, the same knowledge-boundary channel
 *  everything else uses). */
export function daisukeCheckInAcknowledgement(): string {
  return "大輔は小さく頷いた。「そうか」それだけ言って、また鋏を動かし始めた。";
}
