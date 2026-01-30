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
} from "./src/types";
export { DEFAULT_OPTIONS } from "./src/types";

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
} from "./src/reporter";

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
