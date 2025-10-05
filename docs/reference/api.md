# API Reference

Complete API documentation for `@watthem/fieldtest`.

## Core Functions

### `parseMarkdown(markdown: string): FieldTestDocument`

Parses a Markdown string with frontmatter into a document object.

**Parameters:**

- `markdown` (string) — Markdown content with optional YAML frontmatter

**Returns:**

- `FieldTestDocument` — Parsed document with frontmatter and body content

**Example:**

```typescript
import { parseMarkdown } from '@watthem/fieldtest';

const markdown = `
---
title: "Hello World"
author: "John Doe"
---
# Welcome

This is the content.
`;

const doc = parseMarkdown(markdown);
console.log(doc.frontmatter.title); // "Hello World"
console.log(doc.body); // "# Welcome\n\nThis is the content."
```

---

### `serializeMarkdown(doc: FieldTestDocument): string`

Converts a FieldTestDocument back to a Markdown string.

**Parameters:**

- `doc` (FieldTestDocument) — Document object to serialize

**Returns:**

- `string` — Markdown string with frontmatter

**Example:**

```typescript
import { serializeMarkdown } from '@watthem/fieldtest';

const doc = {
  frontmatter: { title: "Hello" },
  body: "Content here"
};

const markdown = serializeMarkdown(doc);
// Returns:
// ---
// title: Hello
// ---
// Content here
```

---

### `validateWithSchema(content: string, schema: StandardSchema): ValidationResult`

Validates Markdown content against a Standard Schema.

**Parameters:**

- `content` (string) — Markdown content with frontmatter to validate
- `schema` (StandardSchema) — Schema to validate against

**Returns:**

- `ValidationResult` — Object with `valid` boolean and `errors` array

**Example:**

```typescript
import { validateWithSchema, loadUserSchema } from '@watthem/fieldtest';

const schema = loadUserSchema({
  version: '1',
  name: 'blog-post',
  fields: {
    title: { type: 'string', required: true }
  }
});

const content = `
---
title: "My Post"
---
Content
`;

const result = validateWithSchema(content, schema);

if (!result.valid) {
  console.error('Validation errors:', result.errors);
}
```

---

### `loadUserSchema(schema: StandardSchemaV1): StandardSchema`

Normalizes and loads a user-defined schema for validation.

**Parameters:**

- `schema` (StandardSchemaV1) — Raw schema definition

**Returns:**

- `StandardSchema` — Normalized schema ready for validation

**Example:**

```typescript
import { loadUserSchema } from '@watthem/fieldtest';

const rawSchema = {
  version: '1',
  name: 'user-profile',
  fields: {
    username: { type: 'string', required: true },
    bio: { type: 'string', required: false }
  }
};

const schema = loadUserSchema(rawSchema);
// Now ready to use with validateWithSchema
```

---

### `getBuiltInSchema(name: string): StandardSchema | undefined`

Retrieves a built-in schema by name from the schema registry.

**Parameters:**

- `name` (string) — Name of the built-in schema

**Returns:**

- `StandardSchema | undefined` — Schema if found, undefined otherwise

**Available built-in schemas:**

- `'marketing-copy'` — Marketing content validation
- `'blog-post'` — Blog post structure
- `'api-guide'` — API documentation

**Example:**

```typescript
import { getBuiltInSchema, validateWithSchema } from '@watthem/fieldtest';

const schema = getBuiltInSchema('blog-post');
if (schema) {
  const result = validateWithSchema(myMarkdown, schema);
}
```

---

## Framework Integration

### `validateAstroContent(content: string, schema: StandardSchema): ValidationResult`

Validates content in an Astro environment with framework-specific error handling.

**Parameters:**

- `content` (string) — Markdown content
- `schema` (StandardSchema) — Validation schema

**Returns:**

- `ValidationResult` — Validation result with Astro-formatted errors

**Example:**

```typescript
// In an Astro component or content collection
import { validateAstroContent, getBuiltInSchema } from '@watthem/fieldtest';

const schema = getBuiltInSchema('blog-post');
const result = validateAstroContent(Astro.content, schema);

if (!result.valid) {
  throw new Error('Invalid content: ' + result.errors.join(', '));
}
```

---

### `validateNextContent(content: string, schema: StandardSchema): ValidationResult`

Validates content in a Next.js environment.

**Parameters:**

- `content` (string) — Markdown content
- `schema` (StandardSchema) — Validation schema

**Returns:**

- `ValidationResult` — Validation result

**Example:**

```typescript
// In a Next.js page or API route
import { validateNextContent, loadUserSchema } from '@watthem/fieldtest';
import fs from 'fs';

const content = fs.readFileSync('posts/my-post.md', 'utf-8');
const schema = loadUserSchema(mySchema);
const result = validateNextContent(content, schema);
```

---

## Types

### `StandardSchemaV1`

Type definition for a Standard Schema version 1 object.

```typescript
interface StandardSchemaV1 {
  version: '1';
  name: string;
  fields: {
    [fieldName: string]: {
      type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
      required?: boolean;
      array?: boolean;
      description?: string;
      default?: any;
    };
  };
  metadata?: {
    description?: string;
    [key: string]: any;
  };
}
```

**Example:**

```typescript
import type { StandardSchemaV1 } from '@watthem/fieldtest';

const schema: StandardSchemaV1 = {
  version: '1',
  name: 'product',
  fields: {
    name: { type: 'string', required: true },
    price: { type: 'number', required: true },
    tags: { type: 'string', array: true },
    inStock: { type: 'boolean', default: true }
  },
  metadata: {
    description: 'Product catalog schema'
  }
};
```

---

### `FieldTestDocument`

Represents a parsed Markdown document with frontmatter and body.

```typescript
interface FieldTestDocument {
  frontmatter: Record<string, unknown>;
  body: string;
  metadata?: {
    path?: string;
    lastModified?: Date;
    [key: string]: unknown;
  };
}
```

**Example:**

```typescript
import type { FieldTestDocument } from '@watthem/fieldtest';

const doc: FieldTestDocument = {
  frontmatter: {
    title: "My Document",
    author: "Jane Doe"
  },
  body: "# Content\n\nMarkdown body here.",
  metadata: {
    path: "docs/example.md"
  }
};
```

---

### `ValidationResult`

Result object returned by validation functions.

```typescript
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings?: ValidationWarning[];
}

interface ValidationError {
  field: string;
  message: string;
  code: string;
}

interface ValidationWarning {
  field: string;
  message: string;
}
```

**Example:**

```typescript
const result = validateWithSchema(content, schema);

if (!result.valid) {
  result.errors.forEach(error => {
    console.error('Field "' + error.field + '": ' + error.message);
  });
}
```

---

## Schema Registry

### `registerSchema(name: string, schema: StandardSchemaV1): void`

Registers a custom schema in the global registry for reuse.

**Parameters:**

- `name` (string) — Unique identifier for the schema
- `schema` (StandardSchemaV1) — Schema definition

**Example:**

```typescript
import { registerSchema } from '@watthem/fieldtest';

registerSchema('custom-post', {
  version: '1',
  name: 'custom-post',
  fields: {
    title: { type: 'string', required: true },
    customField: { type: 'string', required: false }
  }
});

// Later, retrieve it
const schema = getBuiltInSchema('custom-post');
```

---

### `listSchemas(): string[]`

Lists all available schemas in the registry (built-in and custom).

**Returns:**

- `string[]` — Array of schema names

**Example:**

```typescript
import { listSchemas } from '@watthem/fieldtest';

const schemas = listSchemas();
console.log('Available schemas:', schemas);
// ['marketing-copy', 'blog-post', 'api-guide', 'custom-post']
```

---

## Utilities

### `isValidSchema(schema: any): boolean`

Checks if an object is a valid Standard Schema.

**Parameters:**

- `schema` (any) — Object to validate

**Returns:**

- `boolean` — True if valid Standard Schema

**Example:**

```typescript
import { isValidSchema } from '@watthem/fieldtest';

const maybeSchema = {
  version: '1',
  name: 'test',
  fields: {}
};

if (isValidSchema(maybeSchema)) {
  console.log('Valid schema!');
}
```

---

### `mergeSchemas(base: StandardSchemaV1, override: Partial<StandardSchemaV1>): StandardSchemaV1`

Merges two schemas, with override taking precedence.

**Parameters:**

- `base` (StandardSchemaV1) — Base schema
- `override` (Partial<StandardSchemaV1>) — Schema to merge in

**Returns:**

- `StandardSchemaV1` — Merged schema

**Example:**

```typescript
import { mergeSchemas, getBuiltInSchema } from '@watthem/fieldtest';

const baseSchema = getBuiltInSchema('blog-post');
const customSchema = mergeSchemas(baseSchema, {
  fields: {
    customTag: { type: 'string', required: false }
  }
});
```

---

## Constants

### `SUPPORTED_FIELD_TYPES`

Array of supported field types in Standard Schema.

```typescript
const SUPPORTED_FIELD_TYPES = [
  'string',
  'number',
  'boolean',
  'date',
  'array',
  'object'
];
```

---

### `DEFAULT_SCHEMA_VERSION`

Default schema version used when not specified.

```typescript
const DEFAULT_SCHEMA_VERSION = '1';
```

---

## Error Handling

All validation functions return a `ValidationResult` object rather than throwing errors. This allows you to handle validation failures gracefully:

```typescript
const result = validateWithSchema(content, schema);

if (!result.valid) {
  // Handle errors
  result.errors.forEach(error => {
    console.error('Validation failed for "' + error.field + '": ' + error.message);
  });
} else {
  // Content is valid, proceed
  console.log('Content validated successfully!');
}
```

For schema loading and registry operations, functions may throw errors for invalid inputs:

```typescript
try {
  const schema = loadUserSchema(invalidSchema);
} catch (error) {
  console.error('Failed to load schema:', error.message);
}
```

---

## TypeScript Support

FieldTest is written in TypeScript and exports all types. For best results, use TypeScript in your project:

```typescript
import type {
  StandardSchemaV1,
  FieldTestDocument,
  ValidationResult,
  StandardSchema
} from '@watthem/fieldtest';
```

Type definitions are included in the package and work automatically with TypeScript-enabled editors.

---

## Next Steps

- 📖 [Getting Started Guide](../getting-started.md)
- 🎓 [Schema Validation Guide](../guides/schema-validation.md)
- 💡 [Examples](../../packages/examples/)
