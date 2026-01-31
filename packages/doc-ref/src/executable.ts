/**
 * Executable Specifications
 *
 * Concordion-style executable specifications where documentation
 * can BE the test. Markdown files with inline bindings define
 * test inputs, expected outputs, and fixture invocations.
 */

import { loadSpec, parseInlineBindings } from "./markdown";
import type {
	AssertionResult,
	ExecutionResult,
	FixtureContext,
	FixtureFunction,
	FixtureRegistry,
	InlineBinding,
	LoadedSpec,
	SpecOptions,
} from "./types";

/**
 * Create a new fixture registry for storing test fixtures
 *
 * @returns A new fixture registry instance
 *
 * @example
 * ```ts
 * const registry = createFixtureRegistry();
 *
 * registry.register('pricing', (ctx) => {
 *   const quantity = Number(ctx.inputs.quantity);
 *   const unitPrice = Number(ctx.inputs.unitPrice);
 *   return {
 *     total: `$${(quantity * unitPrice).toFixed(2)}`,
 *     discount: quantity > 10 ? '10%' : '0%'
 *   };
 * });
 * ```
 */
export function createFixtureRegistry(): FixtureRegistry {
	const fixtures = new Map<string, FixtureFunction>();

	return {
		register<T>(name: string, fixture: FixtureFunction<T>): void {
			fixtures.set(name, fixture as FixtureFunction);
		},

		get<T>(name: string): FixtureFunction<T> | undefined {
			return fixtures.get(name) as FixtureFunction<T> | undefined;
		},

		has(name: string): boolean {
			return fixtures.has(name);
		},

		list(): string[] {
			return Array.from(fixtures.keys());
		},
	};
}

/**
 * Compare two values for equality in assertion verification
 *
 * Handles string comparisons, number coercion, and deep object equality.
 */
function valuesEqual(expected: unknown, actual: unknown): boolean {
	// Direct equality
	if (expected === actual) return true;

	// String comparison (most common case from bindings)
	if (typeof expected === "string" && typeof actual === "string") {
		return expected.trim() === actual.trim();
	}

	// Number coercion for string-number comparisons
	if (typeof expected === "string" && typeof actual === "number") {
		const parsed = parseFloat(expected.replace(/[^0-9.-]/g, ""));
		return !isNaN(parsed) && parsed === actual;
	}

	if (typeof expected === "number" && typeof actual === "string") {
		const parsed = parseFloat(actual.replace(/[^0-9.-]/g, ""));
		return !isNaN(parsed) && parsed === expected;
	}

	// Deep object comparison
	if (typeof expected === "object" && typeof actual === "object") {
		if (expected === null || actual === null) return expected === actual;
		return JSON.stringify(expected) === JSON.stringify(actual);
	}

	return false;
}

/**
 * Execute a single section of bindings
 */
async function executeBindings(
	bindings: InlineBinding[],
	registry: FixtureRegistry,
	spec: LoadedSpec,
): Promise<AssertionResult[]> {
	const results: AssertionResult[] = [];
	const inputs: Record<string, unknown> = {};
	let lastOutput: unknown = undefined;

	for (const binding of bindings) {
		if (binding.command === "set") {
			// Set command: accumulate inputs
			inputs[binding.field] = binding.value;
		} else if (binding.command === "execute") {
			// Execute command: run fixture
			const fixture = registry.get(binding.field);
			if (!fixture) {
				results.push({
					binding,
					expected: undefined,
					actual: undefined,
					passed: false,
					error: `Fixture not found: ${binding.field}`,
				});
				continue;
			}

			try {
				const context: FixtureContext = {
					inputs: { ...inputs },
					spec,
				};
				lastOutput = await fixture(context);
			} catch (error) {
				results.push({
					binding,
					expected: undefined,
					actual: undefined,
					passed: false,
					error: error instanceof Error ? error.message : String(error),
				});
			}
		} else if (binding.command === "verify") {
			// Verify command: compare expected to actual
			const expected = binding.value;

			// Get actual value from last fixture output
			let actual: unknown;
			if (lastOutput !== undefined) {
				if (typeof lastOutput === "object" && lastOutput !== null) {
					actual = (lastOutput as Record<string, unknown>)[binding.field];
				} else {
					actual = lastOutput;
				}
			}

			// If no output yet, try running a fixture with the field name
			if (actual === undefined && registry.has(binding.field)) {
				const fixture = registry.get(binding.field);
				if (fixture) {
					try {
						const context: FixtureContext = {
							inputs: { ...inputs },
							spec,
						};
						actual = await fixture(context);
					} catch (error) {
						results.push({
							binding,
							expected,
							actual: undefined,
							passed: false,
							error: error instanceof Error ? error.message : String(error),
						});
						continue;
					}
				}
			}

			const passed = valuesEqual(expected, actual);
			results.push({
				binding,
				expected,
				actual,
				passed,
				error: passed ? undefined : `Expected "${expected}" but got "${actual}"`,
			});
		}
	}

	return results;
}

/**
 * Execute a specification file against registered fixtures
 *
 * Loads the spec, extracts inline bindings, runs fixtures,
 * and compares results to expected values.
 *
 * @param specPath Path to the spec file, optionally with #anchor
 * @param registry Fixture registry containing test fixtures
 * @param options Execution options
 * @returns Execution results with pass/fail counts
 *
 * @example
 * ```ts
 * const registry = createFixtureRegistry();
 *
 * registry.register('pricing', (ctx) => ({
 *   total: `$${Number(ctx.inputs.quantity) * Number(ctx.inputs.unitPrice)}`
 * }));
 *
 * const result = await runSpec('docs/pricing.md#examples', registry);
 * console.log(`${result.passed}/${result.passed + result.failed} passed`);
 * ```
 */
export async function runSpec(
	specPath: string,
	registry: FixtureRegistry,
	options: SpecOptions = {},
): Promise<ExecutionResult> {
	const startTime = Date.now();

	// Load the specification
	const spec = loadSpec(specPath, options);

	// Collect all bindings from target section or all sections
	const sectionsToProcess = spec.targetSection
		? [spec.targetSection]
		: spec.sections;

	const allResults: AssertionResult[] = [];

	for (const section of sectionsToProcess) {
		// Process bindings from section content
		const sectionResults = await executeBindings(
			section.bindings,
			registry,
			spec,
		);
		allResults.push(...sectionResults);

		// Also process bindings from tables
		for (const table of section.tables) {
			const tableBindings = parseInlineBindings(table.raw);
			if (tableBindings.length > 0) {
				// For tables, process each row as a separate context
				for (const row of table.rows) {
					const rowContent = row.join(" | ");
					const rowBindings = parseInlineBindings(rowContent);
					if (rowBindings.length > 0) {
						const rowResults = await executeBindings(rowBindings, registry, spec);
						allResults.push(...rowResults);
					}
				}
			}
		}
	}

	const duration = Date.now() - startTime;

	// Count results
	const passed = allResults.filter((r) => r.passed).length;
	const failed = allResults.filter((r) => !r.passed && !r.error?.includes("not found")).length;
	const skipped = allResults.filter((r) => r.error?.includes("not found")).length;

	return {
		specPath,
		passed,
		failed,
		skipped,
		results: allResults,
		duration,
	};
}

/**
 * SpecRunner class for advanced execution control
 *
 * Provides a fluent API for configuring and running specs.
 */
export class SpecRunner {
	private registry: FixtureRegistry;
	private options: SpecOptions;

	constructor(registry?: FixtureRegistry, options?: SpecOptions) {
		this.registry = registry || createFixtureRegistry();
		this.options = options || {};
	}

	/**
	 * Register a fixture function
	 */
	fixture<T>(name: string, fn: FixtureFunction<T>): this {
		this.registry.register(name, fn);
		return this;
	}

	/**
	 * Set base path for spec resolution
	 */
	basePath(path: string): this {
		this.options.basePath = path;
		return this;
	}

	/**
	 * Configure error handling
	 */
	throwOnMissing(value: boolean): this {
		this.options.throwOnMissing = value;
		return this;
	}

	/**
	 * Run a specification
	 */
	async run(specPath: string): Promise<ExecutionResult> {
		return runSpec(specPath, this.registry, this.options);
	}

	/**
	 * Run multiple specifications
	 */
	async runAll(specPaths: string[]): Promise<ExecutionResult[]> {
		return Promise.all(specPaths.map((path) => this.run(path)));
	}

	/**
	 * Get the underlying registry
	 */
	getRegistry(): FixtureRegistry {
		return this.registry;
	}
}

/**
 * Create a new SpecRunner instance
 *
 * @param options Optional configuration
 * @returns New SpecRunner instance
 */
export function createSpecRunner(options?: SpecOptions): SpecRunner {
	return new SpecRunner(undefined, options);
}
