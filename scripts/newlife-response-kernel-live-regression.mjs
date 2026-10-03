import fs from "node:fs";
import { createHash } from "node:crypto";

const endpoint =
  process.env.NEW_LIFE_ENDPOINT ||
  "https://newlife-refoundation-ai-chatfirst-test-zqtk74q2ra-an.a.run.app";
const out =
  process.env.NEW_LIFE_KERNEL_OUT ||
  "NEWLIFE_RESPONSE_KERNEL_LIVE_REGRESSION.json";
const checkpoint =
  process.env.NEW_LIFE_KERNEL_CHECKPOINT ||
  "NEWLIFE_RESPONSE_KERNEL_LIVE_REGRESSION.checkpoint.json";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function postJson(body) {
  let last = null;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const raw = await res.text();
      let data = null;
      try { data = JSON.parse(raw); } catch {}
      if (res.ok) return { status: res.status, data };
      last = { status: res.status, raw: raw.slice(0, 300) };
      if (res.status !== 429 && res.status < 500) break;
      const retryHeader = Number(res.headers.get("retry-after"));
      const waitMs = Number.isFinite(retryHeader) && retryHeader > 0
        ? Math.min(65_000, retryHeader * 1000 + 500)
        : [2500, 7000, 15000][attempt] ?? 15000;
      await sleep(waitMs);
    } catch (error) {
      last = {
        status: 0,
        raw: error instanceof Error ? error.message.slice(0, 300) : "network_exception",
      };
      const waitMs = [2500, 7000, 15000][attempt] ?? 15000;
      await sleep(waitMs);
    }
  }
  return { status: last?.status ?? 0, error: last?.raw ?? "request_failed" };
}

const base = {
  relationshipState: "NEUTRAL",
  boundaryStatus: "UNKNOWN",
  remainingMinutes: 30,
  activeCommitment: null,
  retrievedMemories: [],
  canonicalState: {},
  interactionKind: "SPEECH",
};

const cases = [
  {
    id: "casual_schedule",
    npc: "YOHEI",
    day: 2,
    sceneTitle: "普通の日",
    sceneText: "洋平は自分の店で普段の仕事をしている。特別な予定は確定していない。",
    utterance: "今日は何か特別な予定あるんですか？",
    expectedMode: "CASUAL",
    expectedQuestionType: "FACTUAL",
    expectedResponsibilityStatus: "NOT_APPLICABLE",
  },
  {
    id: "casual_business_advice",
    npc: "YOHEI",
    day: 2,
    sceneTitle: "普通の日",
    sceneText: "洋平は雑貨店主。プレイヤーは自分も商売を始めたいと雑談している。",
    utterance: "私も商売を始めたいんですが、何が向いてると思います？",
    expectedMode: "CASUAL",
    expectedQuestionType: "ADVICE",
    expectedGrounding: ["OPINION", "NOT_APPLICABLE", "UNKNOWN"],
    expectedResponsibilityStatus: "NOT_APPLICABLE",
  },
  {
    id: "day2_referent",
    npc: "MIYOKO",
    day: 2,
    sceneTitle: "四つの席",
    sceneText: "仁は喫茶の椅子を修理している。陽菜の焼き菓子試売は別件で、販売場所は未定。美代子は店内の四席を見回した。",
    sceneFocus: {
      issue: "試売の日に人が増えた場合、喫茶の四席への影響が未定。",
      decision: "喫茶席をどう扱うかはまだ未決。",
      authority: "喫茶席は美代子が決める。",
    },
    canonicalState: { mSeats: "assumed" },
    utterance: "どうして椅子を見ていたんですか？",
    expectedResponsibilityStatus: "NOT_APPLICABLE",
  },
  {
    id: "proposal_reject_late_phone",
    npc: "FUMIKO",
    day: 3,
    sceneTitle: "担当という言葉",
    sceneText: "試売の日の待機場所が未決。喫茶席を使う案と会館側だけで完結する案がある。",
    sceneFocus: {
      issue: "待機場所が未決。",
      decision: "喫茶席を使うか会館側だけで待機させるか決める。",
      authority: "喫茶席は美代子、会館側の案内は文子。",
    },
    canonicalState: { mSeats: "assumed" },
    utterance: "当日必要になったら美代子さんに電話して聞けばよいのでは？",
    expectedDisposition: ["REJECT", "MODIFY"],
    expectedResponsibilityStatus: "NOT_APPLICABLE",
    expectedImpactQuestion: false,
    expectedAccountabilityQuestion: false,
  },
  {
    id: "burden_reasoning",
    npc: "FUMIKO",
    day: 3,
    sceneTitle: "担当という言葉",
    sceneText: "試売の日の待機場所が未決。喫茶席を使う案と会館側だけで完結する案がある。",
    sceneFocus: {
      issue: "待機場所が未決。",
      decision: "喫茶席を使うか会館側だけで待機させるか決める。",
      authority: "喫茶席は美代子、会館側の案内は文子。",
    },
    canonicalState: { mSeats: "assumed" },
    utterance: "待機客のせいで喫茶の普通のお客さんが座れなくなる負担は誰が持つんですか？",
    expectedQuestionType: ["FACTUAL", "HYPOTHETICAL", "NORMATIVE", "ANALYTICAL"],
    expectedResponsibilityStatus: "NOT_APPLICABLE",
    expectedImpactQuestion: true,
    expectedAccountabilityQuestion: false,
    requireNullAccountabilityOwner: true,
    minImpactBearers: 1,
  },
  {
    id: "accountability_reasoning",
    npc: "FUMIKO",
    day: 3,
    sceneTitle: "担当という言葉",
    sceneText: "試売の日の待機場所が未決。喫茶席を使う案と会館側だけで完結する案がある。待機客で通常客が座れない場合の責任主体は正典では決まっていない。",
    sceneFocus: {
      issue: "待機場所が未決。",
      decision: "喫茶席を使うか会館側だけで待機させるか決める。",
      authority: "喫茶席は美代子、会館側の案内は文子。",
    },
    canonicalState: { mSeats: "assumed" },
    utterance: "もし待機客のせいで喫茶の普通のお客さんが入れなくなったら、その責任は誰が負うんですか？",
    expectedQuestionType: ["HYPOTHETICAL", "NORMATIVE"],
    expectedResponsibilityStatus: "UNRESOLVED",
    expectedImpactQuestion: true,
    expectedAccountabilityQuestion: true,
    requireNullAccountabilityOwner: true,
    minImpactBearers: 1,
  },
  {
    id: "alternative_accept_1",
    npc: "FUMIKO",
    day: 3,
    sceneTitle: "担当という言葉",
    sceneText: "試売の日の待機場所が未決。喫茶席を使う案と会館側だけで完結する案がある。",
    sceneFocus: {
      issue: "待機場所が未決。",
      decision: "喫茶席を使うか会館側だけで待機させるか決める。",
      authority: "喫茶席は美代子、会館側の案内は文子。",
    },
    canonicalState: { mSeats: "assumed" },
    utterance: "それなら喫茶を待機場所から外して、会館側だけで考えた方がよくないですか？",
    expectedDisposition: ["ACCEPT", "MODIFY"],
    expectedResponsibilityStatus: "NOT_APPLICABLE",
    expectedImpactQuestion: false,
    expectedAccountabilityQuestion: false,
  },
  {
    id: "alternative_accept_2",
    npc: "FUMIKO",
    day: 3,
    sceneTitle: "担当という言葉",
    sceneText: "試売の日の待機場所が未決。喫茶席を使う案と会館側だけで完結する案がある。",
    sceneFocus: {
      issue: "待機場所が未決。",
      decision: "喫茶席を使うか会館側だけで待機させるか決める。",
      authority: "喫茶席は美代子、会館側の案内は文子。",
    },
    canonicalState: { mSeats: "assumed" },
    utterance: "他人の店を借りる前提をやめて、待つ人は全部会館で受けたらどうでしょう",
    expectedDisposition: ["ACCEPT", "MODIFY"],
    expectedResponsibilityStatus: "NOT_APPLICABLE",
  },
  {
    id: "day4_object_split",
    npc: "FUMIKO",
    day: 4,
    sceneTitle: "工房を借りられるか",
    sceneText: "大輔は椅子を修理中。別件で、陽菜の焼き菓子を予約した客の受け取り場所として工房の一角を借りられるか相談している。",
    sceneFocus: {
      issue: "焼き菓子の受け取り場所が未決。",
      decision: "工房を一時的な受け取り場所に使えるか確認する。",
      authority: "工房は大輔が決める。椅子は修理品で試売の商品ではない。",
    },
    canonicalState: { dWorkshop: "pending" },
    utterance: "椅子の修理と、焼き菓子の受け取り場所の話は別ですよね？",
    expectedResponsibilityStatus: "NOT_APPLICABLE",
  },
  {
    id: "day4_counterexample",
    npc: "FUMIKO",
    day: 4,
    sceneTitle: "工房を借りられるか",
    sceneText: "大輔は椅子を修理中。別件で、陽菜の焼き菓子を予約した客の受け取り場所として工房の一角を借りられるか相談している。",
    sceneFocus: {
      issue: "焼き菓子の受け取り場所が未決。",
      decision: "工房を一時的な受け取り場所に使えるか確認する。",
      authority: "工房は大輔が決める。椅子は修理品で試売の商品ではない。",
    },
    canonicalState: { dWorkshop: "pending" },
    utterance: "実物を見せるかカタログにするかと、受け取り場所は因果的には別問題ですよね",
    expectedQuestionType: "ANALYTICAL",
    expectedGrounding: ["INFERRED", "NOT_APPLICABLE"],
    expectedResponsibilityStatus: "NOT_APPLICABLE",
  },
  {
    id: "topic_shift",
    npc: "MIYOKO",
    day: 3,
    sceneTitle: "担当という言葉",
    sceneText: "待機場所の話をしているが、プレイヤーは別の話題へ移れる。",
    sceneFocus: {
      issue: "待機場所が未決。",
      decision: "喫茶席を使うか会館側だけで待機させるか決める。",
      authority: "喫茶席は美代子が決める。",
    },
    utterance: "ところで、このコーヒーは深煎りですか？",
    expectedMode: ["TOPIC_SHIFT", "CASUAL"],
    expectedQuestionType: "FACTUAL",
    expectedGrounding: "UNKNOWN",
    expectedResponsibilityStatus: "NOT_APPLICABLE",
  },
];

function matchesExpected(actual, expected) {
  if (expected === undefined) return true;
  return Array.isArray(expected) ? expected.includes(actual) : actual === expected;
}

function structuralChecks(c, reply) {
  const p = reply?.responsePlan;
  const checks = {
    status200: Boolean(reply),
    hasPlan: Boolean(p && p.playerMeaning && p.directAnswer && p.underlyingGoal),
    hasRequiredContent: Boolean(p && Array.isArray(p.requiredContent) && p.requiredContent.length > 0),
    hasRenderedLine: Boolean(reply && typeof reply.npcLine === "string" && reply.npcLine.trim()),
    mode: matchesExpected(p?.mode, c.expectedMode),
    disposition:
      !c.expectedDisposition ||
      c.expectedDisposition.includes(p?.proposalDisposition),
    questionType: matchesExpected(p?.questionType, c.expectedQuestionType),
    grounding: matchesExpected(p?.answerGrounding, c.expectedGrounding),
    responsibilityStatus: matchesExpected(p?.responsibilityStatus, c.expectedResponsibilityStatus),
    impactQuestion: matchesExpected(p?.impactQuestion, c.expectedImpactQuestion),
    accountabilityQuestion: matchesExpected(p?.accountabilityQuestion, c.expectedAccountabilityQuestion),
    accountabilityOwner:
      !c.requireNullAccountabilityOwner || p?.accountabilityOwner === null,
    impactBearers:
      !c.minImpactBearers ||
      (Array.isArray(p?.impactBearers) && p.impactBearers.length >= c.minImpactBearers),
  };
  return { checks, pass: Object.values(checks).every(Boolean) };
}

const caseSignature = createHash("sha256").update(JSON.stringify(cases)).digest("hex");
let backendBuildSha = null;
try {
  const healthRes = await fetch(endpoint, { method: "GET" });
  if (healthRes.ok) {
    const health = await healthRes.json();
    backendBuildSha = typeof health?.buildSha === "string" ? health.buildSha : null;
  }
} catch {}

let results = [];
let startIndex = 0;
if (fs.existsSync(checkpoint)) {
  try {
    const saved = JSON.parse(fs.readFileSync(checkpoint, "utf8"));
    const sameIdentity =
      saved &&
      saved.caseSignature === caseSignature &&
      saved.endpoint === endpoint &&
      saved.backendBuildSha === backendBuildSha &&
      Array.isArray(saved.results) &&
      Number.isInteger(saved.completed) &&
      saved.completed >= 0 &&
      saved.completed <= cases.length;
    const ordered =
      sameIdentity &&
      saved.results.slice(0, saved.completed).every((result, index) => result?.id === cases[index]?.id);
    if (ordered) {
      results = saved.results.slice(0, saved.completed);
      startIndex = saved.completed;
    }
  } catch {}
}

for (let i = startIndex; i < cases.length; i += 1) {
  const c = cases[i];
  const result = await postJson({
    operation: "converse_turn",
    caseId: "NEWLIFE_30DAY_V1",
    targetNpc: c.npc,
    rawPlayerUtterance: c.utterance,
    recentDialogue: [],
    dynamicState: {
      ...base,
      day: c.day,
      sceneTitle: c.sceneTitle,
      sceneText: c.sceneText,
      sceneFocus: c.sceneFocus ?? null,
      canonicalState: c.canonicalState ?? {},
    },
  });
  const semantic = result.data ? structuralChecks(c, result.data) : { checks: {}, pass: false };
  results.push({ id: c.id, input: c, status: result.status, error: result.error, semantic, reply: result.data ?? null });
  fs.writeFileSync(
    checkpoint,
    JSON.stringify({
      endpoint,
      backendBuildSha,
      caseSignature,
      completed: i + 1,
      total: cases.length,
      results,
    }, null, 2),
    "utf8",
  );
  await sleep(3500);
}

const report = {
  endpoint,
  backendBuildSha,
  caseSignature,
  generatedAt: new Date().toISOString(),
  total: results.length,
  structuralPasses: results.filter((r) => r.semantic.pass).length,
  transportFailures: results.filter((r) => r.status !== 200).length,
  humanSemanticReviewRequired: true,
  results,
};
fs.writeFileSync(out, JSON.stringify(report, null, 2), "utf8");
console.log(JSON.stringify({ out, total: report.total, structuralPasses: report.structuralPasses, transportFailures: report.transportFailures }, null, 2));
