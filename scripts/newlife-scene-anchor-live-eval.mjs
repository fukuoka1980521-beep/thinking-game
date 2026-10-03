#!/usr/bin/env node
/**
 * NEW LIFE semantic scene-anchor live probe.
 *
 * Usage:
 *   NEWLIFE_REFOUNDATION_ENDPOINT=https://... node scripts/newlife-scene-anchor-live-eval.mjs
 *
 * This is intentionally NOT an exact-string grader. It captures model replies
 * for semantic/human review and includes a topic-shift control to detect
 * over-anchoring.
 */
import fs from "node:fs";

const endpoint = process.env.NEWLIFE_REFOUNDATION_ENDPOINT;
if (!endpoint) {
  console.error("Missing NEWLIFE_REFOUNDATION_ENDPOINT");
  process.exit(2);
}

const sceneFocus = {
  issue: "試売の日、会館前が混んだ時に、客がどこで待つかまだ決まっていません。",
  decision: "喫茶の席を待機場所に使うなら、何人まで・どんな条件ならよいかを事前に確認する必要があります。",
  authority: "喫茶の席を使わせるか、何人まで受けるかを決めるのは美代子です。文子は掲示と案内を担当します。",
};

const dynamicState = {
  relationshipState: "NEUTRAL",
  boundaryStatus: "UNKNOWN",
  remainingMinutes: 30,
  activeCommitment: null,
  day: 3,
  sceneTitle: "担当という言葉",
  sceneText:
    "文子が会館前が混んだ場合の待機場所を相談している。美代子は喫茶の席について明示的な人数・条件をまだ了承していない。",
  sceneFocus,
  canonicalState: {
    signVersion: "unposted",
    pickupPlan: "unassigned",
    mSeats: "assumed",
    jWork: "agreed_two_hours",
    dWorkshop: "pending",
    fEditor: "unassigned",
    hyFactCheck: "avoided",
    playerReport: "reliable",
    publicBlame: "none",
    encouragementOnly: false,
    day24Outcome: null,
  },
  interactionKind: "SPEECH",
};

async function converse(targetNpc, utterance, recentDialogue = []) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      operation: "converse_turn",
      caseId: "NEWLIFE_30DAY_V1",
      targetNpc,
      rawPlayerUtterance: utterance,
      recentDialogue,
      dynamicState,
    }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
  return JSON.parse(text);
}

const runs = [];

const firstUtterance =
  "商売ですからね、できることとできないことは決めておいたほうが良いですよ";
const first = await converse("MIYOKO", firstUtterance);
runs.push({
  id: "owner_meaning_miyoko",
  targetNpc: "MIYOKO",
  utterance: firstUtterance,
  response: first,
  reviewQuestion:
    "一般論だけで終わらず、喫茶の席・人数・条件など現在の具体的争点へ自然に戻っているか。",
});

const secondUtterance =
  "できるだけご自分で対応しないと。どうにもならなければ当日美代子さんに電話して相談するくらいにしないと";
const secondHistory = [
  { speaker: "PLAYER", text: firstUtterance },
  { speaker: "MIYOKO", text: first.npcLine },
];
const second = await converse("FUMIKO", secondUtterance, secondHistory);
runs.push({
  id: "owner_meaning_fumiko",
  targetNpc: "FUMIKO",
  utterance: secondUtterance,
  response: second,
  reviewQuestion:
    "『担当を明確に』だけに抽象化せず、待機場所・席数・事前確認・美代子の決定権へ結び直しているか。",
});

const paraphrase =
  "当日になってから毎回判断するより、先に何人までなら大丈夫か決めておいたほうがいいんじゃないですか";
const para = await converse("MIYOKO", paraphrase);
runs.push({
  id: "paraphrase_boundary",
  targetNpc: "MIYOKO",
  utterance: paraphrase,
  response: para,
  reviewQuestion:
    "元の発言と表現が違っても、同じ実務意味を具体的な場面へ結び直せているか。",
});

const offTopic =
  "ところで、このコーヒーは深煎りですか？";
const off = await converse("MIYOKO", offTopic);
runs.push({
  id: "topic_shift_control",
  targetNpc: "MIYOKO",
  utterance: offTopic,
  response: off,
  reviewQuestion:
    "明確な話題転換を無理に待機場所・席数の議論へ引き戻していないか。",
});

const output = {
  generatedAt: new Date().toISOString(),
  endpoint,
  sceneFocus,
  note:
    "No automatic product verdict. Review semantically: player meaning -> scene anchor -> authority -> character reply, while preserving genuine topic changes.",
  runs,
};

const outPath =
  process.env.NEWLIFE_ANCHOR_EVAL_OUT ||
  "NEWLIFE_SCENE_ANCHOR_LIVE_EVAL.json";
fs.writeFileSync(outPath, JSON.stringify(output, null, 2), "utf8");
console.log(JSON.stringify(output, null, 2));
console.error(`WROTE ${outPath}`);
