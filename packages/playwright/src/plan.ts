import type { Observation, Action } from "./schemas.js";
import { parseActionFromLLM } from "./validate.js";

export interface PlanOptions {
  /** Proofmark Gate URL (OpenAI-compatible /v1/chat/completions) */
  gateUrl: string;
  /** Gate API key (default "*" for local) */
  gateKey?: string;
  /** Model override (Gate routes automatically, but can be forced) */
  model?: string;
  /** Max tokens for response (default 256 — actions are small) */
  maxTokens?: number;
}

export interface PlanResult {
  action: Action;
  raw: string;
  model?: string;
}

const SYSTEM_PROMPT = `You are a browser automation assistant. Given an observation of a web page and a user instruction, return a JSON action to perform.

Response format — return ONLY valid JSON matching one of these action types:
- {"action": "click", "selector": "...", "ref": N, "confidence": 0-1, "reasoning": "..."}
- {"action": "fill", "selector": "...", "ref": N, "value": "...", "confidence": 0-1, "reasoning": "..."}
- {"action": "select", "selector": "...", "ref": N, "value": "...", "confidence": 0-1, "reasoning": "..."}
- {"action": "scroll", "direction": "up|down|left|right", "amount": N, "confidence": 0-1, "reasoning": "..."}
- {"action": "wait", "ms": N, "confidence": 0-1, "reasoning": "..."}

Rules:
- "ref" must match an element from the observation's interactiveElements array
- "selector" must match the selector from that element
- Return exactly ONE action, no commentary outside the JSON
- If no element matches the instruction, use scroll or wait`;

function buildUserPrompt(observation: Observation, instruction: string): string {
  // Trim observation for token efficiency — only include interactive elements and headings
  const trimmed = {
    url: observation.url,
    title: observation.title,
    interactiveElements: observation.interactiveElements.map((el) => ({
      ref: el.ref,
      tag: el.tag,
      text: el.text,
      selector: el.selector,
      ...(el.type ? { type: el.type } : {}),
      ...(el.placeholder ? { placeholder: el.placeholder } : {}),
      ...(el.disabled ? { disabled: el.disabled } : {}),
      ...(el.href ? { href: el.href } : {}),
    })),
    headings: observation.headings,
  };

  return `## Observation\n${JSON.stringify(trimmed, null, 2)}\n\n## Instruction\n${instruction}`;
}

/**
 * Send observation + instruction to Proofmark Gate and get a validated action.
 * Gate handles MiniMax-first routing with quality gate escalation.
 */
export async function plan(
  observation: Observation,
  instruction: string,
  options: PlanOptions,
): Promise<PlanResult> {
  const { gateUrl, gateKey = "*", model, maxTokens = 256 } = options;

  const url = gateUrl.replace(/\/$/, "") + "/v1/chat/completions";

  const body: Record<string, unknown> = {
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(observation, instruction) },
    ],
    max_tokens: maxTokens,
    temperature: 0.1,
  };

  if (model) {
    body.model = model;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${gateKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Gate returned ${response.status}: ${text.slice(0, 200)}`);
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
    model?: string;
  };

  const raw = data.choices?.[0]?.message?.content ?? "";
  if (!raw) {
    throw new Error("Gate returned empty response");
  }

  const validated = parseActionFromLLM(raw, observation);
  if (!validated.success) {
    throw new Error(`LLM returned invalid action: ${validated.error}\nRaw: ${raw.slice(0, 300)}`);
  }

  return {
    action: validated.data!,
    raw,
    model: data.model,
  };
}
