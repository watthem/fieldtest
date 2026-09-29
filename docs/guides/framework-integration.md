# Framework Integration Guide

> **Written for FieldTest 2.0** (`@fieldtest/core` 2.0.0, Node 20 or later). Every example below uses the 2.0 API: `parseDocument`, `check`, `checkDocument`, `readDocument`, and `formatIssues`, with a schema written in zod (or any other [Standard Schema](https://standardschema.dev/) library). If you are on 1.x, that API is gone (`parseMarkdown`, `validateWithSchema`, `validate`, `formatZodError`, `loadUserSchema`, and the `{ version, name, fields }` schema object); follow [MIGRATING.md](https://github.com/watthem/fieldtest/blob/main/MIGRATING.md) first, and see the [API reference](/reference/api).

Learn how to integrate FieldTest with Astro, Next.js, and other modern frameworks.

## What You'll Learn

- Setting up FieldTest in Astro projects
- Using FieldTest with Next.js
- Framework-specific validation patterns
- Build-time content validation
- Error handling strategies

---

## The pattern

Every example here does the same three things:

1. **Define the schema once**, in zod or any other Standard Schema library. It is an ordinary value; there is no loading step.
2. **Parse the file** with `parseDocument(text, { path })`. It never throws and never runs front matter: bad YAML, or a non-YAML fence such as `---js`, comes back as issues on the document.
3. **Check it** with `checkDocument(doc, { frontmatter, outline, rules })`. You get `{ ok: true, value }` or `{ ok: false, issues }`, and `formatIssues(issues)` turns the issues into one line each, with file and line.

For plain data (an API payload, not a Markdown file) use `check(schema, data)`, which returns the same result shape.

Two behaviours to know about:

- Front matter is parsed as YAML 1.2, so an unquoted `2025-01-01` stays a string. The schemas below use `z.coerce.date()`.
- `checkDocument` also reports parse issues, so a file with broken YAML fails even when the schema would accept `{}`. If you call `check(schema, doc.frontmatter)` directly, look at `doc.issues` yourself.

**src/schemas.ts** (shared by every example):

```typescript
import { z } from 'zod';

export const blogPostSchema = z.object({
  title: z.string(),
  description: z.string(),
  publishedAt: z.coerce.date(),
  author: z.string(),
  tags: z.array(z.string()).optional()
});

export type BlogPostFrontmatter = z.infer<typeof blogPostSchema>;

// Checks on the body's shape. `outline` has headings, codeBlocks, links,
// lines, approxTokens, listItems, and tables.
export const blogOutlineSchema = z.object({
  lines: z.number().max(2000, 'Post is over 2,000 lines'),
  headings: z.array(z.object({ depth: z.number() })).refine(
    (headings) => !headings.some((h) => h.depth === 1),
    'Use the title field, not a # heading'
  )
});
```

**src/lib/check-post.ts** (a small helper the examples reuse):

```typescript
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import {
  checkDocument,
  formatIssues,
  readDocument,
  relativeLinksResolve
} from '@fieldtest/core';
import { blogPostSchema, blogOutlineSchema } from '../schemas';

/** Check one Markdown file: front matter, outline, and that relative links resolve. */
export async function checkPostFile(path: string) {
  const doc = await readDocument(path); // reads the file and calls parseDocument with { path }
  return checkDocument(doc, {
    frontmatter: blogPostSchema,
    outline: blogOutlineSchema,
    rules: [relativeLinksResolve]
  });
}

/** Check every Markdown file in a directory. Returns the failures, one formatted block per file. */
export async function checkPostDir(dir: string): Promise<string[]> {
  const failures: string[] = [];
  for (const name of (await readdir(dir)).filter((f) => /\.mdx?$/.test(f))) {
    const result = await checkPostFile(join(dir, name));
    if (!result.ok) failures.push(formatIssues(result.issues));
  }
  return failures;
}
```

---

## Astro Integration

### Installation

```bash
pnpm add @fieldtest/core zod
```

### Content Collections

Astro validates a collection's front matter itself, with the `z` from `astro:content`. Keep that schema for the editor types and `astro sync`, and let FieldTest cover what Astro's schema cannot see: YAML parse problems with line numbers, the body outline, and file-system rules such as relative links.

**src/content/config.ts:**

```typescript
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.coerce.date(),
    author: z.string(),
    tags: z.array(z.string()).optional()
  })
});

export const collections = { blog };
```

This is the same shape as `blogPostSchema` in `src/schemas.ts`. Astro bundles its own zod, which can be a different major version from the one you install, so the two are declared separately.

### Validating During Build

Create a validation script that runs before `astro build`:

**scripts/validate-content.ts:**

```typescript
import { checkPostDir } from '../src/lib/check-post';

const failures = await checkPostDir('src/content/blog');

if (failures.length > 0) {
  console.error(failures.join('\n\n'));
  process.exit(1);
}

console.log('All content validated successfully.');
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

The script uses top-level `await`, so it needs `"type": "module"` in `package.json` (Astro projects have it). A failing file prints one line per issue, for example `src/content/blog/post.md:10 Link target not found: ./nope.md` or `src/content/blog/post.md:3 Invalid YAML: ... (quote the value, e.g. key: "text: more")`.

### Dynamic Pages with Validation

Validate the content directory when generating dynamic pages:

**src/pages/blog/[slug].astro:**

```astro
---
import { getCollection } from 'astro:content';
import { checkPostDir } from '../../lib/check-post';

export async function getStaticPaths() {
  const failures = await checkPostDir('src/content/blog');
  if (failures.length > 0) {
    throw new Error(`Invalid content:\n${failures.join('\n\n')}`);
  }

  const posts = await getCollection('blog');
  return posts.map(post => ({
    params: { slug: post.slug },
    props: { post }
  }));
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
import fs from 'fs';
import path from 'path';
import { checkDocument, formatIssues, parseDocument } from '@fieldtest/core';
import { blogPostSchema, type BlogPostFrontmatter } from '../../../schemas';
import { renderMarkdown } from '../../../lib/render-markdown'; // your renderer: remark, marked, ...

const postsDirectory = path.join(process.cwd(), 'content/posts');

export async function generateStaticParams() {
  return fs.readdirSync(postsDirectory).map(filename => ({
    slug: filename.replace('.md', '')
  }));
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const fullPath = path.join(postsDirectory, `${params.slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf-8');

  // parseDocument reads YAML only and never executes front matter.
  const doc = parseDocument(fileContents, { path: fullPath });
  const result = await checkDocument(doc, { frontmatter: blogPostSchema });

  if (!result.ok) {
    throw new Error(`Content validation failed:\n${formatIssues(result.issues)}`);
  }

  const data = doc.frontmatter as BlogPostFrontmatter; // checked above
  const html = await renderMarkdown(doc.body);

  return (
    <article>
      <h1>{data.title}</h1>
      <p>By {data.author}</p>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
```

`doc.body` is Markdown source, not HTML, so render it before inserting it into the page. Only pass `dangerouslySetInnerHTML` output from a renderer you trust with content you control.

### Pages Router (Next.js 12 and earlier)

**pages/blog/[slug].tsx:**

```typescript
import { GetStaticPaths, GetStaticProps } from 'next';
import fs from 'fs';
import path from 'path';
import { checkDocument, formatIssues, parseDocument } from '@fieldtest/core';
import { blogPostSchema, type BlogPostFrontmatter } from '../../schemas';
import { renderMarkdown } from '../../lib/render-markdown'; // your renderer

interface BlogPostProps {
  title: string;
  author: string;
  html: string;
}

const postsDirectory = path.join(process.cwd(), 'content/posts');

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = fs.readdirSync(postsDirectory).map(filename => ({
    params: { slug: filename.replace('.md', '') }
  }));

  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<BlogPostProps> = async ({ params }) => {
  const fullPath = path.join(postsDirectory, `${params!.slug}.md`);
  const doc = parseDocument(fs.readFileSync(fullPath, 'utf-8'), { path: fullPath });

  // Validate during build
  const result = await checkDocument(doc, { frontmatter: blogPostSchema });

  if (!result.ok) {
    throw new Error(`Invalid content:\n${formatIssues(result.issues)}`);
  }

  const data = doc.frontmatter as BlogPostFrontmatter; // checked above

  return {
    props: {
      title: data.title,
      author: data.author,
      html: await renderMarkdown(doc.body)
    }
  };
};

export default function BlogPost({ title, author, html }: BlogPostProps) {
  return (
    <article>
      <h1>{title}</h1>
      <p>By {author}</p>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
```

### API Routes

Validate content in API endpoints. `parseDocument` is safe on text you did not write: it only reads YAML.

**app/api/validate/route.ts (App Router):**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { checkDocument, parseDocument } from '@fieldtest/core';
import { blogPostSchema } from '../../../schemas';

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();
    const result = await checkDocument(parseDocument(String(content)), {
      frontmatter: blogPostSchema
    });

    if (result.ok) {
      return NextResponse.json({ valid: true });
    } else {
      return NextResponse.json(
        { valid: false, issues: result.issues },
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

These use a `loadMarkdownFile` helper that returns the file's text; substitute your own loader.

### Remix

```typescript
import { json, LoaderFunction } from '@remix-run/node';
import { checkDocument, formatIssues, parseDocument } from '@fieldtest/core';
import { blogPostSchema } from '../schemas';

export const loader: LoaderFunction = async ({ params }) => {
  const content = await loadMarkdownFile(params.slug);
  const result = await checkDocument(parseDocument(content), { frontmatter: blogPostSchema });

  if (!result.ok) {
    throw new Response(formatIssues(result.issues), { status: 400 });
  }

  return json({ content });
};
```

### SvelteKit

```typescript
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { checkDocument, parseDocument } from '@fieldtest/core';
import { blogPostSchema } from '$lib/schemas';

export const load: PageServerLoad = async ({ params }) => {
  const content = await loadMarkdownFile(params.slug);
  const result = await checkDocument(parseDocument(content), { frontmatter: blogPostSchema });

  if (!result.ok) {
    error(400, 'Invalid content');
  }

  return { content };
};
```

### Nuxt 3

```typescript
import { checkDocument, parseDocument } from '@fieldtest/core';
import { blogPostSchema } from '~/schemas';

export default defineEventHandler(async (event) => {
  const slug = event.context.params.slug;
  const content = await loadMarkdownFile(slug);
  const result = await checkDocument(parseDocument(content), { frontmatter: blogPostSchema });

  if (!result.ok) {
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

Every failure is a list of `Issue` objects: `message`, `path` (keys to the field), `severity` (`"error"` or `"warn"`), `source` (`"parse"`, `"frontmatter"`, `"outline"`, `"rule"`, `"tree"`, or `"data"`), and, when known, `line`, `file`, `rule`, and `hint`. A result is `ok` when there are no errors, so warnings never fail a build on their own; `result.issues` still lists them.

### Development vs Production

```typescript
import { checkDocument, formatIssues, parseDocument } from '@fieldtest/core';
import { blogPostSchema } from './schemas';

const isDevelopment = process.env.NODE_ENV === 'development';

async function validateContent(content: string, path?: string) {
  const result = await checkDocument(parseDocument(content, { path }), {
    frontmatter: blogPostSchema
  });

  if (!result.ok) {
    if (isDevelopment) {
      // Show detailed errors in development
      console.error('Validation failed:');
      console.error(formatIssues(result.issues));
      throw new Error('Content validation failed - see console for details');
    } else {
      // Log but don't expose details in production
      console.error('Validation failed:', result.issues);
      throw new Error('Content validation failed');
    }
  }

  return result;
}
```

### Graceful Degradation

```typescript
import { checkDocument, parseDocument, type Issue } from '@fieldtest/core';
import { blogPostSchema } from './schemas';

async function validateContentSafe(content: string): Promise<{ valid: boolean; issues: Issue[] }> {
  // parseDocument and checkDocument report content problems as issues instead of throwing.
  // The catch covers a schema or rule that throws.
  try {
    const result = await checkDocument(parseDocument(content), { frontmatter: blogPostSchema });

    if (!result.ok) {
      // Log errors but don't fail
      console.warn('Content has validation issues:', result.issues);
    }

    return { valid: result.ok, issues: result.issues };
  } catch (error) {
    console.error('Validation error:', error);
    return {
      valid: false,
      issues: [{ message: 'Validation failed', path: [], severity: 'error', source: 'data' }]
    };
  }
}
```

---

## Best Practices

### 1. Validate at Build Time

Catch errors early by validating during the build process, not at runtime.

### 2. Use TypeScript

Write schemas with a library that infers types, and derive the front matter type from the schema so the check and the type cannot drift apart:

```typescript
import { z } from 'zod';

export const blogPostSchema = z.object({
  title: z.string(),
  author: z.string()
});

export type BlogPostFrontmatter = z.infer<typeof blogPostSchema>;
```

`@fieldtest/core` exports the `StandardSchemaV1` type if you want to accept any Standard Schema library in your own helpers.

### 3. Create Reusable Validation Utilities

```typescript
// lib/validation.ts
import { checkDocument, formatIssues, parseDocument, type StandardSchemaV1 } from '@fieldtest/core';

export function createValidator(frontmatter: StandardSchemaV1) {
  return async function validate(content: string, path?: string) {
    const result = await checkDocument(parseDocument(content, { path }), { frontmatter });

    if (!result.ok) {
      throw new Error(`Validation failed:\n${formatIssues(result.issues)}`);
    }

    return result;
  };
}

// Usage
const validateBlogPost = createValidator(blogPostSchema);
await validateBlogPost(content);
```

### 4. Define Schemas Once

A schema is a plain value, so define it in one module (`src/schemas.ts`) and import it from your build script, your pages, and your API routes. There is no loading step to cache.

---

## Next Steps

- 📚 [API Reference](../reference/api.md) — Complete API documentation
- 🎓 [Schema Validation Guide](./schema-validation.md) — Deep dive into schemas
- 💡 [Examples](../../packages/examples/) — Real-world use cases
