import { createHash } from "node:crypto";
import { readdir, realpath, stat } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import {
	type Document,
	type Issue,
	type Rule,
	checkDocument,
	readDocument,
	relativeLinksResolve,
} from "@fieldtest/core";
import { z } from "zod";
import { SKILL_BODY_LIMITS, SKILL_FIELDS } from "./fields";

export { SKILL_BODY_LIMITS, SKILL_FIELDS } from "./fields";

export type SkillProfile = "spec" | "claude-code";

const NAME = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const stringOrList = z.union([z.string(), z.array(z.string())]);

/** Agent Skills spec front matter (https://agentskills.io/specification). */
export const skillSpecFrontmatter = z
	.object({
		name: z
			.string()
			.min(1)
			.max(64)
			.regex(NAME, "Use lowercase letters, digits, and single hyphens; no leading or trailing hyphen"),
		description: z.string().min(1).max(1024),
		license: z.string().optional(),
		compatibility: z.string().min(1).max(500).optional(),
		metadata: z.record(z.string(), z.string()).optional(),
		"allowed-tools": z.string().optional(),
	})
	.passthrough();

/** Claude Code front matter (https://code.claude.com/docs/en/skills). Every field is optional. */
export const skillClaudeCodeFrontmatter = z
	.object({
		name: z.string().min(1).optional(),
		description: z.string().optional(),
		when_to_use: z.string().optional(),
		"argument-hint": z.string().optional(),
		arguments: stringOrList.optional(),
		"disable-model-invocation": z.boolean().optional(),
		"user-invocable": z.boolean().optional(),
		"allowed-tools": stringOrList.optional(),
		"disallowed-tools": stringOrList.optional(),
		model: z.string().optional(),
		effort: z.enum(["low", "medium", "high", "xhigh", "max"]).optional(),
		context: z.literal("fork").optional(),
		agent: z.string().optional(),
		background: z.boolean().optional(),
		hooks: z.record(z.string(), z.unknown()).optional(),
		paths: stringOrList.optional(),
		shell: z.enum(["bash", "powershell"]).optional(),
		metadata: z.record(z.string(), z.unknown()).optional(),
		license: z.string().optional(),
		compatibility: z.string().min(1).max(500).optional(),
	})
	.passthrough();

function distance(a: string, b: string): number {
	const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
	for (let j = 1; j <= b.length; j++) d[0][j] = j;
	for (let i = 1; i <= a.length; i++)
		for (let j = 1; j <= b.length; j++)
			d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
	return d[a.length][b.length];
}

function issue(doc: Document, rule: string, severity: Issue["severity"], message: string, extra: Partial<Issue> = {}): Issue {
	return { message, path: [], severity, source: "rule", rule, ...extra, ...(doc.path ? { file: doc.path } : {}) };
}

/** Keys the host doesn't know. A near miss of a known key gets a "did you mean". */
function unknownKeys(profile: SkillProfile): Rule {
	const known: readonly string[] = profile === "spec" ? SKILL_FIELDS.spec.keys : SKILL_FIELDS.claudeCode.keys;
	return (doc) =>
		Object.keys(doc.frontmatter)
			.filter((k) => !known.includes(k))
			.map((k) => {
				const near = known.find((c) => distance(k.toLowerCase(), c) <= 2);
				return issue(
					doc,
					"unknown-key",
					profile === "spec" ? "error" : "warn",
					near ? `Unknown key "${k}"; the host ignores it` : `Unknown key "${k}"`,
					{ path: [k], line: doc.keyLines[k], ...(near ? { hint: `did you mean "${near}"?` } : {}) },
				);
			});
}

function nameMatchesFolder(profile: SkillProfile): Rule {
	return (doc) => {
		const name = doc.frontmatter.name;
		const folder = doc.path ? basename(dirname(doc.path)) : undefined;
		if (typeof name !== "string" || !folder || name === folder) return [];
		return [
			issue(doc, "name-matches-folder", profile === "spec" ? "error" : "warn", `name "${name}" doesn't match its folder "${folder}"`, {
				path: ["name"],
				line: doc.keyLines.name,
			}),
		];
	};
}

const bodySize: Rule = (doc) => {
	const out: Issue[] = [];
	if (doc.outline.lines > SKILL_BODY_LIMITS.lines)
		out.push(issue(doc, "body-size", "warn", `Body is ${doc.outline.lines} lines; keep SKILL.md under ${SKILL_BODY_LIMITS.lines} and move detail to referenced files`));
	if (doc.outline.approxTokens > SKILL_BODY_LIMITS.tokens)
		out.push(issue(doc, "body-size", "warn", `Body is about ${doc.outline.approxTokens} tokens; the spec recommends under ${SKILL_BODY_LIMITS.tokens}`));
	return out;
};

const claudeCodeExtras: Rule = (doc) => {
	const fm = doc.frontmatter;
	const out: Issue[] = [];
	if (typeof fm.description !== "string" || !fm.description.trim())
		out.push(issue(doc, "description-missing", "warn", "No description; Claude Code falls back to the first line of the body", { path: ["description"] }));
	const listing = `${typeof fm.description === "string" ? fm.description : ""}${typeof fm.when_to_use === "string" ? fm.when_to_use : ""}`;
	if (listing.length > SKILL_FIELDS.claudeCode.listingLimit)
		out.push(
			issue(doc, "listing-truncated", "warn", `description + when_to_use is ${listing.length} characters; the skill listing truncates at ${SKILL_FIELDS.claudeCode.listingLimit}`, {
				path: ["description"],
				line: doc.keyLines.description,
			}),
		);
	return out;
};

export interface SkillCheckOptions {
	profile?: SkillProfile;
}

/** Check one parsed SKILL.md against a host profile. */
export async function checkSkill(doc: Document, options: SkillCheckOptions = {}) {
	const profile = options.profile ?? "spec";
	const rules: Rule[] = [unknownKeys(profile), nameMatchesFolder(profile), bodySize, relativeLinksResolve];
	if (profile === "claude-code") rules.push(claudeCodeExtras);
	return checkDocument(doc, {
		frontmatter: profile === "spec" ? skillSpecFrontmatter : skillClaudeCodeFrontmatter,
		rules,
	});
}

const SKIP = new Set(["node_modules", ".git", "dist"]);

/** Every SKILL.md under the given roots (follows symlinks, visits each real directory once). */
export async function findSkillFiles(roots: string[]): Promise<string[]> {
	const found: string[] = [];
	const seen = new Set<string>();
	async function walk(dir: string): Promise<void> {
		let real: string;
		try {
			real = await realpath(dir);
		} catch {
			return;
		}
		if (seen.has(real)) return;
		seen.add(real);
		const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
		for (const e of entries) {
			const p = join(dir, e.name);
			if (e.isFile() && e.name === "SKILL.md") found.push(p);
			else if (!SKIP.has(e.name) && (e.isDirectory() || (e.isSymbolicLink() && (await stat(p).catch(() => null))?.isDirectory())))
				await walk(p);
		}
	}
	for (const r of roots) await walk(r);
	return found.sort();
}

export interface SkillTreeReport {
	ok: boolean;
	files: number;
	errors: number;
	warnings: number;
	issues: Issue[];
}

/**
 * Check every SKILL.md under the roots, plus issues no single file can show:
 * copies of one skill (same name) whose contents differ.
 */
export async function checkSkillTree(roots: string[], options: SkillCheckOptions = {}): Promise<SkillTreeReport> {
	const files = await findSkillFiles(roots);
	const issues: Issue[] = [];
	const byName = new Map<string, { path: string; hash: string }[]>();
	for (const path of files) {
		const doc = await readDocument(path);
		issues.push(...(await checkSkill(doc, options)).issues);
		const name = typeof doc.frontmatter.name === "string" ? doc.frontmatter.name : basename(dirname(path));
		const hash = createHash("sha1").update(doc.raw).digest("hex");
		byName.set(name, [...(byName.get(name) ?? []), { path, hash }]);
	}
	for (const [name, copies] of byName) {
		if (new Set(copies.map((c) => c.hash)).size < 2) continue;
		for (const c of copies)
			issues.push({
				message: `${copies.length} copies of skill "${name}" have different contents`,
				path: [],
				severity: "warn",
				source: "tree",
				rule: "copies-differ",
				file: c.path,
				hint: copies.filter((o) => o !== c).map((o) => o.path).join(", "),
			});
	}
	const errors = issues.filter((i) => i.severity === "error").length;
	return { ok: errors === 0, files: files.length, errors, warnings: issues.length - errors, issues };
}
