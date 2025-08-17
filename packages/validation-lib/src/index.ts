/**
 * @fieldtest/validation-lib
 *
 * A TypeScript validation library that works with both Astro and Next.js
 * Built on top of Zod and integrated with @docs-score/core
 */

import { z } from "zod";

// Re-export Zod for convenience
export { z };

// Export common validation schemas
export * from "./schemas";

/**
 * Local ScanOptions interface for validation
 */
export interface ScanOptions {
	entry: string;
	maxDepth?: number;
	ignore?: string[];
	concurrency?: number;
	delayBetweenRequests?: number;
}

/**
 * Validates input against a schema and returns the result
 *
 * @param schema - The Zod schema to validate against
 * @param input - The input to validate
 * @returns A tuple containing validation success and parsed data or error
 */
export function validate<T>(
	schema: z.ZodType<T>,
	input: unknown,
): [boolean, T | z.ZodError] {
	try {
		const result = schema.parse(input);
		return [true, result];
	} catch (error) {
		if (error instanceof z.ZodError) {
			return [false, error];
		}
		throw error;
	}
}

/**
 * Validates input asynchronously against a schema and returns the result
 *
 * @param schema - The Zod schema to validate against
 * @param input - The input to validate
 * @returns A Promise for a tuple containing validation success and parsed data or error
 */
export async function validateAsync<T>(
	schema: z.ZodType<T>,
	input: unknown,
): Promise<[boolean, T | z.ZodError]> {
	try {
		const result = await schema.parseAsync(input);
		return [true, result];
	} catch (error) {
		if (error instanceof z.ZodError) {
			return [false, error];
		}
		throw error;
	}
}

/**
 * Formats a Zod error into a user-friendly message
 *
 * @param error - The Zod error to format
 * @returns A formatted error message
 */
export function formatZodError(error: z.ZodError): string {
	return error.errors
		.map((err) => {
			const path = err.path.join(".");
			return `${path ? `${path}: ` : ""}${err.message}`;
		})
		.join("\n");
}

// Integration with @docs-score/core
export const ScanOptionsSchema = z.object({
	entry: z.string().url(),
	maxDepth: z.number().int().positive().optional(),
	ignore: z.array(z.string()).optional(),
	concurrency: z.number().int().positive().optional(),
	delayBetweenRequests: z.number().int().nonnegative().optional(),
}) satisfies z.ZodType<ScanOptions>;

export type ValidatedScanOptions = z.infer<typeof ScanOptionsSchema>;
