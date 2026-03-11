import "dotenv/config";
import { exec } from "node:child_process";
import { isPortOpen } from "../utils/portChecker";
import { wait } from "../utils/wait";
import { logger } from "../services/Logger";
import { config } from "../config/config";

export async function ensureChromeRunning() {

  const running = await isPortOpen(config.port);

  if (!running) {

    logger.warn("Launching Chrome with debugging...")

    exec(process.env.CHROME_DEBUG_COMMAND!);
    const port = config.port

    if (isNaN(port)) {
      throw new Error("LOCAL_PORT must be a valid number");
    }

    while (!(await isPortOpen(port))) {
      await wait(500)
    }

  }

}