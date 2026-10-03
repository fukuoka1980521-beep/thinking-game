import fs from "node:fs";

const endpoint =
  process.env.NEW_LIFE_ENDPOINT ||
  "https://newlife-refoundation-ai-chatfirst-test-zqtk74q2ra-an.a.run.app";
const out =
  process.env.NEW_LIFE_OWNER_REPLAY_OUT ||
  "NEWLIFE_OWNER_TRANSCRIPT_REPLAY_LIVE.json";
const checkpoint =
  process.env.NEW_LIFE_OWNER_REPLAY_CHECKPOINT ||
  "NEWLIFE_OWNER_TRANSCRIPT_REPLAY_LIVE.checkpoint.json";

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
      await sleep([2500, 7000, 15000][attempt] ?? 15000);
    }
  }
  return { status: last?.status ?? 0, error: last?.raw ?? "request_failed" };
}

const scenarios = [
  {
    id: "yohei_smalltalk_to_advice",
    npc: "YOHEI",
    day: 2,
    sceneTitle: "普通の日",
    sceneText: "洋平は自分の店で普段の仕事をしている。特別な予定は確定していない。",
    sceneFocus: null,
    canonicalState: {},
    turns: [
      {
        utterance: "今日何か予定あるんですか",
        expect: {
          mode: ["CASUAL"],
          questionType: ["FACTUAL"],
          responsibilityStatus: ["NOT_APPLICABLE"],
        },
      },
      {
        utterance: "私も商売を始めたいんですが、何が良いですかね",
        expect: {
          mode: ["CASUAL", "TOPIC_SHIFT"],
          questionType: ["ADVICE"],
          responsibilityStatus: ["NOT_APPLICABLE"],
        },
      },
    ],
  },
  {
    id: "fumiko_argument_updates_plan",
    npc: "FUMIKO",
    day: 3,
    sceneTitle: "担当という言葉",
    sceneText:
      "試売の日の待機場所が未決。喫茶席を使う案と会館側だけで完結する案がある。喫茶の通常営業へ不要な負担をかけないことも目的に含まれる。",
    sceneFocus: {
      issue: "試売の日の待機場所が未決。",
      decision: "喫茶席を使うか、会館側だけで待機させるか決める。",
      authority: "喫茶席は美代子、会館側の案内は文子。",
    },
    canonicalState: { mSeats: "assumed" },
    turns: [
      {
        utterance: "状況に応じて当日電話で確認して問題なければお願いするってことでよいのでは",
        expect: {
          proposalDisposition: ["REJECT", "MODIFY"],
          responsibilityStatus: ["NOT_APPLICABLE"],
        },
      },
      {
        utterance: "でも待機客のせいで普通のお客さんが座れなくなったら、その負担は誰に出るんですか",
        expect: {
          impactQuestion: true,
          accountabilityQuestion: false,
          responsibilityStatus: ["NOT_APPLICABLE"],
        },
      },
      {
        utterance: "そんなに負担が出るなら、喫茶は待機場所から外して会館だけで完結させた方がよいですよ",
        expect: {
          proposalDisposition: ["ACCEPT", "MODIFY"],
          accountabilityQuestion: false,
          responsibilityStatus: ["NOT_APPLICABLE"],
        },
      },
      {
        utterance: "それなら美代子さん側に待機客の負担を押し付けなくて済みますよね",
        expect: {
          accountabilityQuestion: false,
        },
      },
    ],
  },
  {
    id: "day4_object_binding_sequence",
    npc: "FUMIKO",
    day: 4,
    sceneTitle: "工房を借りられるか",
    sceneText:
      "大輔は修理中の椅子を直している。別件で、陽菜の焼き菓子を予約した客の受け取り場所として工房の一角を借りられるか相談している。",
    sceneFocus: {
      issue: "焼き菓子の予約品の受け取り場所が未決。",
      decision: "大輔の工房を一時的な受け取り場所に使えるか確認する。",
      authority: "工房を貸すかは大輔が決める。椅子は修理品で試売の商品ではない。",
    },
    sceneEntities: [
      {
        id: "repair_chair",
        label: "大輔が修理中の椅子",
        role: "工房で大輔が修理している依頼品",
        facts: ["陽菜の試売商品ではない", "焼き菓子の受け取り対象ではない"],
      },
      {
        id: "hina_baked_goods",
        label: "陽菜の焼き菓子",
        role: "試売商品であり予約客が受け取る対象",
        facts: ["椅子とは別件"],
      },
      {
        id: "daisuke_workshop",
        label: "大輔の工房",
        role: "焼き菓子の予約品を一時的に受け渡す場所の候補",
        facts: ["貸すかどうかを決めるのは大輔"],
      },
    ],
    canonicalState: { dWorkshop: "pending" },
    turns: [
      {
        utterance: "何を話しているのか分かりません。椅子の話と受け取り場所の話はどうつながるんですか",
        expect: {
          questionType: ["ANALYTICAL", "FACTUAL"],
          accountabilityQuestion: false,
        },
      },
      {
        utterance: "椅子を売る試売なんですか",
        expect: {
          questionType: ["FACTUAL"],
          responsibilityStatus: ["NOT_APPLICABLE"],
        },
      },
      {
        utterance: "実物を並べるかカタログにするかと、受け取り場所の問題は別ですよね",
        expect: {
          questionType: ["ANALYTICAL", "FACTUAL"],
          responsibilityStatus: ["NOT_APPLICABLE"],
        },
      },
      {
        utterance: "では文子さんは何の立場で大輔さんに工房を借りられるか聞いているんですか",
        expect: {
          questionType: ["FACTUAL", "ANALYTICAL"],
          accountabilityQuestion: false,
        },
      },
    ],
  },
];

function matches(actual, expected) {
  if (expected === undefined) return true;
  return Array.isArray(expected) ? expected.includes(actual) : actual === expected;
}

function checkTurn(expect, reply) {
  const p = reply?.responsePlan;
  const checks = {
    status200: Boolean(reply),
    hasPlan: Boolean(p?.playerMeaning && p?.directAnswer && p?.underlyingGoal),
    hasLine: Boolean(reply?.npcLine?.trim()),
    hasRequiredContent: Boolean(Array.isArray(p?.requiredContent) && p.requiredContent.length > 0),
    mode: matches(p?.mode, expect?.mode),
    questionType: matches(p?.questionType, expect?.questionType),
    proposalDisposition: matches(p?.proposalDisposition, expect?.proposalDisposition),
    responsibilityStatus: matches(p?.responsibilityStatus, expect?.responsibilityStatus),
    impactQuestion: matches(p?.impactQuestion, expect?.impactQuestion),
    accountabilityQuestion: matches(p?.accountabilityQuestion, expect?.accountabilityQuestion),
  };
  return { pass: Object.values(checks).every(Boolean), checks };
}

const results = [];
for (const scenario of scenarios) {
  const recentDialogue = [];
  const turns = [];
  for (const turn of scenario.turns) {
    const result = await postJson({
      operation: "converse_turn",
      caseId: "NEWLIFE_30DAY_V1",
      targetNpc: scenario.npc,
      rawPlayerUtterance: turn.utterance,
      recentDialogue: recentDialogue.slice(-12),
      dynamicState: {
        relationshipState: "NEUTRAL",
        boundaryStatus: "UNKNOWN",
        remainingMinutes: 30,
        activeCommitment: null,
        day: scenario.day,
        sceneTitle: scenario.sceneTitle,
        sceneText: scenario.sceneText,
        sceneFocus: scenario.sceneFocus,
        sceneEntities: scenario.sceneEntities ?? [],
        retrievedMemories: [],
        canonicalState: scenario.canonicalState,
        interactionKind: "SPEECH",
      },
    });
    const semantic = result.data
      ? checkTurn(turn.expect || {}, result.data)
      : { pass: false, checks: {} };

    turns.push({
      utterance: turn.utterance,
      expect: turn.expect,
      status: result.status,
      error: result.error,
      semantic,
      reply: result.data ?? null,
    });

    recentDialogue.push({ speaker: "PLAYER", text: turn.utterance });
    if (result.data?.npcLine) {
      recentDialogue.push({ speaker: scenario.npc, text: result.data.npcLine });
    }
    fs.writeFileSync(
      checkpoint,
      JSON.stringify({ scenario: scenario.id, completedTurns: turns.length, turns }, null, 2),
      "utf8",
    );
    await sleep(3500);
  }
  results.push({ id: scenario.id, turns });
}

const allTurns = results.flatMap((r) => r.turns);
const report = {
  endpoint,
  generatedAt: new Date().toISOString(),
  scenarioCount: results.length,
  turnCount: allTurns.length,
  structuralPasses: allTurns.filter((t) => t.semantic.pass).length,
  transportFailures: allTurns.filter((t) => t.status !== 200).length,
  humanSemanticReviewRequired: true,
  results,
};

fs.writeFileSync(out, JSON.stringify(report, null, 2), "utf8");
console.log(
  JSON.stringify(
    {
      out,
      scenarioCount: report.scenarioCount,
      turnCount: report.turnCount,
      structuralPasses: report.structuralPasses,
      transportFailures: report.transportFailures,
    },
    null,
    2,
  ),
);
