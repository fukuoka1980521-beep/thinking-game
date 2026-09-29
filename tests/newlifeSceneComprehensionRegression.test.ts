import { describe, expect, it } from "vitest";
import { getScene } from "../src/newlife/content";

describe("NEW LIFE scene comprehension regressions", () => {
  it("Day 3 names the actual request and preserves Miyoko's non-consent ambiguity", () => {
    const scene = getScene(3, "done", null);

    expect(scene.text).toContain("待機場所");
    expect(scene.text).toContain("会館前が混んだら");
    expect(scene.text).toContain("何人か待たせてもらえる");
    expect(scene.text).toContain("その時のお客さんの入り具合もある");
    expect(scene.text).toContain("じゃあ、少しなら大丈夫かな");

    // The scene must show Fumiko's inference, not turn it into Miyoko's consent.
    expect(scene.text).not.toContain("美代子が了承");
    expect(scene.text).not.toContain("使っていい");
    expect(scene.lowEngagementHook).toContain("お願いを受けてもらったって書いていいのかしら");
  });

  it("removes the owner-observed opaque/meta lines from Day 3 presentation", () => {
    const scene = getScene(3, "done", null);

    expect(scene.text).not.toContain("場所を貸すだけなら簡単、使った後まで考えるとね");
    expect(scene.text).not.toContain("人が待つなら助かる");
    expect(scene.lowEngagementHook).not.toContain("見ているだけでも記録にはなる");
  });
});
