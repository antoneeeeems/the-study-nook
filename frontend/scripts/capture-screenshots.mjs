import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const BASE_URL = process.env.SNAPSHOT_BASE_URL ?? "http://127.0.0.1:3000";
const OUTPUT_DIR = "playwright-snapshots";
const VIEWPORT_MODE = (process.env.SNAPSHOT_VIEWPORTS ?? "all").toLowerCase();

const routes = ["/", "/shop", "/cart", "/pipeline", "/insights"];
const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

const filteredViewports =
  VIEWPORT_MODE === "desktop"
    ? viewports.filter((viewport) => viewport.name === "desktop")
    : viewports;

async function run() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  try {
    for (const viewport of filteredViewports) {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();

      for (const route of routes) {
        const url = `${BASE_URL}${route}`;
        await page.goto(url, { waitUntil: "networkidle" });
        await page.waitForTimeout(500);

        const safeRoute = route === "/" ? "dashboard" : route.slice(1).replaceAll("/", "-");
        const filePath = `${OUTPUT_DIR}/${safeRoute}-${viewport.name}.png`;
        await page.screenshot({ path: filePath, fullPage: true });
      }

      await context.close();
    }
  } finally {
    await browser.close();
  }
}

run().catch((error) => {
  console.error("Snapshot capture failed:", error);
  process.exit(1);
});
