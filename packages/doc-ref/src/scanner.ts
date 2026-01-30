import * as fs from "node:fs";
import * as path from "node:path";
import fg from "fast-glob";
import type { DocReference, DocRefOptions } from "./types";
import { DEFAULT_OPTIONS } from "./types";

/**
 * Regex patterns to match doc references in test files
 *
 * Only matches patterns with explicit line numbers or anchors (doc-driven testing pattern):
 * - docs/reference.md:206
 * - docs/reference.md:206-209
 * - reference.md:207
 * - docs/explainer.md#how-it-works
 * - (reference.md:207)
 * - "docs/guide.md:50"
 *
 * Does NOT match bare .md references like "test.md" or "a.md" (test fixtures)
 */
const DOC_REF_PATTERN =
	/(?:["'(])?(?:docs\/)?([a-zA-Z0-9_-]+\.md)(?::(\d+)(?:-(\d+))?|#([a-zA-Z0-9_-]+))(?:["')])?/g;

/**
 * Parse a raw doc reference string into structured data
 */
export function parseDocReference(
	raw: string,
	testFile: string,
): DocReference | null {
	// Reset regex state
	DOC_REF_PATTERN.lastIndex = 0;

	const match = DOC_REF_PATTERN.exec(raw);
	if (!match) return null;

	const [fullMatch, docFile, lineStart, lineEnd, anchor] = match;

	const ref: DocReference = {
		testFile,
		docPath: raw.includes("docs/") ? `docs/${docFile}` : docFile,
		raw: fullMatch,
	};

	if (lineStart) {
		if (lineEnd) {
			ref.lineRef = { start: Number.parseInt(lineStart, 10), end: Number.parseInt(lineEnd, 10) };
		} else {
			ref.lineRef = Number.parseInt(lineStart, 10);
		}
	}

	if (anchor) {
		ref.anchorRef = anchor;
	}

	return ref;
}

/**
 * Scan a single test file for doc references
 */
export function scanTestFile(filePath: string): DocReference[] {
	const content = fs.readFileSync(filePath, "utf-8");
	const refs: DocReference[] = [];

	// Reset regex state
	DOC_REF_PATTERN.lastIndex = 0;

	let match: RegExpExecArray | null;
	while ((match = DOC_REF_PATTERN.exec(content)) !== null) {
		const [fullMatch, docFile, lineStart, lineEnd, anchor] = match;

		// Skip if no doc file matched
		if (!docFile) continue;

		const ref: DocReference = {
			testFile: filePath,
			docPath: fullMatch.includes("docs/") ? `docs/${docFile}` : docFile,
			raw: fullMatch,
		};

		if (lineStart) {
			if (lineEnd) {
				ref.lineRef = {
					start: Number.parseInt(lineStart, 10),
					end: Number.parseInt(lineEnd, 10),
				};
			} else {
				ref.lineRef = Number.parseInt(lineStart, 10);
			}
		}

		if (anchor) {
			ref.anchorRef = anchor;
		}

		refs.push(ref);
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
