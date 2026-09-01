import { describe, expect, it } from "vitest";
import { loadMetricEvents, recordMetricEvent } from "../src/lib/metrics";

describe("metrics", () => {
  it("returns an empty array when nothing is recorded", () => {
    expect(loadMetricEvents()).toEqual([]);
  });

  it("appends events in order without clobbering earlier ones", () => {
    recordMetricEvent("CASE_START", "run-1", "CASE-001");
    recordMetricEvent("CASE_COMPLETE", "run-1", "CASE-001");
    recordMetricEvent("NEXT_CASE_CLICK", "run-1", "CASE-001");

    const events = loadMetricEvents();
    expect(events.map((e) => e.type)).toEqual(["CASE_START", "CASE_COMPLETE", "NEXT_CASE_CLICK"]);
    expect(events.every((e) => e.playRunId === "run-1")).toBe(true);
  });

  it("recovers from corrupted storage without crashing", () => {
    localStorage.setItem("thinking-game:metrics:v1", "not json");
    expect(loadMetricEvents()).toEqual([]);
  });
});
