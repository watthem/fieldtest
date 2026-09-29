import { hasErrors, toIssues } from "./check";
import { parseDocument } from "./parseDocument";
import type { Document, Issue, Result, StandardSchemaV1 } from "./types";

/** A check that needs more than a schema: the file system, other fields, or the raw text. */
export type Rule = (doc: Document) => Issue[] | Promise<Issue[]>;

export interface DocumentChecks {
	/** Schema for the front matter. */
	frontmatter?: StandardSchemaV1;
	/** Schema for `doc.outline` (headings, code blocks, links, counts). */
	outline?: StandardSchemaV1;
	rules?: Rule[];
}

/**
 * Check a parsed document: its parse issues, front matter, outline, and rules.
 *
 * `ok` is false when any issue is an error; warnings alone keep it true.
 * Front-matter issues carry the line of the top-level key they belong to.
 */
export async function checkDocument(
	doc: Document,
	checks: DocumentChecks = {},
): Promise<Result<Document>> {
	const issues: Issue[] = [...doc.issues];
	const parsed = !doc.issues.some((i) => i.source === "parse" && i.severity === "error");

	if (checks.frontmatter && parsed) {
		const r = await checks.frontmatter["~standard"].validate(doc.frontmatter);
		if (r.issues) {
			for (const issue of toIssues(r.issues, "frontmatter")) {
				const line = doc.keyLines[String(issue.path[0])];
				if (line !== undefined) issue.line = line;
				issues.push(issue);
			}
		}
	}
	if (checks.outline) {
		const r = await checks.outline["~standard"].validate(doc.outline);
		if (r.issues) issues.push(...toIssues(r.issues, "outline"));
	}
	for (const rule of checks.rules ?? []) issues.push(...(await rule(doc)));

	for (const issue of issues) if (doc.path !== undefined && issue.file === undefined) issue.file = doc.path;
	return hasErrors(issues) ? { ok: false, issues } : { ok: true, value: doc, issues };
}

/** Read and parse a Markdown file from disk. */
export async function readDocument(path: string): Promise<Document> {
	const { readFile } = await import("node:fs/promises");
	return parseDocument(await readFile(path, "utf8"), { path });
}

/** Rule: every relative link in the body points at a file that exists (relative to the document). */
export const relativeLinksResolve: Rule = async (doc) => {
	if (doc.path === undefined) return [];
	const { access } = await import("node:fs/promises");
	const { dirname, resolve } = await import("node:path");
	const issues: Issue[] = [];
	for (const link of doc.outline.links) {
		if (!link.relative) continue;
		const target = decodeURI(link.href.split(/[#?]/)[0]);
		if (!target) continue;
		try {
			await access(resolve(dirname(doc.path), target));
		} catch {
			issues.push({
				message: `Link target not found: ${link.href}`,
				path: [],
				severity: "error",
				source: "rule",
				rule: "relative-links-resolve",
				line: link.line,
			});
		}
	}
	return issues;
};
