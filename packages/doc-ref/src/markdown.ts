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
 * Convert heading text to a URL-friendly slug.
 * Matches how VitePress/GitHub generate anchor links.
 *
 * @param text - The heading text to slugify
 * @returns URL-friendly slug
 *
 * @example
 * ```typescript
 * import { slugify } from '@fieldtest/doc-ref';
 *
 * slugify('How It Works');     // → 'how-it-works'
 * slugify('API Reference');    // → 'api-reference'
 * slugify('v2.0 Changes!');    // → 'v20-changes'
 * ```
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
 * Extract code examples from markdown content (fenced code blocks).
 *
 * @param content - Raw markdown string to parse
 * @returns Array of code examples with language, meta, and parsed input/output
 *
 * @example
 * ```typescript
 * import { extractExamples } from '@fieldtest/doc-ref';
 *
 * const markdown = `
 * Here's an example:
 * \`\`\`typescript
 * const x = 1;
 * \`\`\`
 * `;
 *
 * const examples = extractExamples(markdown);
 * // → [{ lang: 'typescript', meta: '', code: 'const x = 1;' }]
 * ```
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
 * Parse structured examples that follow input → output patterns.
 *
 * Supports formats like:
 * - `input: [1, 2, 3]` with `output: 6`
 * - `input: { "name": "test" }` with `expected: true`
 *
 * @param code - Code block content to parse
 * @returns Object with parsed `input` and `expected` values (if found)
 *
 * @example
 * ```typescript
 * import { parseStructuredExample } from '@fieldtest/doc-ref';
 *
 * const result = parseStructuredExample(`
 *   input: [1, 2, 3]
 *   output: 6
 * `);
 * // → { input: [1, 2, 3], expected: 6 }
 * ```
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
 * Extract assertion-like statements from markdown content.
 *
 * Looks for patterns like:
 * - `MUST:`, `SHOULD:`, `SHALL:`, `REQUIRE:` statements
 * - Gherkin: `Given X, When Y, Then Z`
 * - Bullet points starting with "should", "must", etc.
 *
 * @param content - Raw markdown string to parse
 * @returns Array of assertions with type, text, and keyword
 *
 * @example
 * ```typescript
 * import { extractAssertions } from '@fieldtest/doc-ref';
 *
 * const markdown = `
 * MUST: Return 200 on success
 * - should handle empty input gracefully
 * `;
 *
 * const assertions = extractAssertions(markdown);
 * // → [
 * //   { type: 'requirement', text: 'Return 200 on success', keyword: 'MUST' },
 * //   { type: 'behavior', text: 'should handle empty input gracefully' }
 * // ]
 * ```
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
 * Parse a markdown string and extract sections by heading.
 *
 * Returns a `ParsedDoc` with:
 * - `sections`: Map of slug → DocSection
 * - `anchors`: Array of all section slugs
 * - `lineCount`: Total lines in the document
 *
 * Each `DocSection` contains:
 * - `title`, `slug`, `level`, `line`
 * - `content`: Text between this heading and the next
 * - `examples`: Code blocks in this section
 * - `assertions`: MUST/SHOULD statements found
 *
 * @param content - Raw markdown string to parse
 * @returns Parsed document with sections, anchors, and line count
 *
 * @example
 * ```typescript
 * import { parseMarkdown } from '@fieldtest/doc-ref';
 *
 * const parsed = parseMarkdown(`
 * # Installation
 * Run npm install.
 *
 * ## Linux
 * Use apt-get.
 * `);
 *
 * parsed.anchors;           // → ['installation', 'linux']
 * parsed.lineCount;         // → 7
 * parsed.sections.get('linux')?.content;  // → 'Use apt-get.'
 * ```
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
 * Parse a markdown file from disk.
 *
 * This is a convenience wrapper that reads the file and calls `parseMarkdown()`.
 *
 * @param filePath - Absolute or relative path to the markdown file
 * @returns Parsed document with sections, anchors, and line count
 *
 * @example
 * ```typescript
 * import { parseMarkdownFile } from '@fieldtest/doc-ref';
 *
 * const parsed = parseMarkdownFile('docs/api.md');
 *
 * // Access the ParsedDoc structure:
 * parsed.sections;   // Map<string, DocSection>
 * parsed.anchors;    // string[] - all section slugs
 * parsed.lineCount;  // number
 *
 * // Get a specific section:
 * const authSection = parsed.sections.get('authentication');
 * authSection?.content;   // The section's markdown content
 * authSection?.examples;  // Code blocks in that section
 * ```
 */
export function parseMarkdownFile(filePath: string): ParsedDoc {
	const content = fs.readFileSync(filePath, "utf-8");
	return parseMarkdown(content);
}

/**
 * Check if a markdown file contains a specific anchor (section slug).
 *
 * @param filePath - Path to the markdown file
 * @param anchor - The anchor/slug to check for (e.g., 'authentication')
 * @returns `true` if the anchor exists, `false` otherwise
 *
 * @example
 * ```typescript
 * import { hasAnchor } from '@fieldtest/doc-ref';
 *
 * if (hasAnchor('docs/api.md', 'rate-limits')) {
 *   console.log('Rate limits section exists');
 * }
 * ```
 */
export function hasAnchor(filePath: string, anchor: string): boolean {
	const parsed = parseMarkdownFile(filePath);
	return parsed.anchors.includes(anchor);
}

/**
 * Get a specific section from a markdown file by its anchor/slug.
 *
 * @param filePath - Path to the markdown file
 * @param anchor - The anchor/slug of the section to retrieve
 * @returns The DocSection if found, `undefined` otherwise
 *
 * @example
 * ```typescript
 * import { getSection } from '@fieldtest/doc-ref';
 *
 * const section = getSection('docs/api.md', 'authentication');
 * if (section) {
 *   console.log(section.title);    // 'Authentication'
 *   console.log(section.content);  // Section markdown content
 *   console.log(section.examples); // Code blocks in section
 * }
 * ```
 */
export function getSection(
	filePath: string,
	anchor: string,
): DocSection | undefined {
	const parsed = parseMarkdownFile(filePath);
	return parsed.sections.get(anchor);
}

/**
 * Get all sections from a markdown file as an array.
 *
 * This is a convenience wrapper that parses the file and returns all sections.
 * **Note:** Takes a file path, not a ParsedDoc. If you already have a ParsedDoc,
 * use `Array.from(parsed.sections.values())` instead.
 *
 * @param filePath - Path to the markdown file
 * @returns Array of all DocSection objects in the file
 *
 * @example
 * ```typescript
 * import { getSections } from '@fieldtest/doc-ref';
 *
 * // Get all sections from a file
 * const sections = getSections('docs/install.md');
 *
 * // Check for required sections
 * const titles = sections.map(s => s.title.toLowerCase());
 * expect(titles.some(t => t.includes('linux'))).toBe(true);
 * expect(titles.some(t => t.includes('macos'))).toBe(true);
 *
 * // Find sections with code examples
 * const withExamples = sections.filter(s => s.examples.length > 0);
 * ```
 */
export function getSections(filePath: string): DocSection[] {
	const parsed = parseMarkdownFile(filePath);
	return Array.from(parsed.sections.values());
}

/**
 * Parse a markdown table into an array of objects.
 *
 * Headers become object keys, values are parsed as JSON when possible.
 *
 * @param markdown - Markdown table string
 * @returns Array of objects, one per row
 *
 * @example
 * ```typescript
 * import { parseTable } from '@fieldtest/doc-ref';
 *
 * const table = `
 * | input | expected |
 * |-------|----------|
 * | 1     | 2        |
 * | 2     | 4        |
 * `;
 *
 * parseTable(table);
 * // → [{ input: 1, expected: 2 }, { input: 2, expected: 4 }]
 * ```
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
 * Find all tables in markdown content and parse them.
 *
 * @param content - Markdown string containing tables
 * @returns Array of parsed tables, each table is an array of row objects
 *
 * @example
 * ```typescript
 * import { extractTables } from '@fieldtest/doc-ref';
 *
 * const markdown = `
 * ## Test Cases
 * | input | output |
 * |-------|--------|
 * | 1     | 2      |
 *
 * ## Error Cases
 * | code | message |
 * |------|---------|
 * | 404  | "Not found" |
 * `;
 *
 * const tables = extractTables(markdown);
 * // → [
 * //   [{ input: 1, output: 2 }],
 * //   [{ code: 404, message: 'Not found' }]
 * // ]
 * ```
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
