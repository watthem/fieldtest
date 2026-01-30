/**
 * Vitest Integration Entry Point
 *
 * Import from '@fieldtest/doc-ref/vitest' to use doc-driven testing helpers.
 *
 * @example
 * ```typescript
 * import { specSection, linkedDescribe, fromSpec } from '@fieldtest/doc-ref/vitest';
 * ```
 */

export {
	// Core functions
	specSection,
	linkedDescribe,
	linkedIt,
	fromSpec,
	// Test generators
	testFromExamples,
	testFromTable,
	testAssertions,
	// Utilities
	createSpecMatcher,
	// Types
	type LoadedSpec,
	type SpecOptions,
} from "./src/vitest";

// Re-export useful types from main module
export type {
	DocSection,
	CodeExample,
	DocAssertion,
	TableRow,
} from "./src/types";
