import { launchBrowser } from "../browser/BrowserManager";
import { watchTimer } from "./Watcher";
import { logger } from "../services/Logger";
import { wait } from "../utils/wait";

export async function runTimesheetAgent() {

  logger.info("Starting Timesheet Agent...");

  while (true) {

    try {

      logger.info("Launching browser session...");

      const page = await launchBrowser();

      await watchTimer(page);

      await page.waitForEvent("close");

    } catch (err) {

      logger.error(err, "Agent lost connection. Restarting...");

    }

    await wait(5000);

  }
}