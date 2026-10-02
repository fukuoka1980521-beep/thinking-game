import { createRequire } from "node:module";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const lib = require(join(__dirname, "..", "functions", "newlife-refoundation-ai", "lib.js"));

describe("NEW LIFE recalled-memory grounding contract", () => {
  it("keeps recalled replies concrete and separates persona style from external facts", () => {
    const instruction = lib.CONVERSE_SYSTEM_INSTRUCTION;
    expect(instruction).toContain("具体物を少なくとも1つ自然に引き継ぐ");
    expect(instruction).toContain("抽象語だけへ変換して終えてはいけない");
    expect(instruction).toContain("現在の外部状況");
    expect(instruction).toContain("話し方や判断傾向の参考");
  });
});
