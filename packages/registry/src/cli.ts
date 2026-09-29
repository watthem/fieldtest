#!/usr/bin/env node
import { parseArgs } from "node:util";
import { formatIssues } from "@fieldtest/core";
import { type SkillProfile, checkSkillTree } from "./skills";

const USAGE = `Usage: fieldtest skills <dir...> [--profile spec|claude-code] [--json] [--errors-only]

Checks every SKILL.md under the given directories.
  --profile      spec (default): the Agent Skills spec, https://agentskills.io/specification
                 claude-code: the fields Claude Code accepts
  --json         print the full report as JSON
  --errors-only  hide warnings
Exits 1 when any error is found.`;

async function main(argv: string[]): Promise<number> {
	const { values, positionals } = parseArgs({
		args: argv,
		allowPositionals: true,
		options: {
			profile: { type: "string", default: "spec" },
			json: { type: "boolean", default: false },
			"errors-only": { type: "boolean", default: false },
			help: { type: "boolean", short: "h", default: false },
		},
	});
	const [command, ...dirs] = positionals;
	if (values.help || command !== "skills" || dirs.length === 0) {
		console.log(USAGE);
		return values.help ? 0 : 2;
	}
	const profile = values.profile as SkillProfile;
	if (profile !== "spec" && profile !== "claude-code") {
		console.error(`Unknown profile "${values.profile}"\n\n${USAGE}`);
		return 2;
	}
	const report = await checkSkillTree(dirs, { profile });
	if (values["errors-only"]) report.issues = report.issues.filter((i) => i.severity === "error");
	if (values.json) {
		console.log(JSON.stringify(report, null, 2));
	} else {
		if (report.issues.length) console.log(formatIssues(report.issues));
		const withIssues = new Set(report.issues.map((i) => i.file)).size;
		console.log(
			`\n${report.files} SKILL.md files (${profile}): ${report.errors} errors, ${report.warnings} warnings in ${withIssues} files`,
		);
	}
	return report.ok ? 0 : 1;
}

main(process.argv.slice(2)).then(
	(code) => process.exit(code),
	(err) => {
		console.error(err);
		process.exit(2);
	},
);
