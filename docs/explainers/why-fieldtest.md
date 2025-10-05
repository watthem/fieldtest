# Why FieldTest?

Understanding the problems FieldTest solves and when to use it.

## The Problem

Content-rich websites and applications face recurring challenges:

### 1. **Runtime Layout Breaks**

A missing or misnamed field in frontmatter causes pages to break in production:

```markdown
---
title: "My Post"
# Missing required 'author' field
---
Content here
```

Result: `TypeError: Cannot read property 'author' of undefined` at runtime.

### 2. **Schema Drift**

Content structure changes over time, causing inconsistencies:

```markdown
# Post 1
---
tags: "javascript, typescript"  # String
---

# Post 2
---
tags: ["javascript", "typescript"]  # Array
---
```

Without validation, these inconsistencies go unnoticed until deployment.

### 3. **Manual Validation**

Developers write custom validation code for each content type:

```typescript
function validateBlogPost(post: any) {
  if (!post.title || typeof post.title !== 'string') {
    throw new Error('Invalid title');
  }
  if (!post.author || typeof post.author !== 'string') {
    throw new Error('Invalid author');
  }
  // ... repetitive validation code
}
```

This is error-prone and hard to maintain.

### 4. **Framework Lock-in**

Validation logic is tightly coupled to specific frameworks:

```typescript
// Astro-specific
export const collections = {
  blog: defineCollection({
    schema: z.object({ /* ... */ })
  })
};

// Can't reuse this in Next.js, Remix, etc.
```

---

## The FieldTest Solution

FieldTest provides a unified approach to content validation:

### ✅ **Catch Errors Early**

Validate content at build time, not runtime:

```typescript
import { validateWithSchema, loadUserSchema } from '@watthem/fieldtest';

const schema = loadUserSchema(blogPostSchema);
const result = validateWithSchema(content, schema);

if (!result.valid) {
  // Build fails - errors caught before deployment
  throw new Error(`Invalid content: ${result.errors.map(e => e.message).join(', ')}`);
}
```

### ✅ **Enforce Consistency**

Standard Schema ensures all content follows the same structure:

```typescript
const blogPostSchema = {
  version: '1',
  name: 'blog-post',
  fields: {
    tags: { type: 'string', array: true }  // Always an array
  }
};
```

### ✅ **Reusable Schemas**

Define once, use everywhere:

```typescript
// schemas/blog-post.ts
export const blogPostSchema = { /* ... */ };

// Use in Astro
import { validateAstroContent } from '@watthem/fieldtest';
validateAstroContent(content, loadUserSchema(blogPostSchema));

// Use in Next.js
import { validateNextContent } from '@watthem/fieldtest';
validateNextContent(content, loadUserSchema(blogPostSchema));

// Use in CI
import { validateWithSchema } from '@watthem/fieldtest';
validateWithSchema(content, loadUserSchema(blogPostSchema));
```

### ✅ **Framework Agnostic**

Core validation works everywhere. Framework integrations are optional:

```typescript
// Pure validation - works anywhere
validateWithSchema(content, schema);

// Framework-specific helpers
validateAstroContent(content, schema);
validateNextContent(content, schema);
```

---

## When to Use FieldTest

### ✅ **Good Fit**

**1. Content-Driven Sites**

Blogs, documentation sites, marketing pages, portfolios — any site where markdown files drive content.

```
my-blog/
├── content/
│   ├── posts/
│   │   ├── post-1.md
│   │   ├── post-2.md
│   │   └── post-3.md
│   └── authors/
│       ├── jane.md
│       └── john.md
```

**2. Multi-Framework Projects**

Projects using multiple frameworks or planning to migrate:

```
my-project/
├── astro-site/      # Marketing site (Astro)
├── next-app/        # Web app (Next.js)
└── docs/            # Documentation (Astro)
# Shared schemas across all
```

**3. CI/CD Validation**

Catch content errors before they reach production:

```yaml
# .github/workflows/validate.yml
- run: pnpm validate-content
```

**4. Team Collaboration**

Developers and content creators working together. Schemas provide clear guidelines:

```typescript
// schemas/blog-post.ts - single source of truth
export const blogPostSchema = {
  fields: {
    title: { type: 'string', required: true, description: 'Post title' },
    author: { type: 'string', required: true, description: 'Author name' }
  }
};
```

**5. AI-Powered Content Workflows**

LLMs understand Standard Schema, enabling AI-assisted content creation:

```typescript
// MCP integration for Claude/GPT
import { validateWithSchema } from '@watthem/fieldtest';

const aiContent = await llm.generate({
  schema: blogPostSchema,
  prompt: 'Write a blog post about TypeScript'
});

validateWithSchema(aiContent, schema); // Validate AI-generated content
```

### ⚠️ **Not a Good Fit**

**1. Pure API Validation**

For REST/GraphQL APIs, use specialized tools like Zod, Yup, or AJV:

```typescript
// API validation - use Zod instead
const apiSchema = z.object({
  id: z.number(),
  data: z.string()
});
```

**2. Complex Runtime Validation**

FieldTest is optimized for build-time validation. For complex runtime validation with custom rules:

```typescript
// Complex validation - use Zod
const schema = z.object({
  password: z.string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[0-9]/)
});
```

**3. Database Schema Management**

For database schemas, use ORMs like Prisma, TypeORM, or Drizzle:

```typescript
// Database - use Prisma
model User {
  id    Int    @id @default(autoincrement())
  email String @unique
}
```

---

## Comparison with Alternatives

### vs. Manual Validation

| Aspect | Manual | FieldTest |
|--------|--------|-----------|
| Setup time | High | Low |
| Maintenance | Hard | Easy |
| Reusability | Low | High |
| Type safety | Manual | Built-in |
| Errors | Runtime | Build-time |

### vs. Framework-Specific Solutions

| Aspect | Framework-Specific | FieldTest |
|--------|-------------------|-----------|
| Portability | Locked to one framework | Works everywhere |
| Learning curve | Framework-dependent | One API |
| Schema format | Varies | Standard Schema |
| AI integration | Limited | Native |

### vs. Zod/Yup

| Aspect | Zod/Yup | FieldTest |
|--------|---------|-----------|
| Use case | General validation | Content validation |
| Complexity | High (many features) | Low (focused) |
| Format | Library-specific | Standard Schema |
| Markdown support | Manual | Built-in |
| Cross-platform | Language-specific | Universal |

---

## Real-World Benefits

### 1. **Faster Development**

Define schemas once, reuse across projects:

```typescript
// Define
const schema = { /* ... */ };

// Use everywhere
validateAstroContent(content, schema);
validateNextContent(content, schema);
validateRemixContent(content, schema);
```

### 2. **Fewer Bugs**

Catch errors at build time:

```bash
$ pnpm build
❌ Validation failed: posts/my-post.md
   - author: Required field missing
   - tags: Expected array, got string
```

### 3. **Better Collaboration**

Schemas document expected structure:

```typescript
export const blogPostSchema = {
  version: '1',
  name: 'blog-post',
  fields: {
    title: { 
      type: 'string', 
      required: true,
      description: 'Post title (60 chars max recommended)' 
    },
    publishedAt: { 
      type: 'date', 
      required: true,
      description: 'Publication date in ISO format' 
    }
  }
};
```

Content creators know exactly what fields are required and their formats.

### 4. **Confident Refactoring**

Change schemas and validate all content:

```typescript
// Update schema
const schema = {
  fields: {
    author: { type: 'string', required: true }, // Now required!
    // ...
  }
};

// Run validation
$ pnpm validate-content
❌ Found 3 posts missing author field:
   - posts/post-1.md
   - posts/post-2.md
   - posts/post-3.md
```

Fix all issues before deploying.

---

## Success Stories

### Documentation Site

**Before FieldTest:**

- Manual validation in 5 different places
- Runtime errors in production
- Inconsistent frontmatter across 200+ docs

**After FieldTest:**

- Single schema definition
- Build-time validation
- 100% consistent structure
- **Result:** Zero runtime errors, faster development

### Multi-Site Platform

**Before FieldTest:**

- Separate validation logic for Astro and Next.js sites
- Duplicated schemas
- Hard to maintain consistency

**After FieldTest:**

- Shared schemas across all sites
- Unified validation approach
- Easy to add new sites
- **Result:** 50% less validation code, consistent schemas

---

## Key Principles

FieldTest is built on these principles:

1. **Validate Early** — Catch errors at build time
2. **Simple is Better** — Easy-to-understand schemas
3. **Framework Agnostic** — Works everywhere
4. **Standard-Based** — Use Standard Schema
5. **Developer Experience** — Clear error messages, TypeScript support

---

## Getting Started

Ready to try FieldTest?

1. 📖 [Getting Started Guide](../getting-started.md)
2. 🎓 [Schema Validation Guide](../guides/schema-validation.md)
3. 💡 [Framework Integration](../guides/framework-integration.md)
4. 📚 [API Reference](../reference/api.md)

---

## Learn More

- 💭 [What is Standard Schema?](./standard-schema.md)
- 🔄 [Migration Guide](../../MIGRATION.md)
- 🌐 [Standard Schema Specification](https://standardschema.dev)
- 📚 [Getting Started](../getting-started.md)
