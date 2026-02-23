import { z } from "zod";

// --- Observation Schemas ---

export const InteractiveElementSchema = z.object({
  ref: z.number().int().nonnegative(),
  tag: z.string(),
  role: z.string().optional(),
  text: z.string(),
  selector: z.string(),
  type: z.string().optional(),
  placeholder: z.string().optional(),
  href: z.string().optional(),
  disabled: z.boolean().optional(),
  checked: z.boolean().optional(),
  value: z.string().optional(),
});

export type InteractiveElement = z.infer<typeof InteractiveElementSchema>;

export const ObservationSchema = z.object({
  url: z.string().url(),
  title: z.string(),
  interactiveElements: z.array(InteractiveElementSchema),
  headings: z.array(z.string()),
  visibleText: z.string(),
  timestamp: z.string().datetime(),
});

export type Observation = z.infer<typeof ObservationSchema>;

// --- Action Schemas ---

const BaseAction = z.object({
  confidence: z.number().min(0).max(1).optional(),
  reasoning: z.string().optional(),
});

export const ClickAction = BaseAction.extend({
  action: z.literal("click"),
  selector: z.string(),
  ref: z.number().int().nonnegative(),
});

export const FillAction = BaseAction.extend({
  action: z.literal("fill"),
  selector: z.string(),
  ref: z.number().int().nonnegative(),
  value: z.string(),
});

export const SelectAction = BaseAction.extend({
  action: z.literal("select"),
  selector: z.string(),
  ref: z.number().int().nonnegative(),
  value: z.string(),
});

export const ScrollAction = BaseAction.extend({
  action: z.literal("scroll"),
  direction: z.enum(["up", "down", "left", "right"]),
  amount: z.number().int().positive().default(3),
});

export const WaitAction = BaseAction.extend({
  action: z.literal("wait"),
  ms: z.number().int().positive().max(30000),
});

export const ActionSchema = z.discriminatedUnion("action", [
  ClickAction,
  FillAction,
  SelectAction,
  ScrollAction,
  WaitAction,
]);

export type Action = z.infer<typeof ActionSchema>;

// Actions that reference an interactive element
const REF_ACTIONS = new Set(["click", "fill", "select"]);

/**
 * Validate that ref-based actions point to elements that exist in the observation.
 */
export function validateActionAgainstObservation(
  action: Action,
  observation: Observation,
): { valid: boolean; error?: string } {
  if ("ref" in action && REF_ACTIONS.has(action.action)) {
    const el = observation.interactiveElements.find((e) => e.ref === action.ref);
    if (!el) {
      return {
        valid: false,
        error: `ref ${action.ref} not found in observation (${observation.interactiveElements.length} elements available)`,
      };
    }
    if (el.disabled) {
      return {
        valid: false,
        error: `ref ${action.ref} (${el.tag} "${el.text}") is disabled`,
      };
    }
  }
  return { valid: true };
}
