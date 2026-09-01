import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { HomeScreen } from "../src/screens/HomeScreen";
import { AiInterventionScreen } from "../src/screens/AiInterventionScreen";
import { getCaseById } from "../src/data/cases";

// SEMANTICS FIX Run Section 9/10/19 test #8: neither screen should push the
// player toward distrusting the AI right before (or instead of) letting
// them judge the utterance on its own content.
const BANNED_PRIMING_PHRASES = [
  "AIは常に正しいとは限りません",
  "AIを疑",
  "見抜け",
  "騙されるな",
  "正解を当てろ",
];

describe("no AI-distrust priming on the decision screens (Section 9/10)", () => {
  it("HOME contains none of the banned priming phrases", () => {
    const { container } = render(
      <HomeScreen
        hasInProgress={false}
        onResume={() => {}}
        onTodaysCase={() => {}}
        onSelectCase={() => {}}
        onViewGrowth={() => {}}
      />,
    );
    const text = container.textContent ?? "";
    for (const phrase of BANNED_PRIMING_PHRASES) {
      expect(text).not.toContain(phrase);
    }
  });

  it("AI_INTERVENTION no longer shows the always-on distrust reminder, for a calibration-eligible case", () => {
    const case005 = getCaseById("CASE-005")!;
    const { container } = render(
      <AiInterventionScreen
        caseData={case005}
        message={case005.aiIntervention}
        onBack={() => {}}
        onSubmit={() => {}}
      />,
    );
    const text = container.textContent ?? "";
    for (const phrase of BANNED_PRIMING_PHRASES) {
      expect(text).not.toContain(phrase);
    }
  });

  it("AI_INTERVENTION no longer shows the always-on distrust reminder, for a Socratic-question case", () => {
    const case001 = getCaseById("CASE-001")!;
    const { container } = render(
      <AiInterventionScreen
        caseData={case001}
        message={case001.aiIntervention}
        onBack={() => {}}
        onSubmit={() => {}}
      />,
    );
    const text = container.textContent ?? "";
    for (const phrase of BANNED_PRIMING_PHRASES) {
      expect(text).not.toContain(phrase);
    }
  });
});
