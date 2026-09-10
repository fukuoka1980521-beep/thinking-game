// PHASE 12.1 directive Section 5 (resumed after interruption): the minimum additional live calls
// needed for cases A-E. Case F (one interaction capable of proposing an allowed consequence) is
// NOT re-called here -- STATE_A_ALONE_TASK_ACTIVE from ai_necessity_live_evidence.json already
// satisfies it (real proposedConsequenceId="YOHEI_HELP_PROMISE"), and directive Section 5 explicitly
// says keep total live calls <= 30 / do not create a large prompt-tuning loop, so an already-
// captured, already-valid result is reused rather than re-spent.
import { getLiveNpcDialogueEnvelope } from "../../../../devtools/bgwVertexLiveAdapterCore.mjs";
import fs from "node:fs";

const YOHEI_CANON = {
  id: "yohei",
  displayName: "洋平",
  role: "商店主。町で一番の高頻度な実用の窓口。",
  firsthand: ["自分の店の在庫と配達スケジュール", "今月、商店街の祭りの出店用に特別な仕入れを頼んだこと", "自分の店の日々の商売のこと"],
  heard: ["商店街の寄り合いで聞いた話"],
  unknowns: ["チャレンジセンターや役所の内部事情", "プレイヤーが来る前の私生活", "他人の個人的な事情（本人から直接聞いていない限り）", "美代子の店の仕入れ先の詳細"],
  wants: "店を滞りなく回すこと。ひやかしではなく、必要な物を素直に聞いてくれる客がいること。",
  constraints: "直接聞いたか、商売の場で自然に耳にしたことしか知らない。プレイヤーについて特別な洞察は持たない。",
  speechRegister: "初対面は短く実務的。親しくなるとくだけた「〜だな」「〜だよ」に落ちるが、乱暴ではない。過度な説明はしない。",
};

const MIYOKO_CANON = {
  id: "miyoko",
  displayName: "美代子",
  role: "喫茶店（喫茶のどか）の店主。ゆっくりした会話の窓口。",
  firsthand: ["自分の店の営業のこと", "今月、豆の仕入れ先を変えようとしていること"],
  heard: ["カウンター越しに聞く町の噂話"],
  unknowns: ["洋平の店の在庫の詳細", "チャレンジセンターや役所の内部事情", "プレイヤーの私生活"],
  wants: "人が実際に座りたいと思える店であること。ささやかで正直なやりとりに満足を感じる。",
  constraints: "頼まれなければ自分から立ち入った話はしない。洋平と同じく、直接聞いたか自然に耳にしたことしか知らない。",
  speechRegister: "温かく親しみやすい。踏み込みすぎない。",
};

const WORLD_FACTS = [
  "プレイヤーは57歳の男性で、長年勤めた仕事を辞めた",
  "次の仕事や方向性はまだ決めていない",
  "自分の意志でチャレンジ町の30日間トライアル滞在に応募した",
  "DAY30には仮住まいの鍵を返す必要がある",
];

const ALLOWED_CLASSIFICATIONS = ["IN_SCOPE", "NPC_KNOWLEDGE_GAP", "NOT_FEASIBLE_NOW", "OUT_OF_WORLD_SCOPE", "INSUFFICIENT_CONTEXT"];

function packet({ npcId, canon, activity, location, relationship, utterance, allowedConsequenceIds }) {
  return {
    npcId,
    canon,
    worldFacts: WORLD_FACTS,
    npcCurrentActivity: activity,
    npcLocation: location,
    npcRelationshipToPlayer: relationship,
    currentLocation: location,
    recentRelevantExperience: [],
    playerUtterance: utterance,
    allowedClassifications: ALLOWED_CLASSIFICATIONS,
    allowedConsequenceIds,
  };
}

const cases = [
  {
    label: "A_UNAUTHORED_FEASIBLE_SUGGESTION",
    description: "A reasonable, in-world suggestion to Miyoko that has NO pre-authored dialogue response and NO registered consequence id at all for her.",
    packet: packet({
      npcId: "miyoko",
      canon: MIYOKO_CANON,
      activity: "美代子は、いつも通り店を開けている。",
      location: "CAFE_NODOKA",
      relationship: "今月チャレンジ町に来た新しい滞在者として、顔を合わせたことがある程度の間柄",
      utterance: "豆の仕入れ先を変えるなら、味の感想とか聞かせてよ。今度感想言うよ。",
      allowedConsequenceIds: [],
    }),
  },
  {
    label: "B_NPC_KNOWLEDGE_GAP",
    description: "Ask Yohei something specifically outside his firsthand/heard knowledge (Miyoko's own new supplier detail).",
    packet: packet({
      npcId: "yohei",
      canon: YOHEI_CANON,
      activity: "洋平は、いつも通り店番をしている。",
      location: "YOHEI_STORE",
      relationship: "今月チャレンジ町に来た新しい滞在者として、顔を合わせたことがある程度の間柄",
      utterance: "美代子さんの新しいコーヒー豆の仕入れ先、正確にはどこの会社？",
      allowedConsequenceIds: [],
    }),
  },
  {
    label: "C_OUTSIDE_NPC_SCOPE",
    description: "Ask Miyoko something outside HER channel specifically (Yohei's own exact inventory count).",
    packet: packet({
      npcId: "miyoko",
      canon: MIYOKO_CANON,
      activity: "美代子は、いつも通り店を開けている。",
      location: "CAFE_NODOKA",
      relationship: "今月チャレンジ町に来た新しい滞在者として、顔を合わせたことがある程度の間柄",
      utterance: "洋平さんの店の今の在庫、正確に何個か知ってる？",
      allowedConsequenceIds: [],
    }),
  },
  {
    label: "D_OUTSIDE_WORLD_SCOPE",
    description: "Wildly out-of-world question with no referent in the authored world at all.",
    packet: packet({
      npcId: "yohei",
      canon: YOHEI_CANON,
      activity: "洋平は、いつも通り店番をしている。",
      location: "YOHEI_STORE",
      relationship: "今月チャレンジ町に来た新しい滞在者として、顔を合わせたことがある程度の間柄",
      utterance: "ところで、宇宙人っているのかな？",
      allowedConsequenceIds: [],
    }),
  },
  {
    label: "E_FALSE_PLAYER_WORLD_ASSERTION",
    description: "PLAYER asserts a false world-history fact that never happened in this state.",
    packet: packet({
      npcId: "yohei",
      canon: YOHEI_CANON,
      activity: "洋平は、いつも通り店番をしている。",
      location: "YOHEI_STORE",
      relationship: "今月チャレンジ町に来た新しい滞在者として、顔を合わせたことがある程度の間柄",
      utterance: "さっき、倉庫の鍵を渡してくれたよね？",
      allowedConsequenceIds: [],
    }),
  },
];

const results = [];
for (const c of cases) {
  console.log(`Calling live Vertex AI for ${c.label}...`);
  const started = Date.now();
  const { envelope, raw } = await getLiveNpcDialogueEnvelope(c.packet);
  const latencyMs = Date.now() - started;
  results.push({ label: c.label, description: c.description, packet: c.packet, envelope, httpStatus: raw.httpStatus, finishReason: raw.finishReason, usageMetadata: raw.usageMetadata, latencyMs });
  console.log(`${c.label}: httpStatus=${raw.httpStatus} finishReason=${raw.finishReason} latencyMs=${latencyMs} envelope=`, envelope);
}

fs.writeFileSync(
  new URL("./bounded_free_text_live_evidence.json", import.meta.url),
  JSON.stringify({ purpose: "PHASE 12.1 Section 5/7: bounded free-text NG/suggestion/false-assertion cases, real live Vertex output", model: "gemini-2.5-flash", results }, null, 2),
  "utf8",
);
console.log("DONE");
