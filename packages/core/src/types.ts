/**
 * FieldTest Core Types
 */

// The Standard Schema V1 interface, copied from https://standardschema.dev/ as the spec recommends.
export interface StandardSchemaV1<Input = unknown, Output = Input> {
	/** The Standard Schema properties. */
	readonly "~standard": StandardSchemaV1.Props<Input, Output>;
}

export declare namespace StandardSchemaV1 {
	/** The Standard Schema properties interface. */
	export interface Props<Input = unknown, Output = Input> {
		/** The version number of the standard. */
		readonly version: 1;
		/** The vendor name of the schema library. */
		readonly vendor: string;
		/** Validates unknown input values. */
		readonly validate: (
			value: unknown,
		) => Result<Output> | Promise<Result<Output>>;
		/** Inferred types associated with the schema. */
		readonly types?: Types<Input, Output> | undefined;
	}

	/** The result interface of the validate function. */
	export type Result<Output> = SuccessResult<Output> | FailureResult;

	/** The result interface if validation succeeds. */
	export interface SuccessResult<Output> {
		/** The typed output value. */
		readonly value: Output;
		/** The non-existent issues. */
		readonly issues?: undefined;
	}

	/** The result interface if validation fails. */
	export interface FailureResult {
		/** The issues of failed validation. */
		readonly issues: ReadonlyArray<Issue>;
	}

	/** The issue interface of the failure output. */
	export interface Issue {
		/** The error message of the issue. */
		readonly message: string;
		/** The path of the issue, if any. */
		readonly path?: ReadonlyArray<PropertyKey | PathSegment> | undefined;
	}

	/** The path segment interface of the issue. */
	export interface PathSegment {
		/** The key representing a path segment. */
		readonly key: PropertyKey;
	}

	/** The Standard Schema types interface. */
	export interface Types<Input = unknown, Output = Input> {
		/** The input type of the schema. */
		readonly input: Input;
		/** The output type of the schema. */
		readonly output: Output;
	}

	/** Infers the input type of a Standard Schema. */
	export type InferInput<Schema extends StandardSchemaV1> = NonNullable<
		Schema["~standard"]["types"]
	>["input"];

	/** Infers the output type of a Standard Schema. */
	export type InferOutput<Schema extends StandardSchemaV1> = NonNullable<
		Schema["~standard"]["types"]
	>["output"];
}

/** Where an issue came from. */
export type IssueSource = "data" | "parse" | "frontmatter" | "outline" | "rule" | "tree";

/** One problem found by FieldTest, in the same shape whatever produced it. */
export interface Issue {
	message: string;
	/** Keys from the checked value's root to the offending field. */
	path: (string | number)[];
	severity: "error" | "warn";
	source: IssueSource;
	/** 1-based line in the file, when known. */
	line?: number;
	file?: string;
	/** Name of the rule that produced the issue, for rule, tree, and preset issues. */
	rule?: string;
	/** A concrete fix, when there is an obvious one. */
	hint?: string;
}

/** The result of every check: the value on success, the issues on failure. */
export type Result<T> =
	| { ok: true; value: T; issues: Issue[] }
	| { ok: false; value?: undefined; issues: Issue[] };

export interface CheckOptions {
	/** Throw an Error listing the issues instead of returning `{ ok: false }`. */
	throwOnError?: boolean;
}

/** The body of a Markdown document, reduced to elements a schema can check. */
export interface Outline {
	/** Lines in the body. */
	lines: number;
	/** Rough token count (characters / 4). */
	approxTokens: number;
	headings: { depth: number; text: string; line: number }[];
	codeBlocks: { lang?: string; line: number }[];
	links: { href: string; text: string; line: number; relative: boolean }[];
	/** List items (bulleted or numbered). */
	listItems: number;
	tables: number;
}

/** A parsed Markdown file: front matter as data, body as text plus outline. */
export interface Document {
	path?: string;
	raw: string;
	/** Parsed YAML front matter; `{}` when there is none or it failed to parse. */
	frontmatter: Record<string, unknown>;
	body: string;
	/** 1-based line where the body starts in the file. */
	bodyLine: number;
	outline: Outline;
	/** Problems found while parsing (bad YAML, unsupported front-matter language). */
	issues: Issue[];
	/** 1-based line of each top-level front-matter key, for issue locations. */
	keyLines: Record<string, number>;
}
