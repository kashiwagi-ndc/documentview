import { chromium } from "playwright";
import path from "node:path";

const outDir = path.resolve(import.meta.dirname, "../.verify-output");
await import("node:fs/promises").then((fs) => fs.mkdir(outDir, { recursive: true }));

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const consoleErrors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});
page.on("pageerror", (err) => consoleErrors.push(String(err)));

async function shot(name) {
  await page.screenshot({ path: path.join(outDir, name) });
  console.log("screenshot:", name);
}

console.log("1) initial load: top-level doc should show metadata panel");
await page.goto("http://localhost:5173", { waitUntil: "networkidle" });
await page.waitForSelector("text=出張申請書");
await page.waitForTimeout(500);
await shot("01-metadata-panel-default.png");

console.log("2) attachment should NOT show metadata panel");
await page.click("text=領収書（宿泊費）");
await page.waitForTimeout(300);
await shot("02-attachment-no-metadata.png");

console.log("3) select doc with larger metadata set + nested group, expand/collapse");
await page.click("text=業務委託契約書（〇〇株式会社）");
await page.waitForTimeout(400);
await shot("03-large-metadata.png");
await page.click('button:has-text("甲（委託者）")');
await page.waitForTimeout(200);
await shot("04-group-collapsed.png");

console.log("4) search filter within metadata");
await page.fill(".meta-panel__search", "支払");
await page.waitForTimeout(300);
await shot("05-search-filtered.png");
await page.fill(".meta-panel__search", "");

console.log("5) collapse metadata panel entirely, then resize (drag)");
await page.click('.meta-panel__toggle');
await page.waitForTimeout(200);
await shot("06-panel-collapsed.png");
await page.click('.meta-panel__toggle');
await page.waitForTimeout(200);

const resizer = page.locator(".meta-panel__resizer");
const box = await resizer.boundingBox();
if (box) {
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y - 150, { steps: 10 });
  await page.mouse.up();
}
await page.waitForTimeout(300);
await shot("07-panel-resized-larger.png");

console.log("6) compare mode: each pane independently shows its own metadata");
await page.click("text=文書比較モード");
await page.waitForTimeout(200);
await page.click("text=出張申請書（山田太郎・大阪支店）");
await page.waitForTimeout(300);
await page.click("text=稟議書（文書承認ビューア導入について）");
await page.waitForTimeout(500);
await shot("08-compare-with-metadata.png");

console.log("console errors:", consoleErrors.length ? consoleErrors : "(none)");

await browser.close();
console.log("done, screenshots in", outDir);
