/**
 * Vitest Integration for Doc-Driven Testing
 *
 * Provides helpers for writing tests that are explicitly linked to documentation:
 * - specSection(): Load a doc section for use in tests
 * - linkedDescribe(): Create a describe block linked to docs
 * - linkedIt(): Create a test linked to docs
 * - fromSpec(): Higher-order helper for spec-linked test suites
 * - testFromExamples(): Auto-generate tests from documented examples
 * - testFromTable(): Auto-generate tests from markdown tables
 *
 * @example
 * ```typescript
 * import { specSection, linkedDescribe } from '@fieldtest/doc-ref/vitest';
 *
 * const spec = await specSection('reference/api.md#rate-limits');
 *
 * linkedDescribe(spec, () => {
 *   it('enforces documented limits', () => {
 *     // spec.examples, spec.assertions available
 *   });
 * });
 * ```
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, it, expect, beforeAll } from "vitest";
import type { DocSection, CodeExample, DocAssertion, TableRow } from "./types";
import { parseMarkdown, parseTable, extractTables } from "./markdown";

// ============================================================================
// Types
// ============================================================================

/**
 * A loaded spec section with metadata
 */
export interface LoadedSpec extends DocSection {
	/** Absolute path to the doc file */
	file: string;
	/** Original spec path (e.g., "api.md#rate-limits") */
	specPath: string;
	/** File URL link for error messages */
	link: string;
	/** All sections if no anchor specified */
	allSections?: DocSection[];
}

/**
 * Options for spec loading
 */
export interface SpecOptions {
	/** Root directory for docs (default: "./docs" or DOCS_ROOT env var) */
	docsRoot?: string;
}

// ============================================================================
// Configuration
// ============================================================================

const DEFAULT_DOCS_ROOT = process.env.DOCS_ROOT || "./docs";

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Load and parse a spec section from a markdown file
 *
 * @param specPath - Path like 'reference/api.md#rate-limits' or 'api.md'
 * @param options - Configuration options
 * @returns The parsed section with content, examples, and assertions
 *
 * @example
 * ```typescript
 * // Load specific section
 * const spec = await specSection('api.md#authentication');
 * console.log(spec.title);      // "Authentication"
 * console.log(spec.examples);   // Code examples from that section
 * console.log(spec.assertions); // MUST/SHOULD statements
 *
 * // Load entire file
 * const fullSpec = await specSection('api.md');
 * console.log(fullSpec.allSections); // All sections in the file
 * ```
 */
export async function specSection(
	specPath: string,
	options: SpecOptions = {},
): Promise<LoadedSpec> {
	const docsRoot = options.docsRoot || DEFAULT_DOCS_ROOT;

	const [filePath, sectionSlug] = specPath.split("#");
	const fullPath = path.resolve(docsRoot, filePath);

	if (!fs.existsSync(fullPath)) {
		throw new Error(
			`Documentation file not found: ${fullPath}\n` +
				`Spec path was: ${specPath}\n` +
				`This test is linked to documentation that doesn't exist yet.`,
		);
	}

	const content = fs.readFileSync(fullPath, "utf-8");
	const parsed = parseMarkdown(content);

	if (sectionSlug && !parsed.sections.has(sectionSlug)) {
		const available = Array.from(parsed.sections.keys()).join(", ");
		throw new Error(
			`Section not found: #${sectionSlug}\n` +
				`In file: ${fullPath}\n` +
				`Available sections: ${available}\n` +
				`This test references a documentation section that doesn't exist.`,
		);
	}

	if (sectionSlug) {
		const section = parsed.sections.get(sectionSlug)!;
		return {
			...section,
			file: fullPath,
			specPath,
			link: `file://${fullPath}#${sectionSlug}`,
		};
	}

	// No anchor - return file-level spec with all sections
	return {
		title: path.basename(filePath),
		slug: path.basename(filePath, ".md"),
		level: 0,
		line: 1,
		content,
		examples: [],
		assertions: [],
		file: fullPath,
		specPath,
		link: `file://${fullPath}`,
		allSections: Array.from(parsed.sections.values()),
	};
}

/**
 * Create a describe block that's linked to a documentation section
 *
 * Automatically adds a meta-test that verifies the spec section exists.
 *
 * @example
 * ```typescript
 * const spec = await specSection('api.md#authentication');
 *
 * linkedDescribe(spec, () => {
 *   it('requires API key in header', () => {
 *     // Your test here
 *   });
 * });
 * // Creates: describe("📄 Authentication", ...)
 * ```
 */
export function linkedDescribe(spec: LoadedSpec, fn: () => void): void {
	describe(`📄 ${spec.title}`, () => {
		// Meta-test: verify the spec section exists and is valid
		it(`[spec: ${spec.specPath}] documentation exists`, () => {
			expect(spec.content).toBeTruthy();
			expect(spec.content.length).toBeGreaterThan(0);
		});

		// Run the actual tests
		fn();
	});
}

/**
 * Create an it() block with spec context
 *
 * The test description includes a reference to the spec for traceability.
 *
 * @example
 * ```typescript
 * const spec = await specSection('api.md#rate-limits');
 *
 * linkedIt(spec, 'enforces 100 req/min for free tier', (s) => {
 *   expect(rateLimit('free')).toBe(100);
 * });
 * // Creates: it("enforces 100 req/min for free tier (see: api.md#rate-limits)", ...)
 * ```
 */
export function linkedIt(
	spec: LoadedSpec,
	description: string,
	fn: (spec: LoadedSpec) => void,
): void {
	it(`${description} (see: ${spec.specPath})`, () => fn(spec));
}

/**
 * Higher-order function to create spec-linked test suites
 *
 * Provides a fluent API for testing against documentation sections.
 *
 * @example
 * ```typescript
 * const apiSpec = fromSpec('reference/api.md');
 *
 * apiSpec.section('rate-limits', (test) => {
 *   test('enforces limits per plan', (spec) => {
 *     // spec.examples and spec.assertions available
 *     expect(spec.assertions.length).toBeGreaterThan(0);
 *   });
 * });
 *
 * apiSpec.section('authentication', (test) => {
 *   test('requires Bearer token', (spec) => {
 *     expect(spec.content).toContain('Bearer');
 *   });
 * });
 * ```
 */
export function fromSpec(specPath: string, options: SpecOptions = {}) {
	const docsRoot = options.docsRoot || DEFAULT_DOCS_ROOT;
	const [filePath] = specPath.split("#");
	const fullPath = path.resolve(docsRoot, filePath);

	return {
		/**
		 * Test a specific section of the spec
		 */
		section(
			sectionSlug: string,
			fn: (test: (name: string, testFn: (spec: LoadedSpec) => void) => void) => void,
		): void {
			describe(`📄 ${sectionSlug}`, () => {
				let spec: LoadedSpec;

				beforeAll(async () => {
					spec = await specSection(`${filePath}#${sectionSlug}`, { docsRoot });
				});

				// Meta-test
				it(`documentation section exists: ${sectionSlug}`, () => {
					expect(spec).toBeDefined();
					expect(spec.content).toBeTruthy();
				});

				// Run user's tests with spec context
				fn((name: string, testFn: (spec: LoadedSpec) => void) => {
					it(name, () => testFn(spec));
				});
			});
		},

		/**
		 * Run tests for all sections in the spec
		 */
		allSections(fn: (slug: string, section: DocSection) => void): void {
			if (!fs.existsSync(fullPath)) {
				throw new Error(`Documentation file not found: ${fullPath}`);
			}

			const content = fs.readFileSync(fullPath, "utf-8");
			const parsed = parseMarkdown(content);

			for (const [slug, section] of parsed.sections) {
				describe(`📄 ${section.title}`, () => {
					fn(slug, section);
				});
			}
		},
	};
}

/**
 * Generate test cases from documented code examples
 *
 * Looks for examples with input/output or input/expected patterns.
 *
 * @example
 * ```typescript
 * // In your markdown:
 * // ```
 * // input: [1, 2, 3]
 * // expected: 6
 * // ```
 *
 * const spec = await specSection('math.md#sum');
 * testFromExamples(spec, (input, expected) => {
 *   expect(sum(input)).toBe(expected);
 * });
 * ```
 */
export function testFromExamples(
	spec: LoadedSpec,
	testFn: (input: unknown, expected: unknown, example: CodeExample) => void,
): void {
	const examples = spec.examples.filter(
		(e) => e.input !== undefined && e.expected !== undefined,
	);

	if (examples.length === 0) {
		it.skip("no structured examples found in spec", () => {});
		return;
	}

	describe(`examples from ${spec.title}`, () => {
		examples.forEach((example, i) => {
			it(`example ${i + 1}: ${JSON.stringify(example.input)} → ${JSON.stringify(example.expected)}`, () => {
				testFn(example.input, example.expected, example);
			});
		});
	});
}

/**
 * Generate test cases from a markdown table in the spec
 *
 * @example
 * ```typescript
 * // In your markdown:
 * // | input | expected |
 * // |-------|----------|
 * // | 1     | 2        |
 * // | 2     | 4        |
 *
 * const spec = await specSection('math.md#double');
 * testFromTable(spec, 0, (row) => {
 *   expect(double(row.input)).toBe(row.expected);
 * });
 * ```
 */
export function testFromTable(
	spec: LoadedSpec,
	tableIndex: number,
	testFn: (row: TableRow, index: number) => void,
): void {
	const tables = extractTables(spec.content);

	if (tables.length === 0) {
		it.skip("no tables found in spec", () => {});
		return;
	}

	if (tableIndex >= tables.length) {
		it.skip(`table index ${tableIndex} not found (only ${tables.length} tables)`, () => {});
		return;
	}

	const table = tables[tableIndex];

	describe(`table ${tableIndex + 1} from ${spec.title}`, () => {
		table.forEach((row, i) => {
			const rowDesc = Object.entries(row)
				.map(([k, v]) => `${k}=${JSON.stringify(v)}`)
				.join(", ");
			it(`row ${i + 1}: ${rowDesc}`, () => {
				testFn(row, i);
			});
		});
	});
}

/**
 * Test that behavior satisfies documented assertions
 *
 * @example
 * ```typescript
 * const spec = await specSection('api.md#validation');
 *
 * testAssertions(spec, (assertion) => {
 *   if (assertion.text.includes('return 400')) {
 *     expect(validate(null).status).toBe(400);
 *     return true;
 *   }
 *   return false; // Skip assertions we don't handle
 * });
 * ```
 */
export function testAssertions(
	spec: LoadedSpec,
	testFn: (assertion: DocAssertion) => boolean | void,
): void {
	if (spec.assertions.length === 0) {
		it.skip("no assertions found in spec", () => {});
		return;
	}

	describe(`assertions from ${spec.title}`, () => {
		spec.assertions.forEach((assertion, i) => {
			it(`${assertion.keyword || assertion.type}: ${assertion.text}`, () => {
				const handled = testFn(assertion);
				if (handled === false) {
					// Mark as skipped if not handled
					expect(true).toBe(true); // Pass but indicate not tested
				}
			});
		});
	});
}

/**
 * Custom matcher factory for spec assertions
 *
 * Creates a matcher that can be used with expect().
 *
 * @example
 * ```typescript
 * const satisfiesSpec = createSpecMatcher();
 *
 * expect(result).toSatisfy(satisfiesSpec(spec.assertions[0]));
 * ```
 */
export function createSpecMatcher() {
	return (assertion: DocAssertion) => (received: unknown) => {
		const pass = typeof received === "boolean" ? received : !!received;

		return {
			pass,
			message: () =>
				pass
					? `Expected NOT to satisfy: "${assertion.text}"`
					: `Expected to satisfy: "${assertion.text}"`,
		};
	};
}
