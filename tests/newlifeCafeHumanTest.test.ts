import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "..");
const page = fs.readFileSync(path.join(root, "public/newlife-cafe-v1.html"), "utf8");

describe("NEW LIFE V45 cafe-boundary human test", () => {
  it("has syntactically valid inline JavaScript", () => {
    const match = page.match(/<script>([\s\S]*?)<\/script>/);
    expect(match).not.toBeNull();
    expect(() => new Function(match![1])).not.toThrow();
  });

  it("uses only Miyoko/Fumiko inside the third case", () => {
    expect(page).toContain('caseId:"CAFE_BOUNDARY_V1"');
    expect(page).toContain('id="targetMiyoko"');
    expect(page).toContain('id="targetFumiko"');
    expect(page).not.toContain("HINA");
    expect(page).not.toContain("YOHEI");
    expect(page).not.toContain("MIKA");
    expect(page).not.toContain("RYO");
  });

  it("requires the exact V45 backend before human testing", () => {
    expect(page).toContain('data.contractVersion!=="V45"');
    expect(page).toContain("V45 backend を確認できないため開始を停止しています。");
  });

  it("shows what was actually said separately from the interpretation dispute", () => {
    expect(page).toContain("昨日、確認できている会話");
    expect(page).toContain("何か手伝えることがあれば言って");
    expect(page).toContain("席を提供すること・席数・時間は、この会話では決めていません");
    expect(page).toContain("混雑時の待合は喫茶みよこへ");
  });

  it("preserves raw free conversation and bounded NPC-to-NPC continuation", () => {
    expect(page).toContain('rawPlayerUtterance:utterance');
    expect(page).toContain('operation:"continue_npc_exchange"');
    expect(page).toContain("const MAX_NPC_EXCHANGE_TURNS=3");
    expect(page).toContain("continuationDepth:depth");
  });

  it("starts with two distinct interpretations, not a pre-declared winner", () => {
    expect(page).toContain("私そこまで引き受けたつもりはないのよ");
    expect(page).toContain("私は何席かならお願いできると思ったの");
    expect(page).not.toContain("文子が悪い");
    expect(page).not.toContain("美代子が悪い");
  });

  it("keeps thought organization separate from NPC speech", () => {
    expect(page).toContain("これは美代子・文子の発言ではありません");
    expect(page).toContain('operation:"organize_thought"');
    expect(page).toContain("過去の言葉の勝ち負けではなく");
  });
});
