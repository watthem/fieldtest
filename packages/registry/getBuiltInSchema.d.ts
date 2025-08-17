import type { StandardSchemaV1 } from "@fieldtest/core";
/**
 * Collection of built-in schemas
 */
declare const builtInSchemas: {
	Note: StandardSchemaV1<unknown, unknown>;
	BlogPost: StandardSchemaV1<unknown, unknown>;
};
export type BuiltInSchemaName = keyof typeof builtInSchemas;
/**
 * Get all built-in schemas
 *
 * @returns Record of all available built-in schemas
 */
export declare function getBuiltInSchemas(): Record<string, StandardSchemaV1>;
/**
 * Get a specific built-in schema by name
 *
 * @param name Name of the built-in schema
 * @returns The requested schema or undefined if not found
 */
export declare function getBuiltInSchema(
	name: BuiltInSchemaName,
): StandardSchemaV1 | undefined;
//# sourceMappingURL=getBuiltInSchema.d.ts.map
