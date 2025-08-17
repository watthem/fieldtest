import * as path from "path";
import * as fs from "fs/promises";
import type { StandardSchemaV1, ValidationOptions } from "./types";

/**
 * Validate data with a StandardSchemaV1 schema (per https://standardschema.dev/)
 * @param schema The schema to validate with
 * @param data The data to validate
 * @param options Validation options
 * @returns Validation result or throws if throwOnError is true
 */
export async function validateWithSchema<T = unknown>(
	schema: StandardSchemaV1,
	data: unknown,
	options: ValidationOptions = {},
): Promise<T> {
	let result = schema["~standard"].validate(data);
	if (result instanceof Promise) result = await result;

	if (result.issues && options.throwOnError) {
		const message =
			result.issues
				.map((issue) => `${issue.path?.join(".") || ""}: ${issue.message}`)
				.join("\n") || "Validation failed";
		throw new Error(message);
	}

	if (result.issues) return result as any;
	return result.value as T;
}
