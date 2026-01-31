/**
 * Vitest integration for doc-ref
 *
 * Provides utilities for linking tests to documentation and
 * running data-driven tests from markdown tables and examples.
 */

import { specSection, loadSpec } from "./markdown";
import type {
	DocSection,
	LoadedSpec,
	ParsedTable,
	CodeExample,
	SpecOptions,
	VitestSpecOptions,
} from "./types";

// Re-export for convenience
export { specSection, loadSpec };

/**
 * Create a describe block that references documentation
 *
 * Links a test suite to a specific documentation section for traceability.
 *
 * @param docPath Path to the documentation file with optional anchor
 * @param description Test suite description
 * @param fn Test suite function
 * @returns The describe block result
 *
 * @example
 * ```ts
 * linkedDescribe('docs/api.md#authentication', 'Auth API', () => {
 *   it('should validate tokens', () => {
 *     // test implementation
 *   });
 * });
 * ```
 */
export function linkedDescribe(
	docPath: string,
	description: string,
	fn: (spec: LoadedSpec) => void,
	options: VitestSpecOptions = {},
): void {
	// Load spec synchronously
	const spec = specSection(docPath, { throwOnMissing: false });

	// Get vitest describe - we need to import dynamically to avoid hard dependency
	const { describe } = getVitestFunctions();

	const fullDescription = `[${docPath}] ${description}`;

	if (options.skip) {
		describe.skip(fullDescription, () => fn(spec));
	} else if (options.todo) {
		describe.todo(fullDescription);
	} else {
		describe(fullDescription, () => fn(spec));
	}
}

/**
 * Generate test cases from a markdown table
 *
 * Converts table rows into parameterized test cases.
 *
 * @param table Parsed markdown table
 * @param testFn Function to run for each table row
 *
 * @example
 * ```ts
 * const spec = specSection('docs/pricing.md#examples');
 * const table = spec.targetSection?.tables[0];
 *
 * testFromTable(table, (row, headers) => {
 *   const input = Number(row[0]);
 *   const expected = row[1];
 *   expect(calculate(input)).toBe(expected);
 * });
 * ```
 */
export function testFromTable(
	table: ParsedTable | undefined,
	testFn: (row: string[], headers: string[], index: number) => void | Promise<void>,
): void {
	if (!table) {
		const { it } = getVitestFunctions();
		it.skip("No table found", () => {});
		return;
	}

	const { it } = getVitestFunctions();

	table.rows.forEach((row, index) => {
		const testName = `Row ${index + 1}: ${row.join(" | ")}`;
		it(testName, async () => {
			await testFn(row, table.headers, index);
		});
	});
}

/**
 * Generate test cases from code examples
 *
 * Runs tests for each code example in a section.
 *
 * @param examples Array of code examples
 * @param testFn Function to run for each example
 *
 * @example
 * ```ts
 * const spec = specSection('docs/api.md#examples');
 *
 * testFromExamples(spec.targetSection?.examples, (example) => {
 *   // Validate example code compiles/runs
 *   expect(() => eval(example.code)).not.toThrow();
 * });
 * ```
 */
export function testFromExamples(
	examples: CodeExample[] | undefined,
	testFn: (example: CodeExample, index: number) => void | Promise<void>,
): void {
	if (!examples || examples.length === 0) {
		const { it } = getVitestFunctions();
		it.skip("No examples found", () => {});
		return;
	}

	const { it } = getVitestFunctions();

	examples.forEach((example, index) => {
		const testName = `Example ${index + 1} (${example.language})`;
		it(testName, async () => {
			await testFn(example, index);
		});
	});
}

/**
 * Validate that documentation links exist
 *
 * Useful for ensuring docs stay in sync with tests.
 *
 * @param spec Loaded specification
 * @param linkPaths Array of paths that should exist
 *
 * @example
 * ```ts
 * const spec = specSection('docs/api.md');
 * validateDocLinks(spec, [
 *   'docs/setup.md',
 *   'docs/advanced.md#configuration'
 * ]);
 * ```
 */
export function validateDocLinks(
	spec: LoadedSpec,
	linkPaths: string[],
): void {
	const { it, expect } = getVitestFunctions();

	linkPaths.forEach((linkPath) => {
		it(`Link exists: ${linkPath}`, () => {
			const linkedSpec = specSection(linkPath, { throwOnMissing: false });
			expect(linkedSpec.sections.length).toBeGreaterThan(0);
		});
	});
}

/**
 * Test MUST/SHOULD assertions from documentation
 *
 * Generates tests for each RFC 2119 assertion found in the spec.
 *
 * @param section Documentation section
 * @param validator Function to validate each assertion
 *
 * @example
 * ```ts
 * const spec = specSection('docs/requirements.md#security');
 *
 * testAssertions(spec.targetSection, (assertion) => {
 *   if (assertion.type === 'MUST') {
 *     // Validate MUST requirement is implemented
 *     return validateRequirement(assertion.text);
 *   }
 *   return true;
 * });
 * ```
 */
export function testAssertions(
	section: DocSection | undefined,
	validator: (assertion: { type: string; text: string }) => boolean | Promise<boolean>,
): void {
	if (!section || section.assertions.length === 0) {
		const { it } = getVitestFunctions();
		it.skip("No assertions found", () => {});
		return;
	}

	const { it, expect } = getVitestFunctions();

	section.assertions.forEach((assertion, index) => {
		const testName = `${assertion.type}: ${assertion.text.slice(0, 50)}...`;
		it(testName, async () => {
			const result = await validator(assertion);
			expect(result).toBe(true);
		});
	});
}

/**
 * Get vitest functions with lazy loading
 */
function getVitestFunctions(): {
	describe: any;
	it: any;
	expect: any;
} {
	// Try to get vitest from the global scope or require it
	try {
		// Check if vitest is available globally (when running in vitest)
		if (typeof globalThis !== "undefined" && (globalThis as any).describe) {
			return {
				describe: (globalThis as any).describe,
				it: (globalThis as any).it,
				expect: (globalThis as any).expect,
			};
		}

		// Try dynamic import
		const vitest = require("vitest");
		return {
			describe: vitest.describe,
			it: vitest.it,
			expect: vitest.expect,
		};
	} catch {
		// Return no-op functions for environments without vitest
		const noop = () => {};
		const noopDescribe = Object.assign(noop, { skip: noop, todo: noop });
		const noopIt = Object.assign(noop, { skip: noop, todo: noop });

		return {
			describe: noopDescribe,
			it: noopIt,
			expect: () => ({
				toBe: noop,
				toBeGreaterThan: noop,
				not: { toThrow: noop },
			}),
		};
	}
}
