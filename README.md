# FieldTest

> A validation toolkit for Markdown and Standard Schema — built for Astro, Next.js, and modern frameworks.

[![npm version](https://img.shields.io/npm/v/@watthem/fieldtest.svg)](https://www.npmjs.com/package/@watthem/fieldtest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## What is FieldTest?

**FieldTest** is a TypeScript validation toolkit that unifies:

- 📝 **Markdown parsing** with frontmatter support
- ✅ **Schema validation** using [Standard Schema](https://standardschema.dev)
- 🗂️ **Schema registry** for reusable validation rules
- 🚀 **Framework integrations** for Astro, Next.js, and more
- 🤖 **MCP integration** for AI-powered content workflows
- 🔧 **Biome plugins** for linting and migration assistance

FieldTest helps you catch content structure errors before they reach production, ensuring consistency across markdown files, CMS payloads, and content-rich applications.

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

## Installation

```bash
npm install @watthem/fieldtest
```

Or with pnpm:

```bash
pnpm add @watthem/fieldtest
```

**Requirements:** Node.js 18+ and PNPM 8+

## Quick Start

### 1. Define a schema

```typescript
import type { StandardSchemaV1 } from '@watthem/fieldtest';

export const blogPostSchema: StandardSchemaV1 = {
  version: '1',
  name: 'blog-post',
  fields: {
    title: { type: 'string', required: true },
    published: { type: 'boolean', required: true },
    tags: { type: 'string', array: true }
  }
};
```

### 2. Validate your content

```typescript
import { loadUserSchema, validateWithSchema } from '@watthem/fieldtest';
import { blogPostSchema } from './schema';

const schema = loadUserSchema(blogPostSchema);
const markdown = `
---
title: "My First Post"
published: true
tags: ["typescript", "validation"]
---
# Hello World
`;

const result = validateWithSchema(markdown, schema);

if (result.valid) {
  console.log('✓ Content is valid!');
} else {
  console.error('✗ Validation errors:', result.errors);
}
```

📖 **For a complete walkthrough**, see [docs/getting-started.md](./docs/getting-started.md).

## Examples & Guides

### Framework Integration

```typescript
// Astro
import { validateAstroContent } from '@watthem/fieldtest';

// Next.js
import { validateNextContent } from '@watthem/fieldtest';
```

### Markdown Processing

```typescript
import { parseMarkdown, serializeMarkdown } from '@watthem/fieldtest';

const doc = parseMarkdown('---\ntitle: Hello\n---\nContent');
console.log(doc.frontmatter.title); // "Hello"

const markdown = serializeMarkdown(doc);
```

### Schema Registry

```typescript
import { getBuiltInSchema } from '@watthem/fieldtest';

const marketingSchema = getBuiltInSchema('marketing-copy');
```

📚 **More examples**: Check out the [packages/examples](./packages/examples) directory for real-world use cases.

## Biome Integration

FieldTest includes optional **Biome plugins** to help with migration and enforce best practices. These GritQL-based plugins provide diagnostic messages for common issues.

### Available Plugins

1. **Migration Helper** — Detects legacy `@fieldtest/*` imports and `FkitDocument` usage
2. **Schema Validation** — Ensures validation results are properly checked
3. **Schema Conventions** — Flags non-standard schema patterns

### Setup

```bash
# Install Biome
pnpm add -D @biomejs/biome

# Enable FieldTest plugins in biome.json
{
  "plugins": [
    "./node_modules/@watthem/fieldtest/grit-plugins/fieldtest-migration.grit",
    "./node_modules/@watthem/fieldtest/grit-plugins/schema-usage.grit"
  ]
}

# Run linting
pnpm biome lint
```

**Note:** Biome's plugin system currently provides diagnostics only (no auto-fixes). The plugins will highlight issues with helpful messages.

📖 **Learn more** about Biome integration in [docs/guides/biome-integration.md](./docs/guides/biome-integration.md).

## Contributing

We welcome contributions! To get started:

```bash
# Clone the repository
git clone https://github.com/watthem/fieldtest.git

# Install dependencies
pnpm install

# Start development
pnpm dev

# Run tests
pnpm test

# Lint and format
pnpm biome:check
pnpm biome:fix
```

### Project Structure

```
fieldtest/
├── packages/
│   ├── core/              # Core markdown processing
│   ├── validate/          # Validation utilities
│   ├── registry/          # Schema registry
│   ├── examples/          # Example implementations
│   └── integrations/      # MCP, Obsidian, etc.
├── grit-plugins/          # Biome GritQL plugins
└── docs/                  # Documentation
```

📖 **Guidelines**: See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed contribution guidelines.

## Migration from FKit

All FKit and `@fieldtest/*` packages have been consolidated into `@watthem/fieldtest`.

**Quick migration:**

```bash
# Update imports
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/@fieldtest\/[a-zA-Z-]*/@watthem\/fieldtest/g'
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/FkitDocument/FieldTestDocument/g'
```

📖 **Complete guide**: [MIGRATION.md](./MIGRATION.md)

## Documentation

- 📖 [Getting Started](./docs/getting-started.md) — Your first validation
- 📚 [API Reference](./docs/reference/api.md) — Complete API documentation
- 🎓 [Guides](./docs/guides/) — Framework integration, Biome setup, and more
- 💡 [Examples](./packages/examples/) — Real-world use cases

## Community & Support

- 🐛 [Report bugs](https://github.com/watthem/fieldtest/issues)
- 💬 [Discussions](https://github.com/watthem/fieldtest/discussions)
- 📧 Contact: <hello@matthewhendricks.net>

## License

MIT © [Matthew Hendricks](https://matthewhendricks.net)

## Acknowledgements

Built with modern TypeScript tooling (pnpm, Turborepo, Vitest, Biome) and based on [Standard Schema](https://standardschema.dev) for maximum interoperability.
