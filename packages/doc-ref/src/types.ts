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
