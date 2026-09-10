// NEW LIFE V0.2 visual acceptance script (Section 20). Drives a real Chromium browser through
// OPENING -> DAY1 (morning/npc/afternoon/end) -> DAY2 (morning/branch) -> DAY3, at each required
// viewport, and saves a screenshot per beat.
import { chromium } from "playwright";
import fs from "node:fs";

const BASE_URL = "http://localhost:5240/?newlifev02=1";
const OUT_DIR = "C:/Users/user/ClaudeWork/thinking-game/docs/research/evaluation/newlife-v0-2/screenshots";
fs.mkdirSync(OUT_DIR, { recursive: true });

const VIEWPORTS = [
  { name: "360x800", width: 360, height: 800 },
  { name: "390x844", width: 390, height: 844 },
  { name: "430x932", width: 430, height: 932 },
  { name: "1440x900", width: 1440, height: 900 },
];

const results = [];
function log(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}: ${name}${detail ? " -- " + detail : ""}`);
}

const browser = await chromium.launch();

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await context.newPage();
  const shot = (label) => page.screenshot({ path: `${OUT_DIR}/${vp.name}_${label}.png` });

  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await shot("00_opening");
  log(`${vp.name}: opening has no horizontal scroll`, await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1));
  log(`${vp.name}: town image visible in opening`, await page.$eval('[data-testid="v02-town-image"]', (el) => el.naturalWidth > 0).catch(() => false));

  await page.click('[data-testid="v02-start"]');
  await page.waitForTimeout(150);
  await shot("01_day1_morning");
  log(`${vp.name}: DAY1 morning CTA reachable`, await page.$eval('[data-testid="v02-continue"]', (el) => el.getBoundingClientRect().bottom <= window.innerHeight + 4));

  await page.click('[data-testid="v02-continue"]');
  await page.waitForTimeout(100);
  await page.click('[data-testid="v02-pick-YOHEI_STORE"]');
  await page.waitForTimeout(150);
  await shot("02_day1_npc_scene");
  log(`${vp.name}: Yohei portrait visible`, await page.$eval('[data-testid="v02-portrait-yohei"]', (el) => el.naturalWidth > 0).catch(() => false));
  log(`${vp.name}: choices reachable without excessive scroll`, await page.$eval('[data-testid="v02-choice-borrow"]', (el) => el.getBoundingClientRect().top < window.innerHeight));

  await page.click('[data-testid="v02-choice-borrow"]');
  await page.waitForTimeout(100);
  await page.click('[data-testid="v02-continue"]');
  await page.waitForTimeout(150);
  await shot("03_day1_afternoon");

  await page.click('[data-testid="v02-choice-remember_notice"]');
  await page.waitForTimeout(100);
  await page.click('[data-testid="v02-continue"]');
  await page.waitForTimeout(150);
  await shot("03b_day1_evening");

  await page.click('[data-testid="v02-continue"]');
  await page.waitForTimeout(150);
  await shot("04_day1_end_summary");
  log(`${vp.name}: DAY1 summary shows materials`, (await page.textContent('[data-testid="v02-today-list"]'))?.length > 0);

  await page.click('[data-testid="v02-next-day"]');
  await page.waitForTimeout(150);
  await shot("05_day2_morning");
  log(`${vp.name}: DAY2 morning reflects DAY1 (tool-fix choice present)`, (await page.$('[data-testid="v02-choice-fix_with_tool"]')) !== null);

  await page.click('[data-testid="v02-choice-fix_with_tool"]');
  await page.waitForTimeout(100);
  await page.click('[data-testid="v02-continue"]');
  await page.waitForTimeout(150);
  await shot("06_day2_branch_pick");

  await page.click('[data-testid="v02-pick-YOHEI_STORE"]');
  await page.waitForTimeout(150);
  await page.click('[data-testid="v02-choice-report_used"]');
  await page.waitForTimeout(100);
  const day2SceneText = await page.textContent('[data-testid="v02-step-npc-scene"]');
  log(`${vp.name}: Jin's payoff line appears when tool was used on the shelf`, /それ、洋平さんのだろ/.test(day2SceneText ?? ""));
  await page.click('[data-testid="v02-continue"]');
  await page.waitForTimeout(150);
  const afternoon2Choice = await page.$('[data-testid^="v02-choice-"]');
  if (afternoon2Choice) await afternoon2Choice.click();
  await page.click('[data-testid="v02-continue"]');
  await page.waitForTimeout(150);
  await page.click('[data-testid="v02-continue"]');
  await page.waitForTimeout(150);
  await page.click('[data-testid="v02-next-day"]');
  await page.waitForTimeout(150);
  await shot("07_day3_morning");
  const day3Text = await page.textContent('[data-testid="v02-step-intro"]');
  log(`${vp.name}: DAY3 reflects the fixed shelf`, /直した棚/.test(day3Text ?? ""));

  await context.close();
}

fs.writeFileSync(`${OUT_DIR}/../v02_visual_qa_evidence.json`, JSON.stringify({ results, allPass: results.every((r) => r.pass) }, null, 2), "utf8");
await browser.close();
console.log("\nALL PASS:", results.every((r) => r.pass));
console.log("DONE");
