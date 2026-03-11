import { Page } from "playwright";

export async function injectObserver(
  page: Page,
  timerButtonSelector: string,
  playIconSelector: string
) {

  await page.evaluate(
    ({ timerButtonSelector, playIconSelector }) => {

      let timerRunning = true;

      const checkTimer = () => {

        const btn = document.querySelector(timerButtonSelector);
        if (!btn) return;

        const playIcon = btn.querySelector(playIconSelector);

        if (playIcon && timerRunning) {

          timerRunning = false;

          // @ts-ignore
          window.timerStopped();

          setTimeout(() => {
            timerRunning = true;
          }, 3000);

        }

      };

      const btn = document.querySelector(timerButtonSelector);
      if (!btn) return;

      const observer = new MutationObserver(() => {
        checkTimer();
      });

      observer.observe(btn, {
        childList: true,
        subtree: true
      });

      checkTimer();

    },
    { timerButtonSelector, playIconSelector }
  );

}