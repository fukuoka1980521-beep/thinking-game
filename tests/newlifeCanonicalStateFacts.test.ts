import { createRequire } from "node:module";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const { canonicalStateFactsForCase } = require(
  join(__dirname, "..", "functions", "newlife-refoundation-ai", "stateFacts.js"),
);

describe("NEW LIFE canonical state dialogue facts", () => {
  it("translates resolved and unresolved state labels into human-readable facts", () => {
    const facts = canonicalStateFactsForCase("NEWLIFE_30DAY_V1", {
      canonicalState: {
        mSeats: "bounded",
        pickupPlan: "unassigned",
        jWork: "agreed_two_hours",
        dWorkshop: "pending",
        fEditor: "unassigned",
        hyFactCheck: "avoided",
        signVersion: "vague_then_corrected",
      },
    });

    expect(facts.join(" ")).toContain("喫茶席の利用範囲は本人の言葉で確認済み");
    expect(facts.join(" ")).toContain("追加作業は未合意");
    expect(facts.join(" ")).toContain("工房利用はまだ本人の返事待ち");
    expect(facts.join(" ")).toContain("内訳が分かる形へ訂正された");
  });

  it("returns no derived facts outside the 30-day case", () => {
    expect(
      canonicalStateFactsForCase("COMMUNITY_THEATER_V1", {
        canonicalState: { mSeats: "bounded" },
      }),
    ).toEqual([]);
  });
});
