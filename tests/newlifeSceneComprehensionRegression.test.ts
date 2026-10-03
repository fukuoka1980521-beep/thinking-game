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
  });

  it("removes the owner-observed opaque/meta lines from Day 3 presentation", () => {
    const scene = getScene(3, "done", null);

    expect(scene.text).not.toContain("場所を貸すだけなら簡単、使った後まで考えるとね");
    expect(scene.text).not.toContain("人が待つなら助かる");
  });

  it("Day 6 says what the 12 and 18 mean instead of using the opaque phrase '買える方'", () => {
    const scene = getScene(6, "done", null);

    expect(scene.text).toContain("予約12");
    expect(scene.text).toContain("店頭18");
    expect(scene.text).toContain("当日来た人が買えるのは18点");
    expect(scene.text).not.toContain("俺が聞いてるのは、買える方だ");
  });

  it("Day 14 names the actual communication problem instead of saying only '別の話'", () => {
    const scene = getScene(14, "done", null);

    expect(scene.text).toContain("店頭十八");
    expect(scene.text).toContain("予約十二");
    expect(scene.text).toContain("客がどこでどう待つのか伝わってなかった");
    expect(scene.text).not.toContain("昨日の説明は別の話だ");
  });

  it("Day 16 states the concrete work request and Jin's scope condition", () => {
    const scene = getScene(16, "done", null);

    expect(scene.text).toContain("会館前の台を据える仕事");
    expect(scene.text).toContain("何をどこまでやるか");
    expect(scene.text).toContain("時間を先に決めて");
    expect(scene.text).not.toContain("また手伝ってくれる？");
  });

  it("Day 3 exposes the concrete issue, decision, and authority as a scene focus", () => {
    const scene = getScene(3, "done", null);

    expect(scene.sceneFocus?.issue).toContain("客がどこで待つか");
    expect(scene.sceneFocus?.decision).toContain("何人まで");
    expect(scene.sceneFocus?.authority).toContain("決めるのは美代子");
    expect(scene.sceneFocus?.authority).toContain("文子は掲示");
  });

  it("Day 2 keeps chair repair separate from Hina's sales location", () => {
    const scene = getScene(2, "done", null);

    expect(scene.text).toContain("椅子の脚");
    expect(scene.text).toContain("コーヒー");
    expect(scene.text).toContain("売れるといいわね");
    expect(scene.sceneFocus?.issue).toContain("喫茶で販売すると決まったわけではありません");
    expect(scene.sceneFocus?.authority).toContain("試売の販売物とは別");
  });

  it("Day 4 says baked-goods pickup explicitly and never implies that chairs are the trial-sale product", () => {
    const scene = getScene(4, "done", null);

    expect(scene.text).toContain("陽菜さんの焼き菓子");
    expect(scene.text).toContain("商品を受け取る場所");
    expect(scene.text).toContain("椅子の修理とは別の話");
    expect(scene.sceneFocus?.decision).toContain("焼き菓子の受け取り場所");
    expect(scene.sceneFocus?.authority).toContain("椅子は修理品");
    expect(scene.text).not.toContain("椅子を販売");
  });

  it("Day 4 exposes separate canonical entities for chair repair, baked goods, and workshop", () => {
    const scene = getScene(4, "done", null);
    const entities = scene.sceneEntities ?? [];

    const chair = entities.find((entity) => entity.id === "repair_chair");
    const goods = entities.find((entity) => entity.id === "hina_baked_goods");
    const workshop = entities.find((entity) => entity.id === "daisuke_workshop");

    expect(chair?.role).toContain("修理");
    expect(chair?.facts).toContain("陽菜の試売商品ではない");
    expect(goods?.role).toContain("試売商品");
    expect(goods?.facts).toContain("椅子とは別件");
    expect(workshop?.role).toContain("受け渡す場所");
    expect(workshop?.facts).toContain("貸すかどうかを決めるのは大輔");
  });
});
