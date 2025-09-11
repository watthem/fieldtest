import type { StandardSchemaV1 } from "@fieldtest/core";
/**
 * Interface for fieldtest user configuration
 */
export interface FieldTestConfig {
	/**
	 * Custom schema definitions or paths to schema files
	 */
	schemas?: Record<string, string | StandardSchemaV1>;
	/**
	 * Default schema to use when not specified
	 */
	defaultSchema?: string;
        /**
         * Custom configuration options
         */
        options?: Record<string, unknown>;
        /**
         * Glob patterns for files or directories to exclude
         */
        exclude?: string[];
}
/**
 * Load user-defined schemas from configuration file
 *
 * @param configPath Optional path to the config file, default is 'fieldtest.config.ts'
 * @returns Map of schemas loaded from the config
 */
export declare function loadUserSchema(
	configPath?: string,
): Promise<Record<string, StandardSchemaV1>>;
//# sourceMappingURL=loadUserSchema.d.ts.map
