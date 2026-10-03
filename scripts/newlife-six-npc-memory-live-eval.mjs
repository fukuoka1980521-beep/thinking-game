import fs from "node:fs";

const endpoint =
  process.env.NEWLIFE_REFOUNDATION_ENDPOINT ||
  "https://newlife-refoundation-ai-chatfirst-test-zqtk74q2ra-an.a.run.app";
const out =
  process.env.NEWLIFE_SIX_NPC_MEMORY_OUT ||
  "C:\\Users\\user\\Downloads\\NEWLIFE_SIX_NPC_MEMORY_LIVE_EVAL_20261003.json";

const canonicalState = {
  signVersion: "vague_then_corrected",
  pickupPlan: "unassigned",
  mSeats: "bounded",
  jWork: "agreed_two_hours",
  dWorkshop: "pending",
  fEditor: "unassigned",
  hyFactCheck: "avoided",
  playerReport: "reliable",
  publicBlame: "none",
  encouragementOnly: false,
  day24Outcome: null,
};

const cases = [
  {
    id: "hina_stock_split",
    npc: "HINA",
    utterance: "この前、予約分と店頭分の話をしたの覚えてる？今どう考えてる？",
    memory:
      "Day 6 [OBSERVATION] 問題: 予約12点と店頭18点の違いが客に伝わるかが曖昧だった。プレイヤーは合計30点ではなく店頭分を分けて伝えるよう勧めた。",
    expectedTopic: "予約と店頭の区別",
  },
  {
    id: "yohei_numbers",
    npc: "YOHEI",
    utterance: "前に12と18の話をしたけど、何が問題だったと思う？",
    memory:
      "Day 6 [OBSERVATION] 洋平は予約12点・店頭18点を確認し、数字が正しいだけでなく客への伝わり方が問題だと考えた。",
    expectedTopic: "数字と表示の意味",
  },
  {
    id: "daisuke_workshop",
    npc: "DAISUKE",
    utterance: "工房を受け取り場所に使う話、まだ覚えてる？",
    memory:
      "Day 4 [OBSERVATION] 文子は大輔に試売の日に工房を受け取り場所として使えるか尋ねた。大輔本人の返事はまだ決まっていなかった。",
    expectedTopic: "工房利用の返事",
  },
  {
    id: "jin_paid_scope",
    npc: "JIN",
    utterance: "前の二時間の仕事と、追加で頼む仕事はどう分けて考えてる？",
    memory:
      "Day 16 [OBSERVATION] 前回の二時間の設営は有償で完了。追加作業は内容・時間・報酬を具体化して仁本人が了承する必要がある。",
    expectedTopic: "追加作業の内容・時間・報酬",
  },
  {
    id: "miyoko_waiting_seats",
    npc: "MIYOKO",
    utterance: "この前の待つ場所の話、今はどう考えてる？",
    memory:
      "Day 3 [OBSERVATION] 問題: 会館前が混んだ時の待機場所が未決。未決: 喫茶の席を何人まで・どんな条件で使えるか。権限: 席を決めるのは美代子。",
    expectedTopic: "喫茶の待機席・人数・条件",
  },
  {
    id: "fumiko_notice",
    npc: "FUMIKO",
    utterance: "前に確認が曖昧なまま掲示しそうになった件、次はどうする？",
    memory:
      "Day 3 [OBSERVATION] 文子は美代子の曖昧な返事を了承としてメモしかけた。店の席を使う条件は美代子本人に具体的に確認する必要があった。",
    expectedTopic: "掲示前の具体確認",
  },
];

async function runCase(testCase) {
  const body = {
    operation: "converse_turn",
    caseId: "NEWLIFE_30DAY_V1",
    targetNpc: testCase.npc,
    rawPlayerUtterance: testCase.utterance,
    recentDialogue: [],
    dynamicState: {
      relationshipState: "NEUTRAL",
      boundaryStatus: "UNKNOWN",
      remainingMinutes: 30,
      activeCommitment: null,
      day: 20,
      sceneTitle: "別の日の会話",
      sceneText: "通常の一日。プレイヤーが以前の出来事について話しかけている。",
      sceneFocus: null,
      retrievedMemories: [testCase.memory],
      canonicalState,
      interactionKind: "SPEECH",
    },
  };
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let parsed = null;
  try { parsed = JSON.parse(text); } catch {}
  return {
    ...testCase,
    status: res.status,
    response: parsed,
    technicalPass: res.ok && typeof parsed?.npcLine === "string" && parsed.npcLine.trim().length > 0,
    reviewQuestion:
      "過去の具体的な争点を覚えている返答になっているか。人格設定から未観測の出来事・継続的思考を足していないか。",
  };
}

const results = [];
for (const testCase of cases) results.push(await runCase(testCase));

const report = {
  generatedAt: new Date().toISOString(),
  endpoint,
  note:
    "TechnicalPass checks transport/shape only. Social-naturalness and grounded recall require semantic/human review.",
  results,
  technicalPass: results.every((r) => r.technicalPass),
  humanProductVerdict: "PENDING",
};

fs.writeFileSync(out, JSON.stringify(report, null, 2), "utf8");
console.log(JSON.stringify(report, null, 2));
console.error(`WROTE ${out}`);
