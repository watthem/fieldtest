# Getting Started

Follow these steps to validate content with FieldTest's Standard Schema.

## 1. Install

```bash
pnpm add @fieldtest/core
```

## 2. Define a schema

```ts
import type { StandardSchemaV1 } from '@fieldtest/core';

export const blogPostSchema: StandardSchemaV1 = {
  version: '1',
  name: 'blog-post',
  fields: {
    title: { type: 'string', required: true },
    published: { type: 'boolean', required: true },
    content: { type: 'string', required: true },
    tags: { type: 'string', array: true }
  }
};
```

## 3. Load and validate

```ts
import { loadUserSchema, validateWithSchema } from '@fieldtest/core';
import { blogPostSchema } from './schema';

const schema = loadUserSchema(blogPostSchema);

const doc = `
---
title: "Hello"
published: true
---
Content here
`;

const result = validateWithSchema(doc, schema);

if (result.valid) {
  console.log('ok');
} else {
  console.error(result.errors);
}
```

### No extra helpers

- `loadUserSchema` and `validateWithSchema` handle schema setup and validation.
- Tools like `zodToStandardSchema`, custom schema loaders, or manual validation pipelines are no longer necessary.

### Native replacements for removed helpers

These APIs replace earlier utilities that shipped with FieldTest:

- `loadUserSchema` replaces bespoke schema loading helpers.
- `validateWithSchema` replaces manual validation functions.

Using them keeps your code minimal and consistent across frameworks.

