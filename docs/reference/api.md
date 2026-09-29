# API Reference (2.x)

Upgrading from 1.x: see [MIGRATING.md](https://github.com/watthem/fieldtest/blob/main/MIGRATING.md).

## @fieldtest/core

### parseDocument(source, options?)

Parses a Markdown file into front matter (as data), body, and body outline. It never throws and never executes anything.

```typescript
import { parseDocument } from '@fieldtest/core';

const doc = parseDocument(`---
title: Hello
date: 2025-01-01
---
# Hello
`, { path: 'posts/hello.md' });

doc.frontmatter; // { title: "Hello", date: "2025-01-01" }  (YAML 1.2: dates stay strings)
doc.keyLines;    // { title: 2, date: 3 }
doc.outline.headings; // [{ depth: 1, text: "Hello", line: 5 }]
doc.issues;      // [] — invalid YAML or a ---js fence would be reported here
```

- **Parameters:** `source: string`, `options?: { path?: string }`
- **Returns:** `Document`

### check(schema, data, options?)

Validates data with any Standard Schema (zod, valibot, arktype, ...).

```typescript
import { check } from '@fieldtest/core';

const result = await check(schema, { title: 'Hi', count: 42 });
if (result.ok) {
  result.value; // typed output
} else {
  result.issues; // Issue[]
}

await check(schema, input, { throwOnError: true }); // throws an Error listing the issues
```

- **Returns:** `Promise<Result<T>>` — `{ ok: true, value, issues: [] }` or `{ ok: false, issues }`

### checkDocument(doc, checks)

Checks a parsed document: its parse issues, then `frontmatter` and `outline` schemas, then rules. `ok` is false when any issue is an error; warnings alone keep it true. Front-matter issues carry the line of their top-level key.

```typescript
import { checkDocument, relativeLinksResolve } from '@fieldtest/core';

const result = await checkDocument(doc, {
  frontmatter: z.object({ title: z.string() }),
  outline: z.object({ lines: z.number().max(500) }),
  rules: [relativeLinksResolve],
});
```

- **Returns:** `Promise<Result<Document>>`

### readDocument(path)

Reads a file and returns `parseDocument(contents, { path })`.

### Rules

A rule is `(doc: Document) => Issue[] | Promise<Issue[]>`, for checks a schema can't express. Built in:

- `relativeLinksResolve` — every relative link in the body points at a file that exists.

### formatIssues(issues) / hasErrors(issues)

`formatIssues` prints one issue per line: `file:line [warn] path: message (hint)`.

### serializeMarkdown(frontmatter, body)

Writes front matter (YAML) and body back into Markdown. Round-trips with `parseDocument`.

### buildOutline(body, firstLine?)

The outline builder `parseDocument` uses, exported for bodies you already have.

## Types

```typescript
interface Document {
  path?: string;
  raw: string;
  frontmatter: Record<string, unknown>; // {} when missing or unparseable
  body: string;
  bodyLine: number;                     // 1-based file line where the body starts
  outline: Outline;
  issues: Issue[];                      // parse problems
  keyLines: Record<string, number>;     // 1-based line of each top-level key
}

interface Outline {
  lines: number;
  approxTokens: number;                 // characters / 4
  headings: { depth: number; text: string; line: number }[];
  codeBlocks: { lang?: string; line: number }[];
  links: { href: string; text: string; line: number; relative: boolean }[];
  listItems: number;
  tables: number;
}

interface Issue {
  message: string;
  path: (string | number)[];
  severity: 'error' | 'warn';
  source: 'data' | 'parse' | 'frontmatter' | 'outline' | 'rule' | 'tree';
  line?: number;
  file?: string;
  rule?: string;
  hint?: string;
}

type Result<T> =
  | { ok: true; value: T; issues: Issue[] }
  | { ok: false; value?: undefined; issues: Issue[] };
```

`StandardSchemaV1` is exported as well; see [standardschema.dev](https://standardschema.dev).

The outline is a line scanner, not a full CommonMark parser: it reads ATX (`#`) headings, fenced code, inline links, list items, and pipe tables, and skips the content of code fences.

## @fieldtest/registry

Requires `zod` 3.25+ or 4 as a peer dependency.

### Agent skills

```typescript
import { checkSkill, checkSkillTree } from '@fieldtest/registry';

const report = await checkSkillTree(['.claude/skills'], { profile: 'claude-code' });
report.ok; report.files; report.errors; report.warnings; report.issues;
```

- `profile: 'spec'` (default): the [Agent Skills specification](https://agentskills.io/specification). Unknown keys and a `name` that doesn't match its folder are errors.
- `profile: 'claude-code'`: the fields [Claude Code](https://code.claude.com/docs/en/skills) accepts. Unknown keys are warnings, with a "did you mean" for near misses.
- Both: body over 500 lines or about 5,000 tokens (warning), relative links that don't resolve (error), and copies of the same skill with different contents (warning, from `checkSkillTree`).
- Also exported: `skillSpecFrontmatter`, `skillClaudeCodeFrontmatter`, `findSkillFiles`, `SKILL_FIELDS` (with each host's source URL and the date it was checked).

### CLI

```bash
fieldtest skills <dir...> [--profile spec|claude-code] [--json] [--errors-only]
```

Exits 1 when any error is found.

### Obsidian Bases

`validateBasesMetadata`, `validateSystemSpecificMetadata`, `generateDefaultMetadata`, and their schemas, unchanged from 1.x.

## OpenAPI Helpers

OpenAPI to zod conversion lives in `@fieldtest/openapi`. See the [OpenAPI Reference](/reference/openapi).
