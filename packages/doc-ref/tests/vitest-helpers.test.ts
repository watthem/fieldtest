import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import {
	specSection,
	linkedDescribe,
	linkedIt,
	fromSpec,
	testFromExamples,
	testFromTable,
	testAssertions,
	createSpecMatcher,
} from "../src/vitest";

describe("vitest helpers", () => {
	let tempDir: string;
	let docsDir: string;

	beforeAll(() => {
		// Create temp directory with test docs
		tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "doc-ref-vitest-test-"));
		docsDir = path.join(tempDir, "docs");
		fs.mkdirSync(docsDir);

		// Create a test markdown file
		fs.writeFileSync(
			path.join(docsDir, "api.md"),
			`# API Reference

This is the API reference.

## Authentication

MUST: Include API key in header
SHOULD: Use Bearer token format

\`\`\`typescript
const headers = { Authorization: "Bearer xxx" };
\`\`\`

## Rate Limits

| plan | limit |
|------|-------|
| free | 100   |
| pro  | 600   |

## Examples

\`\`\`
input: [1, 2, 3]
expected: 6
\`\`\`

\`\`\`
input: {"name": "test"}
expected: true
\`\`\`
`,
		);
	});

	afterAll(() => {
		fs.rmSync(tempDir, { recursive: true });
	});

	describe("specSection", () => {
		it("loads a specific section", async () => {
			const spec = await specSection("api.md#authentication", {
				docsRoot: docsDir,
			});

			expect(spec.title).toBe("Authentication");
			expect(spec.slug).toBe("authentication");
			expect(spec.content).toContain("Bearer");
			expect(spec.specPath).toBe("api.md#authentication");
			expect(spec.file).toContain("api.md");
		});

		it("loads entire file without anchor", async () => {
			const spec = await specSection("api.md", { docsRoot: docsDir });

			expect(spec.title).toBe("api.md");
			expect(spec.allSections).toBeDefined();
			expect(spec.allSections!.length).toBe(4); // API Reference, Auth, Rate Limits, Examples
		});

		it("extracts assertions from section", async () => {
			const spec = await specSection("api.md#authentication", {
				docsRoot: docsDir,
			});

			expect(spec.assertions.length).toBe(2);
			expect(spec.assertions[0].keyword).toBe("MUST");
			expect(spec.assertions[1].keyword).toBe("SHOULD");
		});

		it("extracts examples from section", async () => {
			const spec = await specSection("api.md#authentication", {
				docsRoot: docsDir,
			});

			expect(spec.examples.length).toBe(1);
			expect(spec.examples[0].lang).toBe("typescript");
		});

		it("throws for non-existent file", async () => {
			await expect(
				specSection("nonexistent.md", { docsRoot: docsDir }),
			).rejects.toThrow("Documentation file not found");
		});

		it("throws for non-existent section", async () => {
			await expect(
				specSection("api.md#nonexistent", { docsRoot: docsDir }),
			).rejects.toThrow("Section not found");
		});
	});

	describe("linkedDescribe", () => {
		it("is a function that takes spec and callback", async () => {
			// linkedDescribe calls describe() internally, which can't be called inside it()
			// We verify the function exists and has the right signature
			expect(linkedDescribe).toBeTypeOf("function");
			expect(linkedDescribe.length).toBe(2); // 2 params: spec, fn
		});
	});

	describe("linkedIt", () => {
		it("is a function that takes spec, description, and callback", () => {
			// linkedIt calls it() internally, which can't be called inside it()
			// We verify the function exists and has the right signature
			expect(linkedIt).toBeTypeOf("function");
			expect(linkedIt.length).toBe(3); // 3 params: spec, description, fn
		});
	});

	describe("fromSpec", () => {
		it("provides section helper", () => {
			const api = fromSpec("api.md", { docsRoot: docsDir });

			expect(api.section).toBeTypeOf("function");
			expect(api.allSections).toBeTypeOf("function");
		});

		it("section helper is a function", () => {
			const api = fromSpec("api.md", { docsRoot: docsDir });
			// section() calls describe() internally, can't test inside it()
			expect(api.section).toBeTypeOf("function");
		});

		it("allSections helper is a function", () => {
			const api = fromSpec("api.md", { docsRoot: docsDir });
			// allSections() calls describe() internally, can't test inside it()
			expect(api.allSections).toBeTypeOf("function");
		});
	});

	describe("testFromExamples", () => {
		it("is a function that takes spec and callback", () => {
			// testFromExamples calls describe()/it() internally, can't test inside it()
			expect(testFromExamples).toBeTypeOf("function");
			expect(testFromExamples.length).toBe(2);
		});

		it("spec examples section has structured examples", async () => {
			const spec = await specSection("api.md#examples", { docsRoot: docsDir });
			// Verify the examples exist (the helper would use these)
			expect(spec.examples.length).toBe(2);
			expect(spec.examples[0].input).toBeDefined();
			expect(spec.examples[0].expected).toBeDefined();
		});

		it("auth section has no structured examples", async () => {
			const spec = await specSection("api.md#authentication", {
				docsRoot: docsDir,
			});
			// Auth section has code but no input/expected pattern
			expect(spec.examples[0].input).toBeUndefined();
		});
	});

	describe("testFromTable", () => {
		it("is a function that takes spec, tableIndex, and callback", () => {
			// testFromTable calls describe()/it() internally, can't test inside it()
			expect(testFromTable).toBeTypeOf("function");
			expect(testFromTable.length).toBe(3);
		});

		it("rate-limits section has table content", async () => {
			const spec = await specSection("api.md#rate-limits", {
				docsRoot: docsDir,
			});
			// Verify the table exists (the helper would use this)
			expect(spec.content).toContain("| plan | limit |");
		});
	});

	describe("testAssertions", () => {
		it("is a function that takes spec and callback", () => {
			// testAssertions calls describe()/it() internally, can't test inside it()
			expect(testAssertions).toBeTypeOf("function");
			expect(testAssertions.length).toBe(2);
		});

		it("auth section has assertions", async () => {
			const spec = await specSection("api.md#authentication", {
				docsRoot: docsDir,
			});
			// Verify assertions exist (the helper would use these)
			expect(spec.assertions.length).toBe(2);
		});
	});

	describe("createSpecMatcher", () => {
		it("creates a matcher function", () => {
			const matcher = createSpecMatcher();

			expect(matcher).toBeTypeOf("function");
		});

		it("matcher returns pass for truthy values", () => {
			const matcher = createSpecMatcher();
			const assertion = { type: "requirement" as const, text: "must return true" };

			const result = matcher(assertion)(true);

			expect(result.pass).toBe(true);
		});

		it("matcher returns fail for falsy values", () => {
			const matcher = createSpecMatcher();
			const assertion = { type: "requirement" as const, text: "must return true" };

			const result = matcher(assertion)(false);

			expect(result.pass).toBe(false);
			expect(result.message()).toContain("must return true");
		});
	});
});

// Integration test with actual file structure
describe("vitest helpers with matchstick docs", () => {
	const matchstickDocsDir =
		"/home/watthem/git/matchstick/repos/matchstick-radar-daas/docs/public";

	it("loads matchstick api.md#rate-limits", async () => {
		// Skip if matchstick isn't available
		if (!fs.existsSync(path.join(matchstickDocsDir, "reference/api.md"))) {
			return;
		}

		const spec = await specSection("reference/api.md#rate-limits", {
			docsRoot: matchstickDocsDir,
		});

		expect(spec.title).toBe("Rate Limits");
		expect(spec.slug).toBe("rate-limits");
		console.log("Matchstick rate-limits section:", {
			title: spec.title,
			line: spec.line,
			contentPreview: spec.content.slice(0, 100),
		});
	});

	it("loads matchstick api.md#authentication", async () => {
		if (!fs.existsSync(path.join(matchstickDocsDir, "reference/api.md"))) {
			return;
		}

		const spec = await specSection("reference/api.md#authentication", {
			docsRoot: matchstickDocsDir,
		});

		expect(spec.title).toBe("Authentication");
		expect(spec.examples.length).toBeGreaterThan(0);
		console.log("Matchstick authentication section:", {
			title: spec.title,
			exampleCount: spec.examples.length,
		});
	});
});
