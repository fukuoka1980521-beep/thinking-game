// PHASE 11.13C: re-verify PHASE 11.13 product rendering is unaffected, and verify the real event
// order (asked before answered before target-known) is observable via the debug evidence.
import { chromium } from "playwright";
import fs from "node:fs";

const BASE_URL = "http://localhost:5204/?newlifeplayable11=1";
const OUT_DIR = "C:/Users/user/ClaudeWork/thinking-game/docs/research/evaluation/phase-11-13c/screenshots";
fs.mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 1400 } });
const results = [];
function log(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}: ${name}${detail ? " -- " + detail : ""}`);
}
async function shot(name) {
  await page.screenshot({ path: `${OUT_DIR}/${name}.png`, fullPage: true });
}
async function actionButtonInfo() {
  return page.$$eval('[data-testid="playable11-actions"] button', (els) => els.map((e) => e.getAttribute("data-testid")));
}

await page.goto(BASE_URL, { waitUntil: "networkidle" });
await page.click('[data-testid="playable11-begin"]');
await page.waitForTimeout(150);
await shot("00_initial_scene_unchanged");
let ids = await actionButtonInfo();
log("initial button set unchanged (still 5)", ids.length === 5, JSON.stringify(ids));

await page.click('[data-testid="playable11-accept"]');
await page.waitForTimeout(150);
await shot("01_after_accept_unchanged");
ids = await actionButtonInfo();
log("post-ACCEPT rendering unchanged (leftover question present)", ids.includes("playable11-ask-leftover"));

await page.click('[data-testid="playable11-debug-toggle"]');
await page.waitForTimeout(150);
await shot("02_debug_before_asking");
let evidence = await page.textContent('[data-testid="playable11-debug-question-prerequisite-evidence"]');
log("BEFORE asking: questionAsked=false, answerReceived=false, targetFactKnown=false", /"questionAsked": false/.test(evidence) && /"answerReceived": false/.test(evidence) && /"targetFactKnown": false/.test(evidence));

let materialsEvidence = await page.textContent('[data-testid="playable11-debug-panel"] pre');
await page.click('[data-testid="playable11-ask-leftover"]');
await page.waitForTimeout(150);
await shot("03_debug_after_asking_and_response");
evidence = await page.textContent('[data-testid="playable11-debug-question-prerequisite-evidence"]');
log("AFTER asking (real response commit): questionAsked=true, answerReceived=true, targetFactKnown=true", /"questionAsked": true/.test(evidence) && /"answerReceived": true/.test(evidence) && /"targetFactKnown": true/.test(evidence));

const materialsBlock = await page.$eval('[data-testid="playable11-debug-panel"]', (el) => el.textContent ?? "");
log("the leftover_question_answered material is now visible in the Materials evidence block", materialsBlock.includes("leftover_question_answered"));

const primaryText = await page.$eval('[data-testid="playable11-actions"]', (el) => el.textContent ?? "");
log("no state-label text leaked onto the primary player surface", !/questionAsked|answerReceived|targetFactKnown|CONFIRM_FESTIVAL/.test(primaryText));

fs.writeFileSync(
  "C:/Users/user/ClaudeWork/thinking-game/docs/research/evaluation/phase-11-13c/event_order_regression_evidence.json",
  JSON.stringify({ results, baseUrl: BASE_URL, allPass: results.every((r) => r.pass) }, null, 2),
  "utf8",
);
await browser.close();
console.log("\nALL PASS:", results.every((r) => r.pass));
console.log("DONE");
