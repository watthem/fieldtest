import matter from "gray-matter";
import type { FieldTestDocument } from "./types";

const rejectExecutable = {
	parse(): never {
		throw new Error(
			"JavaScript front matter is not supported: FieldTest parses front matter as data and never executes it",
		);
	},
	stringify(): never {
		throw new Error("JavaScript front matter is not supported");
	},
};

// gray-matter's default engines eval `---js` front matter. Replace them.
const engines = { js: rejectExecutable, javascript: rejectExecutable };

/**
 * Parse a markdown string with frontmatter into a structured document
 *
 * @param content Raw markdown string with frontmatter
 * @returns Parsed FieldTestDocument with separated frontmatter and body
 */
export function parseMarkdown(content: string): FieldTestDocument {
	const { data, content: body } = matter(content, { engines });

	return {
		raw: content,
		frontmatter: data,
		body,
	};
}
