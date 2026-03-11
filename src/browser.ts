import "dotenv/config";
import { exec } from "node:child_process";
import { chromium, Page } from "playwright";
import net from "net";

export async function launchBrowser(): Promise<Page> {

  await ensureChromeRunning()

  const browser = await chromium.connectOverCDP(process.env.LOCALHOST_URL!);

  const contexts = browser.contexts();
  const context = contexts[0];

  const pages = context.pages();

  let page = pages.find(p =>
    p.url().includes("timesheet")
  );

  if (!page) {
    page = await context.newPage();
    await page.goto(process.env.TARGET_URL!);
  }

  console.log("Connected to:", page.url());

  return page;
}

function isPortOpen(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const socket = new net.Socket();

    socket.setTimeout(1000);

    socket.on("connect", () => {
      socket.destroy();
      resolve(true);
    });

    socket.on("error", () => resolve(false));
    socket.on("timeout", () => resolve(false));

    socket.connect(port, "127.0.0.1");
  });
}

async function ensureChromeRunning() {

  const running = await isPortOpen(9222);

  if (!running) {

    console.log("Launching Chrome with debugging...");

    exec(process.env.CHROME_DEBUG_COMMAND!);
    const port = parseInt(process.env.LOCAL_PORT ?? "9222", 10);

    if (isNaN(port)) {
      throw new Error("LOCAL_PORT must be a valid number");
    }

    while (!(await isPortOpen(port))) {
      await new Promise(r => setTimeout(r, 500));
    }

  }

}