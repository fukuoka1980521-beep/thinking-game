/**
 * Phase 25.2: COMPACT FACT LEDGER — "who said / did / offered / permitted /
 * owns what" for NEW LIFE free conversation.
 *
 * Why this exists: before this module a live-semantic turn was stateless
 * (one utterance + a `FactsSnapshot`), so nothing stopped a generated NPC
 * line from moving a quote, an action, a permission or a responsibility from
 * one person to another mid-conversation (human test: the player's
 * 「何か手伝えることがあれば」 was later claimed as 美代子's own words).
 * The ledger is deliberately NOT a transcript. It is a few short, capped
 * lists of attributed facts:
 *
 *   facts            SAID / DID   — actor + short text
 *   offers           OFFERED / PROMISED — actor + short text
 *   permissions      PERMISSION   — owner + subject + granted(bool)
 *   responsibilities RESPONSIBILITY — owner + task
 *   unresolved       UNRESOLVED   — what is still open
 *
 * `keys` are the short surface fragments the attribution gate
 * (`attributionGate.ts`) uses to recognize that a sentence is talking about
 * an entry. Two provenances share one shape:
 *   - `state:*` ids are re-derived from `NewLife30State` on every sync
 *     (system owns truth; never accumulate stale copies);
 *   - `conv:*` ids come from the conversation (player free input) and are
 *     capped, oldest-first, so a long session cannot grow the payload.
 *
 * Pure functions only. Nothing here writes to `NewLife30State`.
 */
import type { NewLife30State, NpcId } from "../types";

export type Actor = NpcId | "player";

export interface LedgerFact {
  id: string;
  kind: "said" | "did";
  actor: Actor;
  text: string;
  keys: string[];
}
export interface LedgerOffer {
  id: string;
  actor: Actor;
  text: string;
  keys: string[];
}
export interface LedgerPermission {
  id: string;
  /** Whose permission this is (only this person can have granted it). */
  owner: NpcId;
  subject: string;
  keys: string[];
  granted: boolean;
}
export interface LedgerResponsibility {
  id: string;
  owner: Actor;
  task: string;
  keys: string[];
}
export interface LedgerUnresolved {
  id: string;
  text: string;
  keys: string[];
}

export interface FactLedger {
  facts: LedgerFact[];
  offers: LedgerOffer[];
  permissions: LedgerPermission[];
  responsibilities: LedgerResponsibility[];
  unresolved: LedgerUnresolved[];
}

export const LEDGER_MAX_ENTRIES = 10;
export const LEDGER_MAX_TEXT = 80;
export const LEDGER_MAX_KEYS = 5;
export const LEDGER_MAX_KEY = 20;

export function createEmptyLedger(): FactLedger {
  return { facts: [], offers: [], permissions: [], responsibilities: [], unresolved: [] };
}

function clip(text: string, max: number): string {
  const t = text.trim();
  return t.length > max ? t.slice(0, max) : t;
}

function cleanKeys(keys: string[]): string[] {
  return keys
    .map((k) => clip(k, LEDGER_MAX_KEY))
    .filter((k) => k.length > 0)
    .slice(0, LEDGER_MAX_KEYS);
}

/** Drops the oldest `conv:*` entries beyond the cap; `state:*` entries are re-derived and never evicted. */
function capConversation<T extends { id: string }>(list: T[]): T[] {
  const conv = list.filter((e) => e.id.startsWith("conv:"));
  if (conv.length <= LEDGER_MAX_ENTRIES) return list;
  const drop = new Set(conv.slice(0, conv.length - LEDGER_MAX_ENTRIES).map((e) => e.id));
  return list.filter((e) => !drop.has(e.id));
}

/** State-derived entries (canon: NEWLIFE_30DAY_CHARACTER_DERIVED_PLAYABLE_V3.md Day 3 "承諾したという文子の推測" vs 美代子's vague reply). */
function deriveFromState(state: NewLife30State): FactLedger {
  const ledger = createEmptyLedger();

  // 美代子 has never granted use of her café seats as a public waiting area
  // (`bounded` = four seats for her own customers; `assumed` = simply not
  // stated). Either way the permission is NOT granted.
  ledger.permissions.push({
    id: "state:perm:miyoko:waiting_area",
    owner: "miyoko",
    subject: "喫茶の席を待合として使わせる",
    keys: ["待合", "待機", "待つ場所", "席を待"],
    granted: false,
  });

  if (state.day >= 3) {
    ledger.facts.push({
      id: "state:did:fumiko:board",
      kind: "did",
      actor: "fumiko",
      text: "会館に掲示板を据えて日付入りの掲示を出した",
      keys: ["掲示板"],
    });
    ledger.facts.push({
      id: "state:said:fumiko:waiting",
      kind: "said",
      actor: "fumiko",
      text: "「人が待つなら助かる」と言った",
      keys: ["人が待つなら"],
    });
  }

  if (state.signVersion === "vague_uncorrected") {
    ledger.responsibilities.push({
      id: "state:resp:fumiko:sign_fix",
      owner: "fumiko",
      task: "掲示の訂正",
      keys: ["掲示"],
    });
    ledger.unresolved.push({ id: "state:open:sign_fix", text: "掲示の訂正", keys: ["掲示"] });
  }
  if (state.dWorkshop === "pending" && state.day >= 4) {
    ledger.responsibilities.push({
      id: "state:resp:daisuke:workshop",
      owner: "daisuke",
      task: "工房を貸すかの返事",
      keys: ["工房"],
    });
    ledger.unresolved.push({ id: "state:open:workshop", text: "工房を貸すかの返事", keys: ["工房"] });
  }
  if (state.pickupPlan === "time_split_owned_by_hina") {
    ledger.responsibilities.push({
      id: "state:resp:hina:pickup",
      owner: "hina",
      task: "予約の受取時間",
      keys: ["受取", "受け取り", "取り置き"],
    });
  }
  return ledger;
}

/**
 * Re-derives every `state:*` entry from the current canonical state and
 * keeps the conversation entries as they are. Idempotent.
 */
export function syncLedgerWithState(ledger: FactLedger, state: NewLife30State): FactLedger {
  const base = deriveFromState(state);
  const conv = <T extends { id: string }>(list: T[]) => list.filter((e) => !e.id.startsWith("state:"));
  return {
    facts: [...base.facts, ...conv(ledger.facts)],
    offers: [...base.offers, ...conv(ledger.offers)],
    permissions: [...base.permissions, ...conv(ledger.permissions)],
    responsibilities: [...base.responsibilities, ...conv(ledger.responsibilities)],
    unresolved: [...base.unresolved, ...conv(ledger.unresolved)],
  };
}

// ---------------------------------------------------------------------------
// Conversation-side writers (immutable). Each returns a new ledger.
// ---------------------------------------------------------------------------

let convCounter = 0;
function nextConvId(prefix: string): string {
  convCounter += 1;
  return `conv:${prefix}:${convCounter}`;
}

export function addFact(ledger: FactLedger, kind: "said" | "did", actor: Actor, text: string, keys: string[]): FactLedger {
  const entry: LedgerFact = { id: nextConvId(kind), kind, actor, text: clip(text, LEDGER_MAX_TEXT), keys: cleanKeys(keys) };
  return { ...ledger, facts: capConversation([...ledger.facts, entry]) };
}

export function addOffer(ledger: FactLedger, actor: Actor, text: string, keys: string[]): FactLedger {
  const clipped = clip(text, LEDGER_MAX_TEXT);
  if (ledger.offers.some((o) => o.actor === actor && o.text === clipped)) return ledger;
  const entry: LedgerOffer = { id: nextConvId("offer"), actor, text: clipped, keys: cleanKeys(keys) };
  return { ...ledger, offers: capConversation([...ledger.offers, entry]) };
}

export function setPermission(
  ledger: FactLedger,
  owner: NpcId,
  subject: string,
  keys: string[],
  granted: boolean,
): FactLedger {
  const entry: LedgerPermission = {
    id: nextConvId("perm"),
    owner,
    subject: clip(subject, LEDGER_MAX_TEXT),
    keys: cleanKeys(keys),
    granted,
  };
  return { ...ledger, permissions: capConversation([...ledger.permissions, entry]) };
}

export function addResponsibility(ledger: FactLedger, owner: Actor, task: string, keys: string[]): FactLedger {
  const entry: LedgerResponsibility = { id: nextConvId("resp"), owner, task: clip(task, LEDGER_MAX_TEXT), keys: cleanKeys(keys) };
  return { ...ledger, responsibilities: capConversation([...ledger.responsibilities, entry]) };
}

export function addUnresolved(ledger: FactLedger, text: string, keys: string[]): FactLedger {
  const entry: LedgerUnresolved = { id: nextConvId("open"), text: clip(text, LEDGER_MAX_TEXT), keys: cleanKeys(keys) };
  return { ...ledger, unresolved: capConversation([...ledger.unresolved, entry]) };
}

// ---------------------------------------------------------------------------
// Player free input → ledger (CHECK 5: the player's own proposal must update
// the fact state before the next NPC line is generated).
// ---------------------------------------------------------------------------

/**
 * A directed offer of help / promise from the player. Requests aimed at the
 * NPC ("手伝ってもらえますか") and questions about who said something ("誰が
 * 手伝えるって言った？") are excluded.
 */
const OFFER_HELP_RE =
  /(手伝(います|いましょうか|いましょう|おう|おうか|わせて|えます|えること|えれば|えたら|うよ|うね|う[。.!！]?$)|お手伝い(します|しましょうか)|力になれ|協力(します|しますよ|しましょうか))/;
const NOT_AN_OFFER_RE = /誰|だれ|言った|言いました|言ってた|って言/;

const TASK_NOUNS = ["説明", "掲示", "訂正", "片づけ", "片付け", "案内", "連絡", "お詫び", "謝"];

export function isOfferHelp(text: string): boolean {
  const t = text.normalize("NFKC").trim();
  return OFFER_HELP_RE.test(t) && !NOT_AN_OFFER_RE.test(t);
}

/** The concrete task named in an offer ("説明を手伝います" → "説明"), if any. */
export function offerTask(text: string): string | null {
  const t = text.normalize("NFKC");
  return TASK_NOUNS.find((n) => t.includes(n)) ?? null;
}

export function recordPlayerUtterance(ledger: FactLedger, text: string): FactLedger {
  if (!isOfferHelp(text)) return ledger;
  const task = offerTask(text);
  const keys = ["手伝", ...(task ? [task] : [])];
  return addOffer(ledger, "player", text.normalize("NFKC").trim(), keys);
}

/** CHECK 5 helper: true iff a player offer in `text` is already reflected in `ledger`. */
export function ledgerReflectsUtterance(ledger: FactLedger, text: string): boolean {
  if (!isOfferHelp(text)) return true;
  const clipped = clip(text.normalize("NFKC"), LEDGER_MAX_TEXT);
  return ledger.offers.some((o) => o.actor === "player" && o.text === clipped);
}

/** Hard per-list wire cap: every `state:*` entry (a handful) plus the newest conversation entries. */
export const LEDGER_MAX_WIRE = 16;

/** Wire form for the semantic endpoint: same shape, hard-capped (server re-validates). */
export function compactLedger(ledger: FactLedger): FactLedger {
  const cap = <T extends { id: string }>(list: T[]): T[] => {
    const state = list.filter((e) => e.id.startsWith("state:"));
    const conv = list.filter((e) => !e.id.startsWith("state:"));
    return [...state, ...conv.slice(-Math.max(0, LEDGER_MAX_WIRE - state.length))].slice(0, LEDGER_MAX_WIRE);
  };
  return {
    facts: cap(ledger.facts),
    offers: cap(ledger.offers),
    permissions: cap(ledger.permissions),
    responsibilities: cap(ledger.responsibilities),
    unresolved: cap(ledger.unresolved),
  };
}
