import fs from "fs";
import path from "path";
import { parseMarkdown, validateWithSchema } from "@fieldtest/core";

async function runExample(
	examplePath: string,
	filename: string,
	schemaModule: string,
	exportName: string,
) {
	const fullPath = path.join(examplePath, filename);
	const content = fs.readFileSync(fullPath, "utf8");
	const parsed = parseMarkdown(content);
	const schema = await import(path.join(examplePath, schemaModule));

	// Use the named export (e.g. blogPostStandard) or first StandardSchemaV1 found
	const validator =
		schema[exportName] ||
		Object.values(schema).find((s: any) => s && s["~standard"]);
	if (!validator)
		throw new Error("No StandardSchema validator found in " + schemaModule);

	console.log(`\n✅ Validating: ${fullPath}`);
	const result = await validateWithSchema(validator, parsed.frontmatter);

	if (result.issues) {
		console.error("❌ Validation failed:");
		result.issues.forEach((issue: any) => {
			console.error(`- ${issue.message} @ ${issue.path?.join(".") || "root"}`);
		});
	} else {
		console.log("✅ Valid frontmatter");
	}
}

// Define examples
const examples = [
	{
		dir: "blog-validation",
		file: "blog-post.md",
		schema: "schema.ts",
		exportName: "blogPostStandard",
	},
	{
		dir: "docs-validation",
		file: "api-guide.md",
		schema: "schema.ts",
		exportName: "guideStandard",
	},
	{
		dir: "obsidian-notes",
		file: "daily-2025-05-19.md",
		schema: "schema.ts",
		exportName: "noteStandard",
	},
	{
		dir: "embedding-pipeline",
		file: "note.md",
		schema: "schema.ts",
		exportName: "embeddingStandard",
	},
];

// Run all
(async () => {
	for (const { dir, file, schema, exportName } of examples) {
		const base = path.resolve(__dirname, dir);
		await runExample(base, file, schema, exportName);
	}
})();
