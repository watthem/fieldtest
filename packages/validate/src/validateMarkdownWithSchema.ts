import type { FieldTestDocument, StandardSchemaV1 } from "@fieldtest/core";

/**
 * Validate a markdown document against a schema
 *
 * @param doc The parsed markdown document
 * @param schema The schema to validate against
 * @returns Array of validation issues or empty array if valid
 */
export async function validateMarkdownWithSchema(
	doc: FieldTestDocument,
	schema: StandardSchemaV1,
): Promise<StandardSchemaV1.Issue[]> {
	const result = await schema["~standard"].validate(doc.frontmatter);

	if ("issues" in result && result.issues) {
		return Array.from(result.issues);
	}

	return [];
}
