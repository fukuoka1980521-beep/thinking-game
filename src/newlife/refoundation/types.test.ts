/**
 * Guards `types.ts` against silent drift from the validated contract surface
 * (V13 as patched through V24; see the blind matrices in
 * docs/newlife/refoundation/blind/, which enumerate the same allowed-value
 * lists in their "Output" sections). This stage has no reducer logic yet —
 * these are structural/shape assertions, not behavior tests.
 */
import { describe, expect, it } from "vitest";
import {
  ALL_ACTION_TYPES,
  ALL_BOUNDARY_MODES,
  ALL_RELATIONAL_EVENTS,
  EVENT_CLASS_PRECEDENCE,
  SEVERE_RUPTURE_COMBO,
  SIMPLE_RELATIONAL_EVENT_CLASS,
} from "./types";

describe("refoundation contract surface (V13+V14+V16+V18+V20+V22+V24)", () => {
  it("has exactly the 20 allowed ACTION values from the V9 blind matrix", () => {
    expect(ALL_ACTION_TYPES).toHaveLength(20);
    expect(new Set(ALL_ACTION_TYPES).size).toBe(20);
  });

  it("has exactly the 7 allowed BOUNDARY_MODE values from the V9 blind matrix", () => {
    expect(ALL_BOUNDARY_MODES).toHaveLength(7);
    expect(new Set(ALL_BOUNDARY_MODES).size).toBe(7);
  });

  it("has exactly the 8 allowed RELATIONAL_EVENTS values from the V9 blind matrix", () => {
    expect(ALL_RELATIONAL_EVENTS).toHaveLength(8);
    expect(new Set(ALL_RELATIONAL_EVENTS).size).toBe(8);
  });

  it("orders event classes SEVERE_RUPTURE > STRAIN > REPAIR > RELIABILITY > NONE (V14 §2)", () => {
    expect(EVENT_CLASS_PRECEDENCE).toEqual(["SEVERE_RUPTURE", "STRAIN", "REPAIR", "RELIABILITY", "NONE"]);
  });

  it("maps the five context-independent relational events to their V14 §3 class", () => {
    expect(SIMPLE_RELATIONAL_EVENT_CLASS.PERSONAL_INSULT).toBe("STRAIN");
    expect(SIMPLE_RELATIONAL_EVENT_CLASS.PUBLIC_SHAMING).toBe("STRAIN");
    expect(SIMPLE_RELATIONAL_EVENT_CLASS.FALSE_ATTRIBUTION).toBe("STRAIN");
    expect(SIMPLE_RELATIONAL_EVENT_CLASS.DISMISSES_CONCERN).toBe("STRAIN");
    expect(SIMPLE_RELATIONAL_EVENT_CLASS.ACKNOWLEDGES_MISTAKE).toBe("REPAIR");
    expect(SIMPLE_RELATIONAL_EVENT_CLASS.KEEPS_PROMISE).toBe("RELIABILITY");
  });

  it("flags exactly PUBLIC_SHAMING + PERSONAL_INSULT as the SEVERE_RUPTURE combo (V14 §2)", () => {
    expect(SEVERE_RUPTURE_COMBO.has("PUBLIC_SHAMING")).toBe(true);
    expect(SEVERE_RUPTURE_COMBO.has("PERSONAL_INSULT")).toBe(true);
    expect(SEVERE_RUPTURE_COMBO.size).toBe(2);
  });
});
