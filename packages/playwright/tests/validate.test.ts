import { describe, it, expect } from "vitest";
import {
  validateObservation,
  validateAction,
  parseActionFromLLM,
} from "../src/validate.js";
import type { Observation } from "../src/schemas.js";

const observation: Observation = {
  url: "https://example.com",
  title: "Example",
  interactiveElements: [
    { ref: 0, tag: "a", text: "Link", selector: "a[href]" },
    { ref: 1, tag: "input", text: "", selector: "input", type: "text" },
  ],
  headings: ["Example"],
  visibleText: "Hello world",
  timestamp: "2026-02-22T17:00:00.000Z",
};

describe("validateObservation", () => {
  it("accepts valid observation", () => {
    const result = validateObservation(observation);
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  it("rejects garbage input", () => {
    const result = validateObservation({ foo: "bar" });
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe("validateAction", () => {
  it("accepts valid action without observation", () => {
    const result = validateAction({ action: "click", selector: "a", ref: 0 });
    expect(result.success).toBe(true);
  });

  it("accepts valid action with matching observation", () => {
    const result = validateAction(
      { action: "click", selector: "a[href]", ref: 0 },
      observation,
    );
    expect(result.success).toBe(true);
  });

  it("rejects action with invalid ref against observation", () => {
    const result = validateAction(
      { action: "click", selector: "a", ref: 99 },
      observation,
    );
    expect(result.success).toBe(false);
    expect(result.error).toContain("ref 99");
  });

  it("rejects malformed action", () => {
    const result = validateAction({ action: "dance" });
    expect(result.success).toBe(false);
  });
});

describe("parseActionFromLLM", () => {
  it("parses valid JSON", () => {
    const result = parseActionFromLLM(
      '{"action": "click", "selector": "a", "ref": 0, "confidence": 0.9}',
    );
    expect(result.success).toBe(true);
    expect(result.data?.action).toBe("click");
  });

  it("strips markdown code fences", () => {
    const result = parseActionFromLLM(
      '```json\n{"action": "click", "selector": "a", "ref": 0}\n```',
    );
    expect(result.success).toBe(true);
  });

  it("rejects non-JSON", () => {
    const result = parseActionFromLLM("I would click the link");
    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid JSON");
  });

  it("validates ref against observation", () => {
    const result = parseActionFromLLM(
      '{"action": "click", "selector": "a", "ref": 99}',
      observation,
    );
    expect(result.success).toBe(false);
    expect(result.error).toContain("ref 99");
  });

  it("parses fill action with value", () => {
    const result = parseActionFromLLM(
      '{"action": "fill", "selector": "input", "ref": 1, "value": "test query"}',
      observation,
    );
    expect(result.success).toBe(true);
    expect(result.data?.action).toBe("fill");
  });
});
