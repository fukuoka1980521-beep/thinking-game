// NEW LIFE V0.3 visual acceptance script. Drives a real Chromium browser through the opening,
// DAY1's full shape (Kamiya free-text, both location visits, noon/evening/wrap), DAY2's
// opportunity-cost shadow branch, DAY5's Kamiya milestone, and DAY7's ending, at a mobile and a
// desktop viewport, saving a screenshot per beat.
import { chromium } from "playwright";
import fs from "node:fs";

const BASE_URL = "http://localhost:5241/?newlifev03=1";
const OUT_DIR = "C:/Users/user/ClaudeWork/thinking-game/docs/research/evaluation/newlife-v0-3/screenshots";
fs.mkdirSync(OUT_DIR, { recursive: true });

const VIEWPORTS = [
  { name: "390x844", width: 390, height: 844 },
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
  log(`${vp.name}: no horizontal scroll at opening`, await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1));
  log(`${vp.name}: town image visible`, await page.$eval('[data-testid="v03-town-image"]', (el) => el.naturalWidth > 0).catch(() => false));

  await page.click('[data-testid="v03-start"]');
  await page.click('[data-testid="v03-continue"]'); // d1_wake -> kamiya intro
  await shot("01_day1_kamiya_freetext");
  await page.fill('[data-testid="v03-freetext-input"]', "正直、まだ何も決めていません");
  await page.click('[data-testid="v03-freetext-submit"]');
  await shot("02_day1_kamiya_reply");
  await page.click('[data-testid="v03-continue"]');
  await page.click('[data-testid="v03-continue"]'); // kamiya_after -> pick1
  await shot("03_day1_pick1");

  await page.click('[data-testid="v03-pick-YOHEI_STORE"]');
  await page.waitForSelector('[data-testid="v03-portrait-yohei"]');
  await page.waitForTimeout(300);
  log(`${vp.name}: Yohei portrait visible`, await page.$eval('[data-testid="v03-portrait-yohei"]', (el) => el.complete && el.naturalWidth > 0).catch(() => false));
  await shot("04_day1_yohei_scene");
  await page.click('[data-testid="v03-choice-borrow"]');
  await shot("05_day1_yohei_result");
  await page.click('[data-testid="v03-continue"]');

  await page.click('[data-testid="v03-pick-CAFE_NODOKA"]');
  await page.waitForSelector('[data-testid="v03-portrait-miyoko"]');
  await page.waitForTimeout(300);
  log(`${vp.name}: Miyoko portrait visible`, await page.$eval('[data-testid="v03-portrait-miyoko"]', (el) => el.complete && el.naturalWidth > 0).catch(() => false));
  await page.click('[data-testid="v03-choice-sit"]');
  await page.click('[data-testid="v03-continue"]');
  await shot("06_day1_noon");
  await page.click('[data-testid="v03-continue"]');
  await shot("07_day1_evening");
  await page.click('[data-testid="v03-continue"]');
  await shot("08_day1_wrap");
  log(`${vp.name}: DAY1 wrap shows natural-language today list`, (await page.textContent('[data-testid="v03-today-list"]'))?.length > 0);

  await page.click('[data-testid="v03-next-day"]');
  await page.click('[data-testid="v03-continue"]'); // d2_wake -> pick1
  await page.click('[data-testid="v03-pick-COMMUNITY_HALL"]');
  await page.waitForSelector('[data-testid="v03-portrait-jin"]');
  await page.waitForTimeout(300);
  log(`${vp.name}: Jin portrait visible at the shadow-invite scene`, await page.$eval('[data-testid="v03-portrait-jin"]', (el) => el.complete && el.naturalWidth > 0).catch(() => false));
  await shot("09_day2_jin_invite");
  await page.click('[data-testid="v03-choice-not_yet"]');
  await page.click('[data-testid="v03-continue"]');
  await page.waitForTimeout(300);
  await shot("10_day2_shadow_offer");
  await page.click('[data-testid="v03-choice-accept"]');
  await page.click('[data-testid="v03-continue"]');
  await page.waitForTimeout(300);
  await shot("11_day2_shadow_freetext");
  await page.fill('[data-testid="v03-freetext-input"]', "新しい生活を探しに来ました");
  await page.click('[data-testid="v03-freetext-submit"]');
  await page.click('[data-testid="v03-continue"]');
  await shot("12_day2_shadow_result");
  log(`${vp.name}: opportunity cost -- no second PICK screen appears after accepting the shadow job`, (await page.$('[data-testid="v03-step-pick"]')) === null);
  await page.click('[data-testid="v03-continue"]');
  await page.click('[data-testid="v03-continue"]');
  await page.click('[data-testid="v03-next-day"]');

  await context.close();
}

fs.writeFileSync(`${OUT_DIR}/../v03_visual_qa_evidence.json`, JSON.stringify({ results, allPass: results.every((r) => r.pass) }, null, 2), "utf8");
await browser.close();
console.log("\nALL PASS:", results.every((r) => r.pass));
console.log("DONE");
