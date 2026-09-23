const { GoogleGenAI, Type } = require("@google/genai");
const { CHARACTER_PROFILES, SYSTEM_INSTRUCTION, buildResponseSchema, buildPrompt, validateInput, applyCors, createFixedWindowLimiter } = require("./lib");

// Same no-secret pattern as functions/dialogue/index.js: the only identity
// this function ever uses is its own Cloud Run/Cloud Functions service
// account (Application Default Credentials). No API key string exists
// anywhere in this codebase, this repo, or the deployed artifact. See
// README.md "Why a separate function, not a shared endpoint" for why this
// is its own function rather than a second code path inside
// functions/dialogue/. Request validation, CORS, the character grounding,
// and prompt construction all live in ./lib.js, which has no dependency on
// @google/genai and is exercised directly by
// tests/newlifeDialogueFunction.test.ts from the frontend's own test suite.
const PROJECT = process.env.GCP_PROJECT || process.env.GOOGLE_CLOUD_PROJECT;
const LOCATION = process.env.NEWLIFE_DIALOGUE_LOCATION || "asia-northeast1";
const MODEL = process.env.NEWLIFE_DIALOGUE_MODEL || "gemini-2.5-flash";
const MAX_MODEL_CALLS_PER_MINUTE = Math.max(
  1,
  Number.parseInt(process.env.NEWLIFE_DIALOGUE_MAX_CALLS_PER_MINUTE || "20", 10) || 20
);
const modelCallLimiter = createFixedWindowLimiter(MAX_MODEL_CALLS_PER_MINUTE, 60_000);

const RESPONSE_SCHEMA = buildResponseSchema(Type);

let genAiClient;
function getClient() {
  if (!genAiClient) {
    genAiClient = new GoogleGenAI({ vertexai: true, project: PROJECT, location: LOCATION });
  }
  return genAiClient;
}

/**
 * HTTP Cloud Function (Gen 2). POST-only, stateless. Never logs the request
 * body or the player's free text (only an error *type*, matching
 * functions/dialogue/index.js's own discipline) — see the `catch` block
 * below. Does not read or write any database. Recommended
 * `--max-instances=10` at deploy time (README.md) as the same cheap cost
 * circuit-breaker functions/dialogue uses.
 */
exports.newlifeDialogue = async (req, res) => {
  applyCors(req, res);

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const validationError = validateInput(req.body);
  if (validationError) {
    res.status(400).json({ error: validationError });
    return;
  }

  const { utterance, snapshot } = req.body;
  if (!CHARACTER_PROFILES[snapshot.npc]) {
    // Defense in depth: validateInput already rejects an npc id outside
    // NPC_IDS, so this branch is unreachable in practice, but it keeps this
    // function from ever building a prompt with an undefined character
    // profile if that invariant is ever loosened independently.
    res.status(400).json({ error: "invalid_npc" });
    return;
  }

  try {
    const client = getClient();
    const generateOnce = () => {
      if (!modelCallLimiter.consume()) {
        const error = new Error("local_model_rate_limit");
        error.code = "LOCAL_MODEL_RATE_LIMIT";
        throw error;
      }
      return client.models.generateContent({
        model: MODEL,
        contents: buildPrompt(snapshot.npc, utterance, snapshot),
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.4,
          // Reuse the repository's September 2026 real Vertex-AI evidence:
          // gemini-2.5-flash can spend a large share of the budget on
          // internal thinking and occasionally return no visible text when
          // the budget is too small. CASE1 was stabilized with 2048 plus
          // one transparent retry; NEW LIFE uses the same proven pattern.
          maxOutputTokens: 2048,
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
        },
      });
    };

    let response = await generateOnce();
    let text = (response.text || "").trim();
    if (!text) {
      response = await generateOnce();
      text = (response.text || "").trim();
    }
    if (!text) {
      res.status(502).json({ error: "empty_model_response" });
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      res.status(502).json({ error: "malformed_model_response" });
      return;
    }

    res.status(200).json(parsed);
  } catch (err) {
    if (err && err.code === "LOCAL_MODEL_RATE_LIMIT") {
      res.set("Retry-After", "60");
      res.status(429).json({ error: "rate_limited" });
      return;
    }
    // Never leak provider error internals, and never log the request body
    // or player free text -- only the error's own type/message.
    console.error("newlife-dialogue function error:", err && err.message ? err.message : err);
    res.status(502).json({ error: "model_call_failed" });
  }
};
