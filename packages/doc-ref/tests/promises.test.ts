/**
 * Tests for documentation debt detection
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import {
	extractPromisesFromDoc,
	extractPromises,
	scanExports,
	scanSourceDefinitions,
	verifyPromise,
	calculateDebt,
} from "../src/promises";
import { parseMarkdown } from "../src/markdown";
import type { DocPromise } from "../src/types";

// Test fixtures directory
const FIXTURES_DIR = path.join(__dirname, "fixtures", "debt");

describe("Promise Extraction", () => {
	describe("extractPromisesFromDoc", () => {
		it("extracts function from heading with parameters", () => {
			const md = `# API

## registerSchema(name, schema)

Registers a schema with the given name.
`;
			const parsed = parseMarkdown(md);
			const promises = extractPromisesFromDoc(parsed, "api.md");

			expect(promises).toContainEqual(
				expect.objectContaining({
					type: "function",
					identifier: "registerSchema",
					confidence: "explicit",
				}),
			);
		});

		it("extracts function from inline code", () => {
			const md = `# Usage

Call \`validateSchema(data)\` to validate your data.
`;
			const parsed = parseMarkdown(md);
			const promises = extractPromisesFromDoc(parsed, "usage.md");

			expect(promises).toContainEqual(
				expect.objectContaining({
					type: "function",
					identifier: "validateSchema",
					confidence: "explicit",
				}),
			);
		});

		it("extracts function calls from code blocks", () => {
			const md = `# Example

\`\`\`typescript
const result = processData(input);
const validated = validateInput(result);
\`\`\`
`;
			const parsed = parseMarkdown(md);
			const promises = extractPromisesFromDoc(parsed, "example.md");

			const identifiers = promises.map((p) => p.identifier);
			expect(identifiers).toContain("processData");
			expect(identifiers).toContain("validateInput");
		});

		it("filters out common built-ins from code blocks", () => {
			const md = `# Example

\`\`\`typescript
console.log("test");
const arr = Array.from([1, 2, 3]);
if (x > 0) { return true; }
\`\`\`
`;
			const parsed = parseMarkdown(md);
			const promises = extractPromisesFromDoc(parsed, "example.md");

			const identifiers = promises.map((p) => p.identifier);
			expect(identifiers).not.toContain("console");
			expect(identifiers).not.toContain("Array");
			expect(identifiers).not.toContain("if");
			expect(identifiers).not.toContain("return");
		});

		it("extracts API endpoints", () => {
			const md = `# API Endpoints

- GET /api/users
- POST /api/users/:id
- DELETE /api/users/:id
`;
			const parsed = parseMarkdown(md);
			const promises = extractPromisesFromDoc(parsed, "api.md");

			expect(promises).toContainEqual(
				expect.objectContaining({
					type: "api-endpoint",
					identifier: "GET /api/users",
				}),
			);
			expect(promises).toContainEqual(
				expect.objectContaining({
					type: "api-endpoint",
					identifier: "POST /api/users/:id",
				}),
			);
		});

		it("extracts MUST requirements", () => {
			const md = `# Requirements

MUST: validate all input before processing
`;
			const parsed = parseMarkdown(md);
			const promises = extractPromisesFromDoc(parsed, "reqs.md");

			expect(promises).toContainEqual(
				expect.objectContaining({
					type: "requirement",
					identifier: "validate all input before processing",
					confidence: "explicit",
				}),
			);
		});

		it("extracts SHOULD requirements", () => {
			const md = `# Guidelines

SHOULD: provide helpful error messages
`;
			const parsed = parseMarkdown(md);
			const promises = extractPromisesFromDoc(parsed, "guidelines.md");

			expect(promises).toContainEqual(
				expect.objectContaining({
					type: "requirement",
					identifier: "provide helpful error messages",
					confidence: "explicit",
				}),
			);
		});

		it("extracts feature claims as inferred promises", () => {
			const md = `# Features

FieldTest provides automatic validation.
The system supports batch processing.
`;
			const parsed = parseMarkdown(md);
			const promises = extractPromisesFromDoc(parsed, "features.md");

			expect(promises).toContainEqual(
				expect.objectContaining({
					type: "feature",
					confidence: "inferred",
				}),
			);
		});

		it("deduplicates promises by type and identifier", () => {
			const md = `# API

## validateSchema()

Call \`validateSchema()\` to validate.

\`\`\`typescript
validateSchema(data);
\`\`\`
`;
			const parsed = parseMarkdown(md);
			const promises = extractPromisesFromDoc(parsed, "api.md");

			const validatePromises = promises.filter(
				(p) => p.identifier === "validateSchema",
			);
			expect(validatePromises).toHaveLength(1);
		});

		it("includes source location in promises", () => {
			const md = `# API

## myFunction()

Does something.
`;
			const parsed = parseMarkdown(md);
			const promises = extractPromisesFromDoc(parsed, "test.md");

			const promise = promises.find((p) => p.identifier === "myFunction");
			expect(promise?.source).toEqual(
				expect.objectContaining({
					file: "test.md",
					section: "myfunction",
				}),
			);
		});
	});
});

describe("Export Scanning", () => {
	const tempDir = path.join(__dirname, "temp-exports");

	beforeEach(() => {
		fs.mkdirSync(tempDir, { recursive: true });
	});

	afterEach(() => {
		fs.rmSync(tempDir, { recursive: true, force: true });
	});

	it("scans named exports from index file", async () => {
		fs.writeFileSync(
			path.join(tempDir, "index.ts"),
			`export { foo, bar, baz } from "./lib";`,
		);

		const exports = await scanExports(tempDir);

		expect(exports.has("foo")).toBe(true);
		expect(exports.has("bar")).toBe(true);
		expect(exports.has("baz")).toBe(true);
	});

	it("scans direct exports", async () => {
		fs.writeFileSync(
			path.join(tempDir, "index.ts"),
			`
export const myConst = 42;
export function myFunction() {}
export class MyClass {}
export interface MyInterface {}
export type MyType = string;
`,
		);

		const exports = await scanExports(tempDir);

		expect(exports.has("myConst")).toBe(true);
		expect(exports.has("myFunction")).toBe(true);
		expect(exports.has("MyClass")).toBe(true);
		expect(exports.has("MyInterface")).toBe(true);
		expect(exports.has("MyType")).toBe(true);
	});

	it("handles renamed exports", async () => {
		fs.writeFileSync(
			path.join(tempDir, "index.ts"),
			`export { internal as public } from "./lib";`,
		);

		const exports = await scanExports(tempDir);

		expect(exports.has("public")).toBe(true);
		expect(exports.has("internal")).toBe(false);
	});
});

describe("Source Definition Scanning", () => {
	const tempDir = path.join(__dirname, "temp-src");

	beforeEach(() => {
		fs.mkdirSync(path.join(tempDir, "src"), { recursive: true });
	});

	afterEach(() => {
		fs.rmSync(tempDir, { recursive: true, force: true });
	});

	it("scans function declarations", async () => {
		fs.writeFileSync(
			path.join(tempDir, "src", "lib.ts"),
			`
function helper() {}
async function asyncHelper() {}
`,
		);

		const definitions = await scanSourceDefinitions(tempDir);

		expect(definitions.has("helper")).toBe(true);
		expect(definitions.has("asyncHelper")).toBe(true);
	});

	it("scans const/let/var assignments", async () => {
		fs.writeFileSync(
			path.join(tempDir, "src", "lib.ts"),
			`
const myConst = 42;
let myLet = "hello";
var myVar = true;
`,
		);

		const definitions = await scanSourceDefinitions(tempDir);

		expect(definitions.has("myConst")).toBe(true);
		expect(definitions.has("myLet")).toBe(true);
		expect(definitions.has("myVar")).toBe(true);
	});

	it("scans class declarations", async () => {
		fs.writeFileSync(
			path.join(tempDir, "src", "lib.ts"),
			`class MyClass {}`,
		);

		const definitions = await scanSourceDefinitions(tempDir);

		expect(definitions.has("MyClass")).toBe(true);
	});

	it("ignores test files", async () => {
		fs.writeFileSync(
			path.join(tempDir, "src", "lib.test.ts"),
			`function testHelper() {}`,
		);

		const definitions = await scanSourceDefinitions(tempDir);

		expect(definitions.has("testHelper")).toBe(false);
	});
});

describe("Promise Verification", () => {
	it("verifies function is exported", async () => {
		const promise: DocPromise = {
			type: "function",
			identifier: "validateSchema",
			source: { file: "api.md", section: "validation" },
			text: "validateSchema()",
			confidence: "explicit",
		};

		const context = {
			exports: new Set(["validateSchema", "parseDoc"]),
			definitions: new Set<string>(),
		};

		const result = await verifyPromise(promise, "/test", context);

		expect(result.fulfilled).toBe(true);
		expect(result.verification).toBe("export-exists");
	});

	it("verifies function exists in source", async () => {
		const promise: DocPromise = {
			type: "function",
			identifier: "internalHelper",
			source: { file: "api.md", section: "internals" },
			text: "internalHelper()",
			confidence: "explicit",
		};

		const context = {
			exports: new Set<string>(),
			definitions: new Set(["internalHelper"]),
		};

		const result = await verifyPromise(promise, "/test", context);

		expect(result.fulfilled).toBe(true);
		expect(result.verification).toBe("code-exists");
	});

	it("marks function as not found when missing", async () => {
		const promise: DocPromise = {
			type: "function",
			identifier: "missingFunction",
			source: { file: "api.md", section: "api" },
			text: "missingFunction()",
			confidence: "explicit",
		};

		const context = {
			exports: new Set(["existingFunc"]),
			definitions: new Set(["anotherFunc"]),
		};

		const result = await verifyPromise(promise, "/test", context);

		expect(result.fulfilled).toBe(false);
		expect(result.verification).toBe("not-found");
	});

	it("verifies feature by keyword match in code", async () => {
		const promise: DocPromise = {
			type: "feature",
			identifier: "validation support",
			source: { file: "features.md", section: "features" },
			text: "provides validation support",
			confidence: "inferred",
		};

		const context = {
			exports: new Set(["validation", "validate"]),
			definitions: new Set<string>(),
		};

		const result = await verifyPromise(promise, "/test", context);

		expect(result.fulfilled).toBe(true);
		expect(result.verification).toBe("code-exists");
	});
});

describe("Debt Calculation", () => {
	const tempDir = path.join(__dirname, "temp-debt");

	beforeEach(() => {
		fs.mkdirSync(path.join(tempDir, "docs"), { recursive: true });
		fs.mkdirSync(path.join(tempDir, "src"), { recursive: true });
	});

	afterEach(() => {
		fs.rmSync(tempDir, { recursive: true, force: true });
	});

	it("reports no debt when all promises are fulfilled", async () => {
		// Create docs that promise validateSchema
		fs.writeFileSync(
			path.join(tempDir, "docs", "api.md"),
			`# API

## validateSchema()

Validates a schema.
`,
		);

		// Create source that exports validateSchema
		fs.writeFileSync(
			path.join(tempDir, "index.ts"),
			`export { validateSchema } from "./src/lib";`,
		);
		fs.writeFileSync(
			path.join(tempDir, "src", "lib.ts"),
			`export function validateSchema() {}`,
		);

		const report = await calculateDebt(tempDir);

		expect(report.debtCount).toBe(0);
		expect(report.fulfillmentRate).toBe(100);
	});

	it("reports debt for missing functions", async () => {
		// Create docs that promise registerSchema
		fs.writeFileSync(
			path.join(tempDir, "docs", "api.md"),
			`# API

## registerSchema()

Registers a schema.
`,
		);

		// Create source that does NOT export registerSchema
		fs.writeFileSync(path.join(tempDir, "index.ts"), `export const x = 1;`);

		const report = await calculateDebt(tempDir);

		expect(report.debtCount).toBeGreaterThan(0);
		expect(report.debts).toContainEqual(
			expect.objectContaining({
				promise: expect.objectContaining({
					identifier: "registerSchema",
				}),
				severity: "critical",
			}),
		);
	});

	it("calculates correct fulfillment rate", async () => {
		// Create docs with 2 function promises
		fs.writeFileSync(
			path.join(tempDir, "docs", "api.md"),
			`# API

## foo()

Foo function.

## bar()

Bar function.
`,
		);

		// Only export one of them
		fs.writeFileSync(
			path.join(tempDir, "index.ts"),
			`export function foo() {}`,
		);

		const report = await calculateDebt(tempDir);

		expect(report.totalPromises).toBe(2);
		expect(report.fulfilledCount).toBe(1);
		expect(report.debtCount).toBe(1);
		expect(report.fulfillmentRate).toBe(50);
	});

	it("excludes inferred promises by default", async () => {
		fs.writeFileSync(
			path.join(tempDir, "docs", "features.md"),
			`# Features

FieldTest provides automatic validation.
`,
		);

		fs.writeFileSync(path.join(tempDir, "index.ts"), ``);

		const report = await calculateDebt(tempDir, {}, { includeInferred: false });

		// Inferred promises should not be counted
		expect(report.totalPromises).toBe(0);
	});

	it("includes inferred promises when option enabled", async () => {
		fs.writeFileSync(
			path.join(tempDir, "docs", "features.md"),
			`# Features

FieldTest provides automatic validation.
`,
		);

		fs.writeFileSync(path.join(tempDir, "index.ts"), ``);

		const report = await calculateDebt(tempDir, {}, { includeInferred: true });

		// Inferred promises should be counted
		expect(report.totalPromises).toBeGreaterThan(0);
	});

	it("assigns correct severity levels", async () => {
		fs.writeFileSync(
			path.join(tempDir, "docs", "api.md"),
			`# API

## criticalFunction()

Important function.

SHOULD: provide optional feature
`,
		);

		fs.writeFileSync(path.join(tempDir, "index.ts"), ``);

		const report = await calculateDebt(tempDir);

		const functionDebt = report.debts.find(
			(d) => d.promise.identifier === "criticalFunction",
		);
		expect(functionDebt?.severity).toBe("critical");

		const shouldDebt = report.debts.find(
			(d) => d.promise.type === "requirement",
		);
		expect(shouldDebt?.severity).toBe("warning");
	});

	it("generates helpful suggestions", async () => {
		fs.writeFileSync(
			path.join(tempDir, "docs", "api.md"),
			`# API

## missingFunc()

Not implemented.
`,
		);

		fs.writeFileSync(path.join(tempDir, "index.ts"), ``);

		const report = await calculateDebt(tempDir);

		expect(report.debts[0].suggestion).toContain("Implement");
		expect(report.debts[0].suggestion).toContain("missingFunc");
	});
});
