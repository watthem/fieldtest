/**
 * Documentation Debt Detection
 *
 * Extracts "promises" from documentation (things the docs claim exist)
 * and verifies them against actual code exports, tests, and source files.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import fg from "fast-glob";
import type {
	DebtOptions,
	DebtReport,
	DebtSeverity,
	DocDebt,
	DocPromise,
	DocRefOptions,
	DocSection,
	ParsedDoc,
	PromiseConfidence,
	PromiseFulfillment,
	PromiseType,
	VerificationMethod,
} from "./types";
import { DEFAULT_DEBT_OPTIONS, DEFAULT_OPTIONS } from "./types";
import { parseMarkdownFile } from "./markdown";
import { getDocFiles } from "./scanner";

// ============================================================================
// Promise Extraction
// ============================================================================

/**
 * Pattern definitions for extracting promises from documentation
 */
interface ExtractionPattern {
	type: PromiseType;
	confidence: PromiseConfidence;
	regex: RegExp;
	/** Extract identifier from match groups */
	getIdentifier: (match: RegExpExecArray) => string;
}

/**
 * Patterns to detect documented functions/methods
 */
const FUNCTION_PATTERNS: ExtractionPattern[] = [
	// ### registerSchema(name, schema) - function heading
	{
		type: "function",
		confidence: "explicit",
		regex: /^#{1,4}\s+`?(\w+)\s*\(([^)]*)\)`?/gm,
		getIdentifier: (m) => m[1],
	},
	// `registerSchema()` or `registerSchema(args)` in inline code
	{
		type: "function",
		confidence: "explicit",
		regex: /`(\w+)\s*\([^)]*\)`/g,
		getIdentifier: (m) => m[1],
	},
	// const x = registerSchema(...) in code blocks (handled separately)
];

/**
 * Patterns to detect documented API endpoints
 */
const API_PATTERNS: ExtractionPattern[] = [
	// GET /api/users, POST /api/users/:id
	{
		type: "api-endpoint",
		confidence: "explicit",
		regex: /\b(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+([/\w:.-]+)/gi,
		getIdentifier: (m) => `${m[1].toUpperCase()} ${m[2]}`,
	},
];

/**
 * Patterns to detect requirement statements (MUST/SHOULD)
 */
const REQUIREMENT_PATTERNS: ExtractionPattern[] = [
	// MUST: validate input
	{
		type: "requirement",
		confidence: "explicit",
		regex: /\b(MUST|SHALL):\s*(.+)/gi,
		getIdentifier: (m) => m[2].trim(),
	},
	// SHOULD: provide feedback
	{
		type: "requirement",
		confidence: "explicit",
		regex: /\bSHOULD:\s*(.+)/gi,
		getIdentifier: (m) => m[1].trim(),
	},
];

/**
 * Patterns to detect feature claims (lower confidence)
 */
const FEATURE_PATTERNS: ExtractionPattern[] = [
	// "FieldTest provides automatic validation"
	{
		type: "feature",
		confidence: "inferred",
		regex: /(?:provides?|supports?|includes?|offers?|enables?)\s+(\w+(?:\s+\w+){0,3})/gi,
		getIdentifier: (m) => m[1].trim(),
	},
];

/**
 * Extract function calls from code blocks in a section
 */
function extractCodeBlockFunctions(section: DocSection): DocPromise[] {
	const promises: DocPromise[] = [];

	for (const example of section.examples) {
		// Skip non-code blocks (like JSON, bash)
		if (!["typescript", "ts", "javascript", "js", ""].includes(example.lang)) {
			continue;
		}

		// Match function calls like: registerSchema(...), validateSchema(...)
		const callPattern = /\b(\w+)\s*\(/g;
		let match: RegExpExecArray | null;

		while ((match = callPattern.exec(example.code)) !== null) {
			const name = match[1];

			// Filter out common keywords and built-ins
			const SKIP_NAMES = new Set([
				"if",
				"for",
				"while",
				"switch",
				"function",
				"class",
				"return",
				"new",
				"typeof",
				"instanceof",
				"import",
				"export",
				"require",
				"describe",
				"it",
				"test",
				"expect",
				"beforeEach",
				"afterEach",
				"console",
				"Error",
				"Array",
				"Object",
				"String",
				"Number",
				"Boolean",
				"Promise",
				"Map",
				"Set",
				"Date",
				"JSON",
				"Math",
				"setTimeout",
				"setInterval",
			]);

			if (!SKIP_NAMES.has(name) && name.length > 1) {
				promises.push({
					type: "function",
					identifier: name,
					source: {
						file: "", // Will be filled by caller
						section: section.slug,
						line: section.line,
					},
					text: example.code.slice(
						Math.max(0, match.index - 20),
						Math.min(example.code.length, match.index + match[0].length + 20),
					),
					confidence: "explicit",
				});
			}
		}
	}

	return promises;
}

/**
 * Extract promises from a single section
 */
function extractFromSection(
	section: DocSection,
	docFile: string,
): DocPromise[] {
	const promises: DocPromise[] = [];
	const seen = new Set<string>(); // Dedupe by type:identifier

	const addPromise = (promise: DocPromise) => {
		const key = `${promise.type}:${promise.identifier}`;
		if (!seen.has(key)) {
			seen.add(key);
			promises.push({
				...promise,
				source: {
					...promise.source,
					file: docFile,
					section: section.slug,
					line: promise.source.line || section.line,
				},
			});
		}
	};

	// Check section title for function definitions
	const titleMatch = section.title.match(/^`?(\w+)\s*\([^)]*\)`?$/);
	if (titleMatch) {
		addPromise({
			type: "function",
			identifier: titleMatch[1],
			source: { file: docFile, section: section.slug, line: section.line },
			text: section.title,
			confidence: "explicit",
		});
	}

	// Extract from content using patterns
	const allPatterns = [
		...FUNCTION_PATTERNS,
		...API_PATTERNS,
		...REQUIREMENT_PATTERNS,
		...FEATURE_PATTERNS,
	];

	for (const pattern of allPatterns) {
		pattern.regex.lastIndex = 0;
		let match: RegExpExecArray | null;

		while ((match = pattern.regex.exec(section.content)) !== null) {
			addPromise({
				type: pattern.type,
				identifier: pattern.getIdentifier(match),
				source: { file: docFile, section: section.slug },
				text: match[0],
				confidence: pattern.confidence,
			});
		}
	}

	// Extract from code blocks
	const codePromises = extractCodeBlockFunctions(section);
	for (const promise of codePromises) {
		addPromise(promise);
	}

	return promises;
}

/**
 * Extract all promises from a parsed markdown document
 */
export function extractPromisesFromDoc(
	parsed: ParsedDoc,
	docFile: string,
): DocPromise[] {
	const promises: DocPromise[] = [];

	for (const section of parsed.sections.values()) {
		promises.push(...extractFromSection(section, docFile));
	}

	return promises;
}

/**
 * Extract all promises from a project's documentation
 */
export async function extractPromises(
	projectDir: string,
	options: DocRefOptions = {},
): Promise<DocPromise[]> {
	const opts = { ...DEFAULT_OPTIONS, ...options };
	const docFiles = await getDocFiles(projectDir, opts);
	const docsPath = path.join(projectDir, opts.docsDir);
	const allPromises: DocPromise[] = [];

	for (const docFile of docFiles) {
		const fullPath = path.join(docsPath, docFile);
		const parsed = parseMarkdownFile(fullPath);
		const promises = extractPromisesFromDoc(parsed, docFile);
		allPromises.push(...promises);
	}

	return allPromises;
}

// ============================================================================
// Promise Verification
// ============================================================================

/**
 * Scan a file for function/class/const definitions
 */
function scanFileForDefinitions(filePath: string): Set<string> {
	const definitions = new Set<string>();

	if (!fs.existsSync(filePath)) {
		return definitions;
	}

	const content = fs.readFileSync(filePath, "utf-8");

	// Function declarations: function foo() / async function foo()
	const funcDecl = /\bfunction\s+(\w+)/g;
	let match: RegExpExecArray | null;
	while ((match = funcDecl.exec(content)) !== null) {
		definitions.add(match[1]);
	}

	// Arrow functions / const assignments: const foo = / export const foo =
	const constDecl = /\b(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=/g;
	while ((match = constDecl.exec(content)) !== null) {
		definitions.add(match[1]);
	}

	// Class declarations
	const classDecl = /\bclass\s+(\w+)/g;
	while ((match = classDecl.exec(content)) !== null) {
		definitions.add(match[1]);
	}

	// Interface/type declarations (TypeScript)
	const typeDecl = /\b(?:interface|type)\s+(\w+)/g;
	while ((match = typeDecl.exec(content)) !== null) {
		definitions.add(match[1]);
	}

	return definitions;
}

/**
 * Scan package exports from entry point
 */
export async function scanExports(
	projectDir: string,
	options: DebtOptions = {},
): Promise<Set<string>> {
	const opts = { ...DEFAULT_DEBT_OPTIONS, ...options };
	const exports = new Set<string>();

	// Try to find and parse the entry point
	const entryPoints = [
		path.join(projectDir, opts.entryPoint),
		path.join(projectDir, "src", opts.entryPoint),
		path.join(projectDir, "index.ts"),
		path.join(projectDir, "src", "index.ts"),
	];

	for (const entry of entryPoints) {
		if (fs.existsSync(entry)) {
			const content = fs.readFileSync(entry, "utf-8");

			// Named exports: export { foo, bar }
			const namedExport = /export\s*\{([^}]+)\}/g;
			let match: RegExpExecArray | null;
			while ((match = namedExport.exec(content)) !== null) {
				const names = match[1].split(",").map((n) => {
					// Handle "foo as bar" renames
					const parts = n.trim().split(/\s+as\s+/);
					return parts[parts.length - 1].trim();
				});
				for (const name of names) {
					if (name) exports.add(name);
				}
			}

			// Direct exports: export const foo, export function foo, export class foo
			const directExport =
				/export\s+(?:const|let|var|function|class|interface|type)\s+(\w+)/g;
			while ((match = directExport.exec(content)) !== null) {
				exports.add(match[1]);
			}

			// Re-exports: export * from, export { x } from
			// For now, we just note that there are re-exports but don't follow them
		}
	}

	return exports;
}

/**
 * Scan source files for all defined symbols
 */
export async function scanSourceDefinitions(
	projectDir: string,
	options: DebtOptions = {},
): Promise<Set<string>> {
	const opts = { ...DEFAULT_DEBT_OPTIONS, ...options };
	const definitions = new Set<string>();

	const sourceFiles = await fg(opts.srcPatterns, {
		cwd: projectDir,
		absolute: true,
		ignore: ["**/node_modules/**", "**/dist/**", "**/*.d.ts", "**/*.test.ts"],
	});

	for (const file of sourceFiles) {
		const fileDefs = scanFileForDefinitions(file);
		for (const def of fileDefs) {
			definitions.add(def);
		}
	}

	return definitions;
}

/**
 * Check if any test file references a documentation section
 */
export async function hasTestCoverage(
	projectDir: string,
	docFile: string,
	section: string,
	options: DocRefOptions = {},
): Promise<{ covered: boolean; testFile?: string }> {
	const opts = { ...DEFAULT_OPTIONS, ...options };

	const testFiles = await fg(opts.testPatterns, {
		cwd: projectDir,
		absolute: true,
		ignore: ["**/node_modules/**", "**/dist/**"],
	});

	const docFileName = path.basename(docFile, ".md");

	for (const testFile of testFiles) {
		const content = fs.readFileSync(testFile, "utf-8");

		// Check for DOC: comments referencing this doc/section
		if (
			content.includes(`DOC: ${docFile}`) ||
			content.includes(`${docFile}#${section}`) ||
			content.includes(`${docFileName}.md#${section}`) ||
			content.includes(`${docFileName}.md:`)
		) {
			return { covered: true, testFile };
		}
	}

	return { covered: false };
}

/**
 * Verify a single promise against code and tests
 */
export async function verifyPromise(
	promise: DocPromise,
	projectDir: string,
	context: {
		exports: Set<string>;
		definitions: Set<string>;
	},
	options: DocRefOptions = {},
): Promise<PromiseFulfillment> {
	// For functions, check if exported
	if (promise.type === "function") {
		// Check exports first (strongest evidence)
		if (context.exports.has(promise.identifier)) {
			return {
				promise,
				fulfilled: true,
				verification: "export-exists",
				evidence: "package exports",
			};
		}

		// Check source definitions
		if (context.definitions.has(promise.identifier)) {
			return {
				promise,
				fulfilled: true,
				verification: "code-exists",
				evidence: "source files",
			};
		}
	}

	// For requirements, check test coverage
	if (promise.type === "requirement") {
		const coverage = await hasTestCoverage(
			projectDir,
			promise.source.file,
			promise.source.section,
			options,
		);

		if (coverage.covered) {
			return {
				promise,
				fulfilled: true,
				verification: "test-exists",
				evidence: coverage.testFile,
			};
		}
	}

	// For features, check if referenced identifier exists in code
	if (promise.type === "feature") {
		// Extract keywords from feature description
		const words = promise.identifier.toLowerCase().split(/\s+/);
		for (const word of words) {
			// Check if any export/definition contains this word
			for (const name of [...context.exports, ...context.definitions]) {
				if (name.toLowerCase().includes(word)) {
					return {
						promise,
						fulfilled: true,
						verification: "code-exists",
						evidence: name,
					};
				}
			}
		}
	}

	// Not found anywhere
	return {
		promise,
		fulfilled: false,
		verification: "not-found",
	};
}

// ============================================================================
// Debt Calculation
// ============================================================================

/**
 * Determine severity based on promise type and confidence
 */
function calculateSeverity(promise: DocPromise): DebtSeverity {
	// Explicit MUST requirements are critical
	if (
		promise.type === "requirement" &&
		promise.text.toUpperCase().includes("MUST")
	) {
		return "critical";
	}

	// Explicitly documented functions are critical
	if (promise.type === "function" && promise.confidence === "explicit") {
		return "critical";
	}

	// SHOULD requirements are warnings
	if (
		promise.type === "requirement" &&
		promise.text.toUpperCase().includes("SHOULD")
	) {
		return "warning";
	}

	// API endpoints are warnings
	if (promise.type === "api-endpoint") {
		return "warning";
	}

	// Features and inferred promises are info
	return "info";
}

/**
 * Generate suggestion for resolving debt
 */
function generateSuggestion(promise: DocPromise): string {
	switch (promise.type) {
		case "function":
			return `Implement ${promise.identifier}() or remove from documentation`;
		case "api-endpoint":
			return `Implement endpoint ${promise.identifier} or update API docs`;
		case "requirement":
			return `Add tests for requirement or clarify documentation`;
		case "feature":
			return `Verify feature exists or update feature description`;
		default:
			return `Verify documentation matches implementation`;
	}
}

/**
 * Convert unfulfilled promises to debt items
 */
function promisesToDebts(fulfillments: PromiseFulfillment[]): DocDebt[] {
	return fulfillments
		.filter((f) => !f.fulfilled)
		.map((f) => ({
			promise: f.promise,
			severity: calculateSeverity(f.promise),
			suggestion: generateSuggestion(f.promise),
		}));
}

/**
 * Calculate documentation debt for a project
 */
export async function calculateDebt(
	projectDir: string,
	docOptions: DocRefOptions = {},
	debtOptions: DebtOptions = {},
): Promise<DebtReport> {
	const docOpts = { ...DEFAULT_OPTIONS, ...docOptions };
	const dbtOpts = { ...DEFAULT_DEBT_OPTIONS, ...debtOptions };

	// Extract all promises
	let promises = await extractPromises(projectDir, docOpts);

	// Filter by confidence if needed
	if (!dbtOpts.includeInferred) {
		promises = promises.filter((p) => p.confidence === "explicit");
	}

	// Scan code for exports and definitions
	const [exports, definitions] = await Promise.all([
		scanExports(projectDir, dbtOpts),
		scanSourceDefinitions(projectDir, dbtOpts),
	]);

	const context = { exports, definitions };

	// Verify all promises
	const fulfillments: PromiseFulfillment[] = [];
	for (const promise of promises) {
		const result = await verifyPromise(promise, projectDir, context, docOpts);
		fulfillments.push(result);
	}

	// Calculate debt
	const debts = promisesToDebts(fulfillments);
	const fulfilledCount = fulfillments.filter((f) => f.fulfilled).length;

	return {
		totalPromises: promises.length,
		fulfilledCount,
		debtCount: debts.length,
		fulfillmentRate:
			promises.length > 0 ? (fulfilledCount / promises.length) * 100 : 100,
		fulfillments,
		debts,
	};
}
