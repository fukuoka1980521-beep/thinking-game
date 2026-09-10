// NEW LIFE CORE REDESIGN V1 -- Section 31/32 critical content review. Plays DAY1 through 3
// distinct action paths with the deterministic adapter (the actual default/shipped behavior),
// captures screenshots + a transcript per path, and does one live-toggle spot check to confirm
// the real AI wiring end-to-end (the live model itself was separately debugged and verified via
// direct curl calls against /api/newlifecore-npc-dialogue -- see CRITICAL_CONTENT_REVIEW_V1.md).
import { chromium } from "playwright";
import fs from "node:fs";

const BASE_URL = "http://localhost:5242/?newlifecore=1";
const OUT_DIR = "C:/Users/user/ClaudeWork/thinking-game/docs/research/evaluation/newlife-core-v1";
const SHOT_DIR = `${OUT_DIR}/screenshots`;
fs.mkdirSync(SHOT_DIR, { recursive: true });

const browser = await chromium.launch();
const transcript = {};

async function newPage() {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.click('[data-testid="nlc-start"]');
  await page.click('[data-testid="nlc-go-challenge-center"]');
  return { context, page };
}

async function talk(page, npc, text) {
  await page.click(`[data-testid="nlc-talk-${npc}"]`);
  await page.fill(`[data-testid="nlc-freetext-input-${npc}"]`, text);
  await page.click(`[data-testid="nlc-freetext-submit-${npc}"]`);
  await page.waitForTimeout(150);
}

async function logState(page, label) {
  const clock = await page.textContent('[data-testid="nlc-clock"]').catch(() => null);
  const bodyText = await page.textContent("body");
  return { label, clock, bodyText };
}

// ---- PATH A: 神谷 -> 洋平 -> 相馬 ----
{
  const { context, page } = await newPage();
  const log = [];
  await talk(page, "kamiya", "正直、まだ何がしたいかよく分かっていません");
  await page.screenshot({ path: `${SHOT_DIR}/pathA_01_kamiya.png` });
  log.push(await logState(page, "after kamiya"));
  await page.click('[data-testid="nlc-conversation-close-kamiya"]');
  await page.click('[data-testid="nlc-move-YOHEI_STORE"]');
  await page.screenshot({ path: `${SHOT_DIR}/pathA_02_yohei_arrive.png` });
  if (await page.$('[data-testid="nlc-talk-yohei"]')) {
    await talk(page, "yohei", "何か手伝えることはありますか");
    await page.screenshot({ path: `${SHOT_DIR}/pathA_03_yohei_talk.png` });
    log.push(await logState(page, "after yohei"));
    await page.click('[data-testid="nlc-conversation-close-yohei"]');
  } else {
    log.push({ label: "yohei not present", bodyText: await page.textContent("body") });
  }
  await page.click('[data-testid="nlc-move-COMMUNITY_HALL"]');
  await page.screenshot({ path: `${SHOT_DIR}/pathA_04_hall_arrive.png` });
  if (await page.$('[data-testid="nlc-talk-jin"]')) {
    await talk(page, "jin", "この町に来たばかりです。よろしくお願いします");
    await page.screenshot({ path: `${SHOT_DIR}/pathA_05_jin_talk.png` });
    log.push(await logState(page, "after jin"));
  } else {
    log.push({ label: "jin not present", bodyText: await page.textContent("body") });
  }
  transcript.pathA = log;
  await context.close();
}

// ---- PATH B: 神谷 -> 美代子 -> 商店街 ----
{
  const { context, page } = await newPage();
  const log = [];
  await talk(page, "kamiya", "町のことをまだ何も知りません。どんな所ですか");
  log.push(await logState(page, "after kamiya"));
  await page.click('[data-testid="nlc-conversation-close-kamiya"]');
  await page.click('[data-testid="nlc-move-CAFE_NODOKA"]');
  await page.screenshot({ path: `${SHOT_DIR}/pathB_01_cafe_arrive.png` });
  await page.click('[data-testid="nlc-action-sit_down"]').catch(() => {});
  if (await page.$('[data-testid="nlc-talk-miyoko"]')) {
    await talk(page, "miyoko", "この店、長いんですか");
    await page.screenshot({ path: `${SHOT_DIR}/pathB_02_miyoko_talk.png` });
    log.push(await logState(page, "after miyoko"));
    await page.click('[data-testid="nlc-conversation-close-miyoko"]');
  }
  await page.click('[data-testid="nlc-move-SHOPPING_STREET"]');
  await page.screenshot({ path: `${SHOT_DIR}/pathB_03_shopping_street.png` });
  log.push(await logState(page, "shopping street"));
  transcript.pathB = log;
  await context.close();
}

// ---- PATH C: long free chat with Kamiya -> trial house -> other action ----
{
  const { context, page } = await newPage();
  const log = [];
  await page.click('[data-testid="nlc-talk-kamiya"]');
  const kamiyaLines = [
    "正直、まだ何がしたいか自分でもよく分かっていません",
    "前は管理の仕事をしていました",
    "人に使われるの、あんまり好きじゃないんです",
    "いえ、そういうことじゃなくて、もう少し自分のペースでやりたいというか",
  ];
  for (const line of kamiyaLines) {
    await page.fill('[data-testid="nlc-freetext-input-kamiya"]', line);
    await page.click('[data-testid="nlc-freetext-submit-kamiya"]');
    await page.waitForTimeout(150);
  }
  await page.screenshot({ path: `${SHOT_DIR}/pathC_01_long_kamiya_chat.png` });
  log.push(await logState(page, "after long kamiya chat"));
  await page.click('[data-testid="nlc-conversation-close-kamiya"]');
  await page.click('[data-testid="nlc-move-TRIAL_HOUSE"]');
  await page.screenshot({ path: `${SHOT_DIR}/pathC_02_trial_house.png` });
  log.push(await logState(page, "trial house"));
  await page.click('[data-testid="nlc-move-COMMUNITY_HALL"]');
  await page.screenshot({ path: `${SHOT_DIR}/pathC_03_community_hall.png` });
  if (await page.$('[data-testid="nlc-talk-jin"]')) {
    await talk(page, "jin", "何を手伝えばいいですか");
    log.push(await logState(page, "jin at hall"));
    await page.screenshot({ path: `${SHOT_DIR}/pathC_04_jin.png` });
  } else {
    log.push({ label: "jin not present at hall", bodyText: await page.textContent("body") });
  }
  transcript.pathC = log;
  await context.close();
}

// ---- LIVE TOGGLE spot check: confirm the UI wiring actually reaches the real model end to end ----
{
  const { context, page } = await newPage();
  const log = [];
  await page.click('[data-testid="nlc-live-toggle"]');
  await page.click('[data-testid="nlc-talk-kamiya"]');
  await page.fill('[data-testid="nlc-freetext-input-kamiya"]', "正直、まだ何がしたいか自分でもよく分かっていません");
  await page.click('[data-testid="nlc-freetext-submit-kamiya"]');
  await page.waitForSelector('[data-testid="nlc-waiting-indicator"]', { timeout: 3000 }).catch(() => {});
  await page.waitForSelector('[data-testid="nlc-conversation-log-kamiya"] .nlc-line-npc', { timeout: 30000 });
  await page.screenshot({ path: `${SHOT_DIR}/live_toggle_kamiya.png` });
  log.push(await logState(page, "live toggle kamiya reply"));
  transcript.liveToggleSpotCheck = log;
  await context.close();
}

fs.writeFileSync(`${OUT_DIR}/critical_review_transcript.json`, JSON.stringify(transcript, null, 2), "utf8");
await browser.close();
console.log("DONE");
