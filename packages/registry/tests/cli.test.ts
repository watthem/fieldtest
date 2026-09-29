import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const cli = resolve(__dirname, "../dist/cli.mjs");
const fixtures = resolve(__dirname, "fixtures");

function run(...args: string[]): { code: number; out: string } {
	try {
		return { code: 0, out: execFileSync("node", [cli, ...args], { encoding: "utf8" }) };
	} catch (e) {
		const err = e as { status: number; stdout: string };
		return { code: err.status, out: err.stdout };
	}
}

describe("fieldtest skills", () => {
	it("passes a valid skill under the spec profile", () => {
		const { code, out } = run("skills", `${fixtures}/good`);
		expect(code).toBe(0);
		expect(out).toContain("1 SKILL.md files (spec): 0 errors, 0 warnings");
	});

	it("reports parse errors, misspelled keys, and drifted copies without crashing", () => {
		const { code, out } = run("skills", `${fixtures}/bad`, "--profile", "claude-code", "--json");
		expect(code).toBe(1);
		const report = JSON.parse(out);
		expect(report.files).toBe(4);
		const rules = report.issues.map((i: { source: string; rule?: string }) => i.rule ?? i.source);
		expect(rules).toContain("parse");
		expect(rules.filter((r: string) => r === "copies-differ")).toHaveLength(2);
		const typo = report.issues.find((i: { path: string[] }) => i.path[0] === "user-invokable");
		expect(typo).toMatchObject({ severity: "warn", hint: 'did you mean "user-invocable"?', line: 4 });
	});
});
