/**
 * Markdown parsing utilities for doc-ref
 *
 * Parses markdown documents to extract sections, tables, code examples,
 * assertions, and inline bindings for executable specifications.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import matter from "gray-matter";
import type {
	BindingCommand,
	CodeExample,
	DocSection,
	InlineBinding,
	LoadedSpec,
	ParsedTable,
	SpecAssertion,
	SpecOptions,
} from "./types";

/**
 * Parse Concordion-style inline bindings from markdown content.
 *
 * Syntax: [value](!command:field)
 *
 * Examples:
 *   [100](!set:quantity) - sets input.quantity = 100
 *   [$20.00](!verify:total) - verifies output.total === "$20.00"
 *   [calculate](!execute:pricing) - runs pricing fixture
 *
 * @param content Markdown content to parse
 * @returns Array of parsed inline bindings
 */
export function parseInlineBindings(content: string): InlineBinding[] {
	const bindings: InlineBinding[] = [];
	// Match [value](!command:field) pattern
	// Captures: value, command, field
	const pattern = /\[([^\]]+)\]\(!(\w+):([^)]+)\)/g;

	const lines = content.split("\n");
	let lineOffset = 0;

	for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
		const line = lines[lineIndex];
		let match: RegExpExecArray | null;
		const linePattern = new RegExp(pattern.source, "g");

		while ((match = linePattern.exec(line)) !== null) {
			const [raw, value, command, field] = match;

			// Validate command is one of the expected types
			if (command === "set" || command === "verify" || command === "execute") {
				bindings.push({
					value,
					command: command as BindingCommand,
					field,
					raw,
					line: lineIndex + 1, // 1-indexed
				});
			}
		}
		lineOffset += line.length + 1; // +1 for newline
	}

	return bindings;
}

/**
 * Extract markdown tables from content
 *
 * @param content Markdown content
 * @returns Array of parsed tables
 */
export function extractTables(content: string): ParsedTable[] {
	const tables: ParsedTable[] = [];
	const lines = content.split("\n");

	let currentTable: string[] = [];
	let tableStartLine = 0;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const trimmed = line.trim();

		// Check if line is a table row (starts and ends with |)
		if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
			if (currentTable.length === 0) {
				tableStartLine = i + 1;
			}
			currentTable.push(trimmed);
		} else if (currentTable.length > 0) {
			// End of table, parse it
			const parsed = parseTableContent(currentTable, tableStartLine);
			if (parsed) {
				tables.push(parsed);
			}
			currentTable = [];
		}
	}

	// Handle table at end of content
	if (currentTable.length > 0) {
		const parsed = parseTableContent(currentTable, tableStartLine);
		if (parsed) {
			tables.push(parsed);
		}
	}

	return tables;
}

/**
 * Parse raw table rows into structured table data
 */
function parseTableContent(
	rows: string[],
	startLine: number,
): ParsedTable | null {
	if (rows.length < 2) return null;

	// First row is headers
	const headerRow = rows[0];
	const headers = headerRow
		.split("|")
		.map((cell) => cell.trim())
		.filter((cell) => cell.length > 0);

	// Skip separator row (usually row index 1)
	const separatorIndex = rows.findIndex((row) =>
		/^\|[\s\-:|]+\|$/.test(row.trim()),
	);

	const dataRows: string[][] = [];
	const startIndex = separatorIndex >= 0 ? separatorIndex + 1 : 1;

	for (let i = startIndex; i < rows.length; i++) {
		const cells = rows[i]
			.split("|")
			.map((cell) => cell.trim())
			.filter((_, idx, arr) => idx > 0 && idx < arr.length - 1); // Remove empty first/last

		if (cells.length > 0) {
			dataRows.push(cells);
		}
	}

	return {
		headers,
		rows: dataRows,
		raw: rows.join("\n"),
		line: startLine,
	};
}

/**
 * Extract code examples from markdown content
 *
 * @param content Markdown content
 * @returns Array of code examples
 */
export function extractCodeExamples(content: string): CodeExample[] {
	const examples: CodeExample[] = [];
	const pattern = /```(\w*)\n([\s\S]*?)```/g;

	const lines = content.split("\n");
	let currentPos = 0;

	let match: RegExpExecArray | null;
	while ((match = pattern.exec(content)) !== null) {
		const [raw, language, code] = match;

		// Calculate line number
		const beforeMatch = content.slice(0, match.index);
		const lineNumber = beforeMatch.split("\n").length;

		examples.push({
			language: language || "text",
			code: code.trim(),
			raw,
			line: lineNumber,
		});
	}

	return examples;
}

/**
 * Extract MUST/SHOULD assertions from markdown content
 *
 * Looks for RFC 2119 keywords: MUST, MUST NOT, SHOULD, SHOULD NOT
 *
 * @param content Markdown content
 * @returns Array of assertions
 */
export function extractAssertions(content: string): SpecAssertion[] {
	const assertions: SpecAssertion[] = [];
	const lines = content.split("\n");

	const keywords = ["MUST NOT", "MUST", "SHOULD NOT", "SHOULD"] as const;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		for (const keyword of keywords) {
			const index = line.indexOf(keyword);
			if (index !== -1) {
				// Extract the text after the keyword until end of sentence or line
				const afterKeyword = line.slice(index + keyword.length);
				const sentenceMatch = afterKeyword.match(/^([^.!?\n]+[.!?]?)/);
				const text = sentenceMatch ? sentenceMatch[1].trim() : afterKeyword.trim();

				assertions.push({
					type: keyword as SpecAssertion["type"],
					text,
					context: line.trim(),
					line: i + 1,
				});
				break; // Only capture first keyword per line
			}
		}
	}

	return assertions;
}

/**
 * Generate an anchor ID from a heading
 *
 * @param heading Heading text
 * @returns URL-safe anchor ID
 */
export function generateAnchor(heading: string): string {
	return heading
		.toLowerCase()
		.replace(/[^\w\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
}

/**
 * Parse markdown content into sections
 *
 * @param content Raw markdown content
 * @returns Array of parsed sections
 */
export function parseMarkdownSections(content: string): DocSection[] {
	const sections: DocSection[] = [];
	const lines = content.split("\n");

	// Parse frontmatter first
	const { content: bodyContent } = matter(content);
	const bodyLines = bodyContent.split("\n");

	let currentSection: DocSection | null = null;
	let currentContent: string[] = [];
	let sectionStartLine = 1;

	// Calculate offset for frontmatter
	const frontmatterLines = content.split("---").length > 2
		? content.indexOf("---", 3) + 4
		: 0;

	for (let i = 0; i < bodyLines.length; i++) {
		const line = bodyLines[i];
		const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);

		if (headingMatch) {
			// Save previous section
			if (currentSection) {
				const sectionContent = currentContent.join("\n");
				currentSection.content = sectionContent;
				currentSection.tables = extractTables(sectionContent);
				currentSection.examples = extractCodeExamples(sectionContent);
				currentSection.assertions = extractAssertions(sectionContent);
				currentSection.bindings = parseInlineBindings(sectionContent);
				sections.push(currentSection);
			}

			// Start new section
			const level = headingMatch[1].length;
			const title = headingMatch[2].trim();

			currentSection = {
				title,
				level,
				content: "",
				tables: [],
				examples: [],
				assertions: [],
				bindings: [],
				anchor: generateAnchor(title),
				line: i + 1,
			};
			currentContent = [];
			sectionStartLine = i + 1;
		} else if (currentSection) {
			currentContent.push(line);
		}
	}

	// Save final section
	if (currentSection) {
		const sectionContent = currentContent.join("\n");
		currentSection.content = sectionContent;
		currentSection.tables = extractTables(sectionContent);
		currentSection.examples = extractCodeExamples(sectionContent);
		currentSection.assertions = extractAssertions(sectionContent);
		currentSection.bindings = parseInlineBindings(sectionContent);
		sections.push(currentSection);
	}

	return sections;
}

/**
 * Load a specification file and optionally target a specific section
 *
 * @param specPath Path to spec file, optionally with #anchor
 * @param options Loading options
 * @returns Loaded specification
 */
export function loadSpec(specPath: string, options: SpecOptions = {}): LoadedSpec {
	const { basePath = process.cwd(), throwOnMissing = true } = options;

	// Parse path and anchor
	const [filePath, anchor] = specPath.split("#");
	const fullPath = path.isAbsolute(filePath)
		? filePath
		: path.resolve(basePath, filePath);

	// Check if file exists
	if (!fs.existsSync(fullPath)) {
		if (throwOnMissing) {
			throw new Error(`Spec file not found: ${fullPath}`);
		}
		return {
			path: fullPath,
			sections: [],
			raw: "",
		};
	}

	// Read and parse file
	const raw = fs.readFileSync(fullPath, "utf-8");
	const sections = parseMarkdownSections(raw);

	// Find target section if anchor specified
	let targetSection: DocSection | undefined;
	if (anchor) {
		targetSection = sections.find(
			(s) => s.anchor === anchor || s.title.toLowerCase() === anchor.toLowerCase(),
		);
	}

	return {
		path: fullPath,
		sections,
		targetSection,
		raw,
	};
}

/**
 * Load a specification section by path with optional fragment
 *
 * This is the primary function used by vitest integration
 *
 * @param specPath Path like "docs/spec.md#section-name"
 * @param options Loading options
 * @returns Loaded specification
 */
export function specSection(specPath: string, options: SpecOptions = {}): LoadedSpec {
	return loadSpec(specPath, options);
}
