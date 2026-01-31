/**
 * @fieldtest/doc-ref/vitest
 *
 * Vitest integration for doc-driven testing.
 * Links tests to documentation and generates tests from specs.
 */

// Re-export everything from main entry
export * from "./index";

// Vitest-specific exports
export {
	linkedDescribe,
	testFromTable,
	testFromExamples,
	validateDocLinks,
	testAssertions,
} from "./src/vitest";
