import { chromium } from "playwright";

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
await page.goto("http://localhost:5242/?newlifecore=1", { waitUntil: "networkidle" });
await page.click('[data-testid="nlc-start"]');
await page.click('[data-testid="nlc-go-challenge-center"]');
await page.click('[data-testid="nlc-talk-kamiya"]');
await page.fill('[data-testid="nlc-freetext-input-kamiya"]', "こんにちは");
await page.click('[data-testid="nlc-freetext-submit-kamiya"]');
await page.waitForTimeout(150);
await page.click('[data-testid="nlc-conversation-close-kamiya"]');
await page.click('[data-testid="nlc-action-view_jobs"]');
await page.click('[data-testid="nlc-move-YOHEI_STORE"]');
if (await page.$('[data-testid="nlc-action-offer_help_shelf"]')) {
  await page.click('[data-testid="nlc-action-offer_help_shelf"]');
}
await page.click('[data-testid="nlc-move-CAFE_NODOKA"]');
await page.click('[data-testid="nlc-action-sit_down"]').catch(() => {});
await page.click('[data-testid="nlc-move-COMMUNITY_HALL"]');
await page.click('[data-testid="nlc-move-TRIAL_HOUSE"]');
const sleepBtn = await page.$('[data-testid="nlc-sleep"]');
console.log("sleep available yet:", !!sleepBtn);
if (!sleepBtn) {
  // advance further by bouncing between locations until sleep unlocks (20:00+)
  for (let i = 0; i < 20; i++) {
    await page.click('[data-testid="nlc-move-SHOPPING_STREET"]');
    await page.click('[data-testid="nlc-move-TRIAL_HOUSE"]');
    if (await page.$('[data-testid="nlc-sleep"]')) break;
  }
}
await page.screenshot({ path: "C:/Users/user/ClaudeWork/thinking-game/docs/research/evaluation/newlife-core-v1/screenshots/before_sleep.png" });
const clock = await page.textContent('[data-testid="nlc-clock"]');
console.log("clock before sleep:", clock);
await page.click('[data-testid="nlc-sleep"]');
await page.waitForTimeout(150);
await page.screenshot({ path: "C:/Users/user/ClaudeWork/thinking-game/docs/research/evaluation/newlife-core-v1/screenshots/day_end.png" });
console.log("day end reached:", !!(await page.$('[data-testid="nlc-day-end"]')));
await browser.close();
