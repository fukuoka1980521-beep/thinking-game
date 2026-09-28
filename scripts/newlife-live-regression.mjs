const endpoint = process.env.NEW_LIFE_ENDPOINT || "https://newlife-refoundation-ai-zqtk74q2ra-an.a.run.app";

const baseState = {
  relationshipState: "NEUTRAL",
  boundaryStatus: "UNKNOWN",
  remainingMinutes: 30,
  activeCommitment: null,
  sceneRevisionText: null,
  canonicalState: {},
};

const cases = [
  {
    id: "O-01",
    npc: "HINA",
    utterance: "当日人手足りてますか",
    sceneTitle: "空欄の一行",
    sceneText: "陽菜は焼く時間と販売の時間が重なることに気づいている。",
  },
  {
    id: "O-02",
    npc: "HINA",
    utterance: "全部売れるといいですね",
    sceneTitle: "予約の手帳",
    sceneText: "陽菜は予約12点と店頭18点の試売を準備している。",
  },
  {
    id: "O-03",
    npc: "YOHEI",
    utterance: "何かおすすめ商品ありますか",
    sceneTitle: "数のメモ",
    sceneText: "洋平は通りの店先で、試売の数を確認している。",
  },
  {
    id: "O-04a",
    npc: "MIYOKO",
    utterance: "何か食べるものありますか",
    sceneTitle: "四つの席",
    sceneText: "美代子の喫茶。店内には客がいて、普段の営業中。",
  },
  {
    id: "O-05",
    npc: "HINA",
    utterance: "ひとでたりてる？",
    sceneTitle: "空欄の一行",
    sceneText: "陽菜は焼く時間と販売の時間が重なることに気づいている。",
  },
  {
    id: "O-06",
    npc: "YOHEI",
    utterance: "おすすめありますか。それと何時ごろ行けば買えそうですか？",
    sceneTitle: "数のメモ",
    sceneText: "洋平は店頭分と予約分の数字を確認している。",
  },
  {
    id: "O-07-JIN",
    npc: "JIN",
    utterance: "今日は何してるんですか？",
    sceneTitle: "一度のお願い",
    sceneText: "仁は試売で使う台の幅と通路を確認している。",
  },
  {
    id: "O-07-DAISUKE",
    npc: "DAISUKE",
    utterance: "何か手伝えることありますか？",
    sceneTitle: "仮止めの椅子",
    sceneText: "大輔の工房。椅子の修理をしながら試売日の相談を受けている。",
  },
  {
    id: "O-07-FUMIKO",
    npc: "FUMIKO",
    utterance: "この掲示板は誰が使う予定ですか？",
    sceneTitle: "担当という言葉",
    sceneText: "文子が会館に小さな掲示板を据え、日付を入れている。",
  },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function postJson(body) {
  let last;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const raw = await response.text();
    let data = null;
    try { data = JSON.parse(raw); } catch { /* shape check below */ }
    if (response.ok) return data;
    last = new Error(`HTTP ${response.status}: ${raw.slice(0, 160)}`);
    if (response.status !== 429 && response.status < 500) break;
    await sleep([1200, 2600, 5200][attempt] ?? 5200);
  }
  throw last ?? new Error("request failed");
}

function dynamicState(index, c) {
  return {
    ...baseState,
    day: Math.min(30, index + 1),
    sceneTitle: c.sceneTitle,
    sceneText: c.sceneText,
  };
}

const results = [];
let structuralFailures = 0;

for (let i = 0; i < cases.length; i += 1) {
  const c = cases[i];
  try {
    const reply = await postJson({
      operation: "converse_turn",
      caseId: "NEWLIFE_30DAY_V1",
      targetNpc: c.npc,
      rawPlayerUtterance: c.utterance,
      recentDialogue: [],
      dynamicState: dynamicState(i, c),
    });

    const ok = Boolean(reply && reply.npc === c.npc && typeof reply.npcLine === "string" && reply.npcLine.trim());
    if (!ok) structuralFailures += 1;
    results.push({ id: c.id, npc: c.npc, utterance: c.utterance, structuralPass: ok, reply: reply?.npcLine ?? null });

    if (c.id === "O-04a" && ok) {
      await sleep(2800);
      const follow = await postJson({
        operation: "converse_turn",
        caseId: "NEWLIFE_30DAY_V1",
        targetNpc: "MIYOKO",
        rawPlayerUtterance: "ください",
        recentDialogue: [
          { speaker: "PLAYER", text: c.utterance },
          { speaker: "MIYOKO", text: reply.npcLine },
        ],
        dynamicState: dynamicState(i, c),
      });
      const followOk = Boolean(follow && follow.npc === "MIYOKO" && typeof follow.npcLine === "string" && follow.npcLine.trim());
      if (!followOk) structuralFailures += 1;
      results.push({ id: "O-04b", npc: "MIYOKO", utterance: "ください", structuralPass: followOk, reply: follow?.npcLine ?? null });
    }
  } catch (error) {
    structuralFailures += 1;
    results.push({ id: c.id, npc: c.npc, utterance: c.utterance, structuralPass: false, error: String(error) });
  }
  await sleep(2800);
}

console.log(JSON.stringify({
  endpoint,
  generatedAt: new Date().toISOString(),
  structuralFailures,
  qualityReviewRequired: true,
  rubric: ["directness", "context", "persona", "truth", "economy", "variation", "continuity"],
  results,
}, null, 2));

if (structuralFailures > 0) process.exitCode = 1;
