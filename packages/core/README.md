# FieldTest

> **A validation toolkit for Markdown and Standard Schema — built for Astro, Next.js, and modern frameworks.**

[![npm version](https://img.shields.io/npm/v/@watthem/fieldtest.svg)](https://www.npmjs.com/package/@watthem/fieldtest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![GitHub stars](https://img.shields.io/github/stars/watthem/fieldtest.svg?style=social)](https://github.com/watthem/fieldtest)

**FieldTest** is a framework-agnostic TypeScript validation toolkit that brings order to content chaos. Whether you're building with Astro, Next.js, or any modern framework, FieldTest ensures your markdown content and frontmatter data is consistent, valid, and production-ready.

## ✨ Why FieldTest?

- 🚫 **No more runtime content errors** — Catch validation issues at build time
- 🔄 **Framework agnostic** — Works seamlessly with Astro, Next.js, Remix, SvelteKit, and more
- 📋 **Standard Schema compliant** — Built on [Standard Schema v1](https://standardschema.dev) for maximum interoperability
- ⚡ **Performance first** — <50ms validation per document, handles 5000+ files efficiently
- 🛠️ **Developer friendly** — Excellent TypeScript support with comprehensive error messages
- 🔧 **Zero config** — Works out of the box, customizable when you need it

## Project Structure

```
fieldtest/
├── packages/
│   ├── core/                    # Core markdown processing
│   ├── validate/                # Validation utilities
│   ├── registry/                # Schema registry
│   ├── shared/                  # Common utilities and types
│   ├── examples/                # Example implementations
│   └── integrations/
│       └── mcp/
│           └── fieldtest-mcp-server/  # MCP server for AI workflows
├── grit-plugins/                # Biome GritQL linting plugins
├── docs/                        # Documentation
│   ├── guides/                  # How-to guides
│   ├── reference/               # API reference
│   └── explainers/              # Conceptual articles
├── scripts/                     # Build and utility scripts
└── biome.json                   # Biome configuration
```

## Features

✨ **Content Validation** — Validate markdown files against custom schemas with detailed error reporting

🎯 **Standard Schema** — Built on [Standard Schema](https://standardschema.dev) for interoperability

🏗️ **Framework Integration** — Works seamlessly with Astro, Next.js, and other modern frameworks

📚 **Schema Registry** — Reuse and manage validation schemas across projects

🔄 **Markdown Processing** — Parse and serialize markdown with frontmatter

🤖 **AI Workflows** — Model Context Protocol (MCP) server for AI-powered content validation

🛠️ **Biome Plugins** — Custom GritQL linting rules for migration assistance and best practices

## 🚀 Quick Start

### Installation

```bash
npm install @watthem/fieldtest
# or
pnpm add @watthem/fieldtest
# or 
yarn add @watthem/fieldtest
```

**Requirements:** Node.js 18+ | Works with any package manager

### Basic Usage

1. **Define your content schema:**

```typescript
import type { StandardSchemaV1 } from '@watthem/fieldtest';

const blogSchema: StandardSchemaV1 = {
  version: '1',
  name: 'blog-post',
  fields: {
    title: { type: 'string', required: true },
    author: { type: 'string', required: true },
    published: { type: 'boolean', required: true },
    tags: { type: 'string', array: true },
    publishedAt: { type: 'date', required: false }
  }
};
```

2. **Validate your markdown content:**

```typescript
import { loadUserSchema, validateWithSchema } from '@watthem/fieldtest';

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
  // Your content is safe to use
} else {
  console.error('❌ Validation failed:');
  result.errors.forEach(error => {
    console.error(`  • ${error.field}: ${error.message}`);
  });
}
```

**That's it!** You're now validating content like a pro. 🎆

## 🎯 Framework Integration

FieldTest works seamlessly with your favorite framework:

### Astro Content Collections

```typescript
// src/content/config.ts
import { defineCollection } from 'astro:content';
import { loadUserSchema, validateWithSchema } from '@watthem/fieldtest';

const blog = defineCollection({
  type: 'content',
  schema: (z) => z.object({
    title: z.string(),
    author: z.string(),
    publishedAt: z.date()
  }).refine((data) => {
    // Add FieldTest validation on top of Zod
    const result = validateWithSchema(
      generateMarkdown(data), 
      loadUserSchema(blogSchema)
    );
    return result.valid;
  })
});
```

### Next.js Pages & App Router

```typescript
// Validate content in getStaticProps, generateStaticParams, or API routes
import { validateWithSchema, loadUserSchema } from '@watthem/fieldtest';
import fs from 'fs';

export async function generateStaticParams() {
  const schema = loadUserSchema(blogSchema);
  const posts = fs.readdirSync('./content');
  
  return posts.map(post => {
    const content = fs.readFileSync(`./content/${post}`, 'utf-8');
    const result = validateWithSchema(content, schema);
    
    if (!result.valid) {
      throw new Error(`Invalid post ${post}: ${result.errors.map(e => e.message).join(', ')}`);
    }
    
    return { slug: post.replace('.md', '') };
  });
}
```

### Other Frameworks

```typescript
// Works with Remix, SvelteKit, Nuxt, Solid, and more!
import { validateWithSchema } from '@watthem/fieldtest';

// Universal validation that works anywhere
const isValid = validateWithSchema(content, schema).valid;
```

## 🛠️ Advanced Features

### Built-in Schema Registry

Skip writing schemas for common use cases:

```typescript
import { getBuiltInSchema } from '@watthem/fieldtest';

// Pre-built schemas for common content types
const blogSchema = getBuiltInSchema('blog-post');
const docsSchema = getBuiltInSchema('documentation');
const marketingSchema = getBuiltInSchema('marketing-copy');
```

### Biome Integration

FieldTest includes custom **GritQL plugins** for Biome to help with migration and best practices:

```json
// biome.json
{
  "plugins": [
    "./node_modules/@watthem/fieldtest/grit-plugins/fieldtest-migration.grit",
    "./node_modules/@watthem/fieldtest/grit-plugins/schema-usage.grit"
  ]
}
```

- ⚙️ **Migration Helper** — Detects legacy imports and types
- ✓ **Schema Validation** — Ensures validation results are checked
- 🎨 **Code Quality** — Flags non-standard patterns

### MCP Integration for AI Workflows

```typescript
// AI-powered content validation and generation
import { MCPServer } from '@watthem/fieldtest/mcp';

const server = new MCPServer({
  schemas: [blogSchema, docsSchema],
  aiValidation: true
});
```

## 📚 Documentation

FieldTest has comprehensive documentation to get you started:

- 🚀 [**Getting Started**](https://matthewhendricks.net/fieldtest/getting-started) — Quick installation and first steps
- 📚 [**API Reference**](https://matthewhendricks.net/fieldtest/reference/api) — Complete function and type documentation
- 🎯 [**Framework Guides**](https://matthewhendricks.net/fieldtest/guides/framework-integration) — Astro, Next.js, and more
- 📝 [**Schema Validation Guide**](https://matthewhendricks.net/fieldtest/guides/schema-validation) — Creating and using schemas
- 💫 [**Examples**](https://matthewhendricks.net/fieldtest/examples/) — Real-world use cases and patterns

## 🤝 Contributing

We welcome contributions! FieldTest is open source and built by the community.

### Quick Development Setup

```bash
# Clone and setup
git clone https://github.com/watthem/fieldtest.git
cd fieldtest
pnpm install

# Start development
pnpm dev       # Watch mode for all packages
pnpm test      # Run tests
pnpm lint      # Check code quality
```

### Ways to Contribute

- 🐛 **Report bugs** or request features via [GitHub Issues](https://github.com/watthem/fieldtest/issues)
- 📝 **Improve documentation** — Fix typos, add examples, clarify concepts
- 🛠️ **Add features** — New schema types, framework integrations, utilities
- 📺 **Create examples** — Show how to use FieldTest in different scenarios
- 🔌 **Build integrations** — Plugins for editors, build tools, or frameworks

Check out our [**Contributing Guide**](./CONTRIBUTING.md) for detailed guidelines.

## 🔄 Migration from FKit

Upgrading from FKit or legacy `@fieldtest/*` packages? We've got you covered:

```bash
# Update package.json
npm uninstall @fieldtest/core @fieldtest/validate @fieldtest/registry
npm install @watthem/fieldtest

# Update imports (TypeScript/JavaScript)
find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" | xargs sed -i 's/@fieldtest\/[a-zA-Z-]*/@watthem\/fieldtest/g'
find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" | xargs sed -i 's/FkitDocument/FieldTestDocument/g'
```

📝 [**Complete Migration Guide**](https://fieldtest.watthem.blog/migration) — Detailed migration steps and breaking changes

## 🌍 Community & Support

Join the FieldTest community:

- 🐛 [**GitHub Issues**](https://github.com/watthem/fieldtest/issues) — Bug reports and feature requests
- 💬 [**GitHub Discussions**](https://github.com/watthem/fieldtest/discussions) — Questions, ideas, and showcase
- 🐦 [**Twitter**](https://twitter.com/watthem) — Updates and announcements
- 📧 [**Email**](mailto:hello@matthewhendricks.net) — Direct contact for partnerships or support

## 📜 License

**MIT License** © 2024 [Matthew Hendricks](https://matthewhendricks.net)

Free to use in personal and commercial projects. See [LICENSE](./LICENSE) for details.

## 🚀 Built With

FieldTest stands on the shoulders of giants:

- 📦 [**Standard Schema**](https://standardschema.dev) — Universal validation interface
- ⚛️ **TypeScript** — Type-safe development experience
- 📦 **pnpm + Turborepo** — Fast, reliable monorepo management
- 🤖 **Biome** — Fast formatting and linting
- ⚡ **Vitest** — Blazing fast unit testing

---

<div align="center">
  <p><strong>Ready to validate your content like a pro?</strong></p>
  <p>
    <a href="https://fieldtest.watthem.blog/getting-started">Get Started</a> • 
    <a href="https://fieldtest.watthem.blog/examples/">See Examples</a> •
    <a href="https://github.com/watthem/fieldtest">Star on GitHub</a>
  </p>
</div>
