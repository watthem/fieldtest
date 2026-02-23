import {
  ObservationSchema,
  ActionSchema,
  validateActionAgainstObservation,
  type Observation,
  type Action,
} from "./schemas.js";
import { ZodError } from "zod";

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Validate an observation against the ObservationSchema.
 */
export function validateObservation(
  input: unknown,
): ValidationResult<Observation> {
  try {
    const data = ObservationSchema.parse(input);
    return { success: true, data };
  } catch (err) {
    if (err instanceof ZodError) {
      return { success: false, error: formatZodError(err) };
    }
    throw err;
  }
}

/**
 * Validate an action against the ActionSchema.
 * If observation is provided, also checks that ref-based actions
 * reference existing, non-disabled elements.
 */
export function validateAction(
  input: unknown,
  observation?: Observation,
): ValidationResult<Action> {
  try {
    const data = ActionSchema.parse(input);

    if (observation) {
      const refCheck = validateActionAgainstObservation(data, observation);
      if (!refCheck.valid) {
        return { success: false, error: refCheck.error };
      }
    }

    return { success: true, data };
  } catch (err) {
    if (err instanceof ZodError) {
      return { success: false, error: formatZodError(err) };
    }
    throw err;
  }
}

/**
 * Parse raw JSON string into a validated Action.
 * Useful for validating LLM output.
 */
export function parseActionFromLLM(
  raw: string,
  observation?: Observation,
): ValidationResult<Action> {
  let parsed: unknown;
  try {
    // Strip markdown code fences if LLM wrapped the response
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    parsed = JSON.parse(cleaned);
  } catch {
    return { success: false, error: `Invalid JSON: ${raw.slice(0, 100)}` };
  }
  return validateAction(parsed, observation);
}

function formatZodError(err: ZodError): string {
  return err.issues
    .map((i) => `${i.path.join(".")}: ${i.message}`)
    .join("; ");
}
