import "dotenv/config";

export const config = {

  targetUrl: process.env.TARGET_URL!,
  localhostUrl: process.env.LOCALHOST_URL!,
  port: Number(process.env.LOCAL_PORT ?? 9222),
  chromeCommand: process.env.CHROME_DEBUG_COMMAND!,

  selectors: {
    timerButton: ".start-timer-btn",
    checkbox: ".checklist-checkbox span",
    playIcon: "path"
  }

};