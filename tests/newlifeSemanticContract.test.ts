import { describe, expect, it } from "vitest";
import { createInitialState } from "../src/newlife/state";
import { MENU_FACT, PROFIT_FACT } from "../src/newlife/npcVoice";
import { NEGATIVE_CONSTRAINTS, projectFacts } from "../src/newlife/semantic/factsProjection";
import { runTruthGate } from "../src/newlife/semantic/truthGate";
import { NullSemanticInterpreter } from "../src/newlife/semantic/adapter";
import type { NewLife30State } from "../src/newlife/types";
import type { SemanticInterpretation } from "../src/newlife/semantic/contract";

function baseInterpretation(overrides: Partial<SemanticInterpretation> = {}): SemanticInterpretation {
  return {
    conversationalAct: "factual_question",
    semanticIntents: [],
    entities: [],
    answerableFromCanon: true,
    requiredFacts: [],
    unknowns: [],
    proposedResponse: "",
    ...overrides,
  };
}

describe("Phase 29 design (unwired) — factsProjection", () => {
  it("cites npcVoice.ts's own exported fact strings, not a hand-copied duplicate", () => {
    const snapshot = projectFacts("hina", { ...createInitialState(), day: 25 });
    expect(snapshot.known.menu).toBe(MENU_FACT);
    expect(snapshot.known.profit).toBe(PROFIT_FACT);
  });

  it("keeps profit unknown before Day 20 and known from Day 20 on", () => {
    const before = projectFacts("hina", { ...createInitialState(), day: 19 });
    expect(before.unknown).toContain("profit");
    expect(before.known.profit).toBeUndefined();

    const after = projectFacts("hina", { ...createInitialState(), day: 20 });
    expect(after.unknown).not.toContain("profit");
    expect(after.known.profit).toBe(PROFIT_FACT);
  });

  it("keeps yesterday unknown before Day 12 and reflects signVersion from Day 12 on", () => {
    const early = projectFacts("hina", { ...createInitialState(), day: 5 });
    expect(early.unknown).toContain("yesterday");

    const clear: NewLife30State = { ...createInitialState(), day: 12, signVersion: "clear_from_start" };
    expect(projectFacts("hina", clear).known.yesterday).toMatch(/初日から/);

    const corrected: NewLife30State = { ...createInitialState(), day: 12, signVersion: "vague_then_corrected" };
    expect(projectFacts("hina", corrected).known.yesterday).toMatch(/あいまい/);
  });

  it("leaves workshop unknown while pending/lapsed and known once Daisuke answers", () => {
    const pending = projectFacts("daisuke", { ...createInitialState(), dWorkshop: "pending" });
    expect(pending.unknown).toContain("workshop");

    const yes = projectFacts("daisuke", { ...createInitialState(), dWorkshop: "one_hour_yes" });
    expect(yes.known.workshop).toMatch(/一時間/);

    const no = projectFacts("daisuke", { ...createInitialState(), dWorkshop: "no" });
    expect(no.known.workshop).toMatch(/貸さない/);
  });

  it("reflects Miyoko's seat boundary once it's set", () => {
    const assumed = projectFacts("miyoko", { ...createInitialState(), mSeats: "assumed" });
    expect(assumed.known.seats).toMatch(/明言していない/);

    const bounded = projectFacts("miyoko", { ...createInitialState(), mSeats: "bounded" });
    expect(bounded.known.seats).toMatch(/四席/);
  });

  it("always carries the barber negative constraint (Daisuke's rejected old canon)", () => {
    const snapshot = projectFacts("daisuke", createInitialState());
    expect(snapshot.negativeConstraints).toEqual(NEGATIVE_CONSTRAINTS);
    expect(snapshot.negativeConstraints.some((t) => /barber/i.test(t))).toBe(true);
  });
});

describe("Phase 29 design (unwired) — truthGate", () => {
  const snapshot = projectFacts("hina", { ...createInitialState(), day: 25 });

  it("passes a response whose numbers are all traceable to the facts snapshot", () => {
    const interpretation = baseInterpretation({
      requiredFacts: ["reservation_count"],
      proposedResponse: "予約12点、店頭18点、合わせて30点です。",
    });
    expect(runTruthGate(interpretation, snapshot).passed).toBe(true);
  });

  it("flags a banned term even if phrased as an assertion, not a correction", () => {
    const interpretation = baseInterpretation({ proposedResponse: "大輔さんは理容の担当です。" });
    const verdict = runTruthGate(interpretation, snapshot);
    expect(verdict.passed).toBe(false);
    expect(verdict.violations.map((v) => v.code)).toContain("banned_term");
  });

  it("flags a numeric claim that traces to no known fact (hallucinated quantity)", () => {
    const interpretation = baseInterpretation({ proposedResponse: "店頭分はあと50個ありますよ。" });
    const verdict = runTruthGate(interpretation, snapshot);
    expect(verdict.passed).toBe(false);
    expect(verdict.violations).toContainEqual({ code: "unsupported_numeric_claim", detail: "50" });
  });

  it("flags claiming a required fact as answerable when the snapshot says it's still unknown", () => {
    const earlySnapshot = projectFacts("hina", { ...createInitialState(), day: 10 });
    const interpretation = baseInterpretation({
      answerableFromCanon: true,
      requiredFacts: ["profit"],
      proposedResponse: "黒字ですよ。",
    });
    const verdict = runTruthGate(interpretation, earlySnapshot);
    expect(verdict.passed).toBe(false);
    expect(verdict.violations.map((v) => v.code)).toContain("overclaimed_required_fact");
  });

  it("does not flag an unanswerable-marked interpretation even if a required fact is unknown", () => {
    const earlySnapshot = projectFacts("hina", { ...createInitialState(), day: 10 });
    const interpretation = baseInterpretation({
      answerableFromCanon: false,
      requiredFacts: ["profit"],
      proposedResponse: "まだ集計前で分かりません。",
    });
    expect(runTruthGate(interpretation, earlySnapshot).passed).toBe(true);
  });
});

describe("Phase 29 design (unwired) — NullSemanticInterpreter", () => {
  it("always reports unavailable, with no network call and no thrown error", async () => {
    const interpreter = new NullSemanticInterpreter();
    const snapshot = projectFacts("hina", createInitialState());
    const result = await interpreter.interpret("どんな焼き菓子売るのですか", snapshot);
    expect(result).toEqual({ status: "unavailable", reason: "no_provider_configured" });
  });
});
