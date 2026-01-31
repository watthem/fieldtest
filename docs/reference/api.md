# API Reference

## Core Functions

### parseMarkdown(content)

Parses markdown content with frontmatter extraction.

```typescript
import { parseMarkdown } from '@fieldtest/core';

const doc = parseMarkdown(`---
title: "Hello World"
---

Content here.
`);

console.log(doc.frontmatter); // { title: "Hello World" }
console.log(doc.body);        // "\nContent here.\n"
```

- **Parameters:**
  - `content: string` - Raw markdown string with optional frontmatter
- **Returns:** `FieldTestDocument`

### validateWithSchema(schema, data, options?)

Validates data against a Standard Schema (e.g., Zod schema).

```typescript
import { validateWithSchema, z } from '@fieldtest/core';

const schema = z.object({
  title: z.string(),
  count: z.number()
});

// Returns validated data or failure result
const result = await validateWithSchema(schema, { title: 'Hi', count: 42 });

if ('issues' in result) {
  // Validation failed
  console.error(result.issues);
} else {
  // result is the validated data with proper types
  console.log(result.title);
}

// Or throw on error
const data = await validateWithSchema(schema, input, { throwOnError: true });
```

- **Parameters:**
  - `schema: StandardSchemaV1` - A Standard Schema compliant schema (Zod, Valibot, etc.)
  - `data: unknown` - The data to validate
  - `options?: ValidationOptions` - Optional settings
    - `throwOnError?: boolean` - Throw instead of returning failure result
- **Returns:** `Promise<T | StandardSchemaV1.FailureResult>`

### serializeMarkdown(frontmatter, body)

Serializes frontmatter and body back into a markdown string.

```typescript
import { serializeMarkdown } from '@fieldtest/core';

const markdown = serializeMarkdown(
  { title: 'My Post', draft: false },
  '# Hello\n\nContent here.'
);
// Returns:
// ---
// title: My Post
// draft: false
// ---
// # Hello
//
// Content here.
```

- **Parameters:**
  - `frontmatter: Record<string, any>` - The frontmatter object
  - `body: string` - The markdown body content
- **Returns:** `string`

## Validation Library

FieldTest re-exports Zod and provides additional validation helpers.

### z (Zod)

The Zod library is re-exported for convenience:

```typescript
import { z } from '@fieldtest/core';

const schema = z.object({
  title: z.string().min(1),
  tags: z.array(z.string()).optional()
});
```

### validate(schema, input)

Synchronous validation that returns a tuple.

```typescript
import { validate, z } from '@fieldtest/core';

const schema = z.object({ name: z.string() });
const [success, result] = validate(schema, { name: 'Alice' });

if (success) {
  console.log(result.name); // Type-safe
} else {
  console.error(result); // ZodError
}
```

- **Parameters:**
  - `schema: z.ZodType<T>` - A Zod schema
  - `input: unknown` - The data to validate
- **Returns:** `[boolean, T | z.ZodError]`

### formatZodError(error)

Formats a Zod error into a human-readable string.

```typescript
import { formatZodError, validate, z } from '@fieldtest/core';

const [success, result] = validate(z.string(), 123);
if (!success) {
  console.error(formatZodError(result));
  // Output: "Expected string, received number"
}
```

## Types

### FieldTestDocument

Represents a parsed markdown document.

```typescript
interface FieldTestDocument {
  /** The original raw markdown content */
  raw: string;
  /** Parsed frontmatter data */
  frontmatter: any;
  /** The main body content without frontmatter */
  body: string;
}
```

### StandardSchemaV1

The Standard Schema interface for universal validation compatibility. See [standardschema.dev](https://standardschema.dev) for the full specification.

Zod, Valibot, and other libraries implement this interface, allowing FieldTest to work with any compliant schema library.

### ValidationOptions

```typescript
interface ValidationOptions {
  /** Throw error on validation failure instead of returning result object */
  throwOnError?: boolean;
}
```

## OpenAPI Helpers

FieldTest includes OpenAPI to Zod conversion via `@fieldtest/openapi`.

- **Guide:** [OpenAPI Integration](/guides/openapi-integration)
- **Reference:** [OpenAPI Reference](/reference/openapi)
