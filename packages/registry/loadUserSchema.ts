import * as path from "path";
import type { StandardSchemaV1 } from "@fieldtest/core";
import * as fs from "fs/promises";

/**
 * Default config file name
 */
const DEFAULT_CONFIG_FILE = "fieldtest.config.ts";

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
}

/**
 * Load user-defined schemas from configuration file
 *
 * @param configPath Optional path to the config file, default is 'fieldtest.config.ts'
 * @returns Map of schemas loaded from the config
 */
export async function loadUserSchema(
	configPath = DEFAULT_CONFIG_FILE,
): Promise<Record<string, StandardSchemaV1>> {
	const configFilePath = path.resolve(process.cwd(), configPath);

	try {
		// Check if config file exists
		await fs.access(configFilePath);

		// Dynamic import to load the configuration module
		const configModule = await import(configFilePath);
		const config: FieldTestConfig = configModule.default || configModule;

		if (!config || !config.schemas) {
			return {};
		}

		const schemas: Record<string, StandardSchemaV1> = {};

		// Process each schema definition
		for (const [name, schemaOrPath] of Object.entries(config.schemas)) {
			if (typeof schemaOrPath === "string") {
				// If it's a string, treat it as a path and load the schema
				const schemaPath = path.resolve(
					path.dirname(configFilePath),
					schemaOrPath,
				);
				const schemaModule = await import(schemaPath);
				const schema = schemaModule.default || schemaModule;

				if (isStandardSchema(schema)) {
					schemas[name] = schema;
				} else {
					console.warn(
						`Schema ${name} at ${schemaPath} does not conform to StandardSchemaV1`,
					);
				}
			} else if (isStandardSchema(schemaOrPath)) {
				// If it's already a schema object, use it directly
				schemas[name] = schemaOrPath;
			} else {
				console.warn(`Schema ${name} does not conform to StandardSchemaV1`);
			}
		}

		return schemas;
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") {
			// Config file doesn't exist, return empty schemas
			return {};
		}

		throw new Error(
			`Failed to load config from ${configPath}: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}

/**
 * Type guard to check if an object conforms to the StandardSchemaV1 interface
 */
function isStandardSchema(schema: unknown): schema is StandardSchemaV1 {
	return (
		typeof schema === "object" &&
		schema !== null &&
		"id" in schema &&
		"version" in schema &&
		"validate" in schema &&
		typeof (schema as any).validate === "function"
	);
}
