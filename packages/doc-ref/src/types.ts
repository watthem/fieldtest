/**
 * A reference from a test file to a documentation file
 */
export interface DocReference {
	/** The test file containing the reference */
	testFile: string;
	/** The referenced doc file (e.g., "docs/reference.md" or "reference.md") */
	docPath: string;
	/** Line number reference (e.g., 206 or { start: 206, end: 209 }) */
	lineRef?: number | { start: number; end: number };
	/** Section anchor reference (e.g., "how-it-works") */
	anchorRef?: string;
	/** The raw reference string as found in the test file */
	raw: string;
}

/**
 * Result of validating a single doc reference
 */
export interface ValidationResult {
	/** The reference that was validated */
	reference: DocReference;
	/** Whether the reference is valid */
	valid: boolean;
	/** Error message if invalid */
	error?: string;
}

/**
 * Coverage information for a single doc file
 */
export interface DocCoverage {
	/** Path to the doc file */
	docPath: string;
	/** Number of test references to this doc */
	refCount: number;
	/** Test files that reference this doc */
	referencedBy: string[];
}

/**
 * Full validation report for a project
 */
export interface ValidationReport {
	/** Project directory that was validated */
	projectDir: string;
	/** Total number of references found */
	totalRefs: number;
	/** Number of valid references */
	validRefs: number;
	/** Number of invalid references */
	invalidRefs: number;
	/** Detailed validation results */
	results: ValidationResult[];
	/** Coverage by doc file */
	coverage: DocCoverage[];
	/** Docs without any test references */
	orphanedDocs: string[];
	/** Test files without any doc references */
	testsWithoutRefs: string[];
}

/**
 * Options for scanning and validation
 */
export interface DocRefOptions {
	/** Glob patterns for test files */
	testPatterns?: string[];
	/** Directory containing docs (default: "docs") */
	docsDir?: string;
	/** File extensions to consider as docs (default: [".md"]) */
	docExtensions?: string[];
	/** Whether to validate line numbers exist in docs (default: true) */
	validateLines?: boolean;
	/** Whether to validate anchor references (default: true) */
	validateAnchors?: boolean;
}

export const DEFAULT_OPTIONS: Required<DocRefOptions> = {
	testPatterns: ["**/*.test.js", "**/*.test.ts", "**/*.spec.js", "**/*.spec.ts"],
	docsDir: "docs",
	docExtensions: [".md"],
	validateLines: true,
	validateAnchors: true,
};

// ============================================================================
// Markdown Parsing Types
// ============================================================================

/**
 * A code example extracted from markdown
 */
export interface CodeExample {
	/** Language of the code block (e.g., "typescript", "json") */
	lang: string;
	/** Meta string after language (e.g., "typescript:example") */
	meta: string;
	/** The raw code content */
	code: string;
	/** Parsed input value if found (from "input: ..." pattern) */
	input?: unknown;
	/** Parsed expected output if found (from "output: ..." or "expected: ..." pattern) */
	expected?: unknown;
}

/**
 * An assertion extracted from markdown content
 */
export interface DocAssertion {
	/** Type of assertion */
	type: "requirement" | "gherkin" | "behavior";
	/** The assertion text */
	text: string;
	/** Keyword that identified this assertion (e.g., "MUST", "Given", "should") */
	keyword?: string;
}

/**
 * A section parsed from a markdown document
 */
export interface DocSection {
	/** Section title (from heading) */
	title: string;
	/** URL-friendly slug (auto-generated from title) */
	slug: string;
	/** Heading level (1-6, or 0 for HTML id) */
	level: number;
	/** Line number where section starts */
	line: number;
	/** Raw content of the section (excluding heading) */
	content: string;
	/** Code examples found in this section */
	examples: CodeExample[];
	/** Assertions found in this section */
	assertions: DocAssertion[];
}

/**
 * A parsed markdown document
 */
export interface ParsedDoc {
	/** All sections keyed by slug */
	sections: Map<string, DocSection>;
	/** List of all section slugs (anchors) */
	anchors: string[];
	/** Total line count */
	lineCount: number;
}

/**
 * A row parsed from a markdown table
 */
export interface TableRow {
	[column: string]: unknown;
}
