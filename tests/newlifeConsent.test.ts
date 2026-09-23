import { afterEach, describe, expect, it } from "vitest";
import { getNewLifeAiDialogueConsent, setNewLifeAiDialogueConsent } from "../src/newlife/semantic/consent";
import { getAiDialogueConsent, setAiDialogueConsent } from "../src/lib/aiDialogueConsent";

// Phase 30 instruction 12: a separate, versioned consent key from CASE1's,
// per docs/DATA_BOUNDARY.md's "each purpose needs its own opt-in" rule.
describe("NEW LIFE AI-dialogue consent (separate from CASE1's)", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("starts as null (never asked) before any choice is stored", () => {
    expect(getNewLifeAiDialogueConsent()).toBeNull();
  });

  it("is a sticky choice: accepted/declined persists across reads", () => {
    setNewLifeAiDialogueConsent("accepted");
    expect(getNewLifeAiDialogueConsent()).toBe("accepted");

    setNewLifeAiDialogueConsent("declined");
    expect(getNewLifeAiDialogueConsent()).toBe("declined");
  });

  it("uses a distinct localStorage key from CASE1's consent — accepting one never implies accepting the other", () => {
    setAiDialogueConsent("accepted");
    expect(getNewLifeAiDialogueConsent()).toBeNull();

    setNewLifeAiDialogueConsent("accepted");
    localStorage.removeItem("thinking-game:ai-dialogue-consent:v1");
    expect(getAiDialogueConsent()).toBeNull();
    expect(getNewLifeAiDialogueConsent()).toBe("accepted");
  });

  it("treats malformed stored JSON as 'never asked', not a crash", () => {
    localStorage.setItem("thinking-game:newlife-ai-dialogue-consent:v1", "{not json");
    expect(getNewLifeAiDialogueConsent()).toBeNull();
  });

  it("treats an unrecognized stored status value as 'never asked'", () => {
    localStorage.setItem("thinking-game:newlife-ai-dialogue-consent:v1", JSON.stringify({ status: "maybe" }));
    expect(getNewLifeAiDialogueConsent()).toBeNull();
  });
});
