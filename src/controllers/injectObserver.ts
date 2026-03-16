import { Page } from "playwright";

export async function injectObserver(
  page: Page,
  timerButtonSelector: string,
  playIconSelector: string
) {

  await page.evaluate(
    ({ timerButtonSelector, playIconSelector }) => {

      const checkTimer = () => {

        const btn = document.querySelector(timerButtonSelector);
        if (!btn) return;

        const playIcon = btn.querySelector(playIconSelector);

        if (playIcon) {
          console.debug("Timer stopped detected in DOM");
        }

      };

      checkTimer();

      const observer = new MutationObserver(() => {
        checkTimer();
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

    },
    { timerButtonSelector, playIconSelector }
  );

}