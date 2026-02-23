// Schemas & types
export {
  ObservationSchema,
  ActionSchema,
  ClickAction,
  FillAction,
  SelectAction,
  ScrollAction,
  WaitAction,
  InteractiveElementSchema,
  validateActionAgainstObservation,
  type Observation,
  type Action,
  type InteractiveElement,
} from "./schemas.js";

// Observe
export { observe } from "./observe.js";

// Plan
export { plan, type PlanOptions, type PlanResult } from "./plan.js";

// Act
export { act } from "./act.js";

// Validate
export {
  validateObservation,
  validateAction,
  parseActionFromLLM,
  type ValidationResult,
} from "./validate.js";

// Composite
export { run, type RunOptions, type RunResult } from "./run.js";
