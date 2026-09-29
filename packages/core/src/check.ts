import type { CheckOptions, Issue, IssueSource, Result, StandardSchemaV1 } from "./types";

/** Convert Standard Schema issues to FieldTest issues. */
export function toIssues(
	issues: ReadonlyArray<StandardSchemaV1.Issue>,
	source: IssueSource = "data",
): Issue[] {
	return issues.map((issue) => ({
		message: issue.message,
		path: (issue.path ?? []).map((seg) => {
			const key = typeof seg === "object" && seg !== null && "key" in seg ? seg.key : seg;
			return typeof key === "number" ? key : String(key);
		}),
		severity: "error" as const,
		source,
	}));
}

/** One issue per line: `file:line path: message`. */
export function formatIssues(issues: Issue[]): string {
	return issues
		.map((i) => {
			const where = [i.file, i.line].filter((x) => x !== undefined).join(":");
			const path = i.path.length ? `${i.path.join(".")}: ` : "";
			const tag = i.severity === "warn" ? "warn " : "";
			const hint = i.hint ? ` (${i.hint})` : "";
			return `${where ? `${where} ` : ""}${tag}${path}${i.message}${hint}`;
		})
		.join("\n");
}

export function hasErrors(issues: Issue[]): boolean {
	return issues.some((i) => i.severity === "error");
}

/**
 * Validate data with any Standard Schema (zod, valibot, arktype, ...).
 *
 * Returns `{ ok: true, value }` or `{ ok: false, issues }`; never a bare value.
 */
export async function check<S extends StandardSchemaV1>(
	schema: S,
	data: unknown,
	options: CheckOptions = {},
): Promise<Result<StandardSchemaV1.InferOutput<S>>> {
	const result = await schema["~standard"].validate(data);
	if (result.issues) {
		const issues = toIssues(result.issues);
		if (options.throwOnError) throw new Error(formatIssues(issues) || "Validation failed");
		return { ok: false, issues };
	}
	return { ok: true, value: result.value as StandardSchemaV1.InferOutput<S>, issues: [] };
}
