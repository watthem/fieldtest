#!/usr/bin/env node

/**
 * Validation CLI
 *
 * Command-line interface for validating content using schemas from our validation library
 */

import fs from "fs";
import path from "path";
import { scanSite } from "@docs-score/core";
import { Command } from "commander";
import { z } from "zod";
import { ScanOptionsSchema, formatZodError, validate } from "./index";

// Create a new Commander program
const program = new Command();

// Configure program metadata
program
	.name("validate")
	.description("Validate content using schemas from our validation library")
	.version("0.1.0");

// Command for validating a URL
program
	.command("url")
	.description("Validate a URL")
	.argument("<url>", "URL to validate")
	.option("-d, --depth <number>", "Maximum crawl depth", "3")
	.option("-c, --concurrency <number>", "Number of concurrent requests", "5")
	.option("-o, --output <file>", "Output file for validation results")
	.action(async (url, options) => {
		// Validate the options
		const optionsSchema = z.object({
			depth: z.preprocess(
				(val) => Number.parseInt(val as string, 10),
				z.number().int().positive(),
			),
			concurrency: z.preprocess(
				(val) => Number.parseInt(val as string, 10),
				z.number().int().positive(),
			),
			output: z.string().optional(),
		});

		const [isValid, parsedOptions] = validate(optionsSchema, options);

		if (!isValid) {
			console.error("Invalid options:");
			console.error(formatZodError(parsedOptions as z.ZodError));
			process.exit(1);
		}

		// Validate the URL and options using our schema
		const [isScanOptionsValid, scanOptions] = validate(ScanOptionsSchema, {
			entry: url,
			maxDepth: (parsedOptions as z.infer<typeof optionsSchema>).depth,
			concurrency: (parsedOptions as z.infer<typeof optionsSchema>).concurrency,
		});

		if (!isScanOptionsValid) {
			console.error("Invalid scan options:");
			console.error(formatZodError(scanOptions as z.ZodError));
			process.exit(1);
		}

		try {
			console.log(`Validating ${url}...`);
			const result = await scanSite(scanOptions as any);

			console.log(`\nValidation complete!`);
			console.log(`Found ${result.length} pages`);

			// Write the results to a file if output is specified
			if ((parsedOptions as z.infer<typeof optionsSchema>).output) {
				const outputFile = (parsedOptions as z.infer<typeof optionsSchema>)
					.output as string;
				fs.writeFileSync(
					path.resolve(process.cwd(), outputFile),
					JSON.stringify(result, null, 2),
				);
				console.log(`Results written to ${outputFile}`);
			}
		} catch (error) {
			console.error("Error validating URL:");
			console.error(error instanceof Error ? error.message : String(error));
			process.exit(1);
		}
	});

// Command for validating a JSON config file
program
	.command("config")
	.description("Validate a configuration file")
	.argument("<file>", "Path to configuration file")
	.option(
		"-s, --schema <name>",
		"Schema to validate against",
		"ValidationConfig",
	)
	.action((file, options) => {
		try {
			const configFile = path.resolve(process.cwd(), file);
			const configContent = fs.readFileSync(configFile, "utf-8");
			const configData = JSON.parse(configContent);

			// Import the schema dynamically based on the name
			import("./schemas")
				.then((schemas) => {
					const schemaName = `${options.schema}Schema`;
					const schema = (schemas as any)[schemaName];

					if (!schema) {
						console.error(`Schema ${schemaName} not found`);
						process.exit(1);
					}

					const [isValid, result] = validate(schema, configData);

					if (isValid) {
						console.log(`Configuration file ${file} is valid!`);
					} else {
						console.error(`Configuration file ${file} is invalid:`);
						console.error(formatZodError(result as z.ZodError));
						process.exit(1);
					}
				})
				.catch((error) => {
					console.error("Error importing schemas:");
					console.error(error instanceof Error ? error.message : String(error));
					process.exit(1);
				});
		} catch (error) {
			console.error("Error reading or parsing configuration file:");
			console.error(error instanceof Error ? error.message : String(error));
			process.exit(1);
		}
	});

// Parse the command line arguments
program.parse();
