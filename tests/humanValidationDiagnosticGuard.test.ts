// THINKING_GAME_FEYNMAN_UNDERSTANDING_DIAGNOSTIC_V0_1 -- structural guard over the human-validation
// diagnostic documents themselves (docs/research/evaluation/phase-12-9/*.md). These are plain
// content files, not app code; this test protects them from silent drift the same way an app-level
// content gate would (no product mechanics are touched by this file).
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const DIR = path.resolve(__dirname, "..", "docs", "research", "evaluation", "phase-12-9");
const questions = fs.readFileSync(path.join(DIR, "POST_PLAY_QUESTIONS_TEMPLATE.md"), "utf-8");
const observerSheet = fs.readFileSync(path.join(DIR, "OBSERVER_SHEET_TEMPLATE.md"), "utf-8");
const anomalyReview = fs.readFileSync(path.join(DIR, "OPEN_ANOMALY_REVIEW_V1.md"), "utf-8");

describe("human validation post-play questions: leading-question ban", () => {
  // The banned phrases are legitimately named once, in the file's own prohibition notice (so a
  // reader knows exactly what NOT to ask) -- what this guards against is one of them slipping into
  // an actual **Qn. question line, not the file mentioning them at all.
  const bannedLeadingPhrases = ["面白かった？", "良かった？", "分かった？", "覚えていて良かった？"];
  const questionLines = questions.split("\n").filter((line) => /^\*\*Q\d+\./.test(line));

  it("has the expected number of actual question lines (one per Qn)", () => {
    expect(questionLines).toHaveLength(11);
  });

  it("never asks a banned leading yes/no question in an actual question line", () => {
    for (const phrase of bannedLeadingPhrases) {
      for (const line of questionLines) {
        expect(line).not.toContain(phrase);
      }
    }
  });
});

describe("human validation post-play questions: Feynman diagnostic coverage", () => {
  it("asks a GOAL question", () => {
    expect(questions).toMatch(/\[GOAL\]/);
  });

  it("asks a STATE question distinct from the original memory questions", () => {
    expect(questions).toMatch(/\[STATE -- new\]/);
    expect(questions).toContain("今、自分や町や登場人物に何が起きていますか？");
  });

  it("asks a CAUSE question", () => {
    expect(questions).toMatch(/\[CAUSE -- new\]/);
    expect(questions).toContain("なぜ今こうなったと思いますか？");
  });

  it("merges the GAP (explain-it-yourself) framing into the existing confusion question rather than duplicating it", () => {
    expect(questions).toMatch(/\[GAP merged in\]/);
    expect(questions).toContain("自分の言葉で説明してみてください");
  });

  it("merges the NEXT question's 'why' into the existing next-session question rather than duplicating it", () => {
    expect(questions).toMatch(/\[NEXT's "why" merged in\]/);
  });
});

describe("human validation post-play questions: original Q1-Q9 content preserved", () => {
  const originalQuestionTexts = [
    "今、何をしているゲームだと思いましたか？",
    "一番覚えている人は誰ですか？ なぜですか？",
    "一番覚えている出来事は何ですか？",
    "分かりにくかったところはどこですか？",
    "次に開いたら何をしたいですか？",
    "もう一度やるなら、誰に会う/どこへ行くと思いますか？",
    "やめたくなった瞬間はありましたか？ どこですか？",
    "自由に話せるところについて、どう感じましたか？",
    "続きを遊びたいですか？",
  ];

  it("still contains every original question's core wording, unremoved", () => {
    for (const text of originalQuestionTexts) {
      expect(questions).toContain(text);
    }
  });

  it("is numbered Q1 through Q11 (2 new insertions over the original Q1-Q9)", () => {
    for (let n = 1; n <= 11; n++) {
      expect(questions).toMatch(new RegExp(`\\*\\*Q${n}\\.`));
    }
    expect(questions).not.toMatch(/\*\*Q12\./);
  });
});

describe("human validation observer sheet: gap classification taxonomy", () => {
  const requiredCategories = [
    "INTENDED_MYSTERY",
    "ACCIDENTAL_CONFUSION",
    "GOAL_CONFUSION",
    "STATE_CONFUSION",
    "CAUSAL_CONFUSION",
    "ACTION_CONFUSION",
    "WORDING",
    "UI",
    "FEEDBACK",
    "WORLD_CONTINUITY",
    "UNKNOWN",
  ];

  it("defines every required gap-location category", () => {
    for (const category of requiredCategories) {
      expect(observerSheet).toContain(category);
    }
  });

  it("states the intended-mystery-vs-accidental-confusion distinguishing rule (wants to find out vs. also doesn't know what to do next)", () => {
    expect(observerSheet).toContain("wants to find out");
    expect(observerSheet).toContain("also doesn't know what to do next");
  });

  it("does not instruct adding explanation text based on this sheet", () => {
    expect(observerSheet).toMatch(/not a tutorial|Do not propose or add in-game explanation/);
  });
});

describe("open anomaly review", () => {
  it("exists and asks the governing question (spec correct, wrong player model)", () => {
    expect(anomalyReview).toContain("assuming every mechanic here is working exactly as designed");
  });

  it("is honest about not finding a pre-existing artifact to reuse", () => {
    expect(anomalyReview).toMatch(/no prior artifact|found no prior artifact/i);
  });

  it("frames every item as a hypothesis, not a scheduled fix", () => {
    expect(anomalyReview).toMatch(/hypothesis to watch|not a confirmed finding/);
  });
});
