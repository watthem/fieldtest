import type { StandardSchemaV1 } from "@fieldtest/core";

/**
 * Simple Note schema implementation
 */
const noteSchema: StandardSchemaV1 = {
	"~standard": {
		version: 1,
		vendor: "fieldtest",
		validate: async (input: unknown) => {
			if (typeof input !== "object" || input === null) {
				return {
					issues: [
						{
							message: "Note must be an object",
						},
					],
				};
			}

			const obj = input as Record<string, unknown>;
			const issues: StandardSchemaV1.Issue[] = [];

			// Validate title
			if (!obj.title) {
				issues.push({
					path: ["title"],
					message: "Title is required",
				});
			} else if (typeof obj.title !== "string") {
				issues.push({
					path: ["title"],
					message: "Title must be a string",
				});
			}

			// Validate tags if present
			if (obj.tags !== undefined) {
				if (!Array.isArray(obj.tags)) {
					issues.push({
						path: ["tags"],
						message: "Tags must be an array",
					});
				} else {
					// Check each tag is a string
					for (let i = 0; i < obj.tags.length; i++) {
						if (typeof obj.tags[i] !== "string") {
							issues.push({
								path: ["tags", i.toString()],
								message: "Each tag must be a string",
							});
						}
					}
				}
			}

			// Validate date if present
			if (obj.date !== undefined) {
				const date = new Date(String(obj.date));
				if (isNaN(date.getTime())) {
					issues.push({
						path: ["date"],
						message: "Date must be a valid date string",
					});
				}
			}

			if (issues.length > 0) {
				return { issues };
			}
			return { value: input };
		},
	},
};

/**
 * Blog Post schema implementation
 */
const blogPostSchema: StandardSchemaV1 = {
	"~standard": {
		version: 1,
		vendor: "fieldtest",
		validate: async (input: unknown) => {
			if (typeof input !== "object" || input === null) {
				return {
					issues: [
						{
							message: "BlogPost must be an object",
						},
					],
				};
			}

			const obj = input as Record<string, unknown>;
			const issues: StandardSchemaV1.Issue[] = [];

			// Validate required fields
			const requiredFields = ["title", "date", "author"];
			for (const field of requiredFields) {
				if (!obj[field]) {
					issues.push({
						path: [field],
						message: `${field} is required`,
					});
				}
			}

			// Validate title
			if (obj.title && typeof obj.title !== "string") {
				issues.push({
					path: ["title"],
					message: "Title must be a string",
				});
			}

			// Validate date
			if (obj.date) {
				const date = new Date(String(obj.date));
				if (isNaN(date.getTime())) {
					issues.push({
						path: ["date"],
						message: "Date must be a valid date string",
					});
				}
			}

			// Validate author
			if (obj.author && typeof obj.author !== "string") {
				issues.push({
					path: ["author"],
					message: "Author must be a string",
				});
			}

			// Validate tags if present
			if (obj.tags !== undefined) {
				if (!Array.isArray(obj.tags)) {
					issues.push({
						path: ["tags"],
						message: "Tags must be an array",
					});
				} else {
					// Check each tag is a string
					for (let i = 0; i < obj.tags.length; i++) {
						if (typeof obj.tags[i] !== "string") {
							issues.push({
								path: ["tags", i.toString()],
								message: "Each tag must be a string",
							});
						}
					}
				}
			}

			if (issues.length > 0) {
				return { issues };
			}
			return { value: input };
		},
	},
};

/**
 * Collection of built-in schemas
 */
const builtInSchemas = {
	Note: noteSchema,
	BlogPost: blogPostSchema,
};

export type BuiltInSchemaName = keyof typeof builtInSchemas;

/**
 * Get all built-in schemas
 *
 * @returns Record of all available built-in schemas
 */
export function getBuiltInSchemas(): Record<string, StandardSchemaV1> {
	return { ...builtInSchemas };
}

/**
 * Get a specific built-in schema by name
 *
 * @param name Name of the built-in schema
 * @returns The requested schema or undefined if not found
 */
export function getBuiltInSchema(
	name: BuiltInSchemaName,
): StandardSchemaV1 | undefined {
	return builtInSchemas[name];
}
