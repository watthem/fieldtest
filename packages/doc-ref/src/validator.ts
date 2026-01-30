import * as fs from "node:fs";
import * as path from "node:path";
import type { DocReference, DocRefOptions, ValidationResult } from "./types";
import { DEFAULT_OPTIONS } from "./types";

/**
 * Resolve a doc path to an absolute file path
 */
export function resolveDocPath(
	projectDir: string,
	docPath: string,
	options: DocRefOptions = {},
): string {
	const opts = { ...DEFAULT_OPTIONS, ...options };

	// If path starts with docs/, use as-is relative to project
	if (docPath.startsWith("docs/") || docPath.startsWith(`${opts.docsDir}/`)) {
		return path.join(projectDir, docPath);
	}

	// Otherwise, assume it's relative to the docs directory
	return path.join(projectDir, opts.docsDir, docPath);
}

/**
 * Count the number of lines in a file
 */
function getLineCount(filePath: string): number {
	const content = fs.readFileSync(filePath, "utf-8");
	return content.split("\n").length;
}

/**
 * Check if a markdown file contains a heading that matches an anchor
 */
function hasAnchor(filePath: string, anchor: string): boolean {
	const content = fs.readFileSync(filePath, "utf-8");

	// Markdown headings create anchors by:
	// 1. Converting to lowercase
	// 2. Replacing spaces with hyphens
	// 3. Removing special characters
	const anchorPattern = new RegExp(
		`^#+\\s+.*${anchor.replace(/-/g, "[\\s-]")}`,
		"im",
	);

	return anchorPattern.test(content);
}

/**
 * Validate a single doc reference
 */
export function validateReference(
	reference: DocReference,
	projectDir: string,
	options: DocRefOptions = {},
): ValidationResult {
	const opts = { ...DEFAULT_OPTIONS, ...options };
	const fullPath = resolveDocPath(projectDir, reference.docPath, opts);

	// Check if file exists
	if (!fs.existsSync(fullPath)) {
		return {
			reference,
			valid: false,
			error: `Doc file not found: ${reference.docPath}`,
		};
	}

	// Validate line references
	if (reference.lineRef && opts.validateLines) {
		const lineCount = getLineCount(fullPath);
		const lineNum =
			typeof reference.lineRef === "number"
				? reference.lineRef
				: reference.lineRef.end;

		if (lineNum > lineCount) {
			return {
				reference,
				valid: false,
				error: `Line ${lineNum} exceeds file length (${lineCount} lines)`,
			};
		}
	}

	// Validate anchor references
	if (reference.anchorRef && opts.validateAnchors) {
		if (!hasAnchor(fullPath, reference.anchorRef)) {
			return {
				reference,
				valid: false,
				error: `Anchor #${reference.anchorRef} not found in ${reference.docPath}`,
			};
		}
	}

	return {
		reference,
		valid: true,
	};
}

/**
 * Validate multiple doc references
 */
export function validateReferences(
	references: DocReference[],
	projectDir: string,
	options: DocRefOptions = {},
): ValidationResult[] {
	return references.map((ref) => validateReference(ref, projectDir, options));
}
