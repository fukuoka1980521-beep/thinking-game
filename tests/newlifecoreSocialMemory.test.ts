/**
 * PHASE_12_6_NEW_LIFE_RELATIONSHIP_CONSEQUENCE_AND_SOCIAL_MEMORY_V1 Section 24 -- unit tests for
 * the player<->NPC promise mechanic (engine.ts's acceptPlayerPromise/declinePlayerPromise, plus the
 * resolve/sweep hooks wired into recordConversationTurn/startNewDay) and the derived categorical
 * social-memory tags (content/socialMemory.ts). No test here ever asserts on a numeric
 * "score"/"affection"/"trust" value -- Section 3 bans that concept outright, and this suite
 * (Section 24's own "no score system" item) exists partly to keep it that way.
 */
import { describe, expect, it } from "vitest";
import {
  acceptPlayerPromise,
  declinePlayerPromise,
  recordConversationTurn,
  startNewDay,
} from "../src/newlifecore/engine";
import {
  computePlayerNpcTags,
  consecutiveMissedPromises,
  daysSinceLastMeeting,
  eligibleForNewInvitation,
  invitationLabelFor,
  pendingPromiseWith,
} from "../src/newlifecore/content/socialMemory";
import { buildNpcAiContext } from "../src/newlifecore/dialogue/contextBuilder";
import { createInitialCoreState } from "../src/newlifecore/types";
import type { CoreState } from "../src/newlifecore/types";

function metState(npc: "yohei" | "miyoko" | "jin" | "daisuke" | "hina" | "fumiko" | "kamiya", overrides: Partial<CoreState> = {}): CoreState {
  const s = createInitialCoreState();
  return { ...s, flags: { ...s.flags, [`met_${npc}`]: true }, ...overrides };
}

describe("PHASE_12_6 promise mechanic: creation", () => {
  it("accepting a promise creates a pending PlayerPromise with the exact authored label", () => {
    const s = metState("miyoko");
    const label = invitationLabelFor("miyoko");
    const next = acceptPlayerPromise(s, "miyoko", label);
    expect(next.playerPromises).toHaveLength(1);
    expect(next.playerPromises[0]).toMatchObject({ npc: "miyoko", label, status: "pending" });
  });

  it("declining a promise creates an already-resolved 'declined' entry, never 'pending'", () => {
    const s = metState("yohei");
    const next = declinePlayerPromise(s, "yohei", invitationLabelFor("yohei"));
    expect(next.playerPromises).toHaveLength(1);
    expect(next.playerPromises[0].status).toBe("declined");
    expect(next.playerPromises[0].resolvedOnDay).toBe(next.day);
    expect(pendingPromiseWith("yohei", next)).toBeNull();
  });
});

describe("PHASE_12_6 promise mechanic: kept", () => {
  it("talking to the NPC while their promise is still within its due window marks it kept", () => {
    let s = metState("fumiko");
    s = acceptPlayerPromise(s, "fumiko", invitationLabelFor("fumiko"));
    expect(s.playerPromises[0].status).toBe("pending");
    s = recordConversationTurn(s, "fumiko", "こんにちは", "文子は片手を挙げた。「あら、いらっしゃい」");
    expect(s.playerPromises[0].status).toBe("kept");
    expect(s.playerPromises[0].resolvedOnDay).toBe(s.day);
  });

  it("talking to a DIFFERENT NPC does not resolve this NPC's pending promise", () => {
    let s = metState("fumiko", { flags: { met_fumiko: true, met_jin: true } });
    s = acceptPlayerPromise(s, "fumiko", invitationLabelFor("fumiko"));
    s = recordConversationTurn(s, "jin", "こんにちは", "相馬は軽く顎を上げた。");
    expect(s.playerPromises[0].status).toBe("pending");
  });
});

describe("PHASE_12_6 promise mechanic: missed", () => {
  it("a pending promise whose due window has fully elapsed flips to missed at day transition, never earlier", () => {
    let s = metState("hina");
    s = acceptPlayerPromise(s, "hina", invitationLabelFor("hina")); // dueByDay = day + 2
    const dueBy = s.playerPromises[0].dueByDay;
    // Advance days one at a time without meeting hina; must stay pending until dueByDay itself is
    // exceeded (dueByDay < nextDay), never flip prematurely.
    while (s.day < dueBy) {
      expect(s.playerPromises[0].status, `still pending on day ${s.day} (due by ${dueBy})`).toBe("pending");
      s = startNewDay({ ...s, ended: true });
    }
    expect(s.playerPromises[0].status).toBe("pending"); // exactly on the due day itself, still pending
    s = startNewDay({ ...s, ended: true }); // crosses past dueByDay
    expect(s.playerPromises[0].status).toBe("missed");
    expect(s.playerPromises[0].resolvedOnDay).toBe(s.day);
  });

  it("missed status carries no penalty semantics -- no field on PlayerPromise or CoreState represents a score/count that decreases", () => {
    let s = metState("hina");
    s = acceptPlayerPromise(s, "hina", invitationLabelFor("hina"));
    for (let i = 0; i < 5; i++) s = startNewDay({ ...s, ended: true });
    expect(s.playerPromises[0].status).toBe("missed");
    // The ENTIRE CoreState never gains a numeric relationship/affection/trust field anywhere.
    const keys = Object.keys(s);
    expect(keys).not.toContain("npcImpression");
    expect(keys.some((k) => /affection|trust|friendship|score/i.test(k))).toBe(false);
  });
});

describe("PHASE_12_6 social-memory decay (Section 12)", () => {
  it("consecutiveMissedPromises resets to 0 once a promise is kept, and counts a real streak of misses", () => {
    let s = metState("hina");
    // Miss #1.
    s = acceptPlayerPromise(s, "hina", invitationLabelFor("hina"));
    for (let i = 0; i < 5; i++) s = startNewDay({ ...s, ended: true });
    expect(consecutiveMissedPromises("hina", s)).toBe(1);

    // Miss #2 (immediately eligible again since hina's own cooldown in eligibleForNewInvitation
    // only needs 4 days since the last promise's resolution, already satisfied by the 5-day gap).
    s = acceptPlayerPromise(s, "hina", invitationLabelFor("hina"));
    for (let i = 0; i < 5; i++) s = startNewDay({ ...s, ended: true });
    expect(consecutiveMissedPromises("hina", s)).toBe(2);

    // A kept promise resets the streak.
    s = acceptPlayerPromise(s, "hina", invitationLabelFor("hina"));
    s = recordConversationTurn(s, "hina", "こんにちは", "陽菜は顔を上げた。「あ、こんにちは」");
    expect(consecutiveMissedPromises("hina", s)).toBe(0);
  });

  it("a missed promise stops contributing missed_promise/slightly_awkward tags once it is no longer recent", () => {
    let s = metState("hina");
    s = acceptPlayerPromise(s, "hina", invitationLabelFor("hina"));
    for (let i = 0; i < 5; i++) s = startNewDay({ ...s, ended: true });
    expect(computePlayerNpcTags("hina", s)).toEqual(expect.arrayContaining(["missed_promise", "slightly_awkward"]));

    // Advance well past MISSED_PROMISE_RELEVANCE_DAYS (3) with nothing else happening.
    for (let i = 0; i < 10; i++) s = startNewDay({ ...s, ended: true });
    expect(computePlayerNpcTags("hina", s)).not.toContain("missed_promise");
    expect(computePlayerNpcTags("hina", s)).not.toContain("slightly_awkward");
  });

  it("playerPromises does not grow unboundedly across many accept/miss cycles -- old resolved entries are pruned", () => {
    let s = metState("hina");
    for (let cycle = 0; cycle < 10; cycle++) {
      s = acceptPlayerPromise(s, "hina", invitationLabelFor("hina"));
      for (let i = 0; i < 5; i++) s = startNewDay({ ...s, ended: true });
    }
    // 10 cycles x 5-day gaps = 50 days elapsed; RESOLVED_PROMISE_RETENTION_DAYS (10) means only
    // recent cycles' entries should remain, not all 10.
    expect(s.playerPromises.length).toBeLessThan(10);
  });
});

describe("PHASE_12_6 categorical tags (Section 3 -- never a score)", () => {
  it("has_met is false before any conversation, true after", () => {
    const s0 = createInitialCoreState();
    expect(computePlayerNpcTags("yohei", s0)).toEqual([]);
    const s1 = metState("yohei");
    expect(computePlayerNpcTags("yohei", s1)).toContain("has_met");
  });

  it("familiar requires at least 3 conversation turns, not fewer", () => {
    let s = metState("miyoko");
    expect(computePlayerNpcTags("miyoko", s)).not.toContain("familiar");
    for (let i = 0; i < 2; i++) s = recordConversationTurn(s, "miyoko", "こんにちは", "美代子はにっこりした。");
    expect(computePlayerNpcTags("miyoko", s)).not.toContain("familiar"); // only 2 turns
    s = recordConversationTurn(s, "miyoko", "こんにちは", "美代子はにっこりした。");
    expect(computePlayerNpcTags("miyoko", s)).toContain("familiar"); // 3rd turn
  });

  it("shared_history reflects a kept promise", () => {
    let s = metState("fumiko");
    expect(computePlayerNpcTags("fumiko", s)).not.toContain("shared_history");
    s = acceptPlayerPromise(s, "fumiko", invitationLabelFor("fumiko"));
    s = recordConversationTurn(s, "fumiko", "こんにちは", "文子は片手を挙げた。");
    expect(computePlayerNpcTags("fumiko", s)).toContain("shared_history");
  });

  it("pending_promise tag exists only while a promise from that NPC is pending", () => {
    let s = metState("jin");
    expect(computePlayerNpcTags("jin", s)).not.toContain("pending_promise");
    s = acceptPlayerPromise(s, "jin", invitationLabelFor("jin"));
    expect(computePlayerNpcTags("jin", s)).toContain("pending_promise");
    s = recordConversationTurn(s, "jin", "こんにちは", "相馬は軽く顎を上げた。");
    expect(computePlayerNpcTags("jin", s)).not.toContain("pending_promise");
  });
});

describe("PHASE_12_6 invitation eligibility (Section 6/15)", () => {
  it("is never eligible for daisuke -- Reality Bridge stays separate from the social-promise mechanic", () => {
    const s = metState("daisuke");
    expect(eligibleForNewInvitation("daisuke", s)).toBe(false);
  });

  it("is not eligible before the player has ever met the NPC", () => {
    const s = createInitialCoreState();
    expect(eligibleForNewInvitation("yohei", s)).toBe(false);
  });

  it("is not eligible while a promise from that NPC is already pending (no promise spam)", () => {
    let s = metState("yohei");
    expect(eligibleForNewInvitation("yohei", s)).toBe(true);
    s = acceptPlayerPromise(s, "yohei", invitationLabelFor("yohei"));
    expect(eligibleForNewInvitation("yohei", s)).toBe(false);
  });

  it("is not eligible again within the cooldown window after a promise resolves", () => {
    let s = metState("yohei");
    s = declinePlayerPromise(s, "yohei", invitationLabelFor("yohei"));
    expect(eligibleForNewInvitation("yohei", s)).toBe(false);
    for (let i = 0; i < 3; i++) s = startNewDay({ ...s, ended: true }); // 3 days, still within cooldown
    expect(eligibleForNewInvitation("yohei", s)).toBe(false);
    s = startNewDay({ ...s, ended: true }); // day 4 -- cooldown elapsed
    expect(eligibleForNewInvitation("yohei", s)).toBe(true);
  });
});

describe("PHASE_12_6 dialogue context (Section 14) -- daysSinceLastMeeting / promise flags reach the AI context", () => {
  it("daysSinceLastMeeting is null before any conversation, and counts correctly afterward", () => {
    const s0 = metState("miyoko");
    expect(daysSinceLastMeeting("miyoko", s0)).toBeNull();
    let s = recordConversationTurn(s0, "miyoko", "こんにちは", "美代子はにっこりした。");
    for (let i = 0; i < 3; i++) s = startNewDay({ ...s, ended: true });
    expect(daysSinceLastMeeting("miyoko", s)).toBe(3);
  });

  it("buildNpcAiContext exposes daysSinceLastMeeting/pendingPromiseWithPlayer/missedPromiseWithPlayer", () => {
    let s = metState("fumiko");
    s = acceptPlayerPromise(s, "fumiko", invitationLabelFor("fumiko"));
    const context = buildNpcAiContext("fumiko", s, "こんにちは");
    expect(context.pendingPromiseWithPlayer).toBe(true);
    expect(context.missedPromiseWithPlayer).toBe(false);
    expect(context.daysSinceLastMeeting).toBeNull(); // never actually talked yet, only met
  });
});
