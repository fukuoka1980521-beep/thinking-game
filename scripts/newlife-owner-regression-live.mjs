const ENDPOINT = process.env.NEW_LIFE_ENDPOINT || "https://newlife-refoundation-ai-zqtk74q2ra-an.a.run.app";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const transient = new Set([429, 502, 503, 504]);

async function post(body) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) return await res.json();
    if (!transient.has(res.status) || attempt === 2) {
      throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    }
    await sleep(700 * (attempt + 1));
  }
}

function context(day, sceneTitle, sceneText) {
  return {
    relationshipState: "NEUTRAL",
    boundaryStatus: "UNKNOWN",
    remainingMinutes: 30,
    activeCommitment: null,
    sceneRevisionText: null,
    day,
    sceneTitle,
    sceneText,
    canonicalState: {},
  };
}

async function converse(targetNpc, utterance, recentDialogue = [], day = 1, title = "町での一日", text = "町で人と話している。") {
  const data = await post({
    operation: "converse_turn",
    caseId: "NEWLIFE_30DAY_V1",
    targetNpc,
    rawPlayerUtterance: utterance,
    recentDialogue,
    dynamicState: context(day, title, text),
  });
  if (!data || data.npc !== targetNpc || typeof data.npcLine !== "string" || !data.npcLine.trim()) {
    throw new Error("invalid converse response");
  }
  return data;
}

const rows = [];
let hardFailures = 0;
function add(id, npc, input, output, warnings = []) {
  rows.push({ id, npc, input, output, warnings });
}

async function run() {
  const cases = [
    ["O-01", "HINA", "当日人手足りてますか", 11, "午後：重なる二人", "予約客と新しい客が重なり、陽菜は販売と受け渡しを一人で回している。"],
    ["O-02", "HINA", "全部売れるといいですね", 8, "予約の手帳", "陽菜が予約数を確認している。"],
    ["O-03", "YOHEI", "何かおすすめ商品ありますか", 6, "数のメモ", "洋平が店先で商品の数を確認している。"],
    ["O-05", "HINA", "じんでたりてます？", 11, "午後：重なる二人", "試売当日で人が重なっている。"],
    ["O-06", "HINA", "何を売るんですか？値段も教えて", 1, "値段がついた箱", "陽菜が焼き菓子の箱と値札を持っている。"],
    ["O-07-JIN", "JIN", "今日は何をしてるんですか？", 7, "一度のお願い", "仁が台の幅を見ながら設営作業をしている。"],
    ["O-07-DAISUKE", "DAISUKE", "何か手伝えることありますか？", 4, "仮止めの椅子", "大輔が家具の修理をしている。"],
    ["O-07-FUMIKO", "FUMIKO", "この場所は誰が使う予定ですか", 3, "担当という言葉", "文子が会館に掲示板を据えている。"],
  ];

  for (const [id, npc, input, day, title, text] of cases) {
    try {
      const data = await converse(npc, input, [], day, title, text);
      const warnings = [];
      if (data.npcLine.length > 220) warnings.push("long_reply");
      if (id === "O-01" && !/(大丈夫|足り|ぎり|厳|不安|困)/.test(data.npcLine)) warnings.push("staffing_judgment_not_obvious");
      if (id === "O-02" && /先に数を見/.test(data.npcLine)) warnings.push("known_semantic_drift");
      if (id === "O-03" && /^[\d\s＋+＝=。、点個]+$/.test(data.npcLine)) warnings.push("numbers_only_reply");
      add(id, npc, input, data.npcLine, warnings);
    } catch (error) {
      hardFailures += 1;
      add(id, npc, input, "ERROR: " + String(error), ["transport_or_schema_failure"]);
    }
    await sleep(2500);
  }

  try {
    const first = await converse("MIYOKO", "何か食べるものありますか", [], 2, "四つの席", "美代子の喫茶にいる。");
    await sleep(2500);
    const recent = [
      { speaker: "PLAYER", text: "何か食べるものありますか" },
      { speaker: "MIYOKO", text: first.npcLine },
    ];
    const second = await converse("MIYOKO", "ください", recent, 2, "四つの席", "美代子の喫茶にいる。");
    const warnings = [];
    if (/(何のこと|何をですか|詳しく|もう少し)/.test(second.npcLine)) warnings.push("antecedent_lost");
    add("O-04", "MIYOKO", "何か食べるものありますか → ください", first.npcLine + " / " + second.npcLine, warnings);
  } catch (error) {
    hardFailures += 1;
    add("O-04", "MIYOKO", "何か食べるものありますか → ください", "ERROR: " + String(error), ["transport_or_schema_failure"]);
  }

  const lines = [
    "# NEW LIFE live owner-regression report",
    "",
    `Endpoint: ${ENDPOINT}`,
    `Hard failures: ${hardFailures}`,
    "",
    "| Case | NPC | Input | Output | Warnings |",
    "|---|---|---|---|---|",
    ...rows.map((r) => `| ${r.id} | ${r.npc} | ${r.input.replaceAll("|", "／")} | ${r.output.replaceAll("|", "／").replaceAll("\n", " ")} | ${r.warnings.join(", ") || "none"} |`),
    "",
    "Automated warnings are triage signals only. They do not replace blind human conversation review.",
  ];
  const report = lines.join("\n");
  console.log(report);
  if (process.env.GITHUB_STEP_SUMMARY) {
    const { appendFileSync } = await import("node:fs");
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, report + "\n");
  }
  if (hardFailures > 0) process.exitCode = 1;
}

await run();
