import { launchBrowser } from "./browser";
import { watchTimer } from "./watcher";

async function startAgent() {
  console.log("Starting Timesheet Agent...");
  const page = await launchBrowser();
  await watchTimer(page);
}

startAgent();