/**
 * PHASE_12_3_NEW_LIFE_WORLD_AND_THINKING_RESIDENT_V1 Section J -- a deterministic, client-side
 * gate checked BEFORE any adapter (live or deterministic) is ever called, for EVERY NPC's free
 * text, not only Daisuke's. A serious self-harm/harm-to-others/crisis signal never reaches an NPC
 * "in character" -- no NPC in this game is written or allowed to act as a medical/crisis
 * professional (directive: "ゲームNPCが万能な専門家であるかのような表現は禁止"). This is a fixed,
 * out-of-character message, not a generated one -- nothing here is ever produced by the live model,
 * so its wording can be reviewed and trusted directly rather than depending on generation quality.
 *
 * Deliberately conservative (favors false positives): missing a real signal is a much worse outcome
 * than occasionally interrupting an unrelated turn (e.g. someone quoting song lyrics). A false
 * positive costs the player one re-typed message; this is an acceptable, intentional trade-off.
 */
const CRISIS_RE =
  /死にたい|死のう|消えたい|自殺|自傷|リストカット|殺したい|殺してや|殺してしまいたい|生きてる意味がない|生きている意味がない|もう終わりにしたい|消えてしまいたい/;

export function detectsCrisisSignal(playerText: string): boolean {
  return CRISIS_RE.test(playerText);
}

/**
 * Deliberately breaks character/the fourth wall -- this is a system-level message, never voiced as
 * one of Daisuke's (or any NPC's) lines. 119 is Japan's real emergency number (fire/ambulance); no
 * other hotline name or number is asserted here, since getting a specific number wrong could cause
 * real harm -- general, verifiably-correct guidance only.
 */
export const SAFETY_ROUTE_MESSAGE =
  "（ここでゲームの外へ一度出ます）\n" +
  "今の内容は、このゲームの登場人物が扱えることの範囲を超えています。\n" +
  "もし今、自分や誰かを傷つけてしまいそうなときは、119番（消防・救急）への連絡や、" +
  "身近な信頼できる人、専門の相談窓口に連絡することを強くおすすめします。\n" +
  "この会話はここで止めています。";
