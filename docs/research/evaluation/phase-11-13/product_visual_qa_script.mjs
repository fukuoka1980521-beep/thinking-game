// PHASE 11.13: mandatory real browser/Playwright visual QA of the product-repaired scene.
import { chromium } from "playwright";
import fs from "node:fs";

const BASE_URL = "http://localhost:5201/?newlifeplayable11=1";
const OUT_DIR = "C:/Users/user/ClaudeWork/thinking-game/docs/research/evaluation/phase-11-13/screenshots";
fs.mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 1400 } });
const results = [];

function log(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}: ${name}${detail ? " -- " + detail : ""}`);
}
async function shot(name) {
  const p = `${OUT_DIR}/${name}.png`;
  await page.screenshot({ path: p, fullPage: true });
  console.log("captured:", p);
}
async function actionButtonInfo() {
  return page.$$eval('[data-testid="playable11-actions"] button', (els) =>
    els.map((e) => ({ testId: e.getAttribute("data-testid"), label: e.textContent?.trim(), className: e.className })),
  );
}

// ===== Initial scene =====
await page.goto(BASE_URL, { waitUntil: "networkidle" });
await page.click('[data-testid="playable11-begin"]');
await page.waitForTimeout(150);
await shot("00_initial_scene");
let buttons = await actionButtonInfo();
log("initial visible action count is 5 (directive Section 9 expected maximum)", buttons.length === 5, JSON.stringify(buttons.map((b) => b.testId)));
log("QA weather action absent", !buttons.some((b) => b.testId === "playable11-ask-weather"));
log("SALES not shown initially (contextual)", !buttons.some((b) => b.testId === "playable11-ask-sales"));
const bodyText0 = await page.textContent("body");
log("debug text absent from primary surface (initial)", !bodyText0.includes("Vertex AI"));
log("primary (accept/decline) vs secondary visual hierarchy present", buttons.find((b) => b.testId === "playable11-accept")?.className.includes("pw11-primary") && buttons.find((b) => b.testId === "playable11-ask-festival")?.className.includes("pw11-secondary"));

// ===== ASK_WHAT =====
await page.click('[data-testid="playable11-ask-what"]');
await page.waitForTimeout(150);
await shot("01_after_ask_what");
const yoheiLine1 = await page.textContent('[data-testid="playable11-yohei-line"]');
log("ASK_WHAT reply does not name festival/towels", !/祭り|手ぬぐい/.test(yoheiLine1), yoheiLine1);
buttons = await actionButtonInfo();
log("ASK_WHAT removed from action list once answered", !buttons.some((b) => b.testId === "playable11-ask-what"));

// ===== ASK_FESTIVAL =====
await page.click('[data-testid="playable11-ask-festival"]');
await page.waitForTimeout(150);
await shot("02_after_ask_festival");
buttons = await actionButtonInfo();
log("ASK_SALES becomes eligible after ASK_FESTIVAL (contextual, not static)", buttons.some((b) => b.testId === "playable11-ask-sales"));

// ===== contextual SALES =====
await page.click('[data-testid="playable11-ask-sales"]');
await page.waitForTimeout(150);
await shot("03_after_contextual_sales");
const logText3 = await page.textContent('[data-testid="playable11-log"]');
log("SALES answer grounded in real firsthand ~80% figure", /8割/.test(logText3));

// ===== ACCEPT / physical reveal =====
await page.click('[data-testid="playable11-accept"]');
await page.waitForTimeout(150);
await shot("04_after_accept_reveal");
const logText4 = await page.textContent('[data-testid="playable11-log"]');
log("physical reveal narrated (towels become visible)", /手ぬぐい/.test(logText4));
log("reveal does NOT yet confirm festival-leftover status", !/祭りの残り/.test(logText4));
buttons = await actionButtonInfo();
log("causal reveal visible BEFORE the new question is offered (button present after reveal)", buttons.some((b) => b.testId === "playable11-ask-leftover"));
log("ASK_WHAT (resolved-request action) removed after ACCEPT", !buttons.some((b) => b.testId === "playable11-ask-what"));

// ===== new contextual question =====
await page.click('[data-testid="playable11-ask-leftover"]');
await page.waitForTimeout(150);
await shot("05_after_new_question_answered");
const logText5 = await page.textContent('[data-testid="playable11-log"]');
log("new question genuinely answers something new (festival leftover confirmed)", /祭りの残り/.test(logText5));

// ===== fresh reload: DECLINE path =====
await page.goto(BASE_URL, { waitUntil: "networkidle" });
await page.click('[data-testid="playable11-begin"]');
await page.waitForTimeout(150);
await page.click('[data-testid="playable11-decline"]');
await page.waitForTimeout(150);
await shot("06_after_decline");
const logText6 = await page.textContent('[data-testid="playable11-log"]');
log("DECLINE shows PLAYER line + separate Yohei acknowledgment", logText6.includes("ごめん、今日はちょっと") && logText6.includes("じゃあ俺でやるよ"));
buttons = await actionButtonInfo();
log("post-DECLINE request-dependent ASK_WHAT removed", !buttons.some((b) => b.testId === "playable11-ask-what"));

await shot("07_world_continuation_after_decline");
const worldText = await page.textContent('[data-testid="playable11-world-continuity"]');
log("world continuation is separate from the social response line", worldText.includes("値引き用の棚の準備を続けている") && !worldText.includes("じゃあ俺でやるよ"));

fs.writeFileSync(
  "C:/Users/user/ClaudeWork/thinking-game/docs/research/evaluation/phase-11-13/product_visual_qa_evidence.json",
  JSON.stringify({ results, baseUrl: BASE_URL, allPass: results.every((r) => r.pass) }, null, 2),
  "utf8",
);

await browser.close();
console.log("\nALL PASS:", results.every((r) => r.pass));
console.log("DONE");
