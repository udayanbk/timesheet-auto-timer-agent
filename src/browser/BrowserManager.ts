import { config } from "../config/config";
import { chromium, Page } from "playwright";
import { ensureChromeRunning } from "./ChromeLauncher";
import { logger } from "../services/Logger";

export async function launchBrowser(): Promise<Page> {

  await ensureChromeRunning()

  const browser = await chromium.connectOverCDP(config.localhostUrl);

  const contexts = browser.contexts();
  const context = contexts[0];

  const pages = context.pages();

  let page = pages.find(p =>
    p.url().includes("timesheet")
  );

  if (!page) {
    page = await context.newPage();
    await page.goto(config.targetUrl);
  }

  logger.info(`Connected to: ${page.url()}`)

  return page;
}