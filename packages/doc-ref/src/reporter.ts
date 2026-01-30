import * as path from "node:path";
import type {
	DocCoverage,
	DocRefOptions,
	DocReference,
	ValidationReport,
	ValidationResult,
} from "./types";
import { DEFAULT_OPTIONS } from "./types";
import {
	getDocFiles,
	getTestFiles,
	scanDocReferences,
} from "./scanner";
import { validateReferences } from "./validator";

/**
 * Calculate coverage statistics from references
 */
export function calculateCoverage(
	references: DocReference[],
	docFiles: string[],
): DocCoverage[] {
	const coverageMap = new Map<string, DocCoverage>();

	// Initialize coverage for all doc files
	for (const docFile of docFiles) {
		coverageMap.set(docFile, {
			docPath: docFile,
			refCount: 0,
			referencedBy: [],
		});
	}

	// Count references
	for (const ref of references) {
		// Normalize the doc path to just the filename for matching
		const docFileName = path.basename(ref.docPath);

		// Find matching doc file
		for (const docFile of docFiles) {
			if (docFile === docFileName || docFile.endsWith(`/${docFileName}`)) {
				const coverage = coverageMap.get(docFile);
				if (coverage) {
					coverage.refCount++;
					if (!coverage.referencedBy.includes(ref.testFile)) {
						coverage.referencedBy.push(ref.testFile);
					}
				}
				break;
			}
		}
	}

	return Array.from(coverageMap.values()).sort(
		(a, b) => b.refCount - a.refCount,
	);
}

/**
 * Find doc files that have no test references
 */
export function findOrphanedDocs(coverage: DocCoverage[]): string[] {
	return coverage
		.filter((c) => c.refCount === 0)
		.map((c) => c.docPath);
}

/**
 * Find test files that have no doc references
 */
export function findTestsWithoutRefs(
	testFiles: string[],
	references: DocReference[],
): string[] {
	const testsWithRefs = new Set(references.map((r) => r.testFile));
	return testFiles.filter((t) => !testsWithRefs.has(t));
}

/**
 * Generate a full validation report for a project
 */
export async function generateReport(
	projectDir: string,
	options: DocRefOptions = {},
): Promise<ValidationReport> {
	const opts = { ...DEFAULT_OPTIONS, ...options };

	// Scan for references
	const references = await scanDocReferences(projectDir, opts);

	// Validate references
	const results = validateReferences(references, projectDir, opts);

	// Get doc files for coverage
	const docFiles = await getDocFiles(projectDir, opts);

	// Get test files
	const testFiles = await getTestFiles(projectDir, opts);

	// Calculate coverage
	const coverage = calculateCoverage(references, docFiles);

	// Find orphaned docs and tests without refs
	const orphanedDocs = findOrphanedDocs(coverage);
	const testsWithoutRefs = findTestsWithoutRefs(testFiles, references);

	return {
		projectDir,
		totalRefs: references.length,
		validRefs: results.filter((r) => r.valid).length,
		invalidRefs: results.filter((r) => !r.valid).length,
		results,
		coverage,
		orphanedDocs,
		testsWithoutRefs,
	};
}

/**
 * Format a validation report as a string for console output
 */
export function formatReport(report: ValidationReport): string {
	const lines: string[] = [];

	lines.push(`\n=== Doc-Test Validation Report ===\n`);
	lines.push(`Project: ${report.projectDir}`);
	lines.push(`Total References: ${report.totalRefs}`);
	lines.push(`Valid: ${report.validRefs}`);
	lines.push(`Invalid: ${report.invalidRefs}`);

	if (report.invalidRefs > 0) {
		lines.push(`\nInvalid References:`);
		for (const result of report.results.filter((r) => !r.valid)) {
			lines.push(`  - ${result.reference.raw}: ${result.error}`);
			lines.push(`    in ${result.reference.testFile}`);
		}
	}

	lines.push(`\nDoc Coverage:`);
	for (const cov of report.coverage) {
		const status = cov.refCount > 0 ? "covered" : "orphan";
		lines.push(`  ${cov.docPath}: ${cov.refCount} refs (${status})`);
	}

	if (report.orphanedDocs.length > 0) {
		lines.push(`\nOrphaned Docs (no test references): ${report.orphanedDocs.length}`);
	}

	if (report.testsWithoutRefs.length > 0) {
		lines.push(`\nTests Without Doc References: ${report.testsWithoutRefs.length}`);
	}

	lines.push("");
	return lines.join("\n");
}
