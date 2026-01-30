// Types
export type {
	DocReference,
	DocCoverage,
	DocRefOptions,
	ValidationResult,
	ValidationReport,
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
