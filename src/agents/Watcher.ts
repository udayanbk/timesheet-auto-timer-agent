import { Page } from "playwright";
import { logger } from "../services/Logger";
import { config } from "../config/config";
import { injectObserver } from "../controllers/injectObserver";

export async function watchTimer(page: Page) {

  logger.info("Injecting DOM observer...");

  const timerButtonSelector = config.selectors.timerButton;
  const checkboxSelector = config.selectors.checkbox;
  const playIconSelector = config.selectors.playIcon;

  let restartCooldown = 0;
  let loadingSince: number | null = null;

  async function restartTimer() {

    if (Date.now() < restartCooldown) return;

    restartCooldown = Date.now() + 5000;

    try {

      logger.info("Timer stopped → restarting");

      const checkbox = page.locator(checkboxSelector).first();

      if (await checkbox.isVisible().catch(() => false)) {
        await checkbox.click();
      }

      const button = page.locator(timerButtonSelector);

      if (await button.isVisible().catch(() => false)) {
        await button.click();
        logger.info("Timer started");
      }

    } catch (err) {

      logger.error(err, "Restart failed");

    }

  }

  await injectObserver(page, timerButtonSelector, playIconSelector);

  logger.info("Watcher Running");

  return new Promise<void>((_, reject) => {

    let injecting = false;

    const watchdog = setInterval(async () => {

      if (page.isClosed()) {
        clearInterval(watchdog);
        return reject(new Error("Page closed"));
      }

      try {

        const isLoading = await page.locator(".loading").isVisible().catch(() => false);
        const hasTimerButton = (await page.locator(timerButtonSelector).count()) > 0;

        if (isLoading || !hasTimerButton) {

          if (!loadingSince) loadingSince = Date.now();

          const stuckTime = Date.now() - loadingSince;

          logger.warn(`Page unhealthy for ${Math.round(stuckTime / 1000)}s`);

          // attempt reload
          if (stuckTime > 20000 && stuckTime < 40000) {

            logger.warn("Page stuck → forcing reload");

            await page.reload({ waitUntil: "domcontentloaded" }).catch(() => {});

            return;
          }

          // restart browser
          if (stuckTime >= 40000) {

            logger.warn("Page unrecoverable → restarting browser");

            clearInterval(watchdog);

            await page.close().catch(() => {});

            return reject(new Error("Page unhealthy"));

          }

        } else {

          loadingSince = null;

        }

        const playIcon = await page.locator(`${timerButtonSelector} path`).count();

        if (playIcon > 0) {
          await restartTimer();
        }

      } catch (err) {

        logger.warn("Page connection lost → restarting browser");

        clearInterval(watchdog);

        return reject(err);

      }

    }, 10000); // faster recovery

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

          logger.warn("Reload failed → restarting browser");

          clearInterval(watchdog);

          await page.close().catch(() => {});

          return reject(new Error("Reload failed"));

        }

      } finally {

        injecting = false;

      }

    });

    page.on("close", () => {

      logger.warn("Timesheet tab closed");

      clearInterval(watchdog);

      reject(new Error("Page closed"));

    });

  });

}