import * as path from "node:path";
import {
	parseInlineBindings,
	extractTables,
	extractCodeExamples,
	extractAssertions,
	generateAnchor,
	parseMarkdownSections,
	loadSpec,
	specSection,
} from "../src/markdown";

describe("parseInlineBindings", () => {
	it("should parse set commands", () => {
		const content = "Set quantity to [100](!set:quantity).";
		const bindings = parseInlineBindings(content);

		expect(bindings).toHaveLength(1);
		expect(bindings[0].value).toBe("100");
		expect(bindings[0].command).toBe("set");
		expect(bindings[0].field).toBe("quantity");
		expect(bindings[0].raw).toBe("[100](!set:quantity)");
	});

	it("should parse verify commands", () => {
		const content = "The total should be [$20.00](!verify:total).";
		const bindings = parseInlineBindings(content);

		expect(bindings).toHaveLength(1);
		expect(bindings[0].value).toBe("$20.00");
		expect(bindings[0].command).toBe("verify");
		expect(bindings[0].field).toBe("total");
	});

	it("should parse execute commands", () => {
		const content = "Now [calculate](!execute:pricing) the result.";
		const bindings = parseInlineBindings(content);

		expect(bindings).toHaveLength(1);
		expect(bindings[0].value).toBe("calculate");
		expect(bindings[0].command).toBe("execute");
		expect(bindings[0].field).toBe("pricing");
	});

	it("should parse multiple bindings", () => {
		const content = `
Set [2](!set:quantity) and [$10.00](!set:unitPrice).
Total: [$20.00](!verify:total).
`;
		const bindings = parseInlineBindings(content);

		expect(bindings).toHaveLength(3);
		expect(bindings[0].command).toBe("set");
		expect(bindings[1].command).toBe("set");
		expect(bindings[2].command).toBe("verify");
	});

	it("should include line numbers", () => {
		const content = `Line 1
[value](!set:field) on line 2
Line 3`;
		const bindings = parseInlineBindings(content);

		expect(bindings).toHaveLength(1);
		expect(bindings[0].line).toBe(2);
	});

	it("should ignore invalid commands", () => {
		const content = "[value](!invalid:field)";
		const bindings = parseInlineBindings(content);

		expect(bindings).toHaveLength(0);
	});
});

describe("extractTables", () => {
	it("should extract a simple table", () => {
		const content = `
| Header1 | Header2 |
|---------|---------|
| value1  | value2  |
| value3  | value4  |
`;
		const tables = extractTables(content);

		expect(tables).toHaveLength(1);
		expect(tables[0].headers).toEqual(["Header1", "Header2"]);
		expect(tables[0].rows).toHaveLength(2);
		expect(tables[0].rows[0]).toEqual(["value1", "value2"]);
	});

	it("should handle multiple tables", () => {
		const content = `
| A | B |
|---|---|
| 1 | 2 |

Some text

| C | D |
|---|---|
| 3 | 4 |
`;
		const tables = extractTables(content);

		expect(tables).toHaveLength(2);
	});
});

describe("extractCodeExamples", () => {
	it("should extract code blocks with language", () => {
		const content = `
\`\`\`javascript
const x = 1;
\`\`\`
`;
		const examples = extractCodeExamples(content);

		expect(examples).toHaveLength(1);
		expect(examples[0].language).toBe("javascript");
		expect(examples[0].code).toBe("const x = 1;");
	});

	it("should handle multiple languages", () => {
		const content = `
\`\`\`typescript
type Foo = string;
\`\`\`

\`\`\`python
x = 1
\`\`\`
`;
		const examples = extractCodeExamples(content);

		expect(examples).toHaveLength(2);
		expect(examples[0].language).toBe("typescript");
		expect(examples[1].language).toBe("python");
	});

	it("should default to text for unspecified language", () => {
		const content = `
\`\`\`
plain text
\`\`\`
`;
		const examples = extractCodeExamples(content);

		expect(examples[0].language).toBe("text");
	});
});

describe("extractAssertions", () => {
	it("should extract MUST assertions", () => {
		const content = "The system MUST validate all inputs.";
		const assertions = extractAssertions(content);

		expect(assertions).toHaveLength(1);
		expect(assertions[0].type).toBe("MUST");
		expect(assertions[0].text).toBe("validate all inputs.");
	});

	it("should extract SHOULD assertions", () => {
		const content = "The API SHOULD return helpful errors.";
		const assertions = extractAssertions(content);

		expect(assertions[0].type).toBe("SHOULD");
	});

	it("should extract MUST NOT and SHOULD NOT", () => {
		const content = `
The system MUST NOT expose secrets.
It SHOULD NOT log passwords.
`;
		const assertions = extractAssertions(content);

		expect(assertions).toHaveLength(2);
		expect(assertions[0].type).toBe("MUST NOT");
		expect(assertions[1].type).toBe("SHOULD NOT");
	});

	it("should include line numbers", () => {
		const content = `Line 1
MUST be on line 2
Line 3`;
		const assertions = extractAssertions(content);

		expect(assertions[0].line).toBe(2);
	});
});

describe("generateAnchor", () => {
	it("should create lowercase anchor", () => {
		expect(generateAnchor("Hello World")).toBe("hello-world");
	});

	it("should remove special characters", () => {
		expect(generateAnchor("Hello, World!")).toBe("hello-world");
	});

	it("should handle multiple spaces", () => {
		expect(generateAnchor("Hello   World")).toBe("hello-world");
	});
});

describe("parseMarkdownSections", () => {
	it("should parse sections from markdown", () => {
		const content = `
# Title

Introduction text.

## Section 1

Content for section 1.

## Section 2

Content for section 2.
`;
		const sections = parseMarkdownSections(content);

		expect(sections).toHaveLength(3);
		expect(sections[0].title).toBe("Title");
		expect(sections[0].level).toBe(1);
		expect(sections[1].title).toBe("Section 1");
		expect(sections[2].title).toBe("Section 2");
	});

	it("should extract tables within sections", () => {
		const content = `
# Section

| A | B |
|---|---|
| 1 | 2 |
`;
		const sections = parseMarkdownSections(content);

		expect(sections[0].tables).toHaveLength(1);
	});

	it("should extract bindings within sections", () => {
		const content = `
# Section

Set [value](!set:field) here.
`;
		const sections = parseMarkdownSections(content);

		expect(sections[0].bindings).toHaveLength(1);
	});
});

describe("loadSpec", () => {
	const fixturesDir = path.join(__dirname, "fixtures");

	it("should load a spec file", () => {
		const spec = loadSpec(path.join(fixturesDir, "simple.md"));

		expect(spec.sections.length).toBeGreaterThan(0);
		expect(spec.raw).toContain("Simple Test Document");
	});

	it("should target a specific section with anchor", () => {
		const spec = loadSpec(path.join(fixturesDir, "simple.md") + "#data-table");

		expect(spec.targetSection).toBeDefined();
		expect(spec.targetSection?.title).toBe("Data Table");
	});

	it("should throw on missing file by default", () => {
		expect(() => loadSpec("nonexistent.md")).toThrow();
	});

	it("should return empty spec when throwOnMissing is false", () => {
		const spec = loadSpec("nonexistent.md", { throwOnMissing: false });

		expect(spec.sections).toHaveLength(0);
	});
});

describe("specSection", () => {
	const fixturesDir = path.join(__dirname, "fixtures");

	it("should be an alias for loadSpec", () => {
		const spec = specSection(path.join(fixturesDir, "simple.md"));

		expect(spec.sections.length).toBeGreaterThan(0);
	});
});
