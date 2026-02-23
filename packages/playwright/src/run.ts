import type { Page } from "playwright";
import type { Observation, Action } from "./schemas.js";
import { observe } from "./observe.js";
import { plan, type PlanOptions } from "./plan.js";
import { act } from "./act.js";

export interface RunOptions extends PlanOptions {
  /** Take screenshot after action (default true) */
  screenshot?: boolean;
}

export interface RunResult {
  observation: Observation;
  action: Action;
  screenshot?: string;
  durationMs: number;
  model?: string;
}

/**
 * One-liner: observe → plan → validate → act on a Playwright page.
 *
 * @param page - Playwright page (already navigated to target URL)
 * @param instruction - natural language action
 * @param options - must include gateUrl for Proofmark Gate
 */
export async function run(
  page: Page,
  instruction: string,
  options: RunOptions,
): Promise<RunResult> {
  const start = Date.now();

  const observation = await observe(page);
  const planned = await plan(observation, instruction, options);
  await act(page, planned.action);

  let screenshot: string | undefined;
  if (options.screenshot !== false) {
    const buf = await page.screenshot({ fullPage: false });
    screenshot = `data:image/png;base64,${buf.toString("base64")}`;
  }

  return {
    observation,
    action: planned.action,
    screenshot,
    durationMs: Date.now() - start,
    model: planned.model,
  };
}
