# FieldTest Validation Toolkit

A comprehensive TypeScript validation toolkit for content management and schema validation across modern frameworks. FieldTest provides powerful markdown processing, schema validation, and content organization tools in a unified, framework-agnostic package.

## Overview

FieldTest is a **validation toolkit** (not an SDK) that consolidates content validation, markdown processing, and schema management into cohesive, reusable packages. It integrates seamlessly with Astro, Next.js, and other modern frameworks while leveraging @docs-score/core functionality and modern development practices.

## What is FieldTest?

FieldTest is a **validation toolkit** - a collection of specialized tools that work together for:

- **Content Validation**: Validate markdown content against custom schemas
- **Schema Management**: Organize and manage validation schemas across projects  
- **Markdown Processing**: Parse, process, and serialize markdown with frontmatter
- **Framework Integration**: Works with Astro, Next.js, and other modern frameworks
- **Standard Schema Support**: Built on [Standard Schema](https://standardschema.dev) for maximum compatibility

## Structure

The workspace is structured as follows:

```md
fieldtest/
├── apps/                    # Applications
│   ├── astro-site/         # Astro.js application
│   └── next-app/           # Next.js application
├── packages/               # Shared packages
│   ├── core/              # Core markdown processing and schema utilities
│   ├── shared/            # Common utilities and types
│   ├── validation-lib/    # Framework-agnostic validation library
│   ├── validate/          # Validation utilities and schemas
│   ├── registry/          # Schema registry and management
│   ├── examples/          # Example implementations and use cases
│   ├── fieldtest-demo/    # Demo package for various frameworks
│   └── integrations/      # Tool integrations (MCP, Obsidian, etc.)
├── package.json           # Workspace configuration
└── turbo.json             # Turborepo configuration
```

## Key Features

- **Unified Toolkit**: Combines markdown processing, schema validation, and content management
- **Framework Agnostic**: Libraries and utilities that work with Astro, Next.js, and other frameworks
- **Standard Schema Support**: Built on [Standard Schema](https://standardschema.dev) for maximum compatibility
- **Monorepo Setup**: Using PNPM workspaces and Turborepo for efficient package management
- **@docs-score/core Integration**: Leveraging existing functionality from @docs-score/core
- **Modern Tooling**: Using tsup for bundling, Vitest for testing, and ESLint for linting
- **TypeScript**: Full TypeScript support with proper type definitions
- **MCP Integration**: Model Context Protocol server for AI-powered workflows

## Getting Started

### Quick Start

```bash
npm install @watthem/fieldtest
```

### Prerequisites

- Node.js 18+
- PNPM 8+

### Installation

```bash
# Install dependencies
pnpm install
```

### Development

```bash
# Start development servers for all applications
pnpm dev

# Build all packages and applications
npx turbo build

# Run tests across all packages
pnpm test
```

For a step-by-step Standard Schema walkthrough, see [docs/getting-started.md](./docs/getting-started.md).

## Package

`@watthem/fieldtest` bundles the core validation engine, schema registry, and framework integrations into a single, cohesive package:

- Markdown parsing and serialization
- Validation utilities and pre-built schemas
- Schema registry and management
- Integrations like MCP Server and Obsidian tooling

## History

### FKit → FieldTest Migration

All FKit code is now under FieldTest. Use `@watthem/fieldtest` for all validation and schema work.

This project successfully consolidates the functionality from the FKit (Flat File Knowledge Infrastructure Toolkit) project, providing a unified and more maintainable codebase under the FieldTest brand.

### Quick Migration Guide

If you have existing FKit code:

```bash
# Update imports in your codebase
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/@fieldtest\/[a-zA-Z-]*/@watthem\/fieldtest/g'
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/FkitDocument/FieldTestDocument/g'
```

📖 **See [MIGRATION.md](./MIGRATION.md) for complete migration details, breaking changes, and examples.**

## Applications

### Astro Site

A demo Astro.js site that showcases the validation library in action.

### Next.js App

A demo Next.js application that demonstrates how to use the validation library in a React application.

## Acknowledgements

This project is built on the foundations laid by the @docs-score/core library and incorporates functionality from the FKit project. It follows patterns described in the project documentation and emphasizes minimal dependencies for maximum robustness.

## License

MIT
