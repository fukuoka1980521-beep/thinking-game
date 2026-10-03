import { chromium } from "playwright";
import fs from "node:fs";

const OUT =
  process.env.NEWLIFE_MEMORY_PROBE_OUT ||
  "C:\\Users\\user\\Downloads\\NEWLIFE_AGENT_MEMORY_LIVE_PROBE_20261003.json";
const SCREEN =
  process.env.NEWLIFE_MEMORY_PROBE_SCREEN ||
  "C:\\Users\\user\\Downloads\\NEWLIFE_AGENT_MEMORY_LIVE_PROBE_20261003.png";
const URL = process.env.NEWLIFE_URL || "http://localhost:5175/?newlife30=1";

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
});
const context = await browser.newContext({ viewport: { width: 1280, height: 960 } });
await context.addInitScript(() => {
  if (!sessionStorage.getItem("newlife-memory-probe-initialized")) {
    localStorage.removeItem("newlife30_save_v1");
    sessionStorage.setItem("newlife-memory-probe-initialized", "1");
  }
  localStorage.setItem(
    "thinking-game:newlife-ai-dialogue-consent:v1",
    JSON.stringify({ status: "accepted", respondedAt: new Date().toISOString() }),
  );
});

const page = await context.newPage();
const consoleLog = [];
page.on("console", (m) => consoleLog.push(`CONSOLE ${m.type()} ${m.text()}`));
page.on("pageerror", (e) => consoleLog.push(`PAGEERROR ${e.message}`));

await page.goto(URL, { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Day 1から始める" }).click();
await page.getByRole("button", { name: "次の日へ" }).click();
await page.getByRole("button", { name: "次の日へ" }).click();

await page.locator("select").selectOption("miyoko");
const firstUtterance =
  "商売ですからね、できることとできないことは決めておいたほうが良いですよ";
await page.getByPlaceholder(/自由に話しかける/).fill(firstUtterance);
await page.getByRole("button", { name: "話す" }).click();
await page.locator(".newlife30-pending").waitFor({ state: "detached", timeout: 90000 }).catch(() => {});
await page.waitForTimeout(1200);

const day3Transcript = await page.locator(".newlife30-transcript").innerText();
let day3Save = await page.evaluate(() => {
  const raw = localStorage.getItem("newlife30_save_v1");
  return raw ? JSON.parse(raw) : null;
});

const day3MiyokoMemories = day3Save?.agentMemory?.miyoko ?? [];

await page.getByRole("button", { name: "次の日へ" }).click();
await page.getByRole("button", { name: "次の日へ" }).click();
await page.waitForFunction(() => {
  const raw = localStorage.getItem("newlife30_save_v1");
  if (!raw) return false;
  try { return JSON.parse(raw)?.state?.day === 5; } catch { return false; }
}, null, { timeout: 10000 });

// Reload to prove memory survives the browser/session persistence boundary.
await page.reload({ waitUntil: "networkidle" });
const continueButton = page.getByRole("button", { name: /から続ける/ });
if (await continueButton.count()) await continueButton.click();

await page.waitForFunction(() => {
  const select = document.querySelector("select");
  return Boolean(select && [...select.options].some((option) => option.value === "miyoko"));
}, null, { timeout: 10000 });
await page.locator("select").selectOption("miyoko");
const secondUtterance = "この前の待つ場所の話、どう考えてます？";
await page.getByPlaceholder(/自由に話しかける/).fill(secondUtterance);
await page.getByRole("button", { name: "話す" }).click();
await page.locator(".newlife30-pending").waitFor({ state: "detached", timeout: 90000 }).catch(() => {});
await page.waitForTimeout(1200);

const day5Transcript = await page.locator(".newlife30-transcript").innerText();
const finalSave = await page.evaluate(() => {
  const raw = localStorage.getItem("newlife30_save_v1");
  return raw ? JSON.parse(raw) : null;
});
const finalMiyokoMemories = finalSave?.agentMemory?.miyoko ?? [];

await page.screenshot({ path: SCREEN, fullPage: true });

const result = {
  generatedAt: new Date().toISOString(),
  url: page.url(),
  firstUtterance,
  day3Transcript,
  day3MiyokoMemories,
  secondUtterance,
  day5Transcript,
  finalMiyokoMemories,
  technicalPass: Boolean(
    day3MiyokoMemories.length >= 1 &&
      finalMiyokoMemories.length >= day3MiyokoMemories.length &&
      day5Transcript.includes(secondUtterance) &&
      !day5Transcript.includes("通信が途切れました")
  ),
  semanticHumanVerdict: "PENDING",
  consoleLog,
};

fs.writeFileSync(OUT, JSON.stringify(result, null, 2), "utf8");
console.log(JSON.stringify(result, null, 2));
console.error(`WROTE ${OUT}`);
await browser.close();
