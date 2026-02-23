import { describe, it, expect } from "vitest";
import {
  ObservationSchema,
  ActionSchema,
  validateActionAgainstObservation,
  type Observation,
} from "../src/schemas.js";

const baseObservation: Observation = {
  url: "https://example.com",
  title: "Example Domain",
  interactiveElements: [
    { ref: 0, tag: "a", text: "More information...", selector: "a[href]", href: "https://www.iana.org/domains/reserved" },
    { ref: 1, tag: "input", text: "", selector: "input[type=text]", type: "text", placeholder: "Search" },
    { ref: 2, tag: "button", text: "Submit", selector: "button:nth-of-type(1)", disabled: true },
  ],
  headings: ["Example Domain"],
  visibleText: "This domain is for use in illustrative examples.",
  timestamp: "2026-02-22T17:00:00.000Z",
};

describe("ObservationSchema", () => {
  it("parses a valid observation", () => {
    const result = ObservationSchema.safeParse(baseObservation);
    expect(result.success).toBe(true);
  });

  it("rejects missing url", () => {
    const { url, ...rest } = baseObservation;
    const result = ObservationSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects invalid url", () => {
    const result = ObservationSchema.safeParse({ ...baseObservation, url: "not-a-url" });
    expect(result.success).toBe(false);
  });

  it("accepts empty interactiveElements", () => {
    const result = ObservationSchema.safeParse({ ...baseObservation, interactiveElements: [] });
    expect(result.success).toBe(true);
  });
});

describe("ActionSchema", () => {
  it("parses a click action", () => {
    const result = ActionSchema.safeParse({
      action: "click",
      selector: "a[href]",
      ref: 0,
      confidence: 0.95,
      reasoning: "Link matches instruction",
    });
    expect(result.success).toBe(true);
  });

  it("parses a fill action", () => {
    const result = ActionSchema.safeParse({
      action: "fill",
      selector: "input[type=text]",
      ref: 1,
      value: "hello world",
    });
    expect(result.success).toBe(true);
  });

  it("parses a scroll action", () => {
    const result = ActionSchema.safeParse({
      action: "scroll",
      direction: "down",
      amount: 5,
    });
    expect(result.success).toBe(true);
  });

  it("parses a wait action", () => {
    const result = ActionSchema.safeParse({
      action: "wait",
      ms: 2000,
    });
    expect(result.success).toBe(true);
  });

  it("rejects unknown action type", () => {
    const result = ActionSchema.safeParse({
      action: "hover",
      selector: "div",
    });
    expect(result.success).toBe(false);
  });

  it("rejects wait > 30000ms", () => {
    const result = ActionSchema.safeParse({
      action: "wait",
      ms: 60000,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative ref", () => {
    const result = ActionSchema.safeParse({
      action: "click",
      selector: "a",
      ref: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects confidence > 1", () => {
    const result = ActionSchema.safeParse({
      action: "click",
      selector: "a",
      ref: 0,
      confidence: 1.5,
    });
    expect(result.success).toBe(false);
  });
});

describe("validateActionAgainstObservation", () => {
  it("passes for valid ref", () => {
    const action = { action: "click" as const, selector: "a[href]", ref: 0 };
    const result = validateActionAgainstObservation(action, baseObservation);
    expect(result.valid).toBe(true);
  });

  it("fails for ref not in observation", () => {
    const action = { action: "click" as const, selector: "a", ref: 99 };
    const result = validateActionAgainstObservation(action, baseObservation);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("ref 99 not found");
  });

  it("fails for disabled element", () => {
    const action = { action: "click" as const, selector: "button", ref: 2 };
    const result = validateActionAgainstObservation(action, baseObservation);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("disabled");
  });

  it("passes for scroll (no ref check)", () => {
    const action = { action: "scroll" as const, direction: "down" as const, amount: 3 };
    const result = validateActionAgainstObservation(action, baseObservation);
    expect(result.valid).toBe(true);
  });
});
