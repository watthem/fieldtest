import matter from "gray-matter";
import type { FieldTestDocument } from "./types";

/**
 * Parse a markdown string with frontmatter into a structured document
 *
 * @param content Raw markdown string with frontmatter
 * @returns Parsed FieldTestDocument with separated frontmatter and body
 */
export function parseMarkdown(content: string): FieldTestDocument {
	const { data, content: body } = matter(content);

	return {
		raw: content,
		frontmatter: data,
		body,
	};
}
