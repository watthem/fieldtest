#!/usr/bin/env node
/**
 * CLI for @fieldtest/doc-ref
 *
 * Usage:
 *   doc-ref [project-dir] [--verbose] [--json] [--debt] [--include-inferred]
 */

import { generateReport, formatReport, formatDebtReport } from "../index";

interface CliOptions {
	projectDir: string;
	verbose: boolean;
	json: boolean;
	debt: boolean;
	includeInferred: boolean;
}

function parseArgs(args: string[]): CliOptions {
	const options: CliOptions = {
		projectDir: process.cwd(),
		verbose: false,
		json: false,
		debt: false,
		includeInferred: false,
	};

	for (const arg of args) {
		if (arg === "--verbose" || arg === "-v") {
			options.verbose = true;
		} else if (arg === "--json") {
			options.json = true;
		} else if (arg === "--debt" || arg === "-d") {
			options.debt = true;
		} else if (arg === "--include-inferred") {
			options.includeInferred = true;
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
  --verbose, -v       Show detailed reference information
  --json              Output as JSON
  --debt, -d          Enable documentation debt detection
  --include-inferred  Include inferred promises in debt detection
  --help, -h          Show this help

Examples:
  doc-ref                     # Validate current directory
  doc-ref ./my-project        # Validate specific project
  doc-ref --json              # Output as JSON for CI
  doc-ref --debt              # Check for documentation debt
  doc-ref --debt --verbose    # Show detailed debt analysis
`);
		process.exit(0);
	}

	const options = parseArgs(args);

	try {
		const report = await generateReport(options.projectDir, {
			includeDebt: options.debt,
			debtOptions: {
				includeInferred: options.includeInferred,
			},
		});

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

				// Show detailed fulfillment info when debt is enabled
				if (report.debt && report.debt.fulfillments.length > 0) {
					console.log("\nPromise Fulfillments:");
					for (const f of report.debt.fulfillments) {
						const status = f.fulfilled ? "✓" : "✗";
						const evidence = f.evidence ? ` (${f.evidence})` : "";
						console.log(
							`  ${status} ${f.promise.identifier} [${f.verification}]${evidence}`,
						);
					}
				}
			}
		}

		// Exit with error code if there are invalid references or critical debt
		if (report.invalidRefs > 0) {
			process.exit(1);
		}

		// Exit with error code if there is critical debt
		if (report.debt) {
			const criticalDebt = report.debt.debts.filter(
				(d) => d.severity === "critical",
			);
			if (criticalDebt.length > 0) {
				process.exit(1);
			}
		}
	} catch (error) {
		console.error("Error:", error instanceof Error ? error.message : error);
		process.exit(1);
	}
}

main();
