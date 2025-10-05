# Framework Integration Guide

Learn how to integrate FieldTest with Astro, Next.js, and other modern frameworks.

## What You'll Learn

- Setting up FieldTest in Astro projects
- Using FieldTest with Next.js
- Framework-specific validation patterns
- Build-time content validation
- Error handling strategies

---

## Astro Integration

### Installation

```bash
pnpm add @watthem/fieldtest
```

### Content Collections with Validation

Astro's content collections work perfectly with FieldTest:

**src/content/config.ts:**

```typescript
import { defineCollection, z } from 'astro:content';
import { validateAstroContent, loadUserSchema } from '@watthem/fieldtest';
import type { StandardSchemaV1 } from '@watthem/fieldtest';

// Define your FieldTest schema
const blogPostSchema: StandardSchemaV1 = {
  version: '1',
  name: 'blog-post',
  fields: {
    title: { type: 'string', required: true },
    description: { type: 'string', required: true },
    publishedAt: { type: 'date', required: true },
    author: { type: 'string', required: true },
    tags: { type: 'string', array: true }
  }
};

// Load the schema
const fieldTestSchema = loadUserSchema(blogPostSchema);

// Define collection with Astro + FieldTest validation
const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.date(),
    author: z.string(),
    tags: z.array(z.string()).optional()
  }).refine((data) => {
    // Additional FieldTest validation
    const content = `---
title: ${data.title}
description: ${data.description}
publishedAt: ${data.publishedAt.toISOString()}
author: ${data.author}
${data.tags ? `tags: [${data.tags.map(t => `"${t}"`).join(', ')}]` : ''}
---`;
    
    const result = validateAstroContent(content, fieldTestSchema);
    
    if (!result.valid) {
      throw new Error(`FieldTest validation failed: ${result.errors.map(e => e.message).join(', ')}`);
    }
    
    return true;
  })
});

export const collections = { blog };
```

### Validating During Build

Create a validation script that runs during build:

**scripts/validate-content.ts:**

```typescript
import { getCollection } from 'astro:content';
import { validateAstroContent, loadUserSchema } from '@watthem/fieldtest';
import { blogPostSchema } from '../src/schemas';

async function validateContent() {
  const schema = loadUserSchema(blogPostSchema);
  const posts = await getCollection('blog');
  
  let hasErrors = false;
  
  for (const post of posts) {
    const content = post.body; // Full markdown content
    const result = validateAstroContent(content, schema);
    
    if (!result.valid) {
      console.error(`\n❌ ${post.id} failed validation:`);
      result.errors.forEach(error => {
        console.error(`   - ${error.field}: ${error.message}`);
      });
      hasErrors = true;
    } else {
      console.log(`✓ ${post.id}`);
    }
  }
  
  if (hasErrors) {
    process.exit(1);
  }
  
  console.log('\n✓ All content validated successfully!');
}

validateContent();
```

**package.json:**

```json
{
  "scripts": {
    "build": "pnpm validate-content && astro build",
    "validate-content": "tsx scripts/validate-content.ts"
  }
}
```

### Dynamic Pages with Validation

Validate content when generating dynamic pages:

**src/pages/blog/[slug].astro:**

```astro
---
import { getCollection } from 'astro:content';
import { validateAstroContent, loadUserSchema } from '@watthem/fieldtest';
import { blogPostSchema } from '../../schemas';

export async function getStaticPaths() {
  const schema = loadUserSchema(blogPostSchema);
  const posts = await getCollection('blog');
  
  return posts.map(post => {
    // Validate each post
    const result = validateAstroContent(post.body, schema);
    
    if (!result.valid) {
      throw new Error(`Invalid post ${post.id}: ${result.errors.map(e => e.message).join(', ')}`);
    }
    
    return {
      params: { slug: post.slug },
      props: { post }
    };
  });
}

const { post } = Astro.props;
const { Content } = await post.render();
---

<article>
  <h1>{post.data.title}</h1>
  <p class="author">By {post.data.author}</p>
  <Content />
</article>
```

---

## Next.js Integration

### App Router (Next.js 13+)

**app/blog/[slug]/page.tsx:**

```typescript
import { validateNextContent, loadUserSchema } from '@watthem/fieldtest';
import type { StandardSchemaV1 } from '@watthem/fieldtest';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const blogPostSchema: StandardSchemaV1 = {
  version: '1',
  name: 'blog-post',
  fields: {
    title: { type: 'string', required: true },
    author: { type: 'string', required: true },
    publishedAt: { type: 'date', required: true }
  }
};

const schema = loadUserSchema(blogPostSchema);

export async function generateStaticParams() {
  const postsDirectory = path.join(process.cwd(), 'content/posts');
  const filenames = fs.readdirSync(postsDirectory);
  
  return filenames.map(filename => ({
    slug: filename.replace('.md', '')
  }));
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const postsDirectory = path.join(process.cwd(), 'content/posts');
  const fullPath = path.join(postsDirectory, `${params.slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf-8');
  
  // Validate content
  const result = validateNextContent(fileContents, schema);
  
  if (!result.valid) {
    throw new Error(`Content validation failed: ${result.errors.map(e => e.message).join(', ')}`);
  }
  
  const { data, content } = matter(fileContents);
  
  return (
    <article>
      <h1>{data.title}</h1>
      <p>By {data.author}</p>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </article>
  );
}
```

### Pages Router (Next.js 12 and earlier)

**pages/blog/[slug].tsx:**

```typescript
import { GetStaticPaths, GetStaticProps } from 'next';
import { validateNextContent, loadUserSchema } from '@watthem/fieldtest';
import { blogPostSchema } from '../../schemas';
import fs from 'fs';
import path from 'path';

interface BlogPostProps {
  title: string;
  author: string;
  content: string;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const postsDirectory = path.join(process.cwd(), 'content/posts');
  const filenames = fs.readdirSync(postsDirectory);
  
  const paths = filenames.map(filename => ({
    params: { slug: filename.replace('.md', '') }
  }));
  
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<BlogPostProps> = async ({ params }) => {
  const schema = loadUserSchema(blogPostSchema);
  const postsDirectory = path.join(process.cwd(), 'content/posts');
  const fullPath = path.join(postsDirectory, `${params!.slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf-8');
  
  // Validate during build
  const result = validateNextContent(fileContents, schema);
  
  if (!result.valid) {
    throw new Error(`Invalid content in ${params!.slug}: ${result.errors.map(e => e.message).join(', ')}`);
  }
  
  const { data, content } = matter(fileContents);
  
  return {
    props: {
      title: data.title,
      author: data.author,
      content
    }
  };
};

export default function BlogPost({ title, author, content }: BlogPostProps) {
  return (
    <article>
      <h1>{title}</h1>
      <p>By {author}</p>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </article>
  );
}
```

### API Routes

Validate content in API endpoints:

**app/api/validate/route.ts (App Router):**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { validateNextContent, loadUserSchema } from '@watthem/fieldtest';
import { blogPostSchema } from '../../../schemas';

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();
    const schema = loadUserSchema(blogPostSchema);
    const result = validateNextContent(content, schema);
    
    if (result.valid) {
      return NextResponse.json({ valid: true });
    } else {
      return NextResponse.json(
        { valid: false, errors: result.errors },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Validation failed' },
      { status: 500 }
    );
  }
}
```

---

## Other Frameworks

### Remix

```typescript
import { json, LoaderFunction } from '@remix-run/node';
import { validateWithSchema, loadUserSchema } from '@watthem/fieldtest';
import { blogPostSchema } from '../schemas';

export const loader: LoaderFunction = async ({ params }) => {
  const schema = loadUserSchema(blogPostSchema);
  const content = await loadMarkdownFile(params.slug);
  const result = validateWithSchema(content, schema);
  
  if (!result.valid) {
    throw new Response('Invalid content', { status: 400 });
  }
  
  return json({ content });
};
```

### SvelteKit

```typescript
import type { Load } from '@sveltejs/kit';
import { validateWithSchema, loadUserSchema } from '@watthem/fieldtest';
import { blogPostSchema } from '$lib/schemas';

export const load: Load = async ({ params }) => {
  const schema = loadUserSchema(blogPostSchema);
  const content = await loadMarkdownFile(params.slug);
  const result = validateWithSchema(content, schema);
  
  if (!result.valid) {
    return {
      status: 400,
      error: new Error('Invalid content')
    };
  }
  
  return { content };
};
```

### Nuxt 3

```typescript
export default defineEventHandler(async (event) => {
  const { validateWithSchema, loadUserSchema } = await import('@watthem/fieldtest');
  const { blogPostSchema } = await import('~/schemas');
  
  const slug = event.context.params.slug;
  const schema = loadUserSchema(blogPostSchema);
  const content = await loadMarkdownFile(slug);
  const result = validateWithSchema(content, schema);
  
  if (!result.valid) {
    throw createError({
      statusCode: 400,
      message: 'Invalid content'
    });
  }
  
  return { content };
});
```

---

## Error Handling Strategies

### Development vs Production

```typescript
import { validateWithSchema, loadUserSchema } from '@watthem/fieldtest';

const isDevelopment = process.env.NODE_ENV === 'development';

function validateContent(content: string, schema: StandardSchema) {
  const result = validateWithSchema(content, schema);
  
  if (!result.valid) {
    if (isDevelopment) {
      // Show detailed errors in development
      console.error('❌ Validation failed:');
      result.errors.forEach(e => {
        console.error(`   ${e.field}: ${e.message}`);
      });
      throw new Error('Content validation failed - see console for details');
    } else {
      // Log but don't expose details in production
      console.error('Validation failed:', result.errors);
      throw new Error('Content validation failed');
    }
  }
  
  return result;
}
```

### Graceful Degradation

```typescript
function validateContentSafe(content: string, schema: StandardSchema) {
  try {
    const result = validateWithSchema(content, schema);
    
    if (!result.valid) {
      // Log errors but don't fail
      console.warn('Content has validation issues:', result.errors);
      return { valid: false, errors: result.errors };
    }
    
    return { valid: true, errors: [] };
  } catch (error) {
    console.error('Validation error:', error);
    return { valid: false, errors: [{ field: 'unknown', message: 'Validation failed', code: 'UNKNOWN' }] };
  }
}
```

---

## Best Practices

### 1. Validate at Build Time

Catch errors early by validating during the build process, not at runtime.

### 2. Use TypeScript

Combine FieldTest with TypeScript for maximum type safety:

```typescript
import type { StandardSchemaV1, FieldTestDocument } from '@watthem/fieldtest';

const schema: StandardSchemaV1 = {
  // TypeScript ensures correct structure
  version: '1',
  name: 'blog-post',
  fields: {
    title: { type: 'string', required: true }
  }
};
```

### 3. Create Reusable Validation Utilities

```typescript
// lib/validation.ts
import { validateWithSchema, loadUserSchema } from '@watthem/fieldtest';
import type { StandardSchemaV1 } from '@watthem/fieldtest';

export function createValidator(schema: StandardSchemaV1) {
  const loadedSchema = loadUserSchema(schema);
  
  return function validate(content: string) {
    const result = validateWithSchema(content, loadedSchema);
    
    if (!result.valid) {
      throw new Error(
        `Validation failed:\n${result.errors.map(e => `  - ${e.field}: ${e.message}`).join('\n')}`
      );
    }
    
    return result;
  };
}

// Usage
const validateBlogPost = createValidator(blogPostSchema);
validateBlogPost(content);
```

### 4. Cache Loaded Schemas

```typescript
const schemaCache = new Map();

function getCachedSchema(schemaDefinition: StandardSchemaV1) {
  const key = schemaDefinition.name;
  
  if (!schemaCache.has(key)) {
    schemaCache.set(key, loadUserSchema(schemaDefinition));
  }
  
  return schemaCache.get(key);
}
```

---

## Next Steps

- 📚 [API Reference](../reference/api.md) — Complete API documentation
- 🎓 [Schema Validation Guide](./schema-validation.md) — Deep dive into schemas
- 💡 [Examples](../../packages/examples/) — Real-world use cases
