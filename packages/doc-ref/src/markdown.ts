/**
 * Markdown Parsing Utilities for Doc-Driven Testing
 *
 * Parses markdown files to extract:
 * - Sections by heading (with slugified anchors)
 * - Code examples from fenced code blocks
 * - Assertions from MUST/SHOULD/Given/When/Then patterns
 * - Tables as structured data
 */

import * as fs from "node:fs";
import type {
	CodeExample,
	DocAssertion,
	DocSection,
	ParsedDoc,
	TableRow,
} from "./types";

/**
 * Convert heading text to a URL-friendly slug
 * Matches how VitePress/GitHub generate anchor links
 */
export function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^\w\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.trim();
}

/**
 * Extract code examples from markdown content (fenced code blocks)
 */
export function extractExamples(content: string): CodeExample[] {
	const examples: CodeExample[] = [];
	const codeBlockRegex = /```(\w+)?(?::([^\n]+))?\n([\s\S]*?)```/g;

	let match: RegExpExecArray | null;
	while ((match = codeBlockRegex.exec(content)) !== null) {
		const [, lang, meta, code] = match;
		const example: CodeExample = {
			lang: lang || "text",
			meta: meta || "",
			code: code.trim(),
		};

		// Parse structured examples (input/output format)
		const structured = parseStructuredExample(code.trim());
		if (structured.input !== undefined) {
			example.input = structured.input;
		}
		if (structured.expected !== undefined) {
			example.expected = structured.expected;
		}

		examples.push(example);
	}

	return examples;
}

/**
 * Parse structured examples that follow input → output patterns
 *
 * Supports formats like:
 *   input: [1, 2, 3]
 *   output: 6
 *
 * Or:
 *   input: { "name": "test" }
 *   expected: true
 */
export function parseStructuredExample(code: string): {
	input?: unknown;
	expected?: unknown;
} {
	const inputMatch = code.match(/input:\s*(.+)/i);
	const outputMatch = code.match(/output:\s*(.+)/i);
	const expectedMatch = code.match(/expected:\s*(.+)/i);

	const result: { input?: unknown; expected?: unknown } = {};

	if (inputMatch) {
		try {
			result.input = JSON.parse(inputMatch[1].trim());
		} catch {
			result.input = inputMatch[1].trim();
		}
	}

	if (outputMatch || expectedMatch) {
		const value = (outputMatch || expectedMatch)![1].trim();
		try {
			result.expected = JSON.parse(value);
		} catch {
			result.expected = value;
		}
	}

	return result;
}

/**
 * Extract assertion-like statements from markdown
 *
 * Looks for patterns like:
 *   - MUST: <requirement>
 *   - SHOULD: <requirement>
 *   - SHALL: <requirement>
 *   - REQUIRE: <requirement>
 *   - Given X, When Y, Then Z (Gherkin)
 *   - Bullet points starting with "should", "must", etc.
 */
export function extractAssertions(content: string): DocAssertion[] {
	const assertions: DocAssertion[] = [];

	// MUST/SHOULD/SHALL patterns
	const mustMatches = content.matchAll(
		/(?:MUST|SHALL|SHOULD|REQUIRES?):\s*(.+)/gi,
	);
	for (const match of mustMatches) {
		assertions.push({
			type: "requirement",
			text: match[1].trim(),
			keyword: match[0].split(":")[0].toUpperCase(),
		});
	}

	// Given/When/Then patterns (Gherkin-lite)
	const gherkinMatches = content.matchAll(/(?:Given|When|Then|And)\s+(.+)/gi);
	for (const match of gherkinMatches) {
		assertions.push({
			type: "gherkin",
			text: match[1].trim(),
			keyword: match[0].split(/\s/)[0],
		});
	}

	// Bullet points that look like requirements (start with action verbs)
	const bulletMatches = content.matchAll(
		/^[-*]\s+((?:should|must|will|shall|can|cannot)\s+.+)/gim,
	);
	for (const match of bulletMatches) {
		assertions.push({
			type: "behavior",
			text: match[1].trim(),
		});
	}

	return assertions;
}

/**
 * Parse a markdown file and extract sections by heading
 *
 * Each section includes:
 * - Title and slug (anchor)
 * - Content (text between this heading and the next)
 * - Code examples
 * - Assertions
 */
export function parseMarkdown(content: string): ParsedDoc {
	const sections = new Map<string, DocSection>();
	const lines = content.split("\n");

	let currentSection: Partial<DocSection> | null = null;
	let currentContent: string[] = [];

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		// Match markdown headings: # ## ### etc
		const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);

		// Match HTML id attributes
		const htmlIdMatch = line.match(/id=["']([^"']+)["']/);

		if (headingMatch) {
			// Save previous section
			if (currentSection && currentSection.slug) {
				const contentStr = currentContent.join("\n").trim();
				sections.set(currentSection.slug, {
					title: currentSection.title!,
					slug: currentSection.slug,
					level: currentSection.level!,
					line: currentSection.line!,
					content: contentStr,
					examples: extractExamples(contentStr),
					assertions: extractAssertions(contentStr),
				});
			}

			const level = headingMatch[1].length;
			const title = headingMatch[2].trim();
			const slug = slugify(title);

			currentSection = { title, slug, level, line: i + 1 };
			currentContent = [];
		} else if (htmlIdMatch && !currentSection) {
			// HTML block with id as a section
			const id = htmlIdMatch[1];
			currentSection = { title: id, slug: id, level: 0, line: i + 1 };
			currentContent = [];
		} else if (currentSection) {
			currentContent.push(line);
		}
	}

	// Don't forget the last section
	if (currentSection && currentSection.slug) {
		const contentStr = currentContent.join("\n").trim();
		sections.set(currentSection.slug, {
			title: currentSection.title!,
			slug: currentSection.slug,
			level: currentSection.level!,
			line: currentSection.line!,
			content: contentStr,
			examples: extractExamples(contentStr),
			assertions: extractAssertions(contentStr),
		});
	}

	return {
		sections,
		anchors: Array.from(sections.keys()),
		lineCount: lines.length,
	};
}

/**
 * Parse a markdown file from disk
 */
export function parseMarkdownFile(filePath: string): ParsedDoc {
	const content = fs.readFileSync(filePath, "utf-8");
	return parseMarkdown(content);
}

/**
 * Check if a markdown file contains a specific anchor (section slug)
 */
export function hasAnchor(filePath: string, anchor: string): boolean {
	const parsed = parseMarkdownFile(filePath);
	return parsed.anchors.includes(anchor);
}

/**
 * Get a specific section from a markdown file
 */
export function getSection(
	filePath: string,
	anchor: string,
): DocSection | undefined {
	const parsed = parseMarkdownFile(filePath);
	return parsed.sections.get(anchor);
}

/**
 * Get all sections from a markdown file
 */
export function getSections(filePath: string): DocSection[] {
	const parsed = parseMarkdownFile(filePath);
	return Array.from(parsed.sections.values());
}

/**
 * Parse a markdown table into an array of objects
 *
 * Input:
 *   | input | expected |
 *   |-------|----------|
 *   | 1     | 2        |
 *   | 2     | 4        |
 *
 * Output:
 *   [{ input: 1, expected: 2 }, { input: 2, expected: 4 }]
 */
export function parseTable(markdown: string): TableRow[] {
	const lines = markdown
		.trim()
		.split("\n")
		.filter((l) => l.includes("|"));
	if (lines.length < 2) return [];

	const parseRow = (line: string): string[] =>
		line
			.split("|")
			.map((cell) => cell.trim())
			.filter((cell) => cell.length > 0);

	const headers = parseRow(lines[0]);
	const rows = lines.slice(2).map(parseRow); // Skip header divider

	return rows.map((row) => {
		const obj: TableRow = {};
		headers.forEach((header, i) => {
			let value: unknown = row[i] || "";
			// Try to parse as JSON for complex values
			try {
				value = JSON.parse(value as string);
			} catch {
				// Keep as string if not valid JSON
			}
			obj[header] = value;
		});
		return obj;
	});
}

/**
 * Find all tables in a markdown section and parse them
 */
export function extractTables(content: string): TableRow[][] {
	const tables: TableRow[][] = [];

	// Match table blocks (lines starting with |)
	const tableRegex = /(?:^|\n)((?:\|[^\n]+\|\n?)+)/g;
	let match: RegExpExecArray | null;

	while ((match = tableRegex.exec(content)) !== null) {
		const tableContent = match[1];
		const parsed = parseTable(tableContent);
		if (parsed.length > 0) {
			tables.push(parsed);
		}
	}

	return tables;
}
