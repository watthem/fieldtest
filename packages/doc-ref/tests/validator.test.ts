import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { validateReference, resolveDocPath } from "../src/validator";
import type { DocReference } from "../src/types";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

describe("resolveDocPath", () => {
	it("resolves path with docs/ prefix", () => {
		const result = resolveDocPath("/project", "docs/reference.md");
		expect(result).toBe("/project/docs/reference.md");
	});

	it("resolves path without prefix to docs dir", () => {
		const result = resolveDocPath("/project", "reference.md");
		expect(result).toBe("/project/docs/reference.md");
	});

	it("respects custom docsDir option", () => {
		const result = resolveDocPath("/project", "guide.md", {
			docsDir: "documentation",
		});
		expect(result).toBe("/project/documentation/guide.md");
	});
});

describe("validateReference", () => {
	let tempDir: string;

	beforeAll(() => {
		// Set up a temp project with docs
		tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "doc-ref-validator-"));
		const docsDir = path.join(tempDir, "docs");
		fs.mkdirSync(docsDir);

		// Create a doc file with 100 lines
		const lines = Array.from({ length: 100 }, (_, i) => `Line ${i + 1}`);
		lines[49] = "## How It Works"; // Add a heading at line 50
		fs.writeFileSync(path.join(docsDir, "reference.md"), lines.join("\n"));
	});

	afterAll(() => {
		fs.rmSync(tempDir, { recursive: true });
	});

	it("validates existing doc file", () => {
		const ref: DocReference = {
			testFile: "test.ts",
			docPath: "reference.md",
			raw: "reference.md",
		};

		const result = validateReference(ref, tempDir);
		expect(result.valid).toBe(true);
	});

	it("fails for non-existent doc file", () => {
		const ref: DocReference = {
			testFile: "test.ts",
			docPath: "nonexistent.md",
			raw: "nonexistent.md",
		};

		const result = validateReference(ref, tempDir);
		expect(result.valid).toBe(false);
		expect(result.error).toContain("not found");
	});

	it("validates line reference within range", () => {
		const ref: DocReference = {
			testFile: "test.ts",
			docPath: "reference.md",
			lineRef: 50,
			raw: "reference.md:50",
		};

		const result = validateReference(ref, tempDir);
		expect(result.valid).toBe(true);
	});

	it("fails for line reference beyond file length", () => {
		const ref: DocReference = {
			testFile: "test.ts",
			docPath: "reference.md",
			lineRef: 999,
			raw: "reference.md:999",
		};

		const result = validateReference(ref, tempDir);
		expect(result.valid).toBe(false);
		expect(result.error).toContain("exceeds file length");
	});

	it("validates anchor reference that exists", () => {
		const ref: DocReference = {
			testFile: "test.ts",
			docPath: "reference.md",
			anchorRef: "how-it-works",
			raw: "reference.md#how-it-works",
		};

		const result = validateReference(ref, tempDir);
		expect(result.valid).toBe(true);
	});

	it("fails for anchor reference that does not exist", () => {
		const ref: DocReference = {
			testFile: "test.ts",
			docPath: "reference.md",
			anchorRef: "nonexistent-section",
			raw: "reference.md#nonexistent-section",
		};

		const result = validateReference(ref, tempDir);
		expect(result.valid).toBe(false);
		expect(result.error).toContain("Anchor");
	});
});
