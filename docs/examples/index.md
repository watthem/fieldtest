# Examples

Explore real-world examples and patterns for using FieldTest with different frameworks and use cases. Each example includes complete, working code that you can copy and adapt for your projects.

## Quick Examples

### Basic Blog Validation

The simplest use case - validating blog posts with frontmatter:

```typescript
import { loadUserSchema, validateWithSchema } from '@fieldtest/core';

const blogSchema = {
  version: '1',
  name: 'blog-post',
  fields: {
    title: { type: 'string', required: true },
    author: { type: 'string', required: true },
    published: { type: 'boolean', required: true },
    tags: { type: 'string', array: true }
  }
};

const schema = loadUserSchema(blogSchema);
const result = validateWithSchema(markdownContent, schema);

if (!result.valid) {
  console.error('Validation failed:', result.errors);
}
```

### Documentation Validation

Validate technical documentation with specific requirements:

```typescript
const docsSchema = {
  version: '1',
  name: 'documentation',
  fields: {
    title: { type: 'string', required: true },
    category: { type: 'string', required: true },
    difficulty: { type: 'string', required: true },
    lastUpdated: { type: 'date', required: true },
    contributors: { type: 'string', array: true },
    beta: { type: 'boolean', required: false }
  }
};
```

## Framework Examples

<div class="example-grid">

### [Blog Validation](./blog-validation)
Complete blog site validation with categories, tags, and author management.
- **Use case**: Personal blog, company blog, magazine site
- **Features**: Multi-author support, categorization, SEO validation
- **Frameworks**: Astro, Next.js, Nuxt

### [CMS Integration](./cms-integration)  
Validate content from headless CMS platforms like Contentful, Strapi, or Sanity.
- **Use case**: Marketing sites, e-commerce, enterprise content
- **Features**: API validation, webhook validation, content sync
- **Platforms**: Contentful, Strapi, Sanity, Prismic

### [Astro Content Collections](./astro-content)
Deep integration with Astro's content collection system.
- **Use case**: Static sites, documentation, portfolios
- **Features**: Type-safe content, build-time validation, dev server integration
- **Framework**: Astro 4.0+

### [Next.js Pages](./nextjs-pages)
Validate content in both App Router and Pages Router architectures.
- **Use case**: SSG blogs, e-commerce, landing pages
- **Features**: Static generation, API routes, middleware validation
- **Framework**: Next.js 13+ (App Router), Next.js 12+ (Pages Router)

</div>

## Advanced Patterns

### Schema Composition

Build complex schemas from simpler ones:

```typescript
// Base content schema
const baseContentSchema = {
  version: '1',
  name: 'base-content',
  fields: {
    title: { type: 'string', required: true },
    author: { type: 'string', required: true },
    createdAt: { type: 'date', required: true }
  }
};

// Blog post extends base content
const blogPostSchema = {
  ...baseContentSchema,
  name: 'blog-post',
  fields: {
    ...baseContentSchema.fields,
    excerpt: { type: 'string', required: true },
    tags: { type: 'string', array: true },
    published: { type: 'boolean', required: true }
  }
};

// Documentation extends base content
const documentationSchema = {
  ...baseContentSchema,
  name: 'documentation',
  fields: {
    ...baseContentSchema.fields,
    category: { type: 'string', required: true },
    difficulty: { type: 'string', required: true },
    prerequisites: { type: 'string', array: true }
  }
};
```

### Conditional Validation

Validate fields based on other field values:

```typescript
const productSchema = {
  version: '1',
  name: 'product',
  fields: {
    name: { type: 'string', required: true },
    type: { type: 'string', required: true }, // 'digital' | 'physical'
    price: { type: 'number', required: true },
    
    // Only required for physical products
    weight: { type: 'number', required: false },
    dimensions: { type: 'object', required: false },
    
    // Only required for digital products
    downloadUrl: { type: 'string', required: false },
    fileSize: { type: 'number', required: false }
  },
  validation: {
    custom: (data) => {
      if (data.type === 'physical') {
        return data.weight && data.dimensions;
      }
      if (data.type === 'digital') {
        return data.downloadUrl && data.fileSize;
      }
      return true;
    }
  }
};
```

### Multi-language Content

Validate content in multiple languages:

```typescript
const multiLangSchema = {
  version: '1',
  name: 'multi-language-content',
  fields: {
    // Metadata
    id: { type: 'string', required: true },
    defaultLanguage: { type: 'string', required: true },
    availableLanguages: { type: 'string', array: true },
    
    // Content per language
    title: { type: 'object', required: true }, // { en: "Title", fr: "Titre" }
    description: { type: 'object', required: true },
    content: { type: 'object', required: true },
    
    // Shared metadata
    author: { type: 'string', required: true },
    publishedAt: { type: 'date', required: true },
    tags: { type: 'string', array: true }
  }
};
```

## Performance Examples

### Batch Validation

Validate large numbers of files efficiently:

```typescript
import { loadUserSchema, validateWithSchema } from '@fieldtest/core';
import fs from 'fs';
import path from 'path';

async function validateAllContent(contentDir: string) {
  const schema = loadUserSchema(blogPostSchema);
  const files = fs.readdirSync(contentDir);
  
  const results = await Promise.all(
    files.map(async (file) => {
      const content = fs.readFileSync(path.join(contentDir, file), 'utf-8');
      const result = validateWithSchema(content, schema);
      
      return {
        file,
        valid: result.valid,
        errors: result.errors
      };
    })
  );
  
  const invalid = results.filter(r => !r.valid);
  
  if (invalid.length > 0) {
    console.log(`❌ Found ${invalid.length} invalid files:`);
    invalid.forEach(({ file, errors }) => {
      console.log(`  ${file}:`);
      errors.forEach(error => {
        console.log(`    • ${error.field}: ${error.message}`);
      });
    });
    process.exit(1);
  }
  
  console.log(`✅ All ${results.length} files are valid!`);
}
```

### Caching Schemas

Optimize performance by caching loaded schemas:

```typescript
class SchemaCache {
  private cache = new Map();
  
  getSchema(schemaDefinition: StandardSchemaV1) {
    const key = `${schemaDefinition.name}-${schemaDefinition.version}`;
    
    if (!this.cache.has(key)) {
      this.cache.set(key, loadUserSchema(schemaDefinition));
    }
    
    return this.cache.get(key);
  }
  
  clear() {
    this.cache.clear();
  }
}

const schemaCache = new SchemaCache();

// Use cached schema
const schema = schemaCache.getSchema(blogPostSchema);
const result = validateWithSchema(content, schema);
```

## Integration Examples

### Build Tool Integration

Integrate with Vite, Webpack, or other build tools:

```typescript
// vite-plugin-fieldtest.ts
import type { Plugin } from 'vite';
import { loadUserSchema, validateWithSchema } from '@fieldtest/core';

export function fieldTestPlugin(schemas: StandardSchemaV1[]): Plugin {
  const loadedSchemas = schemas.map(schema => ({
    name: schema.name,
    schema: loadUserSchema(schema)
  }));
  
  return {
    name: 'fieldtest',
    load(id) {
      if (id.endsWith('.md')) {
        const content = fs.readFileSync(id, 'utf-8');
        const frontmatter = matter(content).data;
        
        // Find matching schema
        const schemaMatch = loadedSchemas.find(s => 
          frontmatter.type === s.name || frontmatter.schema === s.name
        );
        
        if (schemaMatch) {
          const result = validateWithSchema(content, schemaMatch.schema);
          if (!result.valid) {
            this.error(`FieldTest validation failed in ${id}:\n${
              result.errors.map(e => `  • ${e.field}: ${e.message}`).join('\n')
            }`);
          }
        }
      }
    }
  };
}
```

### CI/CD Integration

Add validation to your deployment pipeline:

```yaml
# .github/workflows/validate-content.yml
name: Validate Content

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm validate-content
        
      # Custom validation script
      - name: Validate Content
        run: |
          node scripts/validate-all-content.js
          echo "✅ All content validated successfully"
```

## Testing Examples

### Unit Testing Schemas

Test your schemas work correctly:

```typescript
// schemas.test.ts
import { describe, it, expect } from 'vitest';
import { loadUserSchema, validateWithSchema } from '@fieldtest/core';
import { blogPostSchema } from '../schemas';

describe('Blog Post Schema', () => {
  const schema = loadUserSchema(blogPostSchema);
  
  it('validates correct blog post', () => {
    const validMarkdown = `---
title: "Test Post"
author: "Test Author"
published: true
tags: ["test", "blog"]
---
# Content here
`;
    
    const result = validateWithSchema(validMarkdown, schema);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
  
  it('rejects missing required fields', () => {
    const invalidMarkdown = `---
title: "Test Post"
# missing author and published
---
# Content here
`;
    
    const result = validateWithSchema(invalidMarkdown, schema);
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        field: 'author',
        message: expect.stringContaining('required')
      })
    );
  });
});
```

## Browse All Examples

Ready to dive deeper? Explore our comprehensive examples:

<div class="example-list">

- [**Blog Validation**](./blog-validation) — Complete blog site with multi-author support
- [**CMS Integration**](./cms-integration) — Headless CMS content validation  
- [**Astro Content Collections**](./astro-content) — Deep Astro integration
- [**Next.js Pages**](./nextjs-pages) — SSG and API route validation
- [**Documentation Site**](./documentation-site) — Technical docs with categories
- [**E-commerce Products**](./ecommerce-products) — Product catalog validation
- [**Marketing Landing Pages**](./marketing-pages) — Marketing content validation
- [**Multi-language Content**](./multilang-content) — Internationalization support

</div>

Need a specific example? [Open an issue](https://github.com/watthem/fieldtest/issues) and we'll add it!

<style>
.example-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.example-grid > div {
  padding: 1.5rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}

.example-grid h3 {
  margin: 0 0 0.5rem 0;
}

.example-grid p {
  margin: 0.5rem 0;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

.example-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 0.5rem;
  margin: 2rem 0;
}

.example-list li {
  list-style: none;
  padding: 0.5rem 0;
}
</style>