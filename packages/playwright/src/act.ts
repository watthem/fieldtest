import type { Page } from "playwright";
import type { Action } from "./schemas.js";

/**
 * Execute a validated action on a Playwright page.
 * No LLM — pure Playwright method dispatch.
 */
export async function act(page: Page, action: Action): Promise<void> {
  switch (action.action) {
    case "click":
      await page.click(action.selector, { timeout: 5000 });
      break;

    case "fill":
      await page.fill(action.selector, action.value, { timeout: 5000 });
      break;

    case "select":
      await page.selectOption(action.selector, action.value, { timeout: 5000 });
      break;

    case "scroll":
      await page.evaluate(
        ({ direction, amount }) => {
          const px = amount * 100;
          const map: Record<string, [number, number]> = {
            up: [0, -px],
            down: [0, px],
            left: [-px, 0],
            right: [px, 0],
          };
          const [x, y] = map[direction];
          window.scrollBy(x, y);
        },
        { direction: action.direction, amount: action.amount },
      );
      break;

    case "wait":
      await page.waitForTimeout(action.ms);
      break;
  }
}
