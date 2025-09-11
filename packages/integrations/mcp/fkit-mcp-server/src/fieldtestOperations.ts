import path from "path";
import {
        FieldTestDocument,
        parseMarkdown,
        serializeMarkdown,
} from "@fieldtest/core"; // Assuming FieldTestDocument is a relevant type
import fs from "fs/promises";
import { shouldExcludeFile } from "@fieldtest/shared";

// This structure reflects the user's info: schema['~standard'].validate
// The DEFAULT_FIELDTEST_SCHEMA provides a default validator if no specific schema is loaded.
const DEFAULT_STANDARD_SCHEMA_DEF = {
	type: "object",
	properties: {
		title: { type: "string" },
		type: {
			type: "string",
			enum: ["reference", "discussion", "tutorial", "guide"],
		},
		category: { type: "string" },
		archived: { type: "boolean" },
		duplicate: { type: "boolean" },
		duplicateOf: { type: "string" }, // To store path of the original document
		date: { type: "string", format: "date" },
		tags: { type: "array", items: { type: "string" } },
	},
	required: ["title", "type", "category"],
};

const DEFAULT_FIELDTEST_SCHEMA = {
	["~standard"]: {
		// This is a placeholder validate function based on the DEFAULT_STANDARD_SCHEMA_DEF.
		// In a real scenario, this would be an instance of a validator (e.g., from @fieldtest/validate based on a loaded schema)
		validate: (data: any) => {
			const issues: Array<{ path: string[]; message: string }> = [];
			(DEFAULT_STANDARD_SCHEMA_DEF.required || []).forEach((field: string) => {
				if (!(field in data)) {
					issues.push({
						path: [field],
						message: `Missing required field: ${field}`,
					});
				}
			});
			// Basic type validation for demonstration (enum check for 'type')
			if (
				data.type &&
				DEFAULT_STANDARD_SCHEMA_DEF.properties.type.enum &&
				!DEFAULT_STANDARD_SCHEMA_DEF.properties.type.enum.includes(data.type)
			) {
				issues.push({
					path: ["type"],
					message: `Invalid 'type': ${data.type}. Must be one of ${DEFAULT_STANDARD_SCHEMA_DEF.properties.type.enum.join(", ")}`,
				});
			}
			// Add other checks as needed from DEFAULT_STANDARD_SCHEMA_DEF properties
			return { issues }; // StandardSchema validation result has an 'issues' array
		},
	},
};

export async function scanFiles(
        directory: string,
        excludePatterns: string[] = [],
): Promise<string[]> {
        const allFiles: string[] = [];
        try {
                const entries = await fs.readdir(directory, { withFileTypes: true });
                for (const entry of entries) {
                        const fullPath = path.join(directory, entry.name);
                        if (shouldExcludeFile(fullPath, excludePatterns)) continue;
                        if (entry.isDirectory()) {
                                allFiles.push(...(await scanFiles(fullPath, excludePatterns)));
                        } else if (entry.isFile() && entry.name.endsWith(".md")) {
                                allFiles.push(fullPath);
                        }
                }
        } catch (error) {
                // Log error or handle appropriately if directory is not accessible
                console.warn(`Could not scan directory ${directory}:`, error);
        }
        return allFiles;
}

export async function readFrontmatter(filePath: string): Promise<any> {
	try {
		const fileContent = await fs.readFile(filePath, "utf-8");
		// Assuming parseMarkdown returns an object with 'frontmatter' and 'body' (or 'content') properties
		const { frontmatter } = parseMarkdown(fileContent);
		return frontmatter || {};
	} catch (error) {
		console.error(`Error reading frontmatter from ${filePath}:`, error);
		return {};
	}
}

export async function validateFrontmatter(
	frontmatter: any,
	schemaToUse: any = DEFAULT_FIELDTEST_SCHEMA, // Expects schema object with ['~standard'].validate
): Promise<{ isValid: boolean; errors?: string[] }> {
	// errors as string array
	const standardSchemaPart = schemaToUse?.["~standard"];

	if (
		!standardSchemaPart ||
		typeof standardSchemaPart.validate !== "function"
	) {
		console.error(
			"Schema does not have a ['~standard'].validate method or schema is not provided correctly.",
		);
		return {
			isValid: false,
			errors: ["Invalid schema structure provided for validation."],
		};
	}

	try {
		const validationResult = standardSchemaPart.validate(frontmatter);
		const isValid =
			!validationResult?.issues || validationResult.issues.length === 0;
		const errorMessages =
			validationResult?.issues?.map(
				(issue: { path: string[]; message: string }) =>
					`${issue.path.join(".") || "general"}: ${issue.message}`,
			) || [];
		return { isValid, errors: errorMessages };
	} catch (e: any) {
		console.error(
			`Error during validation for frontmatter ${JSON.stringify(frontmatter)}:`,
			e,
		);
		return { isValid: false, errors: [`Validation crashed: ${e.message}`] };
	}
}

export async function updateFrontmatter(
	filePath: string,
	updates: any,
): Promise<void> {
	try {
		const fileContent = await fs.readFile(filePath, "utf-8");
		// Assuming parseMarkdown returns { frontmatter, body } based on typical parser structure
		const { frontmatter, body } = parseMarkdown(fileContent);
		const newFrontmatter = { ...frontmatter, ...updates };
		// Assuming serializeMarkdown takes frontmatter and body as separate arguments
		const newFileContent = serializeMarkdown(newFrontmatter, body);
		await fs.writeFile(filePath, newFileContent, "utf-8");
	} catch (error) {
		console.error(`Error updating frontmatter for ${filePath}:`, error);
		throw error;
	}
}

export async function classifyDocument(
	frontmatter: any,
): Promise<{ type?: string; category?: string }> {
	const type = frontmatter.type as string | undefined;
	const category = frontmatter.category as string | undefined;
	return { type, category };
}

export function determineTargetPath(
	currentPath: string,
	classification: { type?: string; category?: string },
	baseDir: string,
	frontmatter: any,
): string {
	const { type, category } = classification;
	const fileName = path.basename(currentPath);

	if (frontmatter.archived || frontmatter.duplicate) {
		return path.join(baseDir, "archive", fileName);
	}

	if (!type || !category) {
		return path.join(baseDir, "needs_review", fileName); // Moving unclassified to needs_review
	}

	const validTypes = DEFAULT_STANDARD_SCHEMA_DEF.properties.type.enum;
	if (!validTypes.includes(type)) {
		return path.join(baseDir, "needs_review", fileName); // Moving invalid types to needs_review
	}

	return path.join(baseDir, type, category, fileName);
}

export async function moveFile(src: string, dest: string): Promise<void> {
	try {
		await fs.mkdir(path.dirname(dest), { recursive: true });
		await fs.rename(src, dest);
		console.log(`Moved file from ${src} to ${dest}`);
	} catch (error) {
		console.error(`Error moving file from ${src} to ${dest}:`, error);
		throw error;
	}
}

export async function archiveFile(
	filePath: string,
	baseDir: string,
	reason: { archived?: boolean; duplicate?: boolean; duplicateOf?: string },
): Promise<{ newPath: string; frontmatterUpdates: any }> {
	const fileName = path.basename(filePath);
	const archivePath = path.join(baseDir, "archive", fileName);
	const frontmatterUpdates = { ...reason };
	return { newPath: archivePath, frontmatterUpdates };
}

export async function updateChangelog(
	baseDir: string,
	entry: string,
): Promise<void> {
	const changelogPath = path.join(baseDir, "CHANGELOG.md");
	const timestamp = new Date().toISOString();
	const formattedEntry = `\n- ${timestamp}: ${entry}\n`;
	try {
		await fs.appendFile(changelogPath, formattedEntry);
	} catch (error: any) {
		if (error.code === "ENOENT") {
			await fs.writeFile(changelogPath, `# Changelog\n${formattedEntry}`);
		} else {
			console.error(`Error updating changelog ${changelogPath}: `, error);
			throw error;
		}
	}
}

export async function updateIndex(baseDir: string): Promise<void> {
	const indexPath = path.join(baseDir, "_index.md");
	let indexContent = "# Document Index\n\n";
	const topLevelDirs = DEFAULT_STANDARD_SCHEMA_DEF.properties.type.enum;

	for (const typeDir of topLevelDirs) {
		const typePath = path.join(baseDir, typeDir);
		indexContent += `## ${typeDir.charAt(0).toUpperCase() + typeDir.slice(1)}\n`;
		try {
			const categories = await fs.readdir(typePath, { withFileTypes: true });
			for (const categoryEntry of categories) {
				if (categoryEntry.isDirectory()) {
					const categoryPath = path.join(typePath, categoryEntry.name);
					indexContent += `### ${categoryEntry.name.charAt(0).toUpperCase() + categoryEntry.name.slice(1)}\n`;
					const files = await fs.readdir(categoryPath);
					for (const file of files) {
						if (file.endsWith(".md")) {
							const relativeFilePath = path
								.join(typeDir, categoryEntry.name, file)
								.replace(/\\/g, "/");
							const fm = await readFrontmatter(path.join(categoryPath, file));
							const title = fm.title || path.basename(file, ".md");
							indexContent += `- [${title}](${relativeFilePath})\n`;
						}
					}
				}
			}
		} catch (error: any) {
			if (!(error.code === "ENOENT")) {
				console.warn(
					`Could not read directory ${typePath} for index generation: `,
					error,
				);
			}
		}
		indexContent += "\n";
	}

	indexContent += "## Needs Review\n";
	const needsReviewPath = path.join(baseDir, "needs_review");
	try {
		const reviewFiles = await fs.readdir(needsReviewPath);
		for (const file of reviewFiles) {
			if (file.endsWith(".md")) {
				const relativeFilePath = path
					.join("needs_review", file)
					.replace(/\\/g, "/");
				const fm = await readFrontmatter(path.join(needsReviewPath, file));
				const title = fm.title || path.basename(file, ".md");
				indexContent += `- [${title}](${relativeFilePath}) (Needs Review)\n`;
			}
		}
	} catch (error: any) {
		if (!(error.code === "ENOENT")) {
			console.warn(
				`Could not read needs_review directory ${needsReviewPath} for index generation: `,
				error,
			);
		}
	}
	indexContent += "\n";

	indexContent += "## Archive\n";
	const archivePath = path.join(baseDir, "archive");
	try {
		const archivedFiles = await fs.readdir(archivePath);
		for (const file of archivedFiles) {
			if (file.endsWith(".md")) {
				const relativeFilePath = path.join("archive", file).replace(/\\/g, "/");
				const fm = await readFrontmatter(path.join(archivePath, file));
				const title = fm.title || path.basename(file, ".md");
				let status = "Archived";
				if (fm.duplicate) status = "Duplicate";
				if (fm.duplicateOf) status += ` (of ${path.basename(fm.duplicateOf)})`;
				indexContent += `- [${title}](${relativeFilePath}) (${status})\n`;
			}
		}
	} catch (error: any) {
		if (!(error.code === "ENOENT")) {
			console.warn(
				`Could not read archive directory ${archivePath} for index generation: `,
				error,
			);
		}
	}
	indexContent += "\n";

	try {
		await fs.writeFile(indexPath, indexContent);
	} catch (error) {
		console.error(`Error writing index file ${indexPath}:`, error);
		throw error;
	}
}

export async function findDuplicates(
	filePath: string,
	allFiles: string[],
	currentFrontmatter: any,
): Promise<string | null> {
	const currentTitle = currentFrontmatter.title?.trim().toLowerCase();
	if (!currentTitle) return null;

	for (const otherFile of allFiles) {
		if (path.resolve(filePath) === path.resolve(otherFile)) continue;
		const otherFrontmatter = await readFrontmatter(otherFile);
		if (otherFrontmatter.title?.trim().toLowerCase() === currentTitle) {
			// TODO: Add content hash comparison for more robust duplicate detection
			return otherFile;
		}
	}
	return null;
}

export function isStale(frontmatter: any): boolean {
	if (frontmatter.archived || frontmatter.duplicate) return false;
	const lastModifiedDateString = frontmatter.lastModified || frontmatter.date;
	if (lastModifiedDateString) {
		try {
			const date = new Date(lastModifiedDateString);
			// Check if date is valid
			if (isNaN(date.getTime())) {
				return false;
			}
			const NINETY_DAYS_AGO = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
			if (date < NINETY_DAYS_AGO) {
				return true;
			}
		} catch (e) {
			return false;
		}
	}
	return false;
}
