import * as fs from "node:fs";
import * as path from "node:path";
import fg from "fast-glob";
import type { DocReference, DocRefOptions } from "./types";
import { DEFAULT_OPTIONS } from "./types";

/**
 * Regex patterns to match doc references in test files
 *
 * Pattern 1: DOC: comment pattern (most explicit, preferred)
 *   - DOC: docs/public/reference/api.md
 *   - DOC: reference.md
 *   - * DOC: docs/guide.md (in JSDoc)
 *
 * Pattern 2: Line number references
 *   - docs/reference.md:206
 *   - docs/reference.md:206-209
 *   - reference.md:207
 *
 * Pattern 3: Anchor references
 *   - docs/explainer.md#how-it-works
 *   - explainer.md#section-name
 *
 * Pattern 4: Parenthesized doc paths in test descriptions
 *   - describe("Rate Limits (docs/public/reference/api.md)", ...)
 *   - it("works (api.md)", ...)
 */

// Pattern 1: DOC: comment - captures full path including nested dirs
// Matches: DOC: docs/public/reference/api.md, DOC: reference.md
const DOC_COMMENT_PATTERN = /DOC:\s*([^\s*\n]+\.md)/g;

// Pattern 2: Line number reference - supports nested paths
// Matches: docs/public/reference.md:206, reference.md:207, docs/guide.md:10-20
const LINE_REF_PATTERN =
	/(?:["'(])?(((?:docs\/)?(?:[\w-]+\/)*[\w-]+\.md)):(\d+)(?:-(\d+))?(?:["')])?/g;

// Pattern 3: Anchor reference - supports nested paths
// Matches: docs/explainer.md#how-it-works, guide.md#setup
const ANCHOR_REF_PATTERN =
	/(?:["'(])?(((?:docs\/)?(?:[\w-]+\/)*[\w-]+\.md))#([\w-]+)(?:["')])?/g;

// Pattern 4: Parenthesized path in test descriptions (without line/anchor)
// Matches: (docs/public/reference/api.md), (api.md)
// Must be in parens to avoid matching random .md mentions
const PAREN_PATH_PATTERN = /\((((?:docs\/)?(?:[\w-]+\/)*[\w-]+\.md))\)/g;

/**
 * Parse a raw doc reference string into structured data
 */
export function parseDocReference(
	raw: string,
	testFile: string,
): DocReference | null {
	// Try DOC: pattern first
	DOC_COMMENT_PATTERN.lastIndex = 0;
	let match = DOC_COMMENT_PATTERN.exec(raw);
	if (match) {
		return {
			testFile,
			docPath: match[1],
			raw: match[0],
		};
	}

	// Try line reference pattern
	LINE_REF_PATTERN.lastIndex = 0;
	match = LINE_REF_PATTERN.exec(raw);
	if (match) {
		const [fullMatch, docPath, , lineStart, lineEnd] = match;
		const ref: DocReference = {
			testFile,
			docPath,
			raw: fullMatch,
		};
		if (lineEnd) {
			ref.lineRef = {
				start: Number.parseInt(lineStart, 10),
				end: Number.parseInt(lineEnd, 10),
			};
		} else {
			ref.lineRef = Number.parseInt(lineStart, 10);
		}
		return ref;
	}

	// Try anchor reference pattern
	ANCHOR_REF_PATTERN.lastIndex = 0;
	match = ANCHOR_REF_PATTERN.exec(raw);
	if (match) {
		const [fullMatch, docPath, , anchor] = match;
		return {
			testFile,
			docPath,
			anchorRef: anchor,
			raw: fullMatch,
		};
	}

	// Try parenthesized path pattern
	PAREN_PATH_PATTERN.lastIndex = 0;
	match = PAREN_PATH_PATTERN.exec(raw);
	if (match) {
		return {
			testFile,
			docPath: match[1],
			raw: match[0],
		};
	}

	return null;
}

/**
 * Scan a single test file for doc references
 */
export function scanTestFile(filePath: string): DocReference[] {
	const content = fs.readFileSync(filePath, "utf-8");
	const refs: DocReference[] = [];
	const seen = new Set<string>(); // Dedupe by raw match + docPath

	// Helper to add ref if not duplicate
	const addRef = (ref: DocReference) => {
		const key = `${ref.docPath}:${ref.lineRef ?? ""}:${ref.anchorRef ?? ""}`;
		if (!seen.has(key)) {
			seen.add(key);
			refs.push(ref);
		}
	};

	// Scan with DOC: comment pattern (highest priority)
	DOC_COMMENT_PATTERN.lastIndex = 0;
	let match: RegExpExecArray | null;
	while ((match = DOC_COMMENT_PATTERN.exec(content)) !== null) {
		addRef({
			testFile: filePath,
			docPath: match[1],
			raw: match[0],
		});
	}

	// Scan with line reference pattern
	LINE_REF_PATTERN.lastIndex = 0;
	while ((match = LINE_REF_PATTERN.exec(content)) !== null) {
		const [fullMatch, docPath, , lineStart, lineEnd] = match;
		const ref: DocReference = {
			testFile: filePath,
			docPath,
			raw: fullMatch,
		};
		if (lineEnd) {
			ref.lineRef = {
				start: Number.parseInt(lineStart, 10),
				end: Number.parseInt(lineEnd, 10),
			};
		} else {
			ref.lineRef = Number.parseInt(lineStart, 10);
		}
		addRef(ref);
	}

	// Scan with anchor reference pattern
	ANCHOR_REF_PATTERN.lastIndex = 0;
	while ((match = ANCHOR_REF_PATTERN.exec(content)) !== null) {
		const [fullMatch, docPath, , anchor] = match;
		addRef({
			testFile: filePath,
			docPath,
			anchorRef: anchor,
			raw: fullMatch,
		});
	}

	// Scan with parenthesized path pattern
	PAREN_PATH_PATTERN.lastIndex = 0;
	while ((match = PAREN_PATH_PATTERN.exec(content)) !== null) {
		addRef({
			testFile: filePath,
			docPath: match[1],
			raw: match[0],
		});
	}

	return refs;
}

/**
 * Scan all test files in a project directory for doc references
 */
export async function scanDocReferences(
	projectDir: string,
	options: DocRefOptions = {},
): Promise<DocReference[]> {
	const opts = { ...DEFAULT_OPTIONS, ...options };

	// Find all test files
	const testFiles = await fg(opts.testPatterns, {
		cwd: projectDir,
		absolute: true,
		ignore: ["**/node_modules/**", "**/dist/**", "**/.git/**"],
	});

	const allRefs: DocReference[] = [];

	for (const testFile of testFiles) {
		const refs = scanTestFile(testFile);
		allRefs.push(...refs);
	}

	return allRefs;
}

/**
 * Get all doc files in a project
 */
export async function getDocFiles(
	projectDir: string,
	options: DocRefOptions = {},
): Promise<string[]> {
	const opts = { ...DEFAULT_OPTIONS, ...options };
	const docsPath = path.join(projectDir, opts.docsDir);

	if (!fs.existsSync(docsPath)) {
		return [];
	}

	const patterns = opts.docExtensions.map((ext) => `**/*${ext}`);

	return fg(patterns, {
		cwd: docsPath,
		absolute: false,
	});
}

/**
 * Get all test files in a project
 */
export async function getTestFiles(
	projectDir: string,
	options: DocRefOptions = {},
): Promise<string[]> {
	const opts = { ...DEFAULT_OPTIONS, ...options };

	return fg(opts.testPatterns, {
		cwd: projectDir,
		absolute: true,
		ignore: ["**/node_modules/**", "**/dist/**", "**/.git/**"],
	});
}
