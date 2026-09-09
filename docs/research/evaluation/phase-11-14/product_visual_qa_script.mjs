// PHASE 11.14: Owner Play natural conversation + semantic option exhaustion repair -- real-browser
// visual QA against the actual product-repaired scene. Two independent playthroughs (PATH B and
// PATH D) plus a mechanical no-debug-leak check, matching directive Section 18/19.
import { chromium } from "playwright";
import fs from "node:fs";

const BASE_URL = "http://localhost:5211/?newlifeplayable11=1";
const OUT_DIR = "C:/Users/user/ClaudeWork/thinking-game/docs/research/evaluation/phase-11-14/screenshots";
fs.mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch();
const results = [];
function log(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}: ${name}${detail ? " -- " + detail : ""}`);
}
async function actionIds(page) {
  return page.$$eval('[data-testid="playable11-actions"] button', (els) => els.map((e) => e.getAttribute("data-testid")));
}
async function logText(page) {
  return page.$eval('[data-testid="playable11-log"]', (el) => el.textContent ?? "");
}

// --- PATH B: ask festival first, then accept (Owner's actual observed sequence) ---
{
  const page = await browser.newPage({ viewport: { width: 900, height: 1400 } });
  await page.goto(BASE_URL, { waitUntil: "networkidle" });

  const preSceneText = await page.textContent('[data-testid="playable11-begin-choice"]');
  log("pre-scene paragraph grounds the relationship (顔なじみ)", preSceneText?.includes("顔なじみ") ?? false, preSceneText ?? "");

  await page.click('[data-testid="playable11-begin"]');
  await page.waitForTimeout(150);
  await page.screenshot({ path: `${OUT_DIR}/00_opening.png`, fullPage: true });

  let ids = await actionIds(page);
  log("opening: exact 5-action set (accept/decline/what/festival/leave)", JSON.stringify(ids) === JSON.stringify(["playable11-accept", "playable11-decline", "playable11-ask-what", "playable11-ask-festival", "playable11-leave"]), JSON.stringify(ids));

  let openingText = await logText(page);
  log("opening narration uses 話しかけてきた, not the old 洋平が言った framing", openingText.includes("話しかけてきた") && !openingText.includes("洋平が言った"), openingText);

  await page.click('[data-testid="playable11-ask-festival"]');
  await page.waitForTimeout(150);
  await page.screenshot({ path: `${OUT_DIR}/01_after_festival_question.png`, fullPage: true });

  const yoheiLineAfterFestival = await page.textContent('[data-testid="playable11-yohei-line"]');
  log("festival response contains the real captured sales result", yoheiLineAfterFestival?.includes("8割") ?? false, yoheiLineAfterFestival ?? "");

  ids = await actionIds(page);
  log("SEMANTIC OPTION EXHAUSTION: ask-festival disappears (one-shot, already selected)", !ids.includes("playable11-ask-festival"), JSON.stringify(ids));
  log("REDUNDANT QUESTION SUPPRESSION: ask-sales never appears (target already resolved by the festival answer)", !ids.includes("playable11-ask-sales"), JSON.stringify(ids));
  log("ask-what remains (independent target, not yet asked)", ids.includes("playable11-ask-what"), JSON.stringify(ids));

  await page.click('[data-testid="playable11-accept"]');
  await page.waitForTimeout(150);
  await page.screenshot({ path: `${OUT_DIR}/02_after_accept_path_b.png`, fullPage: true });

  const logAfterAccept = await logText(page);
  log("PLAYER acceptance line uses the action-grounded rewrite", logAfterAccept.includes("OKです") && logAfterAccept.includes("この棚に置きますね"), logAfterAccept);
  log("physical reveal narrates the towels becoming visible", logAfterAccept.includes("手ぬぐいがたくさん入っていた"), logAfterAccept);

  ids = await actionIds(page);
  log("REDUNDANT QUESTION SUPPRESSION: ask-leftover never appears (its target was already resolved by the earlier festival answer, PATH B/C)", !ids.includes("playable11-ask-leftover"), JSON.stringify(ids));
  log("ask-what gone (request resolved by accept)", !ids.includes("playable11-ask-what"), JSON.stringify(ids));

  await page.click('[data-testid="playable11-debug-toggle"]');
  await page.waitForTimeout(150);
  await page.screenshot({ path: `${OUT_DIR}/03_debug_after_path_b.png`, fullPage: true });
  const evidence = await page.textContent('[data-testid="playable11-debug-question-prerequisite-evidence"]');
  log("debug evidence shows targetStatus KNOWN_TRUE, resolved via the festival response", /"targetStatus": "KNOWN_TRUE"/.test(evidence ?? ""));

  const primaryText = await page.$eval('[data-testid="playable11-actions"]', (el) => el.textContent ?? "");
  log("no debug/research text (targetStatus/KNOWN_TRUE/etc) leaks onto the primary player surface", !/targetStatus|KNOWN_TRUE|KNOWN_FALSE|UNRESOLVED|CONFLICTING|PRODUCT_AUTHORITATIVE/.test(primaryText));

  await page.close();
}

// --- PATH D: accept first (physical reveal only), leftover question remains legitimate ---
{
  const page = await browser.newPage({ viewport: { width: 900, height: 1400 } });
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.click('[data-testid="playable11-begin"]');
  await page.waitForTimeout(150);
  await page.click('[data-testid="playable11-accept"]');
  await page.waitForTimeout(150);
  await page.screenshot({ path: `${OUT_DIR}/04_path_d_reveal_without_festival.png`, fullPage: true });

  let ids = await actionIds(page);
  log("PATH D: ask-leftover remains legitimately eligible (festival never asked, target still open)", ids.includes("playable11-ask-leftover"), JSON.stringify(ids));

  await page.click('[data-testid="playable11-ask-leftover"]');
  await page.waitForTimeout(150);
  await page.screenshot({ path: `${OUT_DIR}/05_path_d_after_leftover_answered.png`, fullPage: true });
  const yoheiLine = await page.textContent('[data-testid="playable11-yohei-line"]');
  log("PATH D: direct leftover question still genuinely confirms the target", yoheiLine?.includes("祭りの残り") ?? false, yoheiLine ?? "");

  ids = await actionIds(page);
  log("PATH C: ask-leftover disappears once its own target is resolved", !ids.includes("playable11-ask-leftover"), JSON.stringify(ids));

  await page.close();
}

fs.writeFileSync(
  "C:/Users/user/ClaudeWork/thinking-game/docs/research/evaluation/phase-11-14/product_visual_qa_evidence.json",
  JSON.stringify({ results, baseUrl: BASE_URL, allPass: results.every((r) => r.pass) }, null, 2),
  "utf8",
);
await browser.close();
console.log("\nALL PASS:", results.every((r) => r.pass));
console.log("DONE");
