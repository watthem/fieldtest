import { describe, it, expect } from "vitest";
import { parseDocReference, scanTestFile } from "../src/scanner";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

describe("parseDocReference", () => {
	describe("DOC: comment pattern", () => {
		it("parses DOC: with simple path", () => {
			const ref = parseDocReference("DOC: reference.md", "test.ts");
			expect(ref).toEqual({
				testFile: "test.ts",
				docPath: "reference.md",
				raw: "DOC: reference.md",
			});
		});

		it("parses DOC: with nested path", () => {
			const ref = parseDocReference(
				"DOC: docs/public/reference/api.md",
				"test.ts",
			);
			expect(ref).toEqual({
				testFile: "test.ts",
				docPath: "docs/public/reference/api.md",
				raw: "DOC: docs/public/reference/api.md",
			});
		});

		it("parses DOC: with docs/ prefix", () => {
			const ref = parseDocReference("DOC: docs/guide.md", "test.ts");
			expect(ref).toEqual({
				testFile: "test.ts",
				docPath: "docs/guide.md",
				raw: "DOC: docs/guide.md",
			});
		});
	});

	describe("line reference pattern", () => {
		it("parses simple line reference", () => {
			const ref = parseDocReference("reference.md:207", "test.ts");
			expect(ref).toEqual({
				testFile: "test.ts",
				docPath: "reference.md",
				lineRef: 207,
				raw: "reference.md:207",
			});
		});

		it("parses line range reference", () => {
			const ref = parseDocReference("docs/reference.md:206-209", "test.ts");
			expect(ref).toEqual({
				testFile: "test.ts",
				docPath: "docs/reference.md",
				lineRef: { start: 206, end: 209 },
				raw: "docs/reference.md:206-209",
			});
		});

		it("parses nested path with line reference", () => {
			const ref = parseDocReference(
				"docs/public/reference/api.md:50",
				"test.ts",
			);
			expect(ref).toEqual({
				testFile: "test.ts",
				docPath: "docs/public/reference/api.md",
				lineRef: 50,
				raw: "docs/public/reference/api.md:50",
			});
		});
	});

	describe("anchor reference pattern", () => {
		it("parses anchor reference", () => {
			const ref = parseDocReference("explainer.md#how-it-works", "test.ts");
			expect(ref).toEqual({
				testFile: "test.ts",
				docPath: "explainer.md",
				anchorRef: "how-it-works",
				raw: "explainer.md#how-it-works",
			});
		});

		it("parses nested path with anchor", () => {
			const ref = parseDocReference(
				"docs/guides/setup.md#installation",
				"test.ts",
			);
			expect(ref).toEqual({
				testFile: "test.ts",
				docPath: "docs/guides/setup.md",
				anchorRef: "installation",
				raw: "docs/guides/setup.md#installation",
			});
		});
	});

	describe("parenthesized path pattern", () => {
		it("parses parenthesized simple path", () => {
			const ref = parseDocReference("(api.md)", "test.ts");
			expect(ref).toEqual({
				testFile: "test.ts",
				docPath: "api.md",
				raw: "(api.md)",
			});
		});

		it("parses parenthesized nested path", () => {
			const ref = parseDocReference(
				"(docs/public/reference/api.md)",
				"test.ts",
			);
			expect(ref).toEqual({
				testFile: "test.ts",
				docPath: "docs/public/reference/api.md",
				raw: "(docs/public/reference/api.md)",
			});
		});
	});

	describe("non-matches", () => {
		it("returns null for bare .md references without pattern", () => {
			const ref = parseDocReference("test.md", "test.ts");
			expect(ref).toBeNull();
		});

		it("returns null for random text", () => {
			const ref = parseDocReference("some random text", "test.ts");
			expect(ref).toBeNull();
		});
	});
});

describe("scanTestFile", () => {
	it("finds DOC: comment references", () => {
		const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "doc-ref-test-"));
		const testFile = path.join(tempDir, "example.test.ts");

		fs.writeFileSync(
			testFile,
			`
			/**
			 * DOC: docs/public/reference/api.md
			 * Section: Rate Limits
			 */
			describe("Rate Limits", () => {
				it("limits requests", () => {});
			});
		`,
		);

		const refs = scanTestFile(testFile);

		expect(refs.length).toBe(1);
		expect(refs[0].docPath).toBe("docs/public/reference/api.md");

		fs.rmSync(tempDir, { recursive: true });
	});

	it("finds parenthesized doc paths in describe strings", () => {
		const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "doc-ref-test-"));
		const testFile = path.join(tempDir, "example.test.ts");

		fs.writeFileSync(
			testFile,
			`
			describe("Rate Limits (docs/public/reference/api.md)", () => {
				it("limits requests", () => {});
			});
		`,
		);

		const refs = scanTestFile(testFile);

		expect(refs.length).toBe(1);
		expect(refs[0].docPath).toBe("docs/public/reference/api.md");

		fs.rmSync(tempDir, { recursive: true });
	});

	it("finds all doc references in a test file", () => {
		const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "doc-ref-test-"));
		const testFile = path.join(tempDir, "example.test.ts");

		fs.writeFileSync(
			testFile,
			`
			/**
			 * Validates claims from docs/reference.md:
			 * - Feature A (lines 10-20)
			 */
			describe("Feature A (reference.md:10-20)", () => {
				it("does something (reference.md:15)", () => {
					// implementation
				});
			});

			// See explainer.md#overview for details
			describe("Overview", () => {});
		`,
		);

		const refs = scanTestFile(testFile);

		expect(refs.length).toBeGreaterThanOrEqual(3);
		expect(refs.some((r) => r.lineRef && typeof r.lineRef === "object")).toBe(
			true,
		);
		expect(refs.some((r) => r.lineRef === 15)).toBe(true);
		expect(refs.some((r) => r.anchorRef === "overview")).toBe(true);

		fs.rmSync(tempDir, { recursive: true });
	});

	it("deduplicates references to the same doc", () => {
		const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "doc-ref-test-"));
		const testFile = path.join(tempDir, "example.test.ts");

		fs.writeFileSync(
			testFile,
			`
			/**
			 * DOC: docs/api.md
			 */
			describe("Test (docs/api.md)", () => {
				// DOC: docs/api.md
				it("works", () => {});
			});
		`,
		);

		const refs = scanTestFile(testFile);

		// Should dedupe - same docPath with no line/anchor
		expect(refs.length).toBe(1);
		expect(refs[0].docPath).toBe("docs/api.md");

		fs.rmSync(tempDir, { recursive: true });
	});

	it("keeps distinct line references to same doc", () => {
		const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "doc-ref-test-"));
		const testFile = path.join(tempDir, "example.test.ts");

		fs.writeFileSync(
			testFile,
			`
			describe("Feature A (reference.md:10)", () => {});
			describe("Feature B (reference.md:20)", () => {});
		`,
		);

		const refs = scanTestFile(testFile);

		expect(refs.length).toBe(2);
		expect(refs.some((r) => r.lineRef === 10)).toBe(true);
		expect(refs.some((r) => r.lineRef === 20)).toBe(true);

		fs.rmSync(tempDir, { recursive: true });
	});

	it("returns empty array for file with no references", () => {
		const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "doc-ref-test-"));
		const testFile = path.join(tempDir, "no-refs.test.ts");

		fs.writeFileSync(
			testFile,
			`
			describe("Some tests", () => {
				it("does something", () => {
					expect(1 + 1).toBe(2);
				});
			});
		`,
		);

		const refs = scanTestFile(testFile);
		expect(refs).toEqual([]);

		fs.rmSync(tempDir, { recursive: true });
	});

	it("handles matchstick-style test file", () => {
		const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "doc-ref-test-"));
		const testFile = path.join(tempDir, "api-docs.test.ts");

		// This is based on the actual matchstick api-docs.test.ts pattern
		fs.writeFileSync(
			testFile,
			`
/**
 * API Documentation Validation Tests
 *
 * These tests validate that code behavior matches documented claims.
 * Source of truth: docs/public/reference/api.md
 */

/**
 * DOC: docs/public/reference/api.md
 * Section: Rate Limits
 */
describe("Rate Limits (docs/public/reference/api.md)", () => {
  it("Free plan: 100 requests/minute", () => {});
  it("Pro plan: 600 requests/minute", () => {});
});

/**
 * DOC: docs/public/reference/api.md
 * Section: Authentication
 */
describe("Authentication (docs/public/reference/api.md)", () => {
  it("extracts API key from Authorization header", () => {});
});
		`,
		);

		const refs = scanTestFile(testFile);

		// Should find the DOC: references (2 unique) and the parenthesized refs
		// DOC: refs are deduped with paren refs since they point to same doc
		expect(refs.length).toBeGreaterThanOrEqual(1);
		expect(refs.some((r) => r.docPath === "docs/public/reference/api.md")).toBe(
			true,
		);

		fs.rmSync(tempDir, { recursive: true });
	});
});
