// PHASE 11.13B: re-verify PHASE 11.13 product rendering is unaffected, and verify the new
// questionAsked/answerReceived/targetFactKnown debug evidence is present and correctly sequenced.
import { chromium } from "playwright";
import fs from "node:fs";

const BASE_URL = "http://localhost:5203/?newlifeplayable11=1";
const OUT_DIR = "C:/Users/user/ClaudeWork/thinking-game/docs/research/evaluation/phase-11-13b/screenshots";
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
log("BEFORE asking: questionAsked=false", /"questionAsked": false/.test(evidence));
log("BEFORE asking: answerReceived=false", /"answerReceived": false/.test(evidence));
log("BEFORE asking: targetFactKnown=false", /"targetFactKnown": false/.test(evidence));

await page.click('[data-testid="playable11-ask-leftover"]');
await page.waitForTimeout(150);
await shot("03_debug_after_asking");
evidence = await page.textContent('[data-testid="playable11-debug-question-prerequisite-evidence"]');
log("AFTER asking (real confirming answer): questionAsked=true", /"questionAsked": true/.test(evidence));
log("AFTER asking: answerReceived=true", /"answerReceived": true/.test(evidence));
log("AFTER asking: targetFactKnown=true", /"targetFactKnown": true/.test(evidence));

const primaryText = await page.$eval('[data-testid="playable11-actions"]', (el) => el.textContent ?? "");
log("no knowledge-badge/state text leaked onto the primary player surface", !/questionAsked|answerReceived|targetFactKnown|QUESTION_/.test(primaryText));

fs.writeFileSync(
  "C:/Users/user/ClaudeWork/thinking-game/docs/research/evaluation/phase-11-13b/answer_authority_regression_evidence.json",
  JSON.stringify({ results, baseUrl: BASE_URL, allPass: results.every((r) => r.pass) }, null, 2),
  "utf8",
);
await browser.close();
console.log("\nALL PASS:", results.every((r) => r.pass));
console.log("DONE");
