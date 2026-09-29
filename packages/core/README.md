# @fieldtest/core

Validate Markdown documents and data with any [Standard Schema](https://standardschema.dev) library (zod, valibot, arktype, ...).

```bash
npm install @fieldtest/core zod
```

```ts
import { check, checkDocument, formatIssues, parseDocument } from "@fieldtest/core";
import { z } from "zod";

// A document: front matter as data, body as an outline
const doc = parseDocument(text, { path: "posts/hello.md" });
const result = await checkDocument(doc, {
  frontmatter: z.object({ title: z.string(), date: z.string().date() }),
  outline: z.object({ lines: z.number().max(500) }),
});
if (!result.ok) console.error(formatIssues(result.issues));

// Any data
const r = await check(schema, record); // { ok: true, value } | { ok: false, issues }
```

- Front matter is parsed as YAML 1.2 data and never executed.
- Parsing never throws: invalid YAML is an issue with the file line.
- One dependency: `yaml`.

API: [docs/reference/api.md](https://github.com/watthem/fieldtest/blob/main/docs/reference/api.md). Upgrading from 1.x: [MIGRATING.md](https://github.com/watthem/fieldtest/blob/main/MIGRATING.md).

MIT
