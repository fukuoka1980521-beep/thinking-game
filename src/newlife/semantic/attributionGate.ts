/**
 * Phase 25.2: attribution gate — deterministic "fact ownership" checks run on
 * a proposed NPC line BEFORE it may be displayed (wired in through
 * `truthGate.ts`'s `runTruthGate`, so `coordinator.ts` has one gate).
 *
 * CHECK 1  a quoted / past statement is attributed to the right speaker
 * CHECK 2  a past action is attributed to the right actor
 * CHECK 3  no permission is fabricated for someone who did not grant it
 * CHECK 4  a responsibility is not moved to another person without cause
 *
 * (CHECK 5 — the player's own free input having updated the ledger — is
 * `factLedger.ts`'s `ledgerReflectsUtterance`, enforced in the coordinator.)
 *
 * Deliberately mechanical: it only judges sentences that (a) touch a ledger
 * entry through that entry's `keys` (or a quoted phrase matching the entry's
 * text) AND (b) name a grammatical actor for a matching verb. A sentence the
 * ledger says nothing about is never rejected, so ordinary in-voice lines are
 * not affected (TEST-F). Negated claims ("私は言っていない") are not claims.
 * Like the rest of the truth gate it cannot prove a line is *natural*; it can
 * only refuse a line whose attribution contradicts the ledger.
 */
import { NPC_NAMES, type NpcId } from "../types";
import type { Actor, FactLedger } from "./factLedger";

export type AttributionViolationCode =
  | "quote_speaker_mismatch"
  | "action_actor_mismatch"
  | "fabricated_permission"
  | "responsibility_shift";

export interface AttributionViolation {
  code: AttributionViolationCode;
  detail: string;
}

const NAME_TOKENS = (Object.entries(NPC_NAMES) as [NpcId, string][]).map(([id, name]) => ({ id, name }));
const NAME_ALT = NAME_TOKENS.map((n) => n.name).join("|");
const SELF_ALT = "私|わたし|あたし|自分";
const YOU_ALT = "あなた|君|きみ|そちら|あんた";
// Optional honorific after a name.
const SUBJECT_SRC = `(?:${SELF_ALT}|${YOU_ALT}|(?:${NAME_ALT})(?:さん|ちゃん|くん|君)?)`;
const SUBJECT_G = new RegExp(`(${SELF_ALT}|${YOU_ALT}|(?:${NAME_ALT})(?:さん|ちゃん|くん|君)?)(が|は|も)`, "gu");
const SUBJECT_ONLY = new RegExp(`(${SELF_ALT}|${YOU_ALT}|(?:${NAME_ALT})(?:さん|ちゃん|くん|君)?)`, "u");

const SAY_VERBS = "言|話し|口に|約束|申し出|提案|誘っ";
const DID_VERBS = "出し|貼|据え|載せ|書い|作っ|決め|頼ん|断っ|渡し|直し|置い|用意|掲示し";
const RESP_VERBS = "します|しておき|担当|責任|引き受|受け持|やります|やる|直します|直しておき|訂正します|訂正しておき|説明します|説明しておき|対応します|持ちます|任せて";
const PERMIT_VERBS = "許可|了承|承諾|認め|OK|オーケー|いいと言|構わないと言";

const NEGATION_AFTER = /^[^、。]{0,6}?(ない|ません|なかった|ではなく|じゃなく|とは言|わけ)/;
const BELIEF_MARK = /思っ|思い込|勘違い|誤解|かと|のかも/;
const REQUEST_MARK = /[?？]|か[。!！]?$|てくれ|てもらえ|お願い|ください|ましょう/;

function norm(s: string): string {
  return s.normalize("NFKC");
}

/** Sentences split on 。！？ that are outside 「」『』 brackets; terminator kept. */
export function splitSentences(text: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of norm(text)) {
    cur += ch;
    if (ch === "「" || ch === "『") depth += 1;
    else if ((ch === "」" || ch === "』") && depth > 0) depth -= 1;
    else if (depth === 0 && /[。！？!?\n]/.test(ch)) {
      if (cur.trim()) out.push(cur.trim());
      cur = "";
    }
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

function extractQuotes(sentence: string): string[] {
  return [...sentence.matchAll(/[「『]([^」』]*)[」』]/gu)].map((m) => m[1]);
}

/** Replaces quoted content so a 私/あなた inside a quotation is not read as the sentence's own actor. */
function maskQuotes(sentence: string): string {
  return sentence.replace(/[「『][^」』]*[」』]/gu, "⟦Q⟧");
}

function resolveActor(token: string, npc: NpcId): Actor | null {
  if (new RegExp(`^(?:${SELF_ALT})$`, "u").test(token)) return npc;
  if (new RegExp(`^(?:${YOU_ALT})$`, "u").test(token)) return "player";
  const hit = NAME_TOKENS.find((n) => token.startsWith(n.name));
  return hit ? hit.id : null;
}

interface Claim {
  actor: Actor;
  negated: boolean;
}

/**
 * Actors the (quote-masked) sentence names as performing a verb from
 * `verbsSrc`. Two shapes: "<X>が…<verb>" and "<verb>…のは<X>".
 */
function claimsFor(masked: string, verbsSrc: string, npc: NpcId): Claim[] {
  const claims: Claim[] = [];
  const verbRe = new RegExp(`^[^。]{0,16}?(?:${verbsSrc})`, "u");
  for (const m of masked.matchAll(SUBJECT_G)) {
    const actor = resolveActor(m[1], npc);
    if (!actor) continue;
    const rest = masked.slice((m.index ?? 0) + m[0].length);
    const hit = verbRe.exec(rest);
    if (!hit) continue;
    claims.push({ actor, negated: NEGATION_AFTER.test(rest.slice(hit[0].length)) });
  }
  const reverse = new RegExp(`(?:${verbsSrc})[^、。]{0,6}?(?:のは|人は)、?(${SUBJECT_SRC})(?!じゃ|では|でなく)`, "gu");
  for (const m of masked.matchAll(reverse)) {
    const tok = SUBJECT_ONLY.exec(m[1]);
    const actor = tok ? resolveActor(tok[1], npc) : null;
    if (actor) claims.push({ actor, negated: false });
  }
  return claims;
}

function touches(sentence: string, quotes: string[], entry: { text: string; keys: string[] }): boolean {
  const s = norm(sentence);
  if (entry.keys.some((k) => k && s.includes(norm(k)))) return true;
  const text = norm(entry.text);
  return quotes.some((q) => {
    const nq = norm(q);
    return nq.length >= 5 && (text.includes(nq) || nq.includes(text));
  });
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Does the sentence REPORT the entry as something said/offered (as opposed to
 * merely using the same words in the NPC's own sentence, e.g. 美代子's own
 * 「私が手伝えることがあれば言ってね」)? True when the phrase is quoted /
 * matches a quote, or its key is followed by a quotative と・って + a saying
 * verb, or by 申し出/提案/約束.
 */
function reportsAsSaid(sentence: string, quotes: string[], entry: { text: string; keys: string[] }): boolean {
  const s = norm(sentence);
  const text = norm(entry.text);
  if (quotes.some((q) => norm(q).length >= 5 && (text.includes(norm(q)) || norm(q).includes(text)))) return true;
  if (quotes.some((q) => entry.keys.some((k) => k && norm(q).includes(norm(k))))) return true;
  return entry.keys.some((k) => {
    if (!k) return false;
    const key = escapeRe(norm(k));
    return (
      new RegExp(`${key}[^。、]{0,14}?(?<![こひ])(?:と|って)(?:は)?(?:一言も|確かに)?(?:${SAY_VERBS})`, "u").test(s) ||
      new RegExp(`${key}[^。、]{0,6}?(?:申し出|提案|約束)`, "u").test(s)
    );
  });
}

function actorLabel(a: Actor): string {
  return a === "player" ? "player" : a;
}

export function checkAttribution(response: string, npc: NpcId, ledger: FactLedger | undefined): AttributionViolation[] {
  if (!ledger) return [];
  const violations: AttributionViolation[] = [];

  const sentences = splitSentences(response);
  for (const [si, sentence] of sentences.entries()) {
    const quotes = extractQuotes(sentence);
    const masked = maskQuotes(sentence);

    // CHECK 1: quoted / past statements and offers ↔ speaker.
    const sayClaims = claimsFor(masked, SAY_VERBS, npc).filter((c) => !c.negated);
    if (sayClaims.length > 0) {
      for (const entry of [...ledger.facts.filter((f) => f.kind === "said"), ...ledger.offers]) {
        if (!reportsAsSaid(sentence, quotes, entry)) continue;
        if (sayClaims.some((c) => c.actor === entry.actor)) continue;
        violations.push({
          code: "quote_speaker_mismatch",
          detail: `「${entry.text}」を言ったのは${actorLabel(entry.actor)}だが、${sayClaims.map((c) => actorLabel(c.actor)).join("/")}の発言として扱っている`,
        });
      }
    }

    // CHECK 2: past actions ↔ actor.
    const didClaims = claimsFor(masked, DID_VERBS, npc).filter((c) => !c.negated);
    if (didClaims.length > 0) {
      for (const entry of ledger.facts.filter((f) => f.kind === "did")) {
        if (!touches(sentence, [], entry)) continue;
        if (didClaims.some((c) => c.actor === entry.actor)) continue;
        violations.push({
          code: "action_actor_mismatch",
          detail: `「${entry.text}」をしたのは${actorLabel(entry.actor)}だが、${didClaims.map((c) => actorLabel(c.actor)).join("/")}の行動として扱っている`,
        });
      }
    }

    // CHECK 3: fabricated permission (someone approving what the ledger says they did not).
    if (!BELIEF_MARK.test(sentence)) {
      const permitClaims: Claim[] = claimsFor(masked, PERMIT_VERBS, npc).filter((c) => !c.negated);
      const permitNoun = new RegExp(`(${NAME_ALT})(?:さん|ちゃん|くん|君)?の(?:${PERMIT_VERBS})[^。]{0,8}?(?:もらっ|得|取れ|済|出て|ある|あっ)`, "u").exec(masked);
      // The approver and the thing approved often sit in adjacent sentences
      // ("美代子さんの許可はもらっています。待合の件です。"), so the subject may
      // be matched in the neighbouring sentences too.
      const context = sentences.slice(Math.max(0, si - 1), si + 2).join("");
      // "…いいと私が言った" (approval verb after the subject).
      const reversedPermit = [...masked.matchAll(new RegExp(`(?:いい|よい|構わない|OK|オーケー)と(${SUBJECT_SRC})(?:が|は)言`, "gu"))]
        .map((m) => SUBJECT_ONLY.exec(m[1])?.[1])
        .flatMap((tok) => {
          const a = tok ? resolveActor(tok, npc) : null;
          return a ? [{ actor: a, negated: false }] : [];
        });
      permitClaims.push(...reversedPermit);
      for (const perm of ledger.permissions) {
        if (perm.granted || !touches(context, quotes, { text: perm.subject, keys: perm.keys })) continue;
        const claimedBy = permitClaims.filter((c) => c.actor === perm.owner);
        const viaNoun = permitNoun && NAME_TOKENS.find((n) => n.name === permitNoun[1])?.id === perm.owner;
        if (claimedBy.length > 0 || viaNoun) {
          violations.push({
            code: "fabricated_permission",
            detail: `${perm.owner}は「${perm.subject}」を許可していないのに、許可した前提になっている`,
          });
        }
      }
    }

    // CHECK 4: responsibility moved to someone who does not own it.
    if (!REQUEST_MARK.test(sentence) && !/手伝/.test(sentence)) {
      const respClaims = claimsFor(masked, RESP_VERBS, npc).filter((c) => !c.negated);
      const ownerLike = new RegExp(`(${SUBJECT_SRC})の(?:担当|責任)`, "u").exec(masked);
      const claimed: Actor[] = respClaims.map((c) => c.actor);
      if (ownerLike) {
        const a = resolveActor(SUBJECT_ONLY.exec(ownerLike[1])?.[1] ?? "", npc);
        if (a) claimed.push(a);
      }
      if (claimed.length > 0) {
        for (const resp of ledger.responsibilities) {
          if (!touches(sentence, quotes, { text: resp.task, keys: resp.keys })) continue;
          if (claimed.includes(resp.owner)) continue;
          violations.push({
            code: "responsibility_shift",
            detail: `「${resp.task}」の責任主体は${actorLabel(resp.owner)}だが、${claimed.map(actorLabel).join("/")}に移っている`,
          });
        }
      }
    }
  }
  return violations;
}
