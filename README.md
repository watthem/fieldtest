# FieldTest

> **A validation toolkit for Markdown and Standard Schema — built for Astro, Next.js, and modern frameworks.**

[![npm version](https://img.shields.io/npm/v/@fieldtest/core.svg)](https://www.npmjs.com/package/@fieldtest/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![GitHub stars](https://img.shields.io/github/stars/watthem/fieldtest.svg?style=social)](https://github.com/watthem/fieldtest)

**FieldTest** is a framework-agnostic TypeScript validation toolkit that brings order to content chaos. Whether you're building with Astro, Next.js, or any modern framework, FieldTest ensures your markdown content and frontmatter data is consistent, valid, and production-ready.

## Why FieldTest?

- Catch validation issues at build time
- Works across Astro, Next.js, Remix, SvelteKit, and more
- Built on [Standard Schema v1](https://standardschema.dev)
- Fast validation for large content sets
- Strong TypeScript support with clear errors
- Sensible defaults with easy customization

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

- Content validation for markdown + frontmatter
- Standard Schema compatibility
- Framework integrations for Astro and Next.js
- Schema registry and reusable validators
- OpenAPI helpers
- Markdown parsing + serialization
- MCP server for AI workflows
- Biome plugins for linting/migration

## OpenAPI Quickstart

```ts
import { loadOpenApiSchemas } from "@fieldtest/openapi";
import { validate } from "@fieldtest/validation-lib";

const registry = loadOpenApiSchemas("./openapi.yaml");
const createUser = registry.paths["/users"].post;

const [ok] = validate(createUser.requestBody!, { name: "Ada" });
```

## Quick Start

### Installation

```bash
npm install @fieldtest/core
# or
pnpm add @fieldtest/core
```

### Validate your first document

```ts
import { loadUserSchema, parseMarkdown, validateWithSchema, z } from "@fieldtest/core";

const blogSchema = z.object({
  title: z.string(),
  date: z.string(),
  tags: z.array(z.string()).optional(),
});

const schema = loadUserSchema(blogSchema);
const doc = parseMarkdown(`---\ntitle: Hello\ndate: 2025-01-01\n---\nContent`);
const result = await validateWithSchema(schema, doc.frontmatter, { throwOnError: true });
```

## Documentation

- Docs hub: https://docs.matthewhendricks.net/fieldtest/
- Issues: https://github.com/watthem/fieldtest/issues

## License

MIT
