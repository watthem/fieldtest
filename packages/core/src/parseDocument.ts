import { LineCounter, isMap, parseDocument as parseYaml, stringify } from "yaml";
import { buildOutline } from "./outline";
import type { Document, Issue } from "./types";

const OPEN = /^---[ \t]*([A-Za-z0-9_-]*)[ \t]*$/;
const CLOSE = /^(?:---|\.\.\.)[ \t]*$/;
// `key: text: more` — an unquoted colon inside a plain scalar
const UNQUOTED_COLON = /^\s*[\w-]+:\s+[^'"|>\s].*:\s/;

function parseIssue(message: string, line: number | undefined, path?: string, hint?: string): Issue {
	const issue: Issue = { message, path: [], severity: "error", source: "parse" };
	if (line !== undefined) issue.line = line;
	if (path !== undefined) issue.file = path;
	if (hint) issue.hint = hint;
	return issue;
}

/**
 * Parse a Markdown file into front matter (as data), body, and body outline.
 *
 * Never throws and never executes anything. Problems (invalid YAML, a
 * non-YAML front-matter fence such as `---js`) are returned in `issues`, and
 * `frontmatter` is `{}` in that case. YAML is parsed as YAML 1.2, so values
 * like `2025-01-01` and `yes` stay strings.
 */
export function parseDocument(source: string, options: { path?: string } = {}): Document {
	const { path } = options;
	const raw = source;
	const text = source.charCodeAt(0) === 0xfeff ? source.slice(1) : source;
	const lines = text.split(/\r?\n/);
	const eol = text.includes("\r\n") ? "\r\n" : "\n";
	const issues: Issue[] = [];
	let frontmatter: Record<string, unknown> = {};
	const keyLines: Record<string, number> = {};
	let bodyStart = 0;

	const open = lines[0]?.match(OPEN);
	if (open) {
		const close = lines.findIndex((l, i) => i > 0 && CLOSE.test(l));
		if (close === -1) {
			issues.push(parseIssue("Front matter opens with --- but never closes", 1, path, "add a closing --- line"));
		} else {
			bodyStart = close + 1;
			const lang = open[1].toLowerCase();
			if (lang && lang !== "yaml" && lang !== "yml") {
				issues.push(
					parseIssue(
						`Front matter language "${open[1]}" is not supported; FieldTest reads YAML only and never executes front matter`,
						1,
						path,
					),
				);
			} else {
				const yamlText = lines.slice(1, close).join("\n");
				const lineCounter = new LineCounter();
				const doc = parseYaml(yamlText, { lineCounter, prettyErrors: true });
				if (doc.errors.length) {
					for (const err of doc.errors) {
						const yamlLine = err.linePos?.[0]?.line;
						const line = yamlLine === undefined ? undefined : yamlLine + 1;
						const src = yamlLine === undefined ? "" : (lines[yamlLine] ?? "");
						const hint = UNQUOTED_COLON.test(src) ? "quote the value, e.g. key: \"text: more\"" : undefined;
						issues.push(parseIssue(`Invalid YAML: ${err.message.split("\n")[0].replace(/ at line \d+, column \d+:?$/, "")}`, line, path, hint));
					}
				} else if (doc.contents === null) {
					// empty front matter
				} else if (!isMap(doc.contents)) {
					issues.push(parseIssue("Front matter must be a mapping of keys to values", 2, path));
				} else {
					frontmatter = (doc.toJS() ?? {}) as Record<string, unknown>;
					for (const item of doc.contents.items) {
						const key = (item.key as { value?: unknown; range?: [number, number, number] } | null) ?? null;
						if (key?.range && key.value !== undefined) {
							keyLines[String(key.value)] = lineCounter.linePos(key.range[0]).line + 1;
						}
					}
				}
			}
		}
	}

	const body = lines.slice(bodyStart).join(eol);
	const bodyLine = bodyStart + 1;
	const document: Document = {
		raw,
		frontmatter,
		body,
		bodyLine,
		outline: buildOutline(body, bodyLine),
		issues,
		keyLines,
	};
	if (path !== undefined) document.path = path;
	return document;
}

/** Serialize front matter and a body back into Markdown. */
export function serializeMarkdown(frontmatter: Record<string, unknown>, body: string): string {
	if (!frontmatter || Object.keys(frontmatter).length === 0) return body;
	return `---\n${stringify(frontmatter)}---\n${body}`;
}
