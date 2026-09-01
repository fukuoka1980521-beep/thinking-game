import { describe, expect, it } from "vitest";
import { loadUserTestResponses, saveUserTestResponse } from "../src/lib/userTestResponses";
import type { UserTestResponse } from "../src/types/log";

function makeResponse(overrides: Partial<UserTestResponse> = {}): UserTestResponse {
  return {
    responseId: "resp-1",
    timestamp: new Date().toISOString(),
    playRunId: "run-1",
    q1WantMore: 4,
    q2Enjoyable: 5,
    q3QuestionedAi: 3,
    q4Confusion: 1,
    q5WantReuse: 4,
    freeText: "",
    ...overrides,
  };
}

describe("user test responses", () => {
  it("returns an empty array when nothing is saved", () => {
    expect(loadUserTestResponses()).toEqual([]);
  });

  it("round-trips a saved response, local-only", () => {
    const response = makeResponse();
    saveUserTestResponse(response);
    expect(loadUserTestResponses()).toEqual([response]);
  });

  it("appends without clobbering earlier responses", () => {
    saveUserTestResponse(makeResponse({ responseId: "resp-1" }));
    saveUserTestResponse(makeResponse({ responseId: "resp-2" }));
    expect(loadUserTestResponses().map((r) => r.responseId)).toEqual(["resp-1", "resp-2"]);
  });

  it("recovers from corrupted storage without crashing", () => {
    localStorage.setItem("thinking-game:user-test-responses:v1", "not json");
    expect(loadUserTestResponses()).toEqual([]);
  });
});
