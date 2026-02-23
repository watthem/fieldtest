import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { plan } from "../src/plan.js";
import type { Observation } from "../src/schemas.js";

const observation: Observation = {
  url: "https://example.com",
  title: "Example Domain",
  interactiveElements: [
    { ref: 0, tag: "a", text: "More information...", selector: "a[href]", href: "https://www.iana.org/domains/reserved" },
  ],
  headings: ["Example Domain"],
  visibleText: "This domain is for use in illustrative examples.",
  timestamp: "2026-02-22T17:00:00.000Z",
};

const gateOpts = { gateUrl: "http://localhost:8090", gateKey: "*" };

let fetchSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  fetchSpy = vi.spyOn(globalThis, "fetch");
});

afterEach(() => {
  fetchSpy.mockRestore();
});

function mockGateResponse(content: string, model = "minimax/MiniMax-Text-01") {
  fetchSpy.mockResolvedValueOnce(
    new Response(
      JSON.stringify({
        choices: [{ message: { content } }],
        model,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    ),
  );
}

describe("plan", () => {
  it("returns validated action from gate response", async () => {
    mockGateResponse(
      '{"action": "click", "selector": "a[href]", "ref": 0, "confidence": 0.95, "reasoning": "Link matches instruction"}',
    );

    const result = await plan(observation, "Click the More information link", gateOpts);
    expect(result.action.action).toBe("click");
    expect(result.model).toBe("minimax/MiniMax-Text-01");
  });

  it("strips markdown fences from LLM response", async () => {
    mockGateResponse(
      '```json\n{"action": "click", "selector": "a[href]", "ref": 0}\n```',
    );

    const result = await plan(observation, "Click the link", gateOpts);
    expect(result.action.action).toBe("click");
  });

  it("throws on invalid action from LLM", async () => {
    mockGateResponse('{"action": "hover", "selector": "a"}');

    await expect(
      plan(observation, "Hover over the link", gateOpts),
    ).rejects.toThrow("LLM returned invalid action");
  });

  it("throws on non-JSON LLM response", async () => {
    mockGateResponse("I would click the More information link");

    await expect(
      plan(observation, "Click the link", gateOpts),
    ).rejects.toThrow("Invalid JSON");
  });

  it("throws on gate HTTP error", async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response("Internal Server Error", { status: 500 }),
    );

    await expect(
      plan(observation, "Click", gateOpts),
    ).rejects.toThrow("Gate returned 500");
  });

  it("throws on empty response", async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ choices: [{ message: { content: "" } }] }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    await expect(
      plan(observation, "Click", gateOpts),
    ).rejects.toThrow("empty response");
  });

  it("validates ref against observation", async () => {
    mockGateResponse(
      '{"action": "click", "selector": "button", "ref": 99}',
    );

    await expect(
      plan(observation, "Click a button", gateOpts),
    ).rejects.toThrow("ref 99");
  });

  it("sends correct request to gate", async () => {
    mockGateResponse(
      '{"action": "click", "selector": "a[href]", "ref": 0}',
    );

    await plan(observation, "Click the link", gateOpts);

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe("http://localhost:8090/v1/chat/completions");
    expect(init?.method).toBe("POST");

    const body = JSON.parse(init?.body as string);
    expect(body.messages).toHaveLength(2);
    expect(body.messages[0].role).toBe("system");
    expect(body.messages[1].role).toBe("user");
    expect(body.temperature).toBe(0.1);
    expect(body.max_tokens).toBe(256);
  });
});
