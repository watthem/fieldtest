/**
 * @fieldtest/doc-ref Type Definitions
 *
 * Core types for doc-driven testing and executable specifications
 */

/**
 * Inline binding commands for executable specifications
 */
export type BindingCommand = "set" | "verify" | "execute";

/**
 * Represents a Concordion-style inline binding parsed from markdown
 *
 * Syntax: [value](!command:field)
 *
 * Examples:
 *   [100](!set:quantity) - sets input.quantity = 100
 *   [$20.00](!verify:total) - verifies output.total === "$20.00"
 *   [calculate](!execute:pricing) - runs pricing fixture
 */
export interface InlineBinding {
	/** The bracketed value: "100" from [100] */
	value: string;
	/** The command type: set, verify, or execute */
	command: BindingCommand;
	/** The field name: "quantity" from (!set:quantity) */
	field: string;
	/** Full match: "[100](!set:quantity)" */
	raw: string;
	/** Line number in source (1-indexed) */
	line?: number;
}

/**
 * A parsed table from markdown content
 */
export interface ParsedTable {
	/** Column headers */
	headers: string[];
	/** Table rows as arrays of cell values */
	rows: string[][];
	/** Raw markdown table source */
	raw: string;
	/** Line number where table starts */
	line?: number;
}

/**
 * A code example extracted from markdown
 */
export interface CodeExample {
	/** Programming language identifier */
	language: string;
	/** The code content */
	code: string;
	/** Raw markdown code block source */
	raw: string;
	/** Line number where code block starts */
	line?: number;
}

/**
 * A MUST/SHOULD assertion extracted from markdown
 */
export interface SpecAssertion {
	/** Assertion type */
	type: "MUST" | "SHOULD" | "MUST NOT" | "SHOULD NOT";
	/** The assertion text */
	text: string;
	/** Full sentence containing the assertion */
	context: string;
	/** Line number of the assertion */
	line?: number;
}

/**
 * Represents a parsed section of a markdown document
 */
export interface DocSection {
	/** Section heading text */
	title: string;
	/** Heading level (1-6) */
	level: number;
	/** Raw markdown content of the section */
	content: string;
	/** Parsed tables in this section */
	tables: ParsedTable[];
	/** Code examples in this section */
	examples: CodeExample[];
	/** MUST/SHOULD assertions in this section */
	assertions: SpecAssertion[];
	/** Inline bindings for executable specs */
	bindings: InlineBinding[];
	/** Anchor ID for linking */
	anchor: string;
	/** Line number where section starts */
	line?: number;
}

/**
 * A fully loaded specification document
 */
export interface LoadedSpec {
	/** File path of the spec */
	path: string;
	/** All sections in the spec */
	sections: DocSection[];
	/** The specific section if a fragment was used */
	targetSection?: DocSection;
	/** Raw content of the file */
	raw: string;
}

/**
 * Options for loading a spec
 */
export interface SpecOptions {
	/** Base directory for resolving relative paths */
	basePath?: string;
	/** Whether to throw on missing files */
	throwOnMissing?: boolean;
}

/**
 * Context provided to fixture functions during execution
 */
export interface FixtureContext {
	/** Accumulated inputs from !set: bindings */
	inputs: Record<string, unknown>;
	/** The loaded specification being executed */
	spec: LoadedSpec;
}

/**
 * A fixture function that executes specification logic
 */
export type FixtureFunction<T = unknown> = (
	context: FixtureContext,
) => T | Promise<T>;

/**
 * Registry for storing and retrieving fixtures
 */
export interface FixtureRegistry {
	/** Register a fixture function */
	register<T>(name: string, fixture: FixtureFunction<T>): void;
	/** Get a fixture by name */
	get<T>(name: string): FixtureFunction<T> | undefined;
	/** Check if a fixture exists */
	has(name: string): boolean;
	/** List all registered fixture names */
	list(): string[];
}

/**
 * Result of a single assertion verification
 */
export interface AssertionResult {
	/** The binding that was verified */
	binding: InlineBinding;
	/** Expected value from the spec */
	expected: unknown;
	/** Actual value from fixture execution */
	actual: unknown;
	/** Whether the assertion passed */
	passed: boolean;
	/** Error message if failed */
	error?: string;
}

/**
 * Result of executing a complete specification
 */
export interface ExecutionResult {
	/** Path to the spec file */
	specPath: string;
	/** Number of passing assertions */
	passed: number;
	/** Number of failing assertions */
	failed: number;
	/** Number of skipped assertions */
	skipped: number;
	/** Detailed results for each assertion */
	results: AssertionResult[];
	/** Total execution time in milliseconds */
	duration: number;
}

/**
 * Options for running specs in vitest
 */
export interface VitestSpecOptions {
	/** Description for the test suite */
	description?: string;
	/** Whether to skip the test */
	skip?: boolean;
	/** Whether to mark as todo */
	todo?: boolean;
}

/**
 * Link validation result
 */
export interface LinkValidation {
	/** The link href */
	href: string;
	/** Whether the link target exists */
	exists: boolean;
	/** Error message if validation failed */
	error?: string;
	/** Line number of the link */
	line?: number;
}
