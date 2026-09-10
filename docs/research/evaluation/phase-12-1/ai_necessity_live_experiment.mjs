// PHASE 12.1 directive Section 6: mandatory AI-necessity experiment. Same PLAYER utterance
// (「手伝おうか？」) to Yohei under 3 legitimate world states, using REAL LIVE Vertex AI output.
// The three final responses are NOT pre-authored anywhere in this repository -- this script is
// the first and only place they are produced, and it is produced by the model, not by this script's
// author. Reuses devtools/bgwVertexLiveAdapterCore.mjs unmodified (the same module the real dev
// server middleware uses) -- no second, independently-maintained copy of the prompt/call logic.
import { getLiveNpcDialogueEnvelope } from "../../../../devtools/bgwVertexLiveAdapterCore.mjs";
import fs from "node:fs";

const YOHEI_CANON = {
  id: "yohei",
  displayName: "洋平",
  role: "商店主。町で一番の高頻度な実用の窓口。",
  firsthand: ["自分の店の在庫と配達スケジュール", "今月、商店街の祭りの出店用に特別な仕入れを頼んだこと", "自分の店の日々の商売のこと"],
  heard: ["商店街の寄り合いで聞いた話"],
  unknowns: ["チャレンジセンターや役所の内部事情", "プレイヤーが来る前の私生活", "他人の個人的な事情（本人から直接聞いていない限り）"],
  wants: "店を滞りなく回すこと。ひやかしではなく、必要な物を素直に聞いてくれる客がいること。",
  constraints: "直接聞いたか、商売の場で自然に耳にしたことしか知らない。プレイヤーについて特別な洞察は持たない。",
  speechRegister: "初対面は短く実務的。親しくなるとくだけた「〜だな」「〜だよ」に落ちるが、乱暴ではない。過度な説明はしない。",
};

const WORLD_FACTS = [
  "プレイヤーは57歳の男性で、長年勤めた仕事を辞めた",
  "次の仕事や方向性はまだ決めていない",
  "自分の意志でチャレンジ町の30日間トライアル滞在に応募した",
  "DAY30には仮住まいの鍵を返す必要がある",
];

function basePacket(activity, allowedConsequenceIds) {
  return {
    npcId: "yohei",
    canon: YOHEI_CANON,
    worldFacts: WORLD_FACTS,
    npcCurrentActivity: activity,
    npcLocation: "YOHEI_STORE",
    npcRelationshipToPlayer: "今月チャレンジ町に来た新しい滞在者として、顔を合わせたことがある程度の間柄",
    currentLocation: "YOHEI_STORE",
    recentRelevantExperience: [],
    playerUtterance: "手伝おうか？",
    allowedClassifications: ["IN_SCOPE", "NPC_KNOWLEDGE_GAP", "NOT_FEASIBLE_NOW", "OUT_OF_WORLD_SCOPE", "INSUFFICIENT_CONTEXT"],
    allowedConsequenceIds,
  };
}

// STATE A: Yohei alone, active task, help genuinely needed.
const stateA = basePacket("洋平は、倉庫の在庫を一人で運ぼうとしている。", ["YOHEI_HELP_PROMISE"]);
// STATE B: same task exists, but Jin (相馬) is already there doing a repair job -- help already covered.
const stateB = basePacket("洋平は、詰まった倉庫の扉の修理を相馬に頼んでいるところだ。相馬が作業をしている。", []);
// STATE C: no active task at all -- ordinary quiet shop moment.
const stateC = basePacket("洋平は、いつも通り店番をしている。", []);

const results = [];
for (const [label, packet] of [["STATE_A_ALONE_TASK_ACTIVE", stateA], ["STATE_B_JIN_ALREADY_HELPING", stateB], ["STATE_C_NO_TASK", stateC]]) {
  console.log(`Calling live Vertex AI for ${label}...`);
  const { envelope, raw } = await getLiveNpcDialogueEnvelope(packet);
  results.push({ label, packet, envelope, httpStatus: raw.httpStatus, finishReason: raw.finishReason, usageMetadata: raw.usageMetadata });
  console.log(`${label}: httpStatus=${raw.httpStatus} finishReason=${raw.finishReason} envelope=`, envelope);
}

fs.writeFileSync(
  new URL("./ai_necessity_live_evidence.json", import.meta.url),
  JSON.stringify({ purpose: "PHASE 12.1 Section 6: same utterance, 3 world states, real live Vertex output, not pre-authored", model: "gemini-2.5-flash", results }, null, 2),
  "utf8",
);

const distinctUtterances = new Set(results.map((r) => r.envelope?.visibleUtterance));
const distinctConsequences = new Set(results.map((r) => r.envelope?.proposedConsequenceId ?? null));
console.log("\nDistinct visible utterances:", distinctUtterances.size, "/ 3");
console.log("Distinct proposedConsequenceId values:", [...distinctConsequences]);
console.log("DONE");
