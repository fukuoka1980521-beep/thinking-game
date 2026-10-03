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
  evidenceIds: ["SCENE_TEXT", "SCENE_FOCUS", "STATE_0", "PERSONA_IDENTITY", "PLAYER_INPUT"],
};

function validPlan(overrides: Record<string, unknown> = {}) {
  return {
    mode: "SCENE_PROBLEM",
    playerMeaning: "喫茶の席に負担をかける案を外した方がよいという提案。",
    directAnswer: "その案なら喫茶を待機場所から外し、会館側で待機場所を考え直せる。",
    explicitQuestion: null,
    explicitAnswer: null,
    questionType: "NONE",
    answerGrounding: "NOT_APPLICABLE",
    answerEvidenceIds: [],
    referents: ["喫茶の席", "会館側の待機場所"],
    activeIssue: "待機場所が未決。",
    underlyingGoal: "試売客の待機を混乱なく処理し、他人の商売へ無断の負担をかけない。",
    unresolvedDecision: "喫茶を使うか会館側だけにするか。",
    authorityOwner: "喫茶席は美代子、会館側は文子。",
    impactQuestion: false,
    accountabilityQuestion: false,
    responsibilityStatus: "NOT_APPLICABLE",
    accountabilityOwner: null,
    accountabilityEvidenceIds: [],
    impactBearers: ["美代子", "喫茶の通常客"],
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
        questionType: "FACTUAL",
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

  it("recovers a direct question when the planner omits the explicit answer", () => {
    const plan = planner.normalizeTurnPlan(
      validPlan({
        explicitQuestion: "このコーヒーは深煎りか。",
        explicitAnswer: null,
        questionType: "FACTUAL",
        answerGrounding: "UNKNOWN",
      }),
      "MIYOKO",
      enums,
    );
    expect(plan).not.toBeNull();
    expect(plan.explicitAnswer).toBe(plan.directAnswer);
  });

  it("allows unknown factual questions only when the plan explicitly answers with uncertainty", () => {
    const plan = planner.normalizeTurnPlan(
      validPlan({
        mode: "TOPIC_SHIFT",
        playerMeaning: "コーヒーの焙煎度を尋ねている。",
        directAnswer: "焙煎度は今の情報では確定できないと答える。",
        explicitQuestion: "このコーヒーは深煎りか。",
        explicitAnswer: "焙煎度は今の情報では確定できない。",
        questionType: "FACTUAL",
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

  it("downgrades a factual answer whose cited evidence id does not exist", () => {
    const plan = planner.normalizeTurnPlan(
      validPlan({
        mode: "CASUAL",
        explicitQuestion: "今日は特別な予定があるか。",
        explicitAnswer: "今日は特別な予定はない。",
        questionType: "FACTUAL",
        answerGrounding: "CANONICAL",
        answerEvidenceIds: ["NOT_A_REAL_SOURCE"],
        playerProposal: null,
        proposalDisposition: "NONE",
      }),
      "YOHEI",
      enums,
    );
    expect(plan).not.toBeNull();
    expect(plan.answerGrounding).toBe("UNKNOWN");
    expect(plan.answerEvidenceIds).toEqual([]);
  });

  it("downgrades an unsupported factual answer to an explicit unknown without state proposals", () => {
    const plan = planner.normalizeTurnPlan(
      validPlan({
        mode: "TOPIC_SHIFT",
        explicitQuestion: "コーヒーは深煎りか。",
        explicitAnswer: "深煎りです。",
        questionType: "FACTUAL",
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
      rawPlayerUtterance: "このコーヒーは深煎りですか",
    });
    expect(ledger.map((x: { id: string }) => x.id)).toEqual(
      expect.arrayContaining(["CASE_CANON", "SCENE_TEXT", "SCENE_FOCUS", "STATE_0", "MEMORY_0", "DIALOGUE_0", "PLAYER_INPUT"]),
    );
    expect(ledger.map((x: { id: string }) => x.id)).not.toContain("DOSSIER");
  });

  it("does not equate decision authority with accountability", () => {
    const plan = planner.normalizeTurnPlan(
      validPlan({
        playerMeaning: "喫茶客が座れなくなる場合の責任主体を尋ねている。",
        directAnswer: "実際の負担は美代子の店と通常客に出るが、誰が責任を負うかは今の情報では決まっていない。",
        explicitQuestion: "通常客が座れなくなった場合、誰が責任を負うのか。",
        explicitAnswer: "誰が責任を負うかは今の情報では決まっていない。",
        questionType: "NORMATIVE",
        answerGrounding: "OPINION",
        answerEvidenceIds: [],
        impactQuestion: true,
        accountabilityQuestion: false,
        responsibilityStatus: "NOT_APPLICABLE",
        accountabilityOwner: null,
        impactBearers: ["美代子", "喫茶の通常客"],
        playerProposal: null,
        proposalDisposition: "NONE",
        responseMove: "ANSWER",
        requiredContent: ["責任の所在は未確定", "負担は美代子の店と通常客に出る"],
      }),
      "FUMIKO",
      enums,
    );
    expect(plan?.impactQuestion).toBe(true);
    expect(plan?.accountabilityQuestion).toBe(false);
    expect(plan?.responsibilityStatus).toBe("NOT_APPLICABLE");
    expect(plan?.accountabilityOwner).toBeNull();
    expect(plan?.impactBearers).toEqual(expect.arrayContaining(["美代子", "喫茶の通常客"]));
  });

  it("downgrades an unsupported accountability assignment instead of failing the whole dialogue", () => {
    const plan = planner.normalizeTurnPlan(
      validPlan({
        explicitQuestion: "誰が責任を負うのか。",
        explicitAnswer: "美代子が責任を負う。",
        questionType: "NORMATIVE",
        answerGrounding: "OPINION",
        impactQuestion: false,
        accountabilityQuestion: true,
        responsibilityStatus: "KNOWN",
        accountabilityOwner: "美代子",
        accountabilityEvidenceIds: [],
        playerProposal: null,
        proposalDisposition: "NONE",
        responseMove: "ANSWER",
        requiredContent: ["美代子が責任を負う"],
      }),
      "FUMIKO",
      enums,
    );
    expect(plan?.responsibilityStatus).toBe("UNRESOLVED");
    expect(plan?.accountabilityOwner).toBeNull();
    expect(plan?.responsibilityDowngraded).toBe(true);

    const safe = planner.downgradeUnsupportedResponsibilityPlan(plan);
    expect(safe.directAnswer).toContain("責任の所在");
    expect(safe.directAnswer).toContain("決まっていません");
    expect(safe.candidateCommitments).toEqual([]);
    expect(safe.candidateWorldEffects).toEqual([]);
  });

  it("exposes persona identity without exposing the whole persona model as factual evidence", () => {
    const ledger = planner.buildEvidenceLedger({
      caseCanon: { setting: "町" },
      dossier: {
        displayName: "美代子",
        canonicalCharacterModel: "**IDENTITY:** 60s, runs the café.\n**SPEECH MODEL:** warm host.",
      },
      dynamicState: {},
      recentDialogue: [],
      rawPlayerUtterance: "何の仕事をしているの？",
    });
    const ids = ledger.map((x: { id: string }) => x.id);
    expect(ids).toContain("PERSONA_IDENTITY");
    expect(ids).not.toContain("DOSSIER");
    expect(ledger.find((x: { id: string }) => x.id === "PERSONA_IDENTITY")?.text).toContain("runs the café");
  });

  it("allows known accountability only with typed accountability evidence", () => {
    const localEnums = {
      ...enums,
      evidenceIds: [...enums.evidenceIds, "RESPONSIBILITY_0"],
      accountabilityEvidenceIds: ["RESPONSIBILITY_0"],
    };
    const plan = planner.normalizeTurnPlan(
      validPlan({
        explicitQuestion: "誰が責任を負うのか。",
        explicitAnswer: "会館側の運営責任者が負う。",
        questionType: "FACTUAL",
        answerGrounding: "CANONICAL",
        answerEvidenceIds: ["RESPONSIBILITY_0"],
        impactQuestion: false,
        accountabilityQuestion: true,
        responsibilityStatus: "KNOWN",
        accountabilityOwner: "会館側の運営責任者",
        accountabilityEvidenceIds: ["RESPONSIBILITY_0"],
        playerProposal: null,
        proposalDisposition: "NONE",
        responseMove: "ANSWER",
        requiredContent: ["会館側の運営責任者が負う"],
      }),
      "FUMIKO",
      localEnums,
    );
    expect(plan?.responsibilityStatus).toBe("KNOWN");
    expect(plan?.accountabilityOwner).toBe("会館側の運営責任者");
    expect(plan?.responsibilityDowngraded).toBe(false);
  });

  it("supports analytical questions without pretending they are missing world facts", () => {
    const plan = planner.normalizeTurnPlan(
      validPlan({
        mode: "SCENE_PROBLEM",
        playerMeaning: "展示方法と受け取り場所の因果関係を確認している。",
        directAnswer: "展示方法と受け取り場所は別の論点として扱える。",
        explicitQuestion: "実物展示かカタログかと受け取り場所は別問題か。",
        explicitAnswer: "別問題として扱える。",
        questionType: "ANALYTICAL",
        answerGrounding: "INFERRED",
        answerEvidenceIds: [],
        responsibilityStatus: "NOT_APPLICABLE",
        accountabilityOwner: null,
        accountabilityEvidenceIds: [],
        playerProposal: null,
        proposalDisposition: "NONE",
        responseMove: "ANSWER",
        requiredContent: ["展示方法と受け取り場所は別の論点"],
      }),
      "FUMIKO",
      enums,
    );
    expect(plan?.questionType).toBe("ANALYTICAL");
    expect(plan?.answerGrounding).toBe("INFERRED");
  });

  it("recovers a missing explicit answer from the already-generated direct semantic answer", () => {
    const plan = planner.normalizeTurnPlan(
      validPlan({
        explicitQuestion: "誰が決めるのか。",
        explicitAnswer: null,
        questionType: "ANALYTICAL",
        answerGrounding: "OPINION",
      }),
      "FUMIKO",
      enums,
    );
    expect(plan).not.toBeNull();
    expect(plan.explicitAnswer).toBe(plan.directAnswer);
  });

  it("downgrades factual grounding without usable evidence instead of dropping the whole turn", () => {
    const plan = planner.normalizeTurnPlan(
      validPlan({
        mode: "CASUAL",
        explicitQuestion: "今日は特別な予定があるか。",
        explicitAnswer: "今日は特別な予定はない。",
        questionType: "FACTUAL",
        answerGrounding: "CANONICAL",
        answerEvidenceIds: [],
        playerProposal: null,
        proposalDisposition: "NONE",
      }),
      "YOHEI",
      enums,
    );
    expect(plan).not.toBeNull();
    expect(plan.answerGrounding).toBe("UNKNOWN");
    expect(plan.answerEvidenceIds).toEqual([]);
  });

  it("turns a scene-problem plan with missing referents into clarification instead of transport failure", () => {
    const plan = planner.normalizeTurnPlan(
      validPlan({ referents: [] }),
      "FUMIKO",
      enums,
    );
    expect(plan).not.toBeNull();
    expect(plan.mode).toBe("CLARIFY");
    expect(plan.uncertainty).toBe("HIGH");
  });

  it("does not invent accountability analysis when the player did not ask about responsibility", () => {
    const plan = planner.normalizeTurnPlan(
      validPlan({
        explicitQuestion: "当日に電話で確認すればよいのでは？",
        explicitAnswer: "事前に確認した方がよい。",
        questionType: "HYPOTHETICAL",
        impactQuestion: false,
        accountabilityQuestion: false,
        responsibilityStatus: "UNRESOLVED",
        accountabilityOwner: "文子",
        accountabilityEvidenceIds: [],
      }),
      "FUMIKO",
      enums,
    );
    expect(plan?.accountabilityQuestion).toBe(false);
    expect(plan?.responsibilityStatus).toBe("NOT_APPLICABLE");
    expect(plan?.accountabilityOwner).toBeNull();
  });

  it("recovers proposal and required-content metadata conservatively", () => {
    const plan = planner.normalizeTurnPlan(
      validPlan({
        proposalDisposition: "NONE",
        requiredContent: [],
      }),
      "FUMIKO",
      enums,
    );
    expect(plan).not.toBeNull();
    expect(plan.proposalDisposition).toBe("NEEDS_CHECK");
    expect(plan.requiredContent).toEqual([plan.directAnswer]);
  });
});
