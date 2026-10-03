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
};

function validPlan(overrides: Record<string, unknown> = {}) {
  return {
    mode: "SCENE_PROBLEM",
    playerMeaning: "喫茶の席に負担をかける案を外した方がよいという提案。",
    directAnswer: "その案なら喫茶を待機場所から外し、会館側で待機場所を考え直せる。",
    referents: ["喫茶の席", "会館側の待機場所"],
    activeIssue: "待機場所が未決。",
    unresolvedDecision: "喫茶を使うか会館側だけにするか。",
    authorityOwner: "喫茶席は美代子、会館側は文子。",
    burdenOwner: "美代子の店",
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
        referents: ["今日の予定"],
        activeIssue: null,
        unresolvedDecision: null,
        authorityOwner: null,
        burdenOwner: null,
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
});
