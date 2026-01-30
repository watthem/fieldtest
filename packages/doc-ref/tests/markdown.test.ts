import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import {
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
} from "../src/markdown";

describe("slugify", () => {
	it("converts to lowercase", () => {
		expect(slugify("Hello World")).toBe("hello-world");
	});

	it("replaces spaces with hyphens", () => {
		expect(slugify("rate limits")).toBe("rate-limits");
	});

	it("removes special characters", () => {
		expect(slugify("What's New?")).toBe("whats-new");
	});

	it("handles multiple spaces", () => {
		expect(slugify("API   Reference")).toBe("api-reference");
	});

	it("handles already-slugified text", () => {
		expect(slugify("already-slugified")).toBe("already-slugified");
	});
});

describe("parseMarkdown", () => {
	it("extracts sections from headings", () => {
		const content = `
# Introduction

This is the intro.

## Getting Started

How to get started.

### Installation

Install instructions.
`;
		const parsed = parseMarkdown(content);

		expect(parsed.anchors).toContain("introduction");
		expect(parsed.anchors).toContain("getting-started");
		expect(parsed.anchors).toContain("installation");
		expect(parsed.sections.size).toBe(3);
	});

	it("captures section content", () => {
		const content = `
# Rate Limits

Each plan has different limits:
- Free: 100/min
- Pro: 600/min
`;
		const parsed = parseMarkdown(content);
		const section = parsed.sections.get("rate-limits");

		expect(section).toBeDefined();
		expect(section?.content).toContain("Free: 100/min");
		expect(section?.content).toContain("Pro: 600/min");
	});

	it("tracks line numbers", () => {
		const content = `Line 1
# First Section
Content
# Second Section
More content`;
		const parsed = parseMarkdown(content);

		expect(parsed.sections.get("first-section")?.line).toBe(2);
		expect(parsed.sections.get("second-section")?.line).toBe(4);
	});

	it("returns line count", () => {
		const content = "Line 1\nLine 2\nLine 3\nLine 4";
		const parsed = parseMarkdown(content);
		expect(parsed.lineCount).toBe(4);
	});
});

describe("extractExamples", () => {
	it("extracts code blocks", () => {
		const content = `
Some text.

\`\`\`typescript
const x = 1;
\`\`\`

More text.

\`\`\`json
{"key": "value"}
\`\`\`
`;
		const examples = extractExamples(content);

		expect(examples).toHaveLength(2);
		expect(examples[0].lang).toBe("typescript");
		expect(examples[0].code).toBe("const x = 1;");
		expect(examples[1].lang).toBe("json");
	});

	it("extracts code blocks with meta", () => {
		const content = `
\`\`\`typescript:example
const x = 1;
\`\`\`
`;
		const examples = extractExamples(content);

		expect(examples[0].meta).toBe("example");
	});

	it("defaults to text for unspecified language", () => {
		const content = `
\`\`\`
plain text
\`\`\`
`;
		const examples = extractExamples(content);

		expect(examples[0].lang).toBe("text");
	});
});

describe("parseStructuredExample", () => {
	it("parses input/output patterns", () => {
		const code = `
input: [1, 2, 3]
output: 6
`;
		const result = parseStructuredExample(code);

		expect(result.input).toEqual([1, 2, 3]);
		expect(result.expected).toBe(6);
	});

	it("parses input/expected patterns", () => {
		const code = `
input: {"name": "test"}
expected: true
`;
		const result = parseStructuredExample(code);

		expect(result.input).toEqual({ name: "test" });
		expect(result.expected).toBe(true);
	});

	it("keeps strings for non-JSON values", () => {
		const code = `
input: hello world
output: goodbye
`;
		const result = parseStructuredExample(code);

		expect(result.input).toBe("hello world");
		expect(result.expected).toBe("goodbye");
	});

	it("returns empty object for no patterns", () => {
		const code = "const x = 1;";
		const result = parseStructuredExample(code);

		expect(result.input).toBeUndefined();
		expect(result.expected).toBeUndefined();
	});
});

describe("extractAssertions", () => {
	it("extracts MUST requirements", () => {
		const content = `
MUST: return a valid response
SHOULD: log the request
`;
		const assertions = extractAssertions(content);

		expect(assertions).toHaveLength(2);
		expect(assertions[0].type).toBe("requirement");
		expect(assertions[0].keyword).toBe("MUST");
		expect(assertions[0].text).toBe("return a valid response");
	});

	it("extracts Gherkin patterns", () => {
		const content = `
Given a user is logged in
When they click the button
Then they see a confirmation
`;
		const assertions = extractAssertions(content);

		expect(assertions.filter((a) => a.type === "gherkin")).toHaveLength(3);
		expect(assertions[0].keyword).toBe("Given");
	});

	it("extracts behavior bullets", () => {
		const content = `
- should return 200 for valid requests
- must validate input parameters
- will retry on failure
`;
		const assertions = extractAssertions(content);

		expect(assertions.filter((a) => a.type === "behavior")).toHaveLength(3);
	});
});

describe("parseTable", () => {
	it("parses simple table", () => {
		const markdown = `
| input | expected |
|-------|----------|
| 1     | 2        |
| 2     | 4        |
`;
		const rows = parseTable(markdown);

		expect(rows).toHaveLength(2);
		expect(rows[0].input).toBe(1);
		expect(rows[0].expected).toBe(2);
		expect(rows[1].input).toBe(2);
		expect(rows[1].expected).toBe(4);
	});

	it("parses JSON values in cells", () => {
		const markdown = `
| input | expected |
|-------|----------|
| [1,2] | 3        |
`;
		const rows = parseTable(markdown);

		expect(rows[0].input).toEqual([1, 2]);
	});

	it("keeps strings for non-JSON", () => {
		const markdown = `
| name  | status |
|-------|--------|
| Alice | active |
`;
		const rows = parseTable(markdown);

		expect(rows[0].name).toBe("Alice");
		expect(rows[0].status).toBe("active");
	});

	it("returns empty array for invalid table", () => {
		const markdown = "not a table";
		const rows = parseTable(markdown);

		expect(rows).toEqual([]);
	});
});

describe("extractTables", () => {
	it("finds all tables in content", () => {
		const content = `
Some intro text.

| a | b |
|---|---|
| 1 | 2 |

More text.

| x | y |
|---|---|
| 3 | 4 |
`;
		const tables = extractTables(content);

		expect(tables).toHaveLength(2);
		expect(tables[0][0].a).toBe(1);
		expect(tables[1][0].x).toBe(3);
	});
});

describe("file operations", () => {
	let tempDir: string;
	let testFile: string;

	beforeAll(() => {
		tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "doc-ref-md-test-"));
		testFile = path.join(tempDir, "test.md");
		fs.writeFileSync(
			testFile,
			`
# API Reference

This is the API reference.

## Authentication

MUST: Include API key in header

\`\`\`typescript
const headers = { Authorization: "Bearer xxx" };
\`\`\`

## Rate Limits

| plan | limit |
|------|-------|
| free | 100   |
| pro  | 600   |
`,
		);
	});

	afterAll(() => {
		fs.rmSync(tempDir, { recursive: true });
	});

	describe("parseMarkdownFile", () => {
		it("parses file from disk", () => {
			const parsed = parseMarkdownFile(testFile);

			expect(parsed.anchors).toContain("api-reference");
			expect(parsed.anchors).toContain("authentication");
			expect(parsed.anchors).toContain("rate-limits");
		});
	});

	describe("hasAnchor", () => {
		it("returns true for existing anchor", () => {
			expect(hasAnchor(testFile, "authentication")).toBe(true);
		});

		it("returns false for non-existing anchor", () => {
			expect(hasAnchor(testFile, "nonexistent")).toBe(false);
		});
	});

	describe("getSection", () => {
		it("returns section by anchor", () => {
			const section = getSection(testFile, "authentication");

			expect(section).toBeDefined();
			expect(section?.title).toBe("Authentication");
			expect(section?.assertions).toHaveLength(1);
			expect(section?.examples).toHaveLength(1);
		});

		it("returns undefined for non-existing anchor", () => {
			const section = getSection(testFile, "nonexistent");
			expect(section).toBeUndefined();
		});
	});

	describe("getSections", () => {
		it("returns all sections", () => {
			const sections = getSections(testFile);

			expect(sections).toHaveLength(3);
			expect(sections.map((s) => s.slug)).toContain("api-reference");
			expect(sections.map((s) => s.slug)).toContain("authentication");
			expect(sections.map((s) => s.slug)).toContain("rate-limits");
		});
	});
});

describe("integration with matchstick docs", () => {
	it("parses matchstick api.md correctly", () => {
		const apiDocPath =
			"/home/watthem/git/matchstick/repos/matchstick-radar-daas/docs/public/reference/api.md";

		// Skip if file doesn't exist (CI environment)
		if (!fs.existsSync(apiDocPath)) {
			return;
		}

		const parsed = parseMarkdownFile(apiDocPath);

		// Should have sections
		expect(parsed.sections.size).toBeGreaterThan(0);

		// Should have anchors
		expect(parsed.anchors.length).toBeGreaterThan(0);

		// Log for debugging
		console.log("Matchstick api.md anchors:", parsed.anchors);
	});
});
