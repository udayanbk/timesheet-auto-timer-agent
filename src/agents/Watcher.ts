import { Page } from "playwright";
import { logger } from "../services/Logger";
import { config } from "../config/config";
import { injectObserver } from "../controllers/injectObserver";

export async function watchTimer(page: Page) {

  logger.info("Injecting DOM observer...");

  let restarting = false;
  const timerButtonSelector = config.selectors.timerButton;
  const checkboxSelector = config.selectors.checkbox;
  const playIconSelector = config.selectors.playIcon;

  await page.exposeFunction("timerStopped", async () => {

    if (restarting) return;
    restarting = true;

    try {

      logger.info("Timer stopped → restarting");

      const checkbox = page.locator(checkboxSelector).first();
      await checkbox.click();
      const button = page.locator(timerButtonSelector);
      await button.click();

      logger.info("Timer started");

    } catch (err) {
      logger.error(err, "Failed to restart timer");
    } finally {
      setTimeout(() => {
        restarting = false;
      }, 3000);
    }

  });

  await injectObserver(page, timerButtonSelector, playIconSelector);
  logger.info("Watcher Running");
  page.on("framenavigated", async (frame) => {

    if (frame !== page.mainFrame()) return;

    logger.info("Page navigation detected → reinjecting observer");

    try {
      await page.waitForLoadState("domcontentloaded");
      await injectObserver(page, timerButtonSelector, playIconSelector);

    } catch (err) {
      logger.warn("Observer injection skipped during navigation");
    }
  });

}