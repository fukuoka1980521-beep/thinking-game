// PHASE 11.12R: mechanical visual verification of the REAL gated ?newlifeplayable11=1 path.
// Reuses the already-installed `playwright` devDependency, same pattern as phase-11-11's
// visual_qa_script.mjs. Does NOT overwrite any phase-11-11 evidence file.
import { chromium } from "playwright";
import fs from "node:fs";

const BASE_URL = "http://localhost:5199/?newlifeplayable11=1";
const OUT_DIR = "C:/Users/user/ClaudeWork/thinking-game/docs/research/evaluation/phase-11-12r/screenshots";
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

async function actionButtonTestIds() {
  return page.$$eval('[data-testid="playable11-actions"] button', (els) => els.map((e) => e.getAttribute("data-testid")));
}

await page.goto(BASE_URL, { waitUntil: "networkidle" });
await shot("00_real_path_initial_entry");

await page.click('[data-testid="playable11-begin"]');
await page.waitForTimeout(200);
await shot("01_real_path_initial_scene");

const initialIds = await actionButtonTestIds();
log("initial screen: exactly 6 real buttons, in the expected order", JSON.stringify(initialIds) === JSON.stringify(["playable11-accept", "playable11-decline", "playable11-ask-what", "playable11-ask-festival", "playable11-ask-sales", "playable11-leave"]), initialIds.join(","));
log("QA weather probe ABSENT from real rendered button list", !initialIds.includes("playable11-ask-weather"));

const bodyTextInitial = await page.textContent("body");
log("Vertex/replay disclosure sentence ABSENT from primary player surface (initial)", !bodyTextInitial.includes("Vertex AI"));

await page.click('[data-testid="playable11-ask-what"]');
await page.waitForTimeout(200);
await shot("02_real_path_after_ask_what");
const bodyTextAskWhat = await page.textContent("body");
log("Vertex/replay disclosure sentence ABSENT from primary player surface (after ASK_WHAT)", !bodyTextAskWhat.includes("Vertex AI"));

await page.click('[data-testid="playable11-accept"]');
await page.waitForTimeout(200);
await shot("03_real_path_after_accept");
const afterAcceptIds = await actionButtonTestIds();
log("after ACCEPT: leftover-followup button ABSENT (real counterfactual causality gate rejected the historical claim)", !afterAcceptIds.includes("playable11-ask-leftover"), afterAcceptIds.join(","));
log("after ACCEPT: weather probe still ABSENT", !afterAcceptIds.includes("playable11-ask-weather"));
log("after ACCEPT: exactly 4 real buttons remain (down from PHASE 11.11's 6)", afterAcceptIds.length === 4, afterAcceptIds.join(","));

await page.click('[data-testid="playable11-debug-toggle"]');
await page.waitForTimeout(200);
await shot("04_real_path_debug_panel_open");
const debugPanelText = await page.textContent('[data-testid="playable11-debug-panel"]');
log("dev-only disclosure IS present inside the debug/evidence surface (this is a dev build)", debugPanelText.includes("Vertex AI") && debugPanelText.includes("PHASE_11_12_DEV_ONLY_DISCLOSURE_MARKER_9f3c1a"));
log("product-surface gate evidence (rejected actions incl. ASK_WEATHER_SCENE) is present in debug panel", debugPanelText.includes("ASK_WEATHER_SCENE") && debugPanelText.includes("CAUSAL_UNLOCK"));

const primarySurfaceText = await page.$eval('[data-testid="playable11-actions"]', (el) => el.textContent ?? "").catch(() => "");
log("primary player action surface itself contains no Vertex AI text even with debug panel open", !primarySurfaceText.includes("Vertex AI"));

fs.writeFileSync(
  "C:/Users/user/ClaudeWork/thinking-game/docs/research/evaluation/phase-11-12r/real_path_visual_evidence.json",
  JSON.stringify({ results, baseUrl: BASE_URL, allPass: results.every((r) => r.pass) }, null, 2),
  "utf8",
);

await browser.close();
console.log("\nALL PASS:", results.every((r) => r.pass));
console.log("DONE");
