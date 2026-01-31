# FieldTest Core

**FieldTest** is a framework-agnostic TypeScript validation toolkit for Markdown and Standard Schema. It helps you catch content errors at build time, with strong TypeScript support and clear diagnostics.

## Install

```bash
npm install @fieldtest/core
# or
pnpm add @fieldtest/core
```

## Quick Example

```ts
import { loadUserSchema, parseMarkdown, validateWithSchema, z } from "@fieldtest/core";

const blogSchema = z.object({
  title: z.string(),
  date: z.string(),
  tags: z.array(z.string()).optional(),
});

const schema = loadUserSchema(blogSchema);
const doc = parseMarkdown(`---\ntitle: Hello\ndate: 2025-01-01\n---\nContent`);
const result = await validateWithSchema(schema, doc.frontmatter, { throwOnError: true });
```

## Features

- Markdown + frontmatter parsing
- Standard Schema compatibility
- Zod-based schema authoring
- Helpful error formatting
- Fast validation for large content sets

## Documentation

https://docs.matthewhendricks.net/fieldtest/

## License

MIT
