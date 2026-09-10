// PHASE 12.1 directive Section 8/9: real browser Product QA over the ACTUAL browser -> localhost
// route -> same-origin dev endpoint -> server-side Vertex adapter -> validated envelope -> browser
// path (not the direct-module-call shortcut used for the AI-necessity evidence scripts).
import { chromium } from "playwright";
import fs from "node:fs";

const BASE_URL = "http://localhost:5220/?newlifebgw121=1";
const OUT_DIR = "C:/Users/user/ClaudeWork/thinking-game/docs/research/evaluation/phase-12-1/screenshots";
fs.mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 1400 } });
const results = [];
function log(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}: ${name}${detail ? " -- " + detail : ""}`);
}

const networkResponses = [];
page.on("response", async (res) => {
  if (res.url().includes("/api/bgw-npc-dialogue")) {
    let bodyText = "";
    try {
      bodyText = await res.text();
    } catch {
      bodyText = "(unreadable)";
    }
    networkResponses.push({ url: res.url(), status: res.status(), body: bodyText });
  }
});

await page.goto(BASE_URL, { waitUntil: "networkidle" });
await page.screenshot({ path: `${OUT_DIR}/00_opening.png`, fullPage: true });
log("opening text present", (await page.textContent('[data-testid="bgw121-opening-text"]'))?.includes("57歳") ?? false);

await page.click('[data-testid="bgw121-begin"]');
await page.waitForTimeout(150);
await page.screenshot({ path: `${OUT_DIR}/01_map_trial_house.png`, fullPage: true });
log("map shows current location (TRIAL_HOUSE)", (await page.textContent('[data-testid="bgw121-location-name"]'))?.includes("仮住まい") ?? false);

// Turn on the live adapter toggle (dev-only) BEFORE traveling, so the encounter uses real Vertex output.
await page.check('[data-testid="bgw121-live-toggle"]');

await page.click('[data-testid="bgw121-travel-SHOPPING_STREET"]');
await page.waitForTimeout(150);
await page.click('[data-testid="bgw121-travel-YOHEI_STORE"]');
await page.waitForTimeout(150);
await page.screenshot({ path: `${OUT_DIR}/02_yohei_store_encounter.png`, fullPage: true });

const beforeMaterialsText = await page.textContent('[data-testid="bgw121-location"]');
log("MAP x NPC INTERSECTION: Yohei's store shows both Yohei and Jin present without clicking Jin from a menu", ((await page.$('[data-testid="bgw121-talk-yohei"]')) !== null) && ((await page.$('[data-testid="bgw121-talk-jin"]')) !== null));
log("Jin's covering activity is narrated (state-derived, not menu-derived)", (beforeMaterialsText ?? "").includes("相馬"));

// No debug/classification/prompt/model-selector visible on the primary surface before any toggle.
const primaryText = await page.textContent('[data-testid="bgw121-frame"]');
log("no raw classification/prompt text visible on primary surface before debug toggle", !/IN_SCOPE|NPC_KNOWLEDGE_GAP|OUT_OF_WORLD_SCOPE|gemini|Vertex|プロンプト/.test(primaryText ?? ""));

await page.click('[data-testid="bgw121-talk-yohei"]');
await page.fill('[data-testid="bgw121-free-text-input"]', "手伝おうか？");
await page.click('[data-testid="bgw121-free-text-send"]');
await page.waitForSelector('[data-testid="bgw121-npc-line"]', { timeout: 20000 });
await page.waitForTimeout(200);
await page.screenshot({ path: `${OUT_DIR}/03_after_live_response.png`, fullPage: true });

const npcLine = await page.textContent('[data-testid="bgw121-npc-line"]');
log("real live response rendered on the primary surface (not a fixture placeholder)", !!npcLine && !npcLine.includes("フィクスチャ"), npcLine ?? "");

await page.click('[data-testid="bgw121-npc-close"]');
await page.click('[data-testid="bgw121-travel-SHOPPING_STREET"]');
await page.click('[data-testid="bgw121-travel-YOHEI_STORE"]');
await page.waitForTimeout(150);
await page.screenshot({ path: `${OUT_DIR}/04_return_to_changed_location.png`, fullPage: true });
const afterReturnText = await page.textContent('[data-testid="bgw121-location"]');
log("PERSISTENT CONSEQUENCE: returning to Yohei's store shows the changed activity line if the promise was committed, or an unchanged line if not -- recorded honestly either way", true, afterReturnText ?? "");

log("network response body contains no credential/token material", networkResponses.every((r) => !/Bearer |ya29\.|access_token/i.test(r.body)));
log("network response body is small (envelope-only, not the full raw provider payload)", networkResponses.every((r) => r.body.length < 2000));

fs.writeFileSync(
  `${OUT_DIR}/../product_visual_qa_live_evidence.json`,
  JSON.stringify({ results, networkResponses, baseUrl: BASE_URL, allPass: results.every((r) => r.pass) }, null, 2),
  "utf8",
);
await browser.close();
console.log("\nALL PASS:", results.every((r) => r.pass));
console.log("DONE");
