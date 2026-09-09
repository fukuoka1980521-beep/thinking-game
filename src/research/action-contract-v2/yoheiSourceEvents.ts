/**
 * PHASE 11.11: single source of truth for NPC-initiated request meaning. Directive Section 5's
 * explicit requirement -- `PendingReply.sourceEventId` stores only an id; every later semantic
 * resolution (the ASK_WHAT packet, the authoring-sufficiency gate, the Action Contract that
 * resolves the request) reads through `resolveYoheiSourceEvent` below. No second,
 * independently-authored copy of a request's meaning exists anywhere in this module.
 *
 * PHASE 11.10's own finding: PLAYER-HIDDEN != WORLD-UNDEFINED. PLAYER not yet knowing the subject
 * is ordinary; the authoritative world not knowing it is a specification failure. This registry is
 * what makes "the world knows" concretely checkable, without any new PendingReply field --
 * `sourceEventId` (already existing since PHASE 11.8) is sufficient once authored specifically per
 * scenario instead of reused generically.
 */

export interface AuthoritativeSourceEvent {
  id: string;
  actor: "yohei";
  /** Why the NPC wants this, in his own terms -- not shown to PLAYER directly. */
  purpose: string;
  /** The concrete answer to "what do you want help with?" -- this is what ASK_WHAT reveals. */
  requestSubject: string;
  /** The LifeMaterial id that becomes ACTIVE once the request is actually satisfied -- the SAME id
   *  both the resolving Action Contract creates and any later eligibility gate checks (Single
   *  Precondition Authority, unchanged since PHASE 11.6R). */
  satisfyingMaterialId: string;
  /** Supporting context, ISOLATED_SCENE_FIXTURE-marked where not already-canonical (see
   *  PLAYABLE_SCENE_SPEC_V1.md) -- legitimate content Yohei may reference. */
  context: string[];
}

const YOHEI_SOURCE_EVENTS: Record<string, AuthoritativeSourceEvent> = {
  YOHEI_ASKS_HELP_MOVE_LEFTOVER_STOCK: {
    id: "YOHEI_ASKS_HELP_MOVE_LEFTOVER_STOCK",
    actor: "yohei",
    purpose: "祭りの残りの手ぬぐいを、値引き用の陳列スペースへ移したい",
    requestSubject: "祭りの残りの手ぬぐいが入った箱を、店先から値引き用の陳列スペースまで運ぶ",
    satisfyingMaterialId: "leftover_stock_moved",
    context: [
      "ISOLATED_SCENE_FIXTURE: 祭りで売れ残った手ぬぐいの箱が、まだ店先に置かれたままになっている",
    ],
  },
};

/** The ONLY function permitted to resolve a sourceEventId's meaning -- never re-derived
 *  independently elsewhere in this scene's code (directive Section 5). */
export function resolveYoheiSourceEvent(sourceEventId: string): AuthoritativeSourceEvent | undefined {
  return YOHEI_SOURCE_EVENTS[sourceEventId];
}

export interface AuthoringSufficiencyResult {
  sufficient: boolean;
  reason: string;
}

/** Directive Section 6's authoring gate. Fails closed -- a PendingReply may only be opened for this
 *  scene if this returns `sufficient: true`. Never calls or references any LLM/language adapter. */
export function authoringSufficiencyGate(sourceEventId: string): AuthoringSufficiencyResult {
  const event = resolveYoheiSourceEvent(sourceEventId);
  if (!event) {
    return { sufficient: false, reason: `SPECIFICATION_FAILURE: no authoritative source event registered for "${sourceEventId}"` };
  }
  if (!event.requestSubject || !event.satisfyingMaterialId) {
    return { sufficient: false, reason: `SPECIFICATION_FAILURE: source event "${sourceEventId}" is missing requestSubject or satisfyingMaterialId` };
  }
  return { sufficient: true, reason: "OK" };
}
