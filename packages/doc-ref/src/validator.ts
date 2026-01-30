import * as fs from "node:fs";
import * as path from "node:path";
import type { DocReference, DocRefOptions, ValidationResult } from "./types";
import { DEFAULT_OPTIONS } from "./types";
import { parseMarkdownFile } from "./markdown";

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
 * Validate a single doc reference
 *
 * Checks:
 * - File exists
 * - Line numbers are within file bounds
 * - Anchor references exist as headings in the markdown
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

	// Parse the markdown file for validation
	const parsed = parseMarkdownFile(fullPath);

	// Validate line references
	if (reference.lineRef && opts.validateLines) {
		const lineNum =
			typeof reference.lineRef === "number"
				? reference.lineRef
				: reference.lineRef.end;

		if (lineNum > parsed.lineCount) {
			return {
				reference,
				valid: false,
				error: `Line ${lineNum} exceeds file length (${parsed.lineCount} lines)`,
			};
		}
	}

	// Validate anchor references using proper markdown parsing
	if (reference.anchorRef && opts.validateAnchors) {
		if (!parsed.anchors.includes(reference.anchorRef)) {
			// Provide helpful error with available anchors
			const available =
				parsed.anchors.length > 0
					? `Available: ${parsed.anchors.slice(0, 5).join(", ")}${parsed.anchors.length > 5 ? "..." : ""}`
					: "No anchors found in document";

			return {
				reference,
				valid: false,
				error: `Anchor #${reference.anchorRef} not found in ${reference.docPath}. ${available}`,
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
