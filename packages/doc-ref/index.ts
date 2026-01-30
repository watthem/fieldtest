// Types
export type {
	DocReference,
	DocCoverage,
	DocRefOptions,
	ValidationResult,
	ValidationReport,
	// Markdown types
	CodeExample,
	DocAssertion,
	DocSection,
	ParsedDoc,
	TableRow,
	// Debt types
	PromiseType,
	PromiseConfidence,
	VerificationMethod,
	DebtSeverity,
	DocPromise,
	PromiseFulfillment,
	DocDebt,
	DebtReport,
	DebtOptions,
} from "./src/types";
export { DEFAULT_OPTIONS, DEFAULT_DEBT_OPTIONS } from "./src/types";

// Scanner
export {
	parseDocReference,
	scanTestFile,
	scanDocReferences,
	getDocFiles,
	getTestFiles,
} from "./src/scanner";

// Validator
export {
	resolveDocPath,
	validateReference,
	validateReferences,
} from "./src/validator";

// Reporter
export {
	calculateCoverage,
	findOrphanedDocs,
	findTestsWithoutRefs,
	generateReport,
	formatReport,
	formatDebtReport,
} from "./src/reporter";
export type { ReportOptions } from "./src/reporter";

// Debt Detection (Promises)
export {
	extractPromises,
	extractPromisesFromDoc,
	scanExports,
	scanSourceDefinitions,
	hasTestCoverage,
	verifyPromise,
	calculateDebt,
} from "./src/promises";

// Markdown Parsing
export {
	slugify,
	parseMarkdown,
	parseMarkdownFile,
	extractExamples,
	extractAssertions,
	parseStructuredExample,
	parseTable,
	extractTables,
	hasAnchor,
	getSection,
	getSections,
} from "./src/markdown";
