#!/usr/bin/env node

/**
 * doc-ref CLI
 *
 * Command-line interface for doc-ref operations.
 * Currently a placeholder for future CLI functionality.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { loadSpec, parseMarkdownSections } from "./markdown";

interface CliOptions {
	file?: string;
	section?: string;
	verbose?: boolean;
}

function parseArgs(args: string[]): CliOptions {
	const options: CliOptions = {};

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];

		if (arg === "--file" || arg === "-f") {
			options.file = args[++i];
		} else if (arg === "--section" || arg === "-s") {
			options.section = args[++i];
		} else if (arg === "--verbose" || arg === "-v") {
			options.verbose = true;
		} else if (!arg.startsWith("-") && !options.file) {
			options.file = arg;
		}
	}

	return options;
}

function printUsage(): void {
	console.log(`
doc-ref - Documentation Reference Tool

Usage:
  doc-ref <file> [options]
  doc-ref --file <path> [--section <name>] [--verbose]

Options:
  -f, --file <path>     Markdown file to analyze
  -s, --section <name>  Specific section to target
  -v, --verbose         Enable verbose output

Examples:
  doc-ref docs/api.md
  doc-ref docs/spec.md --section examples
  doc-ref docs/spec.md#examples
`);
}

function analyzeSpec(options: CliOptions): void {
	if (!options.file) {
		console.error("Error: No file specified");
		printUsage();
		process.exit(1);
	}

	const specPath = options.section
		? `${options.file}#${options.section}`
		: options.file;

	try {
		const spec = loadSpec(specPath);

		console.log(`\nSpec: ${spec.path}`);
		console.log(`Sections: ${spec.sections.length}`);

		if (options.verbose) {
			console.log("\nSections:");
			for (const section of spec.sections) {
				console.log(`  - ${section.title} (level ${section.level})`);
				console.log(`    Tables: ${section.tables.length}`);
				console.log(`    Examples: ${section.examples.length}`);
				console.log(`    Assertions: ${section.assertions.length}`);
				console.log(`    Bindings: ${section.bindings.length}`);
			}
		}

		if (spec.targetSection) {
			console.log(`\nTarget Section: ${spec.targetSection.title}`);
			console.log(`  Tables: ${spec.targetSection.tables.length}`);
			console.log(`  Examples: ${spec.targetSection.examples.length}`);
			console.log(`  Assertions: ${spec.targetSection.assertions.length}`);
			console.log(`  Bindings: ${spec.targetSection.bindings.length}`);
		}
	} catch (error) {
		console.error(`Error: ${error instanceof Error ? error.message : error}`);
		process.exit(1);
	}
}

// Main entry point
const args = process.argv.slice(2);

if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
	printUsage();
} else {
	const options = parseArgs(args);
	analyzeSpec(options);
}
