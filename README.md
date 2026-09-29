# FieldTest

> Validate Markdown documents and data with any Standard Schema: front matter, body structure, and agent skills.

[![npm version](https://img.shields.io/npm/v/@fieldtest/core.svg)](https://www.npmjs.com/package/@fieldtest/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Markdown file is two kinds of data. The front matter is structured YAML. The body looks like free text, but Markdown gives every document the same few elements: headings, code blocks, links, lists, and tables. FieldTest parses the front matter as data and turns the body into a fixed **outline**, so the schema library you already use (zod, valibot, arktype, anything that implements [Standard Schema](https://standardschema.dev)) can check both.

- **Never executes anything.** Front matter is parsed as YAML 1.2 data. `---js` front matter is reported, not run.
- **Never throws on bad input.** Invalid YAML comes back as an issue with the file line and, when there's an obvious one, a fix.
- **One result shape.** Every check returns `{ ok: true, value }` or `{ ok: false, issues }`.
- **Agent skills built in.** `fieldtest skills` checks SKILL.md files against the Agent Skills spec or Claude Code.

## Packages

| Package | What it does |
|---|---|
| [`@fieldtest/core`](packages/core) | `parseDocument`, `check`, `checkDocument`, outline, rules. One dependency (`yaml`). |
| [`@fieldtest/registry`](packages/registry) | Ready-made checks (Agent Skills, Obsidian Bases) and the `fieldtest` CLI. Needs `zod` 3.25+ or 4. |
| [`@fieldtest/doc-ref`](packages/doc-ref) | Link tests to documentation sections. |
| [`@fieldtest/openapi`](packages/openapi) | OpenAPI to zod schemas. |

Upgrading from 1.x: see [MIGRATING.md](MIGRATING.md).

## Validate a document

```bash
npm install @fieldtest/core zod
```

```ts
import { checkDocument, formatIssues, parseDocument } from "@fieldtest/core";
import { z } from "zod";

const doc = parseDocument(`---
title: Hello
date: 2025-01-01
---
# Hello

Read the [guide](./guide.md).
`, { path: "posts/hello.md" });

const result = await checkDocument(doc, {
  frontmatter: z.object({ title: z.string(), date: z.string().date() }),
  outline: z.object({ headings: z.array(z.object({ depth: z.number() })).min(1) }),
});

if (!result.ok) console.error(formatIssues(result.issues));
// With `title: 3` instead, this prints:
// posts/hello.md:2 title: Invalid input: expected string, received number
```

## Validate data

```ts
import { check } from "@fieldtest/core";

const result = await check(schema, record);
if (result.ok) use(result.value);
else report(result.issues);
```

## Check agent skills

```bash
npx -p @fieldtest/registry -p zod fieldtest skills .claude/skills --profile claude-code
```

```
.claude/skills/deploy/SKILL.md:4 warn user-invokable: Unknown key "user-invokable"; the host ignores it (did you mean "user-invocable"?)
.claude/skills/triage/SKILL.md:3 Invalid YAML: Nested mappings are not allowed in compact mappings (quote the value, e.g. key: "text: more")

12 SKILL.md files (claude-code): 1 errors, 1 warnings in 2 files
```

Profiles: `spec` (default, the [Agent Skills specification](https://agentskills.io/specification)) and `claude-code` (the fields [Claude Code](https://code.claude.com/docs/en/skills) accepts). It also warns when copies of the same skill have drifted apart. The CLI exits 1 on errors, so it works in CI and pre-commit hooks.

## Documentation

- API reference: [docs/reference/api.md](docs/reference/api.md)
- Docs hub: https://docs.matthewhendricks.net/fieldtest/
- Issues: https://github.com/watthem/fieldtest/issues

## License

MIT
