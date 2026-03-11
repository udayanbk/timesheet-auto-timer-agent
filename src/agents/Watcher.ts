import { Page } from "playwright";
import { logger } from "../services/Logger";
import { config } from "../config/config";

export async function watchTimer(page: Page) {

  logger.info("Monitoring timesheet...")

  while (true) {

    try {

      logger.info("Waiting for timer to stop...")
      await page.waitForFunction(() => {

        const btn = document.querySelector(config.selectors.timerButton);

        return btn?.querySelector("path");

      })
      logger.warn("Timer stopped → starting process")
      const checkbox = page.locator(config.selectors.checkbox).first();
      await checkbox.click();

      logger.warn("Daily Task checked");

      const button = page.locator(config.selectors.timerButton);
      await button.click();
      logger.info("Timer started")
      await page.waitForTimeout(2000);

    } catch (err) {
      logger.info("Still running...")
      return;

    }

    await page.waitForTimeout(5000);

  }

}