/**
 * Common utility functions
 */

import { z } from "zod";
import { Framework, type ValidationResult } from "./types";

/**
 * Convert a ZodError to a ValidationResult
 */
export function zodErrorToValidationResult<T>(
	error: z.ZodError,
): ValidationResult<T> {
	return {
		isValid: false,
		errors: error.errors.map((err) => ({
			path: err.path.join("."),
			message: err.message,
		})),
	};
}

/**
 * Format a validation error for display
 */
export function formatValidationError(error: {
	path: string | string[];
	message: string;
}): string {
	const pathStr = Array.isArray(error.path) ? error.path.join(".") : error.path;

	return `${pathStr ? `${pathStr}: ` : ""}${error.message}`;
}

/**
 * Detect the framework being used
 */
export function detectFramework(): Framework {
	try {
		// Check for Astro specific globals
		if (typeof globalThis !== "undefined" && "Astro" in globalThis) {
			return Framework.Astro;
		}

		// Check for Next.js specific environment
		if (
			typeof process !== "undefined" &&
			(process.env.NEXT_PUBLIC_VERCEL_URL ||
				process.env.__NEXT_RUNTIME ||
				process.env.NEXT_RUNTIME)
		) {
			return Framework.NextJS;
		}

		return Framework.Unknown;
	} catch {
		return Framework.Unknown;
	}
}

/**
 * Create a validation summary
 */
export function createValidationSummary(
	results: Record<string, ValidationResult<unknown>>,
): {
	valid: number;
	invalid: number;
	total: number;
} {
	const validCount = Object.values(results).filter(
		(result) => result.isValid,
	).length;
	const totalCount = Object.keys(results).length;

	return {
		valid: validCount,
		invalid: totalCount - validCount,
		total: totalCount,
	};
}

/**
 * Safe JSON parse with validation
 */
export function safeJsonParse<T>(
	json: string,
	schema: z.ZodType<T>,
): ValidationResult<T> {
	try {
		const parsed = JSON.parse(json);
		try {
			const valid = schema.parse(parsed);
			return {
				isValid: true,
				data: valid,
			};
		} catch (error) {
			if (error instanceof z.ZodError) {
				return zodErrorToValidationResult<T>(error);
			}
			throw error;
		}
	} catch (error) {
		return {
			isValid: false,
			errors: [
				{
					path: "",
					message: `Invalid JSON: ${
						error instanceof Error ? error.message : String(error)
					}`,
				},
			],
		};
	}
}
