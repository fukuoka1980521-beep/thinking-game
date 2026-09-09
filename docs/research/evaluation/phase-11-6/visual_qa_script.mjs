// PHASE 11.6V: temporary visual QA script. Not part of production runtime. Uses the
// already-installed `playwright` devDependency (no new dependency added) to drive the isolated
// ?newlifecontractv2=1 route in a real headless Chromium and capture rendered-screen evidence for
// Case D (decline) and Case E (help not needed), plus debug-panel separation.
import { chromium } from "playwright";
import fs from "node:fs";

const BASE_URL = "http://localhost:5190/?newlifecontractv2=1";
const OUT_DIR = "C:/Users/user/ClaudeWork/thinking-game/docs/research/evaluation/phase-11-6/screenshots";
fs.mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 1000 } });
const evidence = [];

async function shot(name) {
  const p = `${OUT_DIR}/${name}.png`;
  await page.screenshot({ path: p, fullPage: true });
  evidence.push({ name, path: p });
  console.log("captured:", p);
}

async function textContains(str) {
  const body = await page.textContent("body");
  return body.includes(str);
}

// ============================================================
// CASE D: Jin, help needed -> observe -> decline
// ============================================================
await page.goto(BASE_URL, { waitUntil: "networkidle" });
await shot("caseD_00_scenario_picker");

await page.click('button:has-text("公民館で迅を見かける（手伝いが必要な日）")');
await page.waitForTimeout(200);
await shot("caseD_01_before_begin_no_offer_help_yet");
const beforeBeginHasOfferHelp = await textContains("手伝う");
console.log("CASE D check A (initial screen must NOT show 手伝う before observation):", !beforeBeginHasOfferHelp ? "PASS" : "FAIL");

await page.click('[data-testid="contractv2-begin"]');
await page.waitForTimeout(200);
await shot("caseD_02_after_observation_offer_help_visible");
const afterObserveHasOfferHelp = await textContains("手伝う");
console.log("CASE D check B (OFFER_HELP visible after observation reveals it):", afterObserveHasOfferHelp ? "PASS" : "FAIL");

await page.click('[data-testid="contractv2-decline"]');
await page.waitForTimeout(200);
await shot("caseD_03_after_decline");
const bodyAfterDecline = await page.textContent("body");
const hasRewardLanguage = /報酬|成功！|関係.*上昇|ポイント/.test(bodyAfterDecline);
const hasJinContinuation = bodyAfterDecline.includes("一人で長机を運び終えた");
const hasSharedEventLabel = bodyAfterDecline.includes("SHARED_EVENT");
console.log("CASE D check D (no reward/relationship/celebration language shown):", !hasRewardLanguage ? "PASS" : "FAIL");
console.log("CASE D check E (Jin's own work continuation narration visible):", hasJinContinuation ? "PASS" : "FAIL");
console.log("CASE D check F (no SHARED_EVENT internal label leaked into player UI):", !hasSharedEventLabel ? "PASS" : "FAIL");

// ============================================================
// CASE E: Jin, help NOT needed -> observe -> OFFER_HELP must never appear
// ============================================================
await page.click('[data-testid="contractv2-back-to-scenarios"]');
await page.waitForTimeout(200);
await page.click('button:has-text("公民館で迅を見かける（手伝いが不要な日）")');
await page.waitForTimeout(200);
await shot("caseE_00_initial_state");

await page.click('[data-testid="contractv2-begin"]');
await page.waitForTimeout(200);
await shot("caseE_01_after_observation_no_offer_help");
const bodyCaseE = await page.textContent("body");
const caseEHasOfferHelp = bodyCaseE.includes("手伝う");
const caseEHasDisabledHelpButton = (await page.$('button:has-text("手伝う")[disabled]')) !== null;
console.log("CASE E check A/B (OFFER_HELP absent after observation):", !caseEHasOfferHelp ? "PASS" : "FAIL");
console.log("CASE E check C (no disabled/misleading HELP control present):", !caseEHasDisabledHelpButton ? "PASS" : "FAIL");
const caseEHasLeave = bodyCaseE.includes("何もせず立ち去る") || bodyCaseE.includes("シナリオ選択に戻る");
console.log("CASE E check D (PLAYER can still leave/return normally):", caseEHasLeave ? "PASS" : "FAIL");
const caseEHasJinWorking = bodyCaseE.includes("迅ともう一人が長机を運んでいる");
console.log("CASE E check E (Jin continues work normally, described honestly):", caseEHasJinWorking ? "PASS" : "FAIL");

// ============================================================
// Debug UI separation
// ============================================================
const debugVisibleByDefault = (await page.$('[data-testid="contractv2-debug-panel"]')) !== null;
console.log("DEBUG check (panel NOT visible by default):", !debugVisibleByDefault ? "PASS" : "FAIL");
await shot("debug_00_not_visible_by_default");

await page.click('[data-testid="contractv2-debug-toggle"]');
await page.waitForTimeout(200);
await shot("debug_01_after_toggle_visible_and_separated");
const debugPanelNowVisible = (await page.$('[data-testid="contractv2-debug-panel"]')) !== null;
const debugContent = debugPanelNowVisible ? await page.textContent('[data-testid="contractv2-debug-panel"]') : "";
const debugHasContractInternals = debugContent.includes("contractId") || debugContent.includes("canonicalPreconditionId");
console.log("DEBUG check (panel appears only after explicit toggle):", debugPanelNowVisible ? "PASS" : "FAIL");
console.log("DEBUG check (contract internals ARE present, but ONLY inside the isolated debug panel):", debugHasContractInternals ? "PASS" : "FAIL");

// Confirm the PLAYER-facing narration area itself never contains raw internal field names, even
// while the debug panel is open (i.e., the two are visually/DOM separate, not the same block).
const narrationText = await page.textContent('[data-testid="contractv2-narration"]').catch(() => "");
const narrationLeaksInternals = /contractId|canonicalPreconditionId|stateAdmissionDecision|PARTICIPATED|WITNESSED/.test(narrationText);
console.log("DEBUG check (player-facing narration block itself never contains internal field names):", !narrationLeaksInternals ? "PASS" : "FAIL");

fs.writeFileSync(
  "C:/Users/user/ClaudeWork/thinking-game/docs/research/evaluation/phase-11-6/visual_qa_evidence.json",
  JSON.stringify({ evidence, baseUrl: BASE_URL }, null, 2),
  "utf8"
);

await browser.close();
console.log("\nDONE");
