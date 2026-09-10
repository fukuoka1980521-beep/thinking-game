// PHASE 12.1: server-side-only Vertex AI live adapter core. Plain ESM Node module (not TypeScript)
// so it can be imported identically by (a) the Vite dev-server-only middleware
// (devtools/bgwVertexDevMiddleware.mjs, wired into vite.config.ts with `apply: "serve"`) and (b)
// standalone evidence-capture scripts run directly via `node` for the AI-necessity Product
// experiment -- one implementation, never two independently-maintained copies of the same prompt/
// call logic.
//
// CRITICAL: this file is NEVER imported by any client-side (src/**) module. It uses
// `child_process.execSync("gcloud auth print-access-token")` to obtain a short-lived bearer
// token, held in memory only, exactly as docs/research/evaluation/phase-11-9/direct_vertex_probe.json
// already proved works -- see docs/research/evaluation/phase-12-0/LIVE_VERTEX_LOCAL_ADAPTER_DESIGN_V1.md.

import { execSync } from "node:child_process";

const PROJECT_ID = "gas-test-runner-20260620-wjxf";
const LOCATION = "asia-northeast1";
const MODEL_ID = "gemini-2.5-flash";
const ENDPOINT = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL_ID}:generateContent`;

function getAccessToken() {
  // Same local-user-identity method as the already-proven PHASE 11.9 probe -- no service-account
  // key file created or read; the token exists only for the duration of this process's call.
  return execSync("gcloud auth print-access-token", { encoding: "utf8" }).trim();
}

export function buildPrompt(packet) {
  const c = packet.canon;
  return `あなたはゲーム「NEW LIFE」に登場するNPC「${c.displayName}」を演じます。以下の境界を厳密に守り、
最後に指定された1つのJSONオブジェクトだけを出力してください（説明文やコードフェンスは付けないでください）。

【${c.displayName}について（authored canon -- これ以外の事実を発明しないこと）】
役割: ${c.role}
本人が直接知っていること: ${c.firsthand.join(" / ")}
人づてに聞いたこと: ${c.heard.join(" / ") || "（特になし）"}
本人が知らないこと: ${c.unknowns.join(" / ")}
望んでいること: ${c.wants}
制約: ${c.constraints}
話し方: ${c.speechRegister}
${c.frozenBehavioralRule ? `固定された行動ルール（絶対に変更・拡張しないこと）: ${c.frozenBehavioralRule}` : ""}

【世界の事実】
${packet.worldFacts.join("\n")}

【今の状況】
${c.displayName}は今、${packet.npcCurrentActivity}
場所: ${packet.npcLocation}
プレイヤーとの関係: ${packet.npcRelationshipToPlayer}
直近のやり取り: ${packet.recentRelevantExperience.join(" / ") || "（まだ特になし）"}

【プレイヤーの発言】
「${packet.playerUtterance}」

【この応答が選べる分類（このいずれか一つを必ず選ぶこと）】
${packet.allowedClassifications.join(" / ")}
- IN_SCOPE: このNPCが実際に答えられる、世界に存在する話題
- NPC_KNOWLEDGE_GAP: このNPCの知識範囲外（知らない、または自分の専門ではない）
- NOT_FEASIBLE_NOW: 内容は理解できるが、今の状況では実行できない
- OUT_OF_WORLD_SCOPE: この世界に存在しない話題
- INSUFFICIENT_CONTEXT: 発言があいまいで判断できない

【この応答が提案できる結果ID（このNPC・この状況で今、正当に提案できるものだけ。無ければ null）】
${packet.allowedConsequenceIds.length > 0 ? packet.allowedConsequenceIds.join(" / ") : "（今は無し -- 必ず null にすること）"}

重要: あなたが本当に知らない事実を、親切心で発明してはいけません。上記の authored canon にない
固有名詞・出来事・約束を作り出さないでください。上記リストに無い結果IDを提案してはいけません。

出力は必ず次の形の1つのJSONオブジェクトのみ:
{"classification": "...", "npcResponseIntent": "短い英語の意図ラベル", "proposedConsequenceId": "...またはnull", "visibleUtterance": "${c.displayName}として話す、自然な日本語のセリフ"}`;
}

export function parseEnvelopeJson(text) {
  if (!text) return null;
  // Model output is expected to be raw JSON per the prompt's instruction, but strip a markdown
  // code fence defensively if one appears anyway -- never trust the model's formatting compliance.
  const stripped = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  try {
    return JSON.parse(stripped);
  } catch {
    // Try to locate the first {...} block as a last-resort extraction.
    const match = stripped.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

export async function callVertexGenerateContent(promptText) {
  const token = getAccessToken();
  const body = {
    contents: [{ role: "user", parts: [{ text: promptText }] }],
    generationConfig: { temperature: 0.8, maxOutputTokens: 2048 }, // >=2048: PHASE 11.9's documented gemini-2.5-flash thinking-budget bug
  };
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) {
    return { ok: false, httpStatus: res.status, raw: json, text: null };
  }
  const finishReason = json.candidates?.[0]?.finishReason ?? null;
  const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? null;
  return { ok: true, httpStatus: res.status, finishReason, usageMetadata: json.usageMetadata ?? null, raw: json, text };
}

/** The one entry point both the dev middleware and evidence scripts call. Returns the RAW parsed
 *  envelope object (or null) -- hard structural validation against the authored registries
 *  happens client-side (src/research/bounded-generative-world/envelope.ts), never here. This
 *  module's only responsibilities are: hold the credential, build the prompt, call the model,
 *  parse JSON out of its text. */
export async function getLiveNpcDialogueEnvelope(packet) {
  const prompt = buildPrompt(packet);
  const result = await callVertexGenerateContent(prompt);
  const envelope = result.ok ? parseEnvelopeJson(result.text) : null;
  return { envelope, raw: result, prompt };
}
