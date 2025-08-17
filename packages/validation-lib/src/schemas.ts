/**
 * Common validation schemas
 */

import type { MetricResult } from "@docs-score/core";
import { z } from "zod";

// Basic schemas
export const URLSchema = z.string().url();
export const EmailSchema = z.string().email();
export const DateSchema = z.coerce.date();
export const UUIDSchema = z.string().uuid();

// Content validation schemas
export const HeadingSchema = z.object({
	level: z.number().int().min(1).max(6),
	text: z.string().min(1),
	id: z.string().optional(),
});

export const LinkSchema = z.object({
	href: z.string().url(),
	text: z.string().min(1),
	external: z.boolean().optional(),
});

export const DocumentSchema = z.object({
	title: z.string().min(1),
	url: z.string().url(),
	headings: z.array(HeadingSchema),
	links: z.array(LinkSchema).optional(),
	lastModified: z.coerce.date().optional(),
});

// Post schema for blog posts
export const PostSchema = z.object({
	title: z.string().min(1),
	description: z.string().min(1),
	slug: z.string().min(1),
	published: z.boolean(),
});

// Issue schema for validation results
export const IssueSeveritySchema = z.enum(["error", "warning", "info"]);

export const IssueSchema = z.object({
	message: z.string(),
	severity: IssueSeveritySchema,
	url: z.string().url().optional(),
	element: z.string().optional(),
	fix: z.string().optional(),
	details: z.record(z.any()).optional(),
});

// Metric result schema - compatible with @docs-score/core
export const MetricResultSchema = z.object({
	id: z.string(),
	score: z.number().min(0).max(100),
	details: z.any().optional(),
});

// Configuration schemas
export const ValidationConfigSchema = z.object({
	rules: z.record(
		z.object({
			enabled: z.boolean().default(true),
			severity: IssueSeveritySchema.default("warning"),
			options: z.record(z.any()).optional(),
		}),
	),
	ignore: z.array(z.string()).optional(),
});

export type ValidationConfig = z.infer<typeof ValidationConfigSchema>;
export type IssueSeverity = z.infer<typeof IssueSeveritySchema>;
export type Heading = z.infer<typeof HeadingSchema>;
export type Link = z.infer<typeof LinkSchema>;
export type Document = z.infer<typeof DocumentSchema>;

/**
 * Schema Registry - maps schema names to their Zod schemas
 */
const schemaRegistry: Record<string, z.ZodTypeAny> = {
	document: DocumentSchema,
	post: PostSchema,
};

/**
 * Validate content against a named schema
 */
export function validateSchema(
	content: unknown,
	schemaName: string,
): { success: boolean; errors?: string[] } {
	const schema = schemaRegistry[schemaName];

	if (!schema) {
		return {
			success: false,
			errors: [`Schema "${schemaName}" not found in registry`],
		};
	}

	try {
		schema.parse(content);
		return { success: true };
	} catch (error) {
		if (error instanceof z.ZodError) {
			return {
				success: false,
				errors: error.errors.map(
					(err) => `${err.path.join(".")}: ${err.message}`,
				),
			};
		}
		return {
			success: false,
			errors: ["Unknown validation error"],
		};
	}
}
