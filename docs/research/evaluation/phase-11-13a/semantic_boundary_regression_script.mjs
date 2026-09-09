// PHASE 11.13A: re-verify the PHASE 11.13 mechanical checks are unaffected by the semantic-only
// correction (no PLAYER-visible behavior should have changed), plus verify the new dev/debug
// evidence block is present and correctly reflects the corrected prerequisite/target model.
import { chromium } from "playwright";
import fs from "node:fs";

const BASE_URL = "http://localhost:5202/?newlifeplayable11=1";
const OUT_DIR = "C:/Users/user/ClaudeWork/thinking-game/docs/research/evaluation/phase-11-13a/screenshots";
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
log("initial button set unchanged by the semantic correction (still 5)", ids.length === 5, JSON.stringify(ids));

await page.click('[data-testid="playable11-accept"]');
await page.waitForTimeout(150);
await shot("01_after_accept_unchanged");
ids = await actionButtonInfo();
log("post-ACCEPT rendering unchanged (leftover question still present)", ids.includes("playable11-ask-leftover"));

// Open debug panel and inspect the NEW evidence block specifically
await page.click('[data-testid="playable11-debug-toggle"]');
await page.waitForTimeout(150);
await shot("02_debug_panel_before_asking");
let prereqEvidence = await page.textContent('[data-testid="playable11-debug-question-prerequisite-evidence"]');
log("debug evidence: prerequisiteSatisfied=true BEFORE asking", /"prerequisiteSatisfied": true/.test(prereqEvidence));
log("debug evidence: targetFactKnown=false BEFORE asking (this is the corrected claim -- PHASE 11.13's prose wrongly implied it was already known here)", /"targetFactKnown": false/.test(prereqEvidence));
log("debug evidence: eligible=true BEFORE asking", /"eligible": true/.test(prereqEvidence));

await page.click('[data-testid="playable11-ask-leftover"]');
await page.waitForTimeout(150);
await shot("03_debug_panel_after_asking");
prereqEvidence = await page.textContent('[data-testid="playable11-debug-question-prerequisite-evidence"]');
log("debug evidence: targetFactKnown=true AFTER asking (flips only once the answer event actually occurred)", /"targetFactKnown": true/.test(prereqEvidence));
log("debug evidence: reason mentions 'not a new discovery' after asking", /not a new discovery/.test(prereqEvidence));

log("no knowledge badges/evidence labels leaked onto the primary player surface", !(await page.$eval('[data-testid="playable11-actions"]', (el) => el.textContent)).match(/QUESTION_|targetFactKnown|prerequisiteSatisfied/));

fs.writeFileSync(
  "C:/Users/user/ClaudeWork/thinking-game/docs/research/evaluation/phase-11-13a/semantic_boundary_regression_evidence.json",
  JSON.stringify({ results, baseUrl: BASE_URL, allPass: results.every((r) => r.pass) }, null, 2),
  "utf8",
);
await browser.close();
console.log("\nALL PASS:", results.every((r) => r.pass));
console.log("DONE");
