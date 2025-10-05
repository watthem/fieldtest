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
  options: ValidationOptions = {}
): Promise<T | StandardSchemaV1.FailureResult> {
  // Ensure we always have a resolved Result (the validate function may return a Promise)
  const result = await Promise.resolve(schema["~standard"].validate(data));

  if (result.issues && options.throwOnError) {
    const message =
      result.issues
        .map((issue) => {
          // Path segments can be raw keys or objects with a `key` prop. Normalize to strings.
          const pathStr =
            issue.path
              ?.map((seg) =>
                typeof seg === "object" && seg !== null && "key" in seg
                  ? String((seg as any).key)
                  : String(seg)
              )
              .join(".") || "";
          return `${pathStr}: ${issue.message}`;
        })
        .join("\n") || "Validation failed";
    throw new Error(message);
  }

  if (result.issues) return result;
  // At this point result is a success result and has a typed `value` property.
  return (result as StandardSchemaV1.SuccessResult<T>).value;
}
