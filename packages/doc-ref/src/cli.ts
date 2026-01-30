#!/usr/bin/env node
/**
 * CLI for @fieldtest/doc-ref
 *
 * Usage:
 *   doc-ref [project-dir] [--verbose] [--json]
 */

import { generateReport, formatReport } from "../index";

interface CliOptions {
	projectDir: string;
	verbose: boolean;
	json: boolean;
}

function parseArgs(args: string[]): CliOptions {
	const options: CliOptions = {
		projectDir: process.cwd(),
		verbose: false,
		json: false,
	};

	for (const arg of args) {
		if (arg === "--verbose" || arg === "-v") {
			options.verbose = true;
		} else if (arg === "--json") {
			options.json = true;
		} else if (!arg.startsWith("-")) {
			options.projectDir = arg;
		}
	}

	return options;
}

async function main() {
	const args = process.argv.slice(2);

	if (args.includes("--help") || args.includes("-h")) {
		console.log(`
@fieldtest/doc-ref - Doc-driven testing validation

Usage:
  doc-ref [project-dir] [options]

Options:
  --verbose, -v   Show detailed reference information
  --json          Output as JSON
  --help, -h      Show this help

Examples:
  doc-ref                     # Validate current directory
  doc-ref ./my-project        # Validate specific project
  doc-ref --json              # Output as JSON for CI
`);
		process.exit(0);
	}

	const options = parseArgs(args);

	try {
		const report = await generateReport(options.projectDir);

		if (options.json) {
			console.log(JSON.stringify(report, null, 2));
		} else {
			console.log(formatReport(report));

			if (options.verbose) {
				console.log("\nAll References:");
				for (const result of report.results) {
					const status = result.valid ? "✓" : "✗";
					console.log(`  ${status} ${result.reference.raw}`);
					if (!result.valid && result.error) {
						console.log(`    Error: ${result.error}`);
					}
				}
			}
		}

		// Exit with error code if there are invalid references
		if (report.invalidRefs > 0) {
			process.exit(1);
		}
	} catch (error) {
		console.error("Error:", error instanceof Error ? error.message : error);
		process.exit(1);
	}
}

main();
