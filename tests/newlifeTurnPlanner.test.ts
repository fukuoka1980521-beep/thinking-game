import { createRequire } from "node:module";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const planner = require(join(__dirname, "..", "functions", "newlife-refoundation-ai", "turnPlanner.js"));

const enums = {
  actionTypes: ["OBSERVE", "CLARIFY"],
  boundaryModes: ["NOT_RELEVANT", "UNKNOWN"],
  relationalEvents: ["ACKNOWLEDGES_MISTAKE"],
  npcIds: ["HINA", "YOHEI", "DAISUKE", "JIN", "MIYOKO", "FUMIKO"],
  sceneStatuses: ["AWAIT_PLAYER", "NPC_EXCHANGE", "RESOLVED", "STALLED"],
  uncertaintyLevels: ["LOW", "MEDIUM", "HIGH"],
  worldEffects: ["MIYOKO_WAITING_CAPACITY_STATED"],
  evidenceIds: ["SCENE_TEXT", "SCENE_FOCUS", "STATE_0", "DOSSIER"],
};

function validPlan(overrides: Record<string, unknown> = {}) {
  return {
    mode: "SCENE_PROBLEM",
    playerMeaning: "喫茶の席に負担をかける案を外した方がよいという提案。",
    directAnswer: "その案なら喫茶を待機場所から外し、会館側で待機場所を考え直せる。",
    explicitQuestion: null,
    explicitAnswer: null,
    answerGrounding: "NOT_APPLICABLE",
    answerEvidenceIds: [],
    referents: ["喫茶の席", "会館側の待機場所"],
    activeIssue: "待機場所が未決。",
    underlyingGoal: "試売客の待機を混乱なく処理し、他人の商売へ無断の負担をかけない。",
    unresolvedDecision: "喫茶を使うか会館側だけにするか。",
    authorityOwner: "喫茶席は美代子、会館側は文子。",
    hardConstraints: ["喫茶席は美代子の同意なしに使えない。"],
    affectedParties: ["美代子", "喫茶の通常客", "文子"],
    burdens: ["喫茶席を待機に使うと通常客の席を圧迫する可能性がある。"],
    playerProposal: "喫茶を待機場所から外す。",
    proposalDisposition: "ACCEPT",
    responseMove: "ACCEPT_PROPOSAL",
    requiredContent: ["喫茶を待機場所から外す", "会館側で考え直す"],
    unknowns: [],
    candidateTurn: {
      action: "OBSERVE",
      boundaryMode: "NOT_RELEVANT",
      relationalEvents: [],
      needsClarification: false,
    },
    candidateFactRevealIds: [],
    candidateCommitments: [],
    candidateWorldEffects: [],
    uncertainty: "LOW",
    thoughtSupportSignal: false,
    sceneStatus: "AWAIT_PLAYER",
    nextNpc: null,
    ...overrides,
  };
}

describe("NEW LIFE turn planner", () => {
  it("requires a semantic plan before character wording", () => {
    const plan = planner.normalizeTurnPlan(validPlan(), "FUMIKO", enums);
    expect(plan).not.toBeNull();
    expect(plan.directAnswer).toContain("喫茶を待機場所から外し");
    expect(plan.proposalDisposition).toBe("ACCEPT");
    expect(plan.requiredContent).toContain("会館側で考え直す");
  });

  it("rejects a plan that omits the direct semantic answer", () => {
    expect(planner.normalizeTurnPlan(validPlan({ directAnswer: "" }), "FUMIKO", enums)).toBeNull();
  });

  it("keeps casual conversation distinct from scene-problem anchoring", () => {
    const casual = planner.normalizeTurnPlan(
      validPlan({
        mode: "CASUAL",
        playerMeaning: "今日の予定を聞いている。",
        directAnswer: "今日はいつも通りの予定だ。",
        explicitQuestion: "今日の予定は何か。",
        explicitAnswer: "特別な予定はなく、いつも通りの予定だ。",
        answerGrounding: "CANONICAL",
        answerEvidenceIds: ["SCENE_TEXT"],
        referents: ["今日の予定"],
        activeIssue: null,
        underlyingGoal: "今日の予定について普通に答える。",
        unresolvedDecision: null,
        authorityOwner: null,
        hardConstraints: [],
        affectedParties: ["洋平", "プレイヤー"],
        burdens: [],
        playerProposal: null,
        proposalDisposition: "NONE",
        responseMove: "ANSWER",
        requiredContent: ["いつも通りの予定"],
      }),
      "YOHEI",
      enums,
    );
    expect(casual?.mode).toBe("CASUAL");
    expect(casual?.directAnswer).toContain("いつも通り");
  });

  it("renderer receives the plan as a meaning contract rather than reconstructing intent", () => {
    const prompt = planner.buildRenderPrompt({
      npc: "FUMIKO",
      dossier: { displayName: "文子", speechModel: "短く事実を整理する" },
      plan: validPlan(),
      recentDialogue: [{ speaker: "PLAYER", text: "喫茶を外した方がいい" }],
      rawPlayerUtterance: "喫茶を外した方がいい",
    });
    expect(prompt).toContain("Response Plan（意味契約）");
    expect(prompt).toContain("proposalDisposition");
    expect(prompt).toContain("喫茶を待機場所から外す");
  });

  it("planner instructions explicitly evaluate alternatives instead of defending sceneFocus", () => {
    expect(planner.TURN_PLAN_SYSTEM_INSTRUCTION).toContain("必ずその解決策を採用する命令ではない");
    expect(planner.TURN_PLAN_SYSTEM_INSTRUCTION).toContain("旧案を守るのではなく");
    expect(planner.TURN_PLAN_SYSTEM_INSTRUCTION).toContain("因果・責任・負担");
  });

  it("does not make the legacy conversational-act taxonomy part of 30-day planning", () => {
    const FakeType = {
      OBJECT: "OBJECT", STRING: "STRING", ARRAY: "ARRAY", NUMBER: "NUMBER", BOOLEAN: "BOOLEAN",
    };
    const schema = planner.buildTurnPlanSchema(FakeType, enums);
    expect(schema.properties.candidateTurn).toBeUndefined();
    expect(schema.required).not.toContain("candidateTurn");
  });

  it("fails rendering when the renderer says a required semantic obligation was not covered", () => {
    expect(
      planner.normalizeRenderedLine(
        { npcLine: "会館側で考えましょう。", coveredRequirementIndexes: [1] },
        2,
      ),
    ).toBeNull();
    expect(
      planner.normalizeRenderedLine(
        { npcLine: "喫茶は外して、会館側で考えましょう。", coveredRequirementIndexes: [0, 1] },
        2,
      ),
    ).toContain("喫茶は外して");
  });

  it("rejects a direct question when the plan omits the explicit answer", () => {
    expect(
      planner.normalizeTurnPlan(
        validPlan({
          explicitQuestion: "このコーヒーは深煎りか。",
          explicitAnswer: null,
          answerGrounding: "UNKNOWN",
        }),
        "MIYOKO",
        enums,
      ),
    ).toBeNull();
  });

  it("allows unknown factual questions only when the plan explicitly answers with uncertainty", () => {
    const plan = planner.normalizeTurnPlan(
      validPlan({
        mode: "TOPIC_SHIFT",
        playerMeaning: "コーヒーの焙煎度を尋ねている。",
        directAnswer: "焙煎度は今の情報では確定できないと答える。",
        explicitQuestion: "このコーヒーは深煎りか。",
        explicitAnswer: "焙煎度は今の情報では確定できない。",
        answerGrounding: "UNKNOWN",
        answerEvidenceIds: [],
        activeIssue: null,
        unresolvedDecision: null,
        authorityOwner: null,
        playerProposal: null,
        proposalDisposition: "NONE",
        responseMove: "ANSWER",
        requiredContent: ["焙煎度は確定できない"],
      }),
      "MIYOKO",
      enums,
    );
    expect(plan?.answerGrounding).toBe("UNKNOWN");
    expect(plan?.explicitAnswer).toContain("確定できない");
  });

  it("rejects a factual answer whose cited evidence id does not exist", () => {
    expect(
      planner.normalizeTurnPlan(
        validPlan({
          mode: "CASUAL",
          explicitQuestion: "今日は特別な予定があるか。",
          explicitAnswer: "今日は特別な予定はない。",
          answerGrounding: "CANONICAL",
          answerEvidenceIds: ["NOT_A_REAL_SOURCE"],
          playerProposal: null,
          proposalDisposition: "NONE",
        }),
        "YOHEI",
        enums,
      ),
    ).toBeNull();
  });

  it("downgrades an unsupported factual answer to an explicit unknown without state proposals", () => {
    const plan = planner.normalizeTurnPlan(
      validPlan({
        mode: "TOPIC_SHIFT",
        explicitQuestion: "コーヒーは深煎りか。",
        explicitAnswer: "深煎りです。",
        answerGrounding: "OBSERVED",
        answerEvidenceIds: ["SCENE_TEXT"],
        playerProposal: null,
        proposalDisposition: "NONE",
        candidateCommitments: ["深煎りを出す"],
        candidateWorldEffects: ["MIYOKO_WAITING_CAPACITY_STATED"],
      }),
      "MIYOKO",
      enums,
    );
    expect(plan).not.toBeNull();
    const safe = planner.downgradeUnsupportedFactPlan(plan);
    expect(safe.answerGrounding).toBe("UNKNOWN");
    expect(safe.explicitAnswer).toContain("確定できません");
    expect(safe.answerEvidenceIds).toEqual([]);
    expect(safe.candidateCommitments).toEqual([]);
    expect(safe.candidateWorldEffects).toEqual([]);
  });

  it("builds a bounded evidence ledger that separates scene, state, memory, and dialogue", () => {
    const ledger = planner.buildEvidenceLedger({
      caseCanon: { setting: "町" },
      dossier: { displayName: "美代子" },
      dynamicState: {
        sceneText: "喫茶で話している。",
        sceneFocus: { issue: "席", decision: "未決", authority: "美代子" },
        canonicalStateFacts: ["席数は未確認。"],
        retrievedMemories: ["Day 2 [OBSERVATION] 椅子を見た。"],
      },
      recentDialogue: [{ speaker: "PLAYER", text: "深煎りですか" }],
    });
    expect(ledger.map((x: { id: string }) => x.id)).toEqual(
      expect.arrayContaining(["CASE_CANON", "DOSSIER", "SCENE_TEXT", "SCENE_FOCUS", "STATE_0", "MEMORY_0", "DIALOGUE_0"]),
    );
  });
});
