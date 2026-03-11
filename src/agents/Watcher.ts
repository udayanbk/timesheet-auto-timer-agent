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

  try {
    await page.exposeFunction("timerStopped", async () => {

      if (restarting) return;
      restarting = true;

      try {

        logger.info("Timer stopped → restarting");

        const checkbox = page.locator(checkboxSelector).first();

        if (await checkbox.isVisible().catch(() => false)) {
          await checkbox.click();
        } else {
          logger.warn("Task checkbox not available, skipping selection");
        }

        const button = page.locator(timerButtonSelector);
        if (await button.isVisible().catch(() => false)) {
          await button.click();
          logger.info("Timer started");
        } else {
          logger.warn("Start button not visible");
        }
      } catch (err) {
        logger.error(err, "Failed to restart timer");
      } finally {
        setTimeout(() => {
          restarting = false;
        }, 3000);
      }
    });
  }
  catch { }



  await injectObserver(page, timerButtonSelector, playIconSelector);
  logger.info("Watcher Running");

  let injecting = false;
  page.on("framenavigated", async (frame) => {

    if (frame !== page.mainFrame()) return;
    if (injecting) return;

    injecting = true;

    logger.debug?.("Navigation detected");

    try {

      await Promise.race([
        page.waitForLoadState("domcontentloaded"),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Load timeout")), 10000)
        )
      ]);

      await injectObserver(page, timerButtonSelector, playIconSelector);

    } catch {
      logger.warn("Page load stuck → forcing reload");
      try {
        await page.reload({ waitUntil: "domcontentloaded", timeout: 10000 });
        await injectObserver(page, timerButtonSelector, playIconSelector);
      } catch {
        logger.warn("Reload failed → closing tab");
        await page.close(); // outer agent loop will recreate it
      }
    } finally {
      injecting = false;
    }
  });

  page.on("close", () => {
    logger.warn("Timesheet tab closed");
  });

}