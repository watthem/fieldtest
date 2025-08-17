import matter from "gray-matter";

/**
 * Serialize a frontmatter object and markdown body back into a complete markdown string
 *
 * @param frontmatter The frontmatter object to serialize
 * @param body The markdown body content
 * @returns Combined markdown string with frontmatter
 */
export function serializeMarkdown(
	frontmatter: Record<string, any>,
	body: string,
): string {
	return matter.stringify(body, frontmatter);
}
