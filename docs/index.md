---
layout: home

hero:
  name: "FieldTest"
  text: "Validation toolkit for content"
  tagline: "Framework-agnostic validation for Markdown and Standard Schema — built for Astro, Next.js, and modern frameworks."
  image:
    src: /hero.png
    alt: FieldTest - Framework-agnostic validation toolkit
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/watthem/fieldtest
    - theme: alt
      text: API Reference
      link: /reference/api

features:
  - icon: 🚫
    title: No Runtime Errors
    details: Catch content validation issues at build time, not in production. Your users will never see broken content again.

  - icon: 🔄
    title: Framework Agnostic
    details: Works seamlessly with Astro, Next.js, Remix, SvelteKit, Nuxt, and any modern framework. One validation API to rule them all.

  - icon: 📋
    title: Standard Schema Compliant
    details: Built on Standard Schema v1 for maximum interoperability. Your validation logic works across different libraries and tools.

  - icon: ⚡
    title: Performance First
    details: <50ms validation per document, efficiently handles 5000+ files. Built for large content sites that need speed.

  - icon: 🧩
    title: OpenAPI Ready
    details: Generate Zod schemas from OpenAPI specs to validate request and response payloads quickly.

  - icon: 🛠️
    title: Developer Friendly
    details: Excellent TypeScript support, comprehensive error messages, and extensive documentation. Get productive quickly.

  - icon: 🔧
    title: Zero Configuration
    details: Works out of the box with sensible defaults. Customize when you need it, but don't worry about complex setup.
---

## Quick Example

```typescript
import { parseMarkdown, validateWithSchema, z } from '@watthem/fieldtest';

// Define your schema using Zod (Standard Schema compliant)
const blogSchema = z.object({
  title: z.string(),
  author: z.string(),
  published: z.boolean(),
  tags: z.array(z.string()).optional()
});

// Parse your markdown content
const markdown = `---
title: "Getting Started with FieldTest"
author: "Jane Developer"
published: true
tags: ["typescript", "validation", "markdown"]
---

# Getting Started

This post shows how easy it is to validate content with FieldTest!
`;

const doc = parseMarkdown(markdown);

// Validate the frontmatter against your schema
const result = await validateWithSchema(blogSchema, doc.frontmatter);

if ('issues' in result) {
  result.issues.forEach(issue => {
    console.error(`❌ ${issue.path?.join('.')}: ${issue.message}`);
  });
} else {
  console.log('✓ Content validated successfully!');
  console.log('Title:', result.title);  // Type-safe access
}
```

## Framework Integration

<div class="framework-grid">

### Astro
```typescript
// src/content/config.ts
import { defineCollection } from 'astro:content';
import { z } from '@watthem/fieldtest';

// Astro's built-in Zod works with FieldTest schemas
const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    author: z.string(),
    published: z.boolean().default(false),
    tags: z.array(z.string()).optional()
  })
});

export const collections = { blog };
```

### Next.js
```typescript
// Validate content at build time
import { parseMarkdown, validateWithSchema, z } from '@watthem/fieldtest';
import fs from 'fs';

const postSchema = z.object({
  title: z.string(),
  date: z.string(),
  author: z.string()
});

export async function getStaticProps({ params }) {
  const content = fs.readFileSync(`./content/${params.slug}.md`, 'utf-8');
  const doc = parseMarkdown(content);

  const data = await validateWithSchema(postSchema, doc.frontmatter, {
    throwOnError: true  // Fail build on invalid content
  });

  return { props: { post: { ...data, body: doc.body } } };
}
```

### Universal
```typescript
// Works with any framework or runtime
import { parseMarkdown, validateWithSchema, z } from '@watthem/fieldtest';

const schema = z.object({ title: z.string() });
const doc = parseMarkdown(markdown);
const result = await validateWithSchema(schema, doc.frontmatter);
const isValid = !('issues' in result);
```

</div>

## Why Choose FieldTest?

### 🎯 **Built for Modern Frameworks**
Stop wrestling with framework-specific validation. FieldTest works the same way across Astro, Next.js, Remix, SvelteKit, and more.

### 📚 **Standard Schema Foundation**
Based on the emerging [Standard Schema](https://standardschema.dev) specification, ensuring your validation logic is future-proof and interoperable.

### ⚡ **Performance Optimized**
Designed to handle large content sites. Validates thousands of documents in seconds with minimal memory usage.

### 🔧 **Developer Experience**
Comprehensive TypeScript support, clear error messages, extensive documentation, and helpful tooling integrations.

## OpenAPI Support

Use OpenAPI contracts to generate Zod schemas and validate request/response payloads.

- [OpenAPI Integration Guide](/guides/openapi-integration)
- [OpenAPI Reference](/reference/openapi)

## Ready to Get Started?

<div class="cta-grid">
  <div class="cta-card">
    <h3>🚀 Quick Start</h3>
    <p>Get up and running in less than 5 minutes with our comprehensive getting started guide.</p>
    <a href="/getting-started" class="cta-link">Get Started →</a>
  </div>

  <div class="cta-card">
    <h3>📖 Learn by Example</h3>
    <p>Explore real-world examples and patterns for different frameworks and use cases.</p>
    <a href="/examples/" class="cta-link">Browse Examples →</a>
  </div>

  <div class="cta-card">
    <h3>🔍 API Reference</h3>
    <p>Comprehensive documentation of all functions, types, and configuration options.</p>
    <a href="/reference/api" class="cta-link">View API →</a>
  </div>
</div>

<style>
.framework-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.cta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.cta-card {
  padding: 1.5rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}

.cta-card h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
}

.cta-card p {
  margin: 0 0 1rem 0;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}

.cta-link {
  color: var(--vp-c-brand);
  text-decoration: none;
  font-weight: 500;
}

.cta-link:hover {
  text-decoration: underline;
}
</style>
