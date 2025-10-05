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

  - icon: 🛠️
    title: Developer Friendly
    details: Excellent TypeScript support, comprehensive error messages, and extensive documentation. Get productive quickly.

  - icon: 🔧
    title: Zero Configuration
    details: Works out of the box with sensible defaults. Customize when you need it, but don't worry about complex setup.
---

## Quick Example

```typescript
import { loadUserSchema, validateWithSchema } from '@watthem/fieldtest';
import type { StandardSchemaV1 } from '@watthem/fieldtest';

// Define your schema
const blogSchema: StandardSchemaV1 = {
  version: '1',
  name: 'blog-post',
  fields: {
    title: { type: 'string', required: true },
    author: { type: 'string', required: true },
    published: { type: 'boolean', required: true },
    tags: { type: 'string', array: true }
  }
};

// Validate your content
const schema = loadUserSchema(blogSchema);
const markdown = `---
title: "Getting Started with FieldTest"
author: "Jane Developer"
published: true
tags: ["typescript", "validation", "markdown"]
---

# Getting Started

This post shows how easy it is to validate content with FieldTest!
`;

const result = validateWithSchema(markdown, schema);

if (result.valid) {
  console.log('✓ Content validated successfully!');
} else {
  result.errors.forEach(error => {
    console.error(`❌ ${error.field}: ${error.message}`);
  });
}
```

## Framework Integration

<div class="framework-grid">

### Astro
```typescript
// src/content/config.ts
import { defineCollection } from 'astro:content';
import { loadUserSchema } from '@watthem/fieldtest';

const blog = defineCollection({
  type: 'content',
  schema: (z) => z.object({
    title: z.string(),
    author: z.string()
  }).refine(data => {
    const result = validateWithSchema(
      generateMarkdown(data), 
      loadUserSchema(blogSchema)
    );
    return result.valid;
  })
});
```

### Next.js
```typescript
// Validate in generateStaticParams or getStaticProps
export async function generateStaticParams() {
  const schema = loadUserSchema(blogSchema);
  const posts = fs.readdirSync('./content');
  
  return posts.map(post => {
    const content = fs.readFileSync(`./content/${post}`, 'utf-8');
    const result = validateWithSchema(content, schema);
    
    if (!result.valid) {
      throw new Error(`Invalid post: ${result.errors.map(e => e.message)}`);
    }
    
    return { slug: post.replace('.md', '') };
  });
}
```

### Other Frameworks
```typescript
// Universal validation that works anywhere
import { validateWithSchema } from '@watthem/fieldtest';

const isValid = validateWithSchema(content, schema).valid;
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