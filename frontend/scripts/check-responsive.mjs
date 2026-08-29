import { chromium } from "playwright";
import path from "node:path";

const outDir = path.resolve(import.meta.dirname, "../.verify-output");
await import("node:fs/promises").then((fs) => fs.mkdir(outDir, { recursive: true }));

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const consoleErrors = [];

async function shot(viewport, name, actions) {
  const page = await browser.newPage({ viewport, hasTouch: true, isMobile: viewport.width < 500 });
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(`[${name}] ${msg.text()}`);
  });
  await page.goto("http://localhost:5173", { waitUntil: "networkidle" });
  await page.waitForSelector("text=出張申請書");
  await page.waitForTimeout(400);
  if (actions) await actions(page);
  await page.screenshot({ path: path.join(outDir, name) });
  console.log("screenshot:", name, viewport);
  await page.close();
}

// iPad mini 縦持ち相当（狭めのタブレット）
await shot({ width: 768, height: 1024 }, "tablet-narrow-portrait-default.png");

// iPad 縦持ち相当
await shot({ width: 820, height: 1180 }, "tablet-portrait-with-metadata.png", async (page) => {
  await page.waitForTimeout(300);
});

// iPad 横持ち相当・3枚比較
await shot({ width: 1180, height: 820 }, "tablet-landscape-3panes.png", async (page) => {
  await page.click("text=文書比較モード");
  await page.waitForTimeout(200);
  await page.click('button:has-text("3枚比較")');
  await page.waitForTimeout(200);
  await page.click("text=出張申請書（山田太郎・大阪支店）");
  await page.waitForTimeout(200);
  await page.click("text=業務委託契約書（〇〇株式会社）");
  await page.waitForTimeout(200);
  await page.click("text=稟議書（文書承認ビューア導入について）");
  await page.waitForTimeout(500);
});

// タブレット縦持ちでサイドバーをドラッグで縮めて、PDF幅を広げる操作の確認
await shot({ width: 820, height: 1180 }, "tablet-sidebar-resize.png", async (page) => {
  const resizer = page.locator(".sidebar-resizer");
  const box = await resizer.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x - 150, box.y + box.height / 2, { steps: 10 });
    await page.mouse.up();
  }
  await page.waitForTimeout(300);
});

await browser.close();
console.log("console errors:", consoleErrors.length ? consoleErrors : "(none)");
console.log("done");
