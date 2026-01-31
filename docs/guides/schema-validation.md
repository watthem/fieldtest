# Schema Validation Guide

Learn how to validate content using FieldTest's Standard Schema support.

## What You'll Learn

- Creating custom schemas
- Validating markdown content
- Handling validation errors
- Schema design best practices
- Using the schema registry

---

## Creating Your First Schema

A Standard Schema defines the structure of your content. Here's a simple example:

```typescript
import type { StandardSchemaV1 } from '@fieldtest/core';

export const blogPostSchema: StandardSchemaV1 = {
  version: '1',
  name: 'blog-post',
  fields: {
    title: { 
      type: 'string', 
      required: true,
      description: 'The post title'
    },
    author: { 
      type: 'string', 
      required: true 
    },
    published: { 
      type: 'boolean', 
      required: true,
      default: false
    },
    tags: { 
      type: 'string', 
      array: true,
      description: 'Post tags for categorization'
    },
    publishedAt: { 
      type: 'date', 
      required: false 
    }
  },
  metadata: {
    description: 'Schema for blog post frontmatter'
  }
};
```

### Schema Structure

Every Standard Schema must include:

1. **`version`** — Schema version (currently `'1'`)
2. **`name`** — Unique identifier for the schema
3. **`fields`** — Object defining each field and its constraints

### Field Types

FieldTest supports these field types:

| Type | Description | Example |
|------|-------------|---------|
| `string` | Text content | `"Hello World"` |
| `number` | Numeric values | `42`, `3.14` |
| `boolean` | True/false | `true`, `false` |
| `date` | ISO date strings | `"2025-01-15"` |
| `array` | List of values | Use with `array: true` |
| `object` | Nested objects | Complex structures |

### Field Options

Each field can have these options:

- **`type`** (required) — Field type
- **`required`** — Whether field must be present (default: `false`)
- **`array`** — Whether field is an array (default: `false`)
- **`description`** — Human-readable description
- **`default`** — Default value if not provided

---

## Validating Content

Once you have a schema, validate your markdown content:

### Basic Validation

```typescript
import { loadUserSchema, validateWithSchema } from '@fieldtest/core';
import { blogPostSchema } from './schemas';

// Load the schema
const schema = loadUserSchema(blogPostSchema);

// Your markdown content
const markdown = `
---
title: "Getting Started with FieldTest"
author: "Jane Doe"
published: true
tags: ["typescript", "validation"]
---

# Introduction

This is the content of the blog post.
`;

// Validate
const result = validateWithSchema(markdown, schema);

if (result.valid) {
  console.log('✓ Content is valid!');
} else {
  console.error('✗ Validation failed:');
  result.errors.forEach(error => {
    console.error(`  - ${error.field}: ${error.message}`);
  });
}
```

### Handling Validation Errors

The `ValidationResult` object contains detailed error information:

```typescript
interface ValidationResult {
  valid: boolean;           // Whether validation passed
  errors: ValidationError[]; // Array of errors
  warnings?: ValidationWarning[]; // Optional warnings
}

interface ValidationError {
  field: string;   // Field that failed
  message: string; // Error description
  code: string;    // Error code for programmatic handling
}
```

Example error handling:

```typescript
const result = validateWithSchema(content, schema);

if (!result.valid) {
  // Group errors by type
  const missingFields = result.errors.filter(e => e.code === 'REQUIRED_FIELD_MISSING');
  const typeErrors = result.errors.filter(e => e.code === 'INVALID_TYPE');
  
  if (missingFields.length > 0) {
    console.error('Missing required fields:', 
      missingFields.map(e => e.field).join(', '));
  }
  
  if (typeErrors.length > 0) {
    console.error('Type errors:', 
      typeErrors.map(e => `${e.field}: ${e.message}`).join('\n'));
  }
  
  // Throw or handle as needed
  throw new Error('Content validation failed');
}
```

---

## Schema Design Best Practices

### 1. Use Descriptive Names

Choose clear, meaningful names for schemas and fields:

```typescript
// Good
const userProfileSchema: StandardSchemaV1 = {
  version: '1',
  name: 'user-profile',
  fields: {
    displayName: { type: 'string', required: true },
    emailAddress: { type: 'string', required: true }
  }
};

// Avoid
const schema1: StandardSchemaV1 = {
  version: '1',
  name: 's1',
  fields: {
    n: { type: 'string' },
    e: { type: 'string' }
  }
};
```

### 2. Provide Field Descriptions

Help users understand what each field is for:

```typescript
const schema: StandardSchemaV1 = {
  version: '1',
  name: 'product',
  fields: {
    sku: { 
      type: 'string', 
      required: true,
      description: 'Unique product identifier (e.g., PROD-001)'
    },
    price: { 
      type: 'number', 
      required: true,
      description: 'Price in USD cents (e.g., 1999 for $19.99)'
    }
  }
};
```

### 3. Use camelCase for Field Names

Follow Standard Schema conventions:

```typescript
// Good
fields: {
  firstName: { type: 'string' },
  lastName: { type: 'string' },
  dateOfBirth: { type: 'date' }
}

// Avoid
fields: {
  first_name: { type: 'string' },    // snake_case
  LastName: { type: 'string' },      // PascalCase
  'date-of-birth': { type: 'date' }  // kebab-case
}
```

### 4. Set Sensible Defaults

Provide defaults for optional fields when appropriate:

```typescript
fields: {
  published: { 
    type: 'boolean', 
    required: false,
    default: false 
  },
  priority: { 
    type: 'number', 
    required: false,
    default: 1 
  }
}
```

### 5. Use Arrays for Lists

When a field can have multiple values:

```typescript
fields: {
  tags: { 
    type: 'string', 
    array: true,
    description: 'Content tags for categorization'
  },
  authors: { 
    type: 'string', 
    array: true,
    required: true 
  }
}
```

---

## Using the Schema Registry

FieldTest includes a schema registry for managing reusable schemas.

### Registering Custom Schemas

```typescript
import { registerSchema } from '@fieldtest/core';

// Register your schema
registerSchema('my-custom-schema', {
  version: '1',
  name: 'my-custom-schema',
  fields: {
    title: { type: 'string', required: true }
  }
});

// Later, retrieve it anywhere
import { getBuiltInSchema, validateWithSchema } from '@fieldtest/core';

const schema = getBuiltInSchema('my-custom-schema');
if (schema) {
  const result = validateWithSchema(content, schema);
}
```

### Listing Available Schemas

```typescript
import { listSchemas } from '@fieldtest/core';

const available = listSchemas();
console.log('Available schemas:', available);
// Output: ['blog-post', 'marketing-copy', 'api-guide', 'my-custom-schema']
```

### Using Built-in Schemas

FieldTest includes several built-in schemas:

```typescript
import { getBuiltInSchema } from '@fieldtest/core';

// Blog post schema
const blogSchema = getBuiltInSchema('blog-post');

// Marketing copy schema
const marketingSchema = getBuiltInSchema('marketing-copy');

// API documentation schema
const apiSchema = getBuiltInSchema('api-guide');
```

---

## Advanced Patterns

### Schema Composition

Extend existing schemas by merging them:

```typescript
import { mergeSchemas, getBuiltInSchema } from '@fieldtest/core';

const baseSchema = getBuiltInSchema('blog-post');

const extendedSchema = mergeSchemas(baseSchema, {
  fields: {
    featured: { type: 'boolean', default: false },
    readingTime: { type: 'number', required: false }
  }
});
```

### Conditional Validation

Validate content based on conditions:

```typescript
const result = validateWithSchema(content, schema);

if (!result.valid) {
  // Only fail on errors, ignore warnings
  const hasErrors = result.errors.length > 0;
  if (hasErrors) {
    throw new Error('Validation failed');
  }
}

// Or allow draft content
const isDraft = result.errors.some(e => e.field === 'published' && e.code === 'INVALID_VALUE');
if (isDraft) {
  console.warn('Draft content - skipping validation');
} else if (!result.valid) {
  throw new Error('Validation failed');
}
```

### Batch Validation

Validate multiple files efficiently:

```typescript
import fs from 'fs';
import path from 'path';
import { loadUserSchema, validateWithSchema } from '@fieldtest/core';

const schema = loadUserSchema(mySchema);
const contentDir = './content/posts';

const files = fs.readdirSync(contentDir)
  .filter(f => f.endsWith('.md'));

const results = files.map(file => {
  const content = fs.readFileSync(path.join(contentDir, file), 'utf-8');
  const result = validateWithSchema(content, schema);
  
  return {
    file,
    valid: result.valid,
    errors: result.errors
  };
});

// Report errors
const failed = results.filter(r => !r.valid);
if (failed.length > 0) {
  console.error(`${failed.length} files failed validation:`);
  failed.forEach(r => {
    console.error(`\n${r.file}:`);
    r.errors.forEach(e => console.error(`  - ${e.field}: ${e.message}`));
  });
  process.exit(1);
}
```

---

## Integration with CI/CD

Add validation to your build pipeline:

### GitHub Actions Example

```yaml
name: Validate Content

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm validate-content
```

### NPM Script

```json
{
  "scripts": {
    "validate-content": "node scripts/validate.js"
  }
}
```

**scripts/validate.js:**

```javascript
import { validateWithSchema, loadUserSchema } from '@fieldtest/core';
import { blogPostSchema } from './schemas.js';
import fs from 'fs';
import path from 'path';

const schema = loadUserSchema(blogPostSchema);
const contentDir = './content/posts';

// ... validation logic from batch example above ...
```

---

## Next Steps

- 📚 [API Reference](../reference/api.md) — Complete API documentation
- 🎓 [Framework Integration Guide](./framework-integration.md) — Use FieldTest with Astro/Next.js
- 💡 [Examples](../../packages/examples/) — Real-world use cases
- 📖 [Standard Schema Explainer](../explainers/standard-schema.md) — Learn about Standard Schema
