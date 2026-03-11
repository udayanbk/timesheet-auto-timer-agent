import { Page } from "playwright";

export async function watchTimer(page: Page) {

  console.log("Monitoring timesheet...");

  while (true) {

    try {

      console.log("Waiting for timer to stop...");
      await page.waitForFunction(() => {

        const btn = document.querySelector(".start-timer-btn");

        return btn?.querySelector("path");

      })
      console.log("Timer stopped → starting process");
      const checkbox = page.locator(".checklist-checkbox span").first();
      await checkbox.click();

      console.log("Daily Task checked");

      const button = page.locator(".start-timer-btn");
      await button.click();
      console.log("Timer started");
      await page.waitForTimeout(2000);

    } catch (err) {

      console.log("Still running...");
      return;

    }

    await page.waitForTimeout(5000);

  }

}