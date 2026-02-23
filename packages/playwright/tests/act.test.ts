import { describe, it, expect, vi } from "vitest";
import { act } from "../src/act.js";
import type { Action } from "../src/schemas.js";

function mockPage() {
  return {
    click: vi.fn().mockResolvedValue(undefined),
    fill: vi.fn().mockResolvedValue(undefined),
    selectOption: vi.fn().mockResolvedValue(undefined),
    evaluate: vi.fn().mockResolvedValue(undefined),
    waitForTimeout: vi.fn().mockResolvedValue(undefined),
  } as any;
}

describe("act", () => {
  it("dispatches click action", async () => {
    const page = mockPage();
    await act(page, { action: "click", selector: "a[href]", ref: 0 });
    expect(page.click).toHaveBeenCalledWith("a[href]", { timeout: 5000 });
  });

  it("dispatches fill action", async () => {
    const page = mockPage();
    await act(page, { action: "fill", selector: "input", ref: 1, value: "hello" });
    expect(page.fill).toHaveBeenCalledWith("input", "hello", { timeout: 5000 });
  });

  it("dispatches select action", async () => {
    const page = mockPage();
    await act(page, { action: "select", selector: "select#color", ref: 2, value: "red" });
    expect(page.selectOption).toHaveBeenCalledWith("select#color", "red", { timeout: 5000 });
  });

  it("dispatches scroll action", async () => {
    const page = mockPage();
    await act(page, { action: "scroll", direction: "down", amount: 3 });
    expect(page.evaluate).toHaveBeenCalledOnce();
    const [fn, args] = page.evaluate.mock.calls[0];
    expect(args).toEqual({ direction: "down", amount: 3 });
  });

  it("dispatches wait action", async () => {
    const page = mockPage();
    await act(page, { action: "wait", ms: 2000 });
    expect(page.waitForTimeout).toHaveBeenCalledWith(2000);
  });
});
