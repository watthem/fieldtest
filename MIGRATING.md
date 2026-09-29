# Migrating from 1.x to 2.0

2.0 removes the parts of 1.x that tied FieldTest to one schema library and made results ambiguous. The reasoning is in [docs/proposals/2.0.md](docs/proposals/2.0.md).

## Install

```bash
npm install @fieldtest/core@2 zod
```

Core no longer ships zod. Install the schema library you use yourself; anything that implements Standard Schema works.

## Removed from @fieldtest/core

| 1.x | 2.0 |
|---|---|
| `import { z } from "@fieldtest/core"` | `import { z } from "zod"` |
| `parseMarkdown(text)` | `parseDocument(text, { path })` |
| `validateWithSchema(schema, data)` returning the value or `{ issues }` | `check(schema, data)` returning `{ ok, value }` or `{ ok: false, issues }` |
| `validate(schema, input)` returning `[ok, valueOrZodError]` | `check(schema, input)` |
| `formatZodError(error)` | `formatIssues(result.issues)` |
| `ValidationOptions` | `CheckOptions` |

### Typical site build check

```ts
// 1.x
import { parseMarkdown, validate, formatZodError, z } from "@fieldtest/core";
const doc = parseMarkdown(text);
const [ok, result] = validate(schema, doc.frontmatter);
if (!ok) throw new Error(formatZodError(result));

// 2.0
import { check, formatIssues, parseDocument } from "@fieldtest/core";
import { z } from "zod";
const doc = parseDocument(text, { path });
const result = await check(schema, doc.frontmatter);
if (!result.ok) throw new Error(formatIssues(result.issues));
```

Or check the whole document, including parse errors, with `checkDocument(doc, { frontmatter: schema })`.

## Behaviour changes

- **YAML 1.2.** Front matter is parsed with `yaml` instead of gray-matter (js-yaml, YAML 1.1). Unquoted dates such as `2025-01-01` and words such as `yes`/`no` now stay strings. If a schema expected a `Date`, use `z.coerce.date()` or `z.string().date()`.
- **No exceptions from parsing.** Invalid YAML no longer throws; `parseDocument` returns `frontmatter: {}` and a `parse` issue. `checkDocument` reports it. If you call `check(schema, doc.frontmatter)` directly, look at `doc.issues` too.
- **No executable front matter.** `---js` / `---javascript` front matter is reported as unsupported and never run. (1.0.3 already stopped executing it; it throws there.)
- **Node 20 or later.** (Node 18 reached end of life in April 2025.)

## Removed packages

`@fieldtest/validate`, `@fieldtest/validation-lib`, and `@fieldtest/shared` are no longer published. Their useful parts are in `@fieldtest/core`. The `validate` CLI from validation-lib is replaced by `fieldtest` in `@fieldtest/registry`.

## @fieldtest/registry

Rebuilt. 1.x exported `getBuiltInSchema` and `loadUserSchema`, without type declarations; both are gone (pass your schema directly). 2.0 exports the Agent Skills checks, the `fieldtest` CLI, and the Obsidian Bases schemas, with types. It needs `zod` 3.25+ or 4 as a peer dependency.
