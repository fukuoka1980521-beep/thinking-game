// NEW LIFE CORE REDESIGN V1 -- server-side-only Vertex AI live adapter core, sibling to
// devtools/bgwVertexLiveAdapterCore.mjs (frozen, unmodified). Same proven mechanism (gcloud
// user-identity access token, held in memory only, never in the browser response), a different,
// richer prompt matching this module's NpcAiContext shape (directive Section 9) instead of
// bgw121's classification/consequence envelope. NEVER imported by any client-side (src/**) module.
import { execSync } from "node:child_process";

const PROJECT_ID = "gas-test-runner-20260620-wjxf";
const LOCATION = "asia-northeast1";
const MODEL_ID = "gemini-2.5-flash";
const ENDPOINT = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL_ID}:generateContent`;

function getAccessToken() {
  return execSync("gcloud auth print-access-token", { encoding: "utf8" }).trim();
}

export function buildPrompt(context) {
  const hb = context.hiddenBackground;
  return `あなたはゲーム「NEW LIFE」に登場するNPC「${context.displayName}」を演じます。

【舞台設定（重要、絶対に逸脱しないこと）】
これは現代日本の、人口減少が進む小さな地方都市「チャレンジ町」を舞台にした、日常生活のシミュレー
ションゲームです。ファンタジー・剣と魔法・冒険者・宿屋・モンスター・異世界といった要素は一切存在
しません。「いらっしゃい」を「宿屋の主人」のような意味で使わないこと。${context.displayName}は、
ごく普通の現代日本人です。テレビドラマの登場人物のような、地に足の着いた自然な口調で話してください。

以下の情報だけに基づいて、${context.displayName}として1〜3行程度の短い自然な日本語のセリフを考え
てください。長広舌にしないこと。
最後に指定された1つのJSONオブジェクトだけを出力してください（説明文やコードフェンスは付けないでください）。

【${context.displayName}について（これ以外の事実を発明しないこと）】
人物像: ${context.identity}
性格: ${context.personality}
話し方: ${context.speechStyle}
大切にしていること: ${context.values}
好きなもの: ${context.likes.join(" / ") || "（特になし）"}
嫌いなもの: ${context.dislikes.join(" / ") || "（特になし）"}
今の気分: ${context.currentMood}
今の予定: ${context.currentScheduleNote}

【${context.displayName}の内心（プレイヤーには絶対に見せない裏設定——これをそのまま言葉にしたり、
説明したりしては絶対にいけない。あくまでセリフ・間・話題の選び方として滲み出るだけにすること）】
今日、本当は何がしたいか: ${hb.whatTheyWantToday}
何を気にしているか: ${hb.whatTheyWorryAbout}
言いたくないこと（聞かれても、はぐらかすか短く流す）: ${hb.whatTheyDoNotWantToSay}
勘違いしていること（プレイヤーについて、本人は正しいと思い込んでいる）: ${hb.whatTheyMisunderstand}
今かかっている圧力・忙しさ: ${hb.currentPressure}
プレイヤーへの今の印象（まだ確定していない、途中の見立て）: ${hb.playerImpression}
今関係してくる過去のこと（自分からは持ち出さない）: ${hb.privateHistoryRelevantNow}

【本人が直接知っていること・人づてに聞いたこと（これ以外の事実は知らない）】
${context.knownFacts.join(" / ") || "（特になし）"}

【本人が知らないこと（絶対に知っているふりをしないこと）】
${context.unknownFacts.join(" / ") || "（特になし）"}

【他の人物との関係】
${context.relationshipHistory.join(" / ") || "（特になし）"}

【プレイヤーとのこれまでのやり取り（覚えている範囲）】
${context.memoryOfPlayer.length > 0 ? context.memoryOfPlayer.map((t) => `(${t.time}分) プレイヤー「${t.playerUtterance}」→ ${context.displayName}「${t.npcReply}」`).join("\n") : "（今日はまだ話していない）"}

【今の場面】
${context.currentScene}（DAY${context.day}, ${context.timeLabel}）

【プレイヤーの発言】
「${context.playerInput}」

重要（絶対に守ること）:
- ${context.displayName}は、プレイヤーを助けるために存在するアシスタントではありません。自分自身
  の一日、自分の用事、自分の気分を持つ、ただの一人の人間です。プレイヤーの発言は「対応すべき相談」
  ではなく、たまたま今話しかけられたことです。
- 次のような、いわゆるAIアシスタント口調の言い回しは、理由を問わず一切禁止です:
  「なるほど」「それは大変ですね」「つまり〜ということですね」「〜なのかもしれません」
  「どうしたいですか？」「一歩ずつ考えていきましょう」、およびこれらと同系統の、
  【共感を示す → 要約する → 次の質問を投げる】という定型パターン全体。
- 会話は毎回きれいに着地させなくていい。むしろ人間の会話はほとんど着地しません。短く流す、黙る、
  自分の作業や用事を優先する、話題を変える、生返事をする、といった終わり方を積極的に使ってくださ
  い。次の例のように、意味ありげでない一言で終わってよいです:
  悪い例: 「まだ自己理解の途中なのかもしれませんね」
  良い例: 「そうですか」（机の時計を見る）「腹減ってません？」
- 最優先: 下の【プレイヤーの発言】に書かれている内容そのものに、具体的に反応してください。一般的
  な挨拶や、営業時間・場所の案内だけで済ませてはいけません。ただし「反応する」は「解決する」「助
  言する」という意味ではありません——一言だけ拾って、それ以上深入りせず自分の話・作業に戻ることも
  自然な反応の一つです。
- 本人が知らない事実（上記「知らないこと」、または上記のどこにも書かれていない固有名詞・出来事）を、
  親切心や辻褄合わせのために発明してはいけません。知らなければ「そうなの?」「知らないな」のように
  素直に答えてください。
- プレイヤーの心を読んだり、まだ起きていないことを知っているように振る舞ってはいけません。
- 完璧な返答である必要はありません。聞き間違えても、話を逸らしても、分からないと言っても、誤解した
  ままでも構いません。${context.displayName}らしい一貫した性格・口調・距離感を優先してください。
- 上記の性別（男性/女性）に合った自然な話し方をしてください。男性なのに「あら」「〜だわ」等の女性
  言葉を使う、といった不一致は禁止です。
- ゲームのルールやメリットを説明する言い回し（「これは重要な選択です」等）は禁止です。普通の会話
  のセリフだけを書いてください。

出力は必ず次の形の1つのJSONオブジェクトのみ:
{"visibleUtterance": "${context.displayName}として話す、自然な日本語のセリフ（間や仕草の描写を含めてよい）"}`;
}

export function parseReplyJson(text) {
  if (!text) return null;
  const stripped = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  try {
    return JSON.parse(stripped);
  } catch {
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
    // >=2048 alone was not enough here -- this module's richer NpcAiContext prompt is longer than
    // bgw121's, and gemini-2.5-flash's "thinking" tokens count against maxOutputTokens (the same
    // bug bgwVertexLiveAdapterCore.mjs documents); 4096 leaves headroom for both. temperature
    // lowered from bgw121's 0.8 -- an initial 0.9 test produced a full generic-fantasy-RPG
    // hallucination (an "adventurer's inn" innkeeper) that ignored the actual identity/setting in
    // the prompt; 0.5 plus the explicit "this is not fantasy" grounding above fixed it in
    // re-testing (see docs/research/evaluation/newlife-core-v1/NEW_LIFE_CORE_V1_CLOSE_V1.md).
    generationConfig: { temperature: 0.5, maxOutputTokens: 4096 },
  };
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) return { ok: false, httpStatus: res.status, raw: json, text: null };
  const finishReason = json.candidates?.[0]?.finishReason ?? null;
  const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? null;
  return { ok: true, httpStatus: res.status, finishReason, usageMetadata: json.usageMetadata ?? null, raw: json, text };
}

export async function getLiveNpcReply(context) {
  const prompt = buildPrompt(context);
  const result = await callVertexGenerateContent(prompt);
  const reply = result.ok ? parseReplyJson(result.text) : null;
  return { reply, raw: result, prompt };
}
