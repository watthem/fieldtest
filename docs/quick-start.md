# Quick Start

Get up and running with FieldTest in less than 5 minutes! This guide covers installation, your first schema, and validating content.

## Installation

Install FieldTest using your preferred package manager:

::: code-group

```bash [npm]
npm install @watthem/fieldtest
```

```bash [pnpm]
pnpm add @watthem/fieldtest
```

```bash [yarn]
yarn add @watthem/fieldtest
```

```bash [bun]
bun add @watthem/fieldtest
```

:::

::: tip Requirements
**Node.js 18+** is required. FieldTest works with any package manager and any modern framework.
:::

## Your First Schema

Let's start by creating a simple blog post schema. Create a new file called `schemas.ts`:

```typescript
// schemas.ts
import type { StandardSchemaV1 } from '@watthem/fieldtest';

export const blogPostSchema: StandardSchemaV1 = {
  version: '1',
  name: 'blog-post',
  fields: {
    title: { 
      type: 'string', 
      required: true,
      description: 'The blog post title'
    },
    author: { 
      type: 'string', 
      required: true,
      description: 'Author name'
    },
    published: { 
      type: 'boolean', 
      required: true,
      description: 'Whether the post is published'
    },
    publishedAt: { 
      type: 'date', 
      required: false,
      description: 'Publication date'
    },
    tags: { 
      type: 'string', 
      array: true,
      description: 'Post tags for categorization'
    }
  }
};
```

## Validate Your Content

Now let's validate some markdown content. Create a file called `validate.ts`:

```typescript
// validate.ts
import { loadUserSchema, validateWithSchema } from '@watthem/fieldtest';
import { blogPostSchema } from './schemas';

// Load the schema (do this once, reuse the result)
const schema = loadUserSchema(blogPostSchema);

// Sample markdown content
const markdown = `---
title: "My First Blog Post"
author: "Jane Developer"
published: true
publishedAt: 2024-01-15
tags: ["javascript", "web development", "tutorial"]
---

# Welcome to My Blog

This is my first blog post using FieldTest for validation!

## Getting Started

Content validation has never been easier...
`;

// Validate the content
const result = validateWithSchema(markdown, schema);

if (result.valid) {
  console.log('✅ Content is valid!');
  console.log('Title:', result.data.frontmatter.title);
  console.log('Author:', result.data.frontmatter.author);
} else {
  console.log('❌ Validation failed:');
  result.errors.forEach(error => {
    console.log(`  • ${error.field}: ${error.message}`);
  });
}
```

Run the validation:

```bash
npx tsx validate.ts
# or
node validate.js
```

You should see: ✅ **Content is valid!**

## Handle Validation Errors

Let's see what happens with invalid content:

```typescript
const invalidMarkdown = `---
title: ""  # Empty title (required field)
author: "Jane Developer"
published: "yes"  # Should be boolean, not string
# missing required fields
---

# Content here
`;

const result = validateWithSchema(invalidMarkdown, schema);

if (!result.valid) {
  console.log('❌ Found validation errors:');
  result.errors.forEach(error => {
    console.log(`  Field "${error.field}": ${error.message}`);
  });
}
```

Output:
```
❌ Found validation errors:
  Field "title": Title cannot be empty
  Field "published": Expected boolean, got string
```

## Framework Integration

### Astro

Add validation to your Astro content collections:

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';
import { loadUserSchema, validateWithSchema } from '@watthem/fieldtest';
import { blogPostSchema } from '../schemas';

const schema = loadUserSchema(blogPostSchema);

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    author: z.string(),
    published: z.boolean(),
    publishedAt: z.date().optional(),
    tags: z.array(z.string()).optional()
  }).refine((data) => {
    // Add FieldTest validation on top of Zod
    const markdownContent = `---
title: "${data.title}"
author: "${data.author}"
published: ${data.published}
${data.publishedAt ? `publishedAt: ${data.publishedAt.toISOString()}` : ''}
${data.tags ? `tags: ${JSON.stringify(data.tags)}` : ''}
---`;
    
    const result = validateWithSchema(markdownContent, schema);
    return result.valid;
  }, {
    message: "Content failed FieldTest validation"
  })
});

export const collections = { blog };
```

### Next.js

Validate content during static generation:

```typescript
// pages/blog/[slug].tsx or app/blog/[slug]/page.tsx
import { GetStaticProps, GetStaticPaths } from 'next';
import { loadUserSchema, validateWithSchema } from '@watthem/fieldtest';
import { blogPostSchema } from '../../schemas';
import fs from 'fs';
import path from 'path';

const schema = loadUserSchema(blogPostSchema);

export const getStaticPaths: GetStaticPaths = async () => {
  const postsDirectory = path.join(process.cwd(), 'content/blog');
  const filenames = fs.readdirSync(postsDirectory);
  
  const paths = filenames.map((filename) => ({
    params: { slug: filename.replace('.md', '') }
  }));

  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const fullPath = path.join(process.cwd(), 'content/blog', `${params!.slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  
  // Validate content at build time
  const result = validateWithSchema(fileContents, schema);
  
  if (!result.valid) {
    throw new Error(`Invalid content in ${params!.slug}.md: ${
      result.errors.map(e => `${e.field}: ${e.message}`).join(', ')
    }`);
  }
  
  return {
    props: {
      content: fileContents,
      frontmatter: result.data.frontmatter
    }
  };
};
```

## Built-in Schemas

FieldTest includes pre-built schemas for common use cases:

```typescript
import { getBuiltInSchema } from '@watthem/fieldtest';

// Use pre-built schemas
const blogSchema = getBuiltInSchema('blog-post');
const docsSchema = getBuiltInSchema('documentation');
const marketingSchema = getBuiltInSchema('marketing-copy');

// List all available schemas
import { listSchemas } from '@watthem/fieldtest';
console.log('Available schemas:', listSchemas());
```

## Next Steps

🎉 **Congratulations!** You've successfully:
- Installed FieldTest
- Created your first schema
- Validated markdown content
- Handled validation errors
- Integrated with a framework

### Where to go from here:

- 📖 [**Framework Integration Guide**](./guides/framework-integration) — Detailed setup for Astro, Next.js, and more
- 📝 [**Schema Validation Guide**](./guides/schema-validation) — Advanced schema patterns and validation
- 💡 [**Examples**](./examples/) — Real-world use cases and patterns
- 🔍 [**API Reference**](./reference/api) — Complete function and type documentation

### Need Help?

- 🐛 [Report issues](https://github.com/watthem/fieldtest/issues) on GitHub
- 💬 [Join discussions](https://github.com/watthem/fieldtest/discussions) for questions and ideas
- 📧 [Contact support](mailto:hello@matthewhendricks.net) for direct help

---

**Ready for more advanced topics?** Check out our [Framework Integration Guide](./guides/framework-integration) to see how FieldTest works with your favorite framework.