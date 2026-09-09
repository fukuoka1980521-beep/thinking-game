// PHASE 11.13E: re-verify PHASE 11.13 product rendering is unaffected by the zero-prose-authority
// correction (real CONFIRM path unchanged), and that the debug evidence still reports correctly.
import { chromium } from "playwright";
import fs from "node:fs";

const BASE_URL = "http://localhost:5206/?newlifeplayable11=1";
const OUT_DIR = "C:/Users/user/ClaudeWork/thinking-game/docs/research/evaluation/phase-11-13e/screenshots";
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
let evidence = await page.textContent('[data-testid="playable11-debug-question-prerequisite-evidence"]');
log("BEFORE asking: targetStatus is UNRESOLVED", /"targetStatus": "UNRESOLVED"/.test(evidence));

await page.click('[data-testid="playable11-ask-leftover"]');
await page.waitForTimeout(150);
await shot("02_debug_after_real_confirm");
evidence = await page.textContent('[data-testid="playable11-debug-question-prerequisite-evidence"]');
log("AFTER asking (real CONFIRM path): targetStatus is KNOWN_TRUE", /"targetStatus": "KNOWN_TRUE"/.test(evidence));
log("no CONFLICTING status appears on the real single-outcome path", !/"targetStatus": "CONFLICTING"/.test(evidence));

const primaryText = await page.$eval('[data-testid="playable11-actions"]', (el) => el.textContent ?? "");
log("no state-label text leaked onto the primary player surface", !/targetStatus|KNOWN_TRUE|KNOWN_FALSE|UNRESOLVED|CONFLICTING/.test(primaryText));

fs.writeFileSync(
  "C:/Users/user/ClaudeWork/thinking-game/docs/research/evaluation/phase-11-13e/zero_prose_authority_regression_evidence.json",
  JSON.stringify({ results, baseUrl: BASE_URL, allPass: results.every((r) => r.pass) }, null, 2),
  "utf8",
);
await browser.close();
console.log("\nALL PASS:", results.every((r) => r.pass));
console.log("DONE");
