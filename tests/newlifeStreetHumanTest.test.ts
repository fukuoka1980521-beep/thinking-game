import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "..");
const page = fs.readFileSync(path.join(root, "public/newlife-street-v1.html"), "utf8");

describe("NEW LIFE V43 street-trial human test", () => {
  it("has syntactically valid inline JavaScript", () => {
    const match = page.match(/<script>([\s\S]*?)<\/script>/);
    expect(match).not.toBeNull();
    expect(() => new Function(match![1])).not.toThrow();
  });

  it("uses the second server-owned case and only its two NPCs", () => {
    expect(page).toContain('caseId:"STREET_TRIAL_V1"');
    expect(page).toContain('targetNpc:requestTarget');
    expect(page).toContain('id="targetHina"');
    expect(page).toContain('id="targetYohei"');
    expect(page).not.toContain('targetMika');
    expect(page).not.toContain('targetRyo');
  });

  it("requires V43 health before human testing", () => {
    expect(page).toContain('data.contractVersion!=="V43"');
    expect(page).toContain('V43 backend を確認できないため開始を停止しています。');
  });

  it("preserves raw free conversation and bounded NPC-to-NPC continuation", () => {
    expect(page).toContain('rawPlayerUtterance:utterance');
    expect(page).toContain('operation:"continue_npc_exchange"');
    expect(page).toContain('const MAX_NPC_EXCHANGE_TURNS=3');
    expect(page).toContain('continuationDepth:depth');
  });

  it("shows the ambiguous public sign as a real observable artifact", () => {
    expect(page).toContain("現在の掲示");
    expect(page).toContain("本日30点");
    expect(page).toContain("予約品の受け渡し担当");
  });

  it("guards against theater-only scene-revision leakage", () => {
    expect(page).toContain('sceneRevisionText:null');
    expect(page).toContain('data.sceneRevisionProposal?.hasProposal===true');
    expect(page).toContain("商店街ケースで台本修正が生成されました");
  });

  it("starts with distinct Hina and Yohei voices rather than reusing theater dialogue", () => {
    expect(page).toContain("『本日30点』って書いただけなんです。そんなに変ですか？");
    expect(page).toContain("で、店頭は何個だ。");
    expect(page).not.toContain("この場面、明日はやりません");
  });
});
