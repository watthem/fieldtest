import { describe, it, expect } from "vitest";
import { parseDocReference, scanTestFile } from "../src/scanner";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

describe("parseDocReference", () => {
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

	it("parses anchor reference", () => {
		const ref = parseDocReference("explainer.md#how-it-works", "test.ts");
		expect(ref).toEqual({
			testFile: "test.ts",
			docPath: "explainer.md",
			anchorRef: "how-it-works",
			raw: "explainer.md#how-it-works",
		});
	});

	it("parses reference with docs/ prefix", () => {
		const ref = parseDocReference("docs/guide.md:50", "test.ts");
		expect(ref).toEqual({
			testFile: "test.ts",
			docPath: "docs/guide.md",
			lineRef: 50,
			raw: "docs/guide.md:50",
		});
	});

	it("returns null for bare .md references without line/anchor", () => {
		const ref = parseDocReference("test.md", "test.ts");
		expect(ref).toBeNull();
	});
});

describe("scanTestFile", () => {
	it("finds all doc references in a test file", () => {
		// Create a temp test file
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
		expect(refs.some((r) => r.lineRef && typeof r.lineRef === "object")).toBe(true);
		expect(refs.some((r) => r.lineRef === 15)).toBe(true);
		expect(refs.some((r) => r.anchorRef === "overview")).toBe(true);

		// Cleanup
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

		// Cleanup
		fs.rmSync(tempDir, { recursive: true });
	});
});
