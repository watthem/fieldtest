/**
 * @fieldtest/doc-ref/executable
 *
 * Executable specifications for Concordion-style testing.
 * Documentation that IS the test.
 */

// Core executable specification exports
export {
	createFixtureRegistry,
	runSpec,
	SpecRunner,
	createSpecRunner,
} from "./src/executable";

// Types for executable specs
export type {
	FixtureRegistry,
	FixtureFunction,
	FixtureContext,
	ExecutionResult,
	AssertionResult,
} from "./src/types";

// Markdown parsing for bindings
export { parseInlineBindings, loadSpec, specSection } from "./src/markdown";

export type { InlineBinding, LoadedSpec, SpecOptions } from "./src/types";
