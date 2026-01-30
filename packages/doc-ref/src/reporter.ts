import * as path from "node:path";
import type {
	DebtOptions,
	DebtReport,
	DocCoverage,
	DocDebt,
	DocRefOptions,
	DocReference,
	ValidationReport,
	ValidationResult,
} from "./types";
import { DEFAULT_DEBT_OPTIONS, DEFAULT_OPTIONS } from "./types";
import {
	getDocFiles,
	getTestFiles,
	scanDocReferences,
} from "./scanner";
import { validateReferences } from "./validator";
import { calculateDebt } from "./promises";

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
 * Options for report generation
 */
export interface ReportOptions extends DocRefOptions {
	/** Enable documentation debt detection */
	includeDebt?: boolean;
	/** Debt detection options */
	debtOptions?: DebtOptions;
}

/**
 * Generate a full validation report for a project
 */
export async function generateReport(
	projectDir: string,
	options: ReportOptions = {},
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

	const report: ValidationReport = {
		projectDir,
		totalRefs: references.length,
		validRefs: results.filter((r) => r.valid).length,
		invalidRefs: results.filter((r) => !r.valid).length,
		results,
		coverage,
		orphanedDocs,
		testsWithoutRefs,
	};

	// Add debt analysis if enabled
	if (options.includeDebt) {
		const debtOpts = { ...DEFAULT_DEBT_OPTIONS, ...options.debtOptions };
		report.debt = await calculateDebt(projectDir, opts, debtOpts);
	}

	return report;
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

	// Include debt report if available
	if (report.debt) {
		lines.push(formatDebtReport(report.debt));
	}

	lines.push("");
	return lines.join("\n");
}

/**
 * Format debt report as a string for console output
 */
export function formatDebtReport(debt: DebtReport): string {
	const lines: string[] = [];

	lines.push(`\n=== Documentation Debt Report ===\n`);

	if (debt.debts.length === 0) {
		lines.push(`No documentation debt found!`);
	} else {
		// Group by severity
		const critical = debt.debts.filter((d) => d.severity === "critical");
		const warnings = debt.debts.filter((d) => d.severity === "warning");
		const info = debt.debts.filter((d) => d.severity === "info");

		if (critical.length > 0) {
			lines.push(`CRITICAL (${critical.length}):`);
			for (const d of critical) {
				lines.push(formatDebtItem(d));
			}
			lines.push("");
		}

		if (warnings.length > 0) {
			lines.push(`WARNING (${warnings.length}):`);
			for (const d of warnings) {
				lines.push(formatDebtItem(d));
			}
			lines.push("");
		}

		if (info.length > 0) {
			lines.push(`INFO (${info.length}):`);
			for (const d of info) {
				lines.push(formatDebtItem(d));
			}
			lines.push("");
		}
	}

	lines.push(`Debt Summary:`);
	lines.push(
		`  Promises: ${debt.totalPromises} | Fulfilled: ${debt.fulfilledCount} (${debt.fulfillmentRate.toFixed(0)}%) | Debt: ${debt.debtCount} (${(100 - debt.fulfillmentRate).toFixed(0)}%)`,
	);

	return lines.join("\n");
}

/**
 * Format a single debt item for console output
 */
function formatDebtItem(debt: DocDebt): string {
	const lines: string[] = [];
	const { promise } = debt;

	lines.push(`  - ${promise.identifier} (${promise.type})`);
	lines.push(`    in: ${promise.source.file}#${promise.source.section}`);
	lines.push(`    suggestion: ${debt.suggestion}`);

	return lines.join("\n");
}
