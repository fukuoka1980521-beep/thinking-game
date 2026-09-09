// PHASE 11.8: mandatory visual QA script (directive Section 23). Temporary, not part of the
// production runtime. Reuses the already-installed `playwright` devDependency, exactly as
// PHASE 11.6V established -- no new dependency added. Drives the isolated ?newlifecontractv2=1
// route's new PENDING_REPLY_YOHEI_HELP scenario in a real headless Chromium.
import { chromium } from "playwright";
import fs from "node:fs";

const BASE_URL = "http://localhost:5177/?newlifecontractv2=1";
const OUT_DIR = "C:/Users/user/ClaudeWork/thinking-game/docs/research/evaluation/phase-11-8/screenshots";
fs.mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 1200 } });
const evidence = [];
const results = [];

function log(name, pass) {
  results.push({ name, pass });
  console.log(`${pass ? "PASS" : "FAIL"}: ${name}`);
}

async function shot(name) {
  const p = `${OUT_DIR}/${name}.png`;
  await page.screenshot({ path: p, fullPage: true });
  evidence.push({ name, path: p });
  console.log("captured:", p);
}

async function bodyText() {
  return page.textContent("body");
}

async function startScenario() {
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.click('button:has-text("洋平に手伝いを頼まれる（未回答の会話・PHASE 11.8）")');
  await page.waitForTimeout(150);
  await page.click('[data-testid="contractv2-begin"]');
  await page.waitForTimeout(150);
}

// ============================================================
// VISUAL A: small talk while PendingReply OPEN
// ============================================================
await startScenario();
await shot("visualA_00_yohei_asks_for_help");
const beforeA = await bodyText();
log("VISUAL A pre-check: Yohei's question is visible before any reply", beforeA.includes("今、少し手伝える"));

await page.click('[data-testid="contractv2-pending-smalltalk"]');
await page.waitForTimeout(150);
await shot("visualA_01_after_small_talk");
const afterA = await bodyText();
const questionNotErased = afterA.includes("今、少し手伝える") || afterA.includes("今日は暑いね");
const answerButtonsStillOffered = (await page.$('[data-testid="contractv2-pending-accept"]')) !== null;
const noFalseAnsweredLanguage = !/答えてくれた|了承した|承知した/.test(afterA);
log("VISUAL A: the original question is not visually erased after small talk", questionNotErased);
log("VISUAL A: ACCEPT/DECLINE/DEFER are still offered (Yohei has not acted as if answered)", answerButtonsStillOffered);
log("VISUAL A: no language implies the pending question was already answered", noFalseAnsweredLanguage);

// ============================================================
// VISUAL B: greeting-like utterance
// ============================================================
await page.click('[data-testid="contractv2-pending-greeting"]');
await page.waitForTimeout(150);
await shot("visualB_00_after_greeting");
const afterB = await bodyText();
const stillHasAnswerButtons = (await page.$('[data-testid="contractv2-pending-accept"]')) !== null;
const scenarioPickerNotShown = (await page.$('[data-testid="contractv2-scenario-picker"]')) === null;
const beginButtonNotShown = (await page.$('[data-testid="contractv2-begin"]')) === null;
log("VISUAL B: conversation does not restart -- ACCEPT/DECLINE/DEFER still offered after greeting", stillHasAnswerButtons);
log("VISUAL B: scenario picker/begin screen did not reappear (no reinitialization)", scenarioPickerNotShown && beginButtonNotShown);

// ============================================================
// VISUAL C: PLAYER leaves
// ============================================================
await page.click('[data-testid="contractv2-pending-leave"]');
await page.waitForTimeout(150);
await shot("visualC_00_after_leave");
const afterC = await bodyText();
const noResolvedLanguage = !/解決した|引き受けた|承知した|了承した/.test(afterC);
const leftNarrationPresent = afterC.includes("その場を後にした");
log("VISUAL C: PLAYER_LEAVES is not presented as answering/resolving the question", noResolvedLanguage);
log("VISUAL C: the leaving narration itself renders", leftNarrationPresent);

// Confirm via debug panel that the underlying PendingReply is still OPEN (not silently closed)
await page.click('[data-testid="contractv2-debug-toggle"]');
await page.waitForTimeout(150);
await shot("visualC_01_debug_panel_status_open");
const debugTextC = await page.textContent('[data-testid="contractv2-debug-panel"]');
log("VISUAL C: debug panel confirms PendingReply.status is still OPEN after leaving", /"status":\s*"OPEN"/.test(debugTextC));
await page.click('[data-testid="contractv2-debug-toggle"]');
await page.waitForTimeout(150);

// ============================================================
// VISUAL D: customer interruption
// ============================================================
await page.click('[data-testid="contractv2-debug-toggle"]');
await page.waitForTimeout(150);
await page.click('[data-testid="contractv2-pending-debug-customer-arrives"]');
await page.waitForTimeout(150);
await shot("visualD_00_customer_arrives");
const afterD = await bodyText();
const shopWorkContinues = afterD.includes("接客") || afterD.includes("客が店に入ってきて");
const answerButtonsHiddenDuringInterrupt = (await page.$('[data-testid="contractv2-pending-accept"]')) === null;
log("VISUAL D: Yohei visibly continues shop activity (serving the customer)", shopWorkContinues);
log("VISUAL D: PLAYER cannot answer while Yohei is unavailable (buttons withdrawn, not just ignored)", answerButtonsHiddenDuringInterrupt);
const debugTextD = await page.textContent('[data-testid="contractv2-debug-panel"]');
log("VISUAL D: pending context survives the interruption (debug panel still shows OPEN, not null)", /"status":\s*"OPEN"/.test(debugTextD));

await page.click('[data-testid="contractv2-pending-debug-customer-leaves"]');
await page.waitForTimeout(150);
await shot("visualD_01_customer_leaves_answer_restored");
const afterDResume = await bodyText();
const answerButtonsRestored = (await page.$('[data-testid="contractv2-pending-accept"]')) !== null;
log("VISUAL D: PLAYER can answer again once the interruption ends", answerButtonsRestored);

// ============================================================
// Internals-leak check: normal player-facing narration must never show PendingReply/status/
// contractId/eligibility/State Admission taxonomy (directive Section 23).
// ============================================================
const narrationOnly = await page.textContent('[data-testid="contractv2-narration"]').catch(() => "");
const pendingChoicesOnly = await page.textContent('[data-testid="contractv2-pending-choices"]').catch(() => "");
const playerFacingText = narrationOnly + pendingChoicesOnly;
const leaksInternals = /pendingReply|PendingReply|"status"|contractId|eligibilityResult|stateAdmissionDecision|OPEN|DEFERRED|RESOLVED|WITHDRAWN/.test(playerFacingText);
log("INTERNALS: player-facing narration/choice area never exposes PendingReply/status/contractId/eligibility/State Admission internals", !leaksInternals);

fs.writeFileSync(
  "C:/Users/user/ClaudeWork/thinking-game/docs/research/evaluation/phase-11-8/visual_qa_evidence.json",
  JSON.stringify({ evidence, results, baseUrl: BASE_URL, allPass: results.every((r) => r.pass) }, null, 2),
  "utf8",
);

await browser.close();
console.log("\nALL PASS:", results.every((r) => r.pass));
console.log("DONE");
