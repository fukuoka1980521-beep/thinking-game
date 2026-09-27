import { describe, expect, it } from "vitest";
import { answerFreeText } from "../src/newlife/npcVoice";
import { createInitialState } from "../src/newlife/state";

describe("NEW LIFE owner playtest regressions 2026-09-27", () => {
  it("treats a wish that everything sells as encouragement, not an inventory question", () => {
    const reply = answerFreeText("hina", "\u5168\u90e8\u58f2\u308c\u308b\u3068\u3044\u3044\u3067\u3059\u306d", createInitialState());
    expect(reply).toMatch(/\u3042\u308a\u304c\u3068\u3046|\u3046\u308c\u3057\u3044/);
    expect(reply).not.toMatch(/\u6570\u3092|\u5341\u4e8c|\u5341\u516b/);
  });

  it("answers Yohei's recommendation with actual products, not stock arithmetic", () => {
    const reply = answerFreeText("yohei", "\u4f55\u304b\u304a\u3059\u3059\u3081\u5546\u54c1\u3042\u308a\u307e\u3059\u304b", createInitialState());
    expect(reply).toMatch(/\u30b9\u30b3\u30fc\u30f3|\u30af\u30c3\u30ad\u30fc/);
    expect(reply).not.toMatch(/\u5341\u4e8c\u3068\u5341\u516b/);
  });
});
