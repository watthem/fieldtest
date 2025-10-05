# FieldTest - AI Workflow Framework

## Overview

This directory contains specialized templates and contexts for AI assistants working on FieldTest - a TypeScript validation toolkit for markdown content and Standard Schema validation across modern frameworks.

## Project Context

**FieldTest** (`@watthem/fieldtest`) is a unified validation toolkit providing:

- Markdown processing with frontmatter support
- Schema validation using Standard Schema
- Framework integrations for Astro, Next.js, and more
- MCP server for AI-powered workflows
- Biome plugins for linting and migration

## Key Performance Targets

- **Document Processing**: <50ms per document for typical content
- **Batch Processing**: Handle 5,000+ documents efficiently
- **Memory Usage**: <200MB for processing 5,000 documents
- **Build Performance**: <20 seconds for full monorepo build

## AI Workflow Structure

### Commands (`./commands/`)

Specialized prompts for common development tasks:

- `planning.md` - Feature planning and framework integration decisions
- `implementation.md` - Code implementation with Standard Schema V1 patterns
- `testing.md` - Testing strategy across multiple frameworks
- `consolidation.md` - Guidelines for consolidating overlapping projects

### Contexts (`./contexts/`)

Domain-specific knowledge for the assistant:

- `typescript.md` - TypeScript monorepo standards and patterns
- `frameworks.md` - Framework integration patterns (Astro, Next.js, etc.)
- `validation.md` - Standard Schema V1 compatibility patterns
- `performance.md` - Performance optimization techniques

### Project-Specific Instructions (`./CLAUDE.md`)

Claude Code specific guidance for this project.

## Usage

Invoke commands with:

```
/planning <feature description>
/implementation <task details>
/testing <framework integration>
/consolidation <overlap analysis>
```

## Development Philosophy

### Framework-Agnostic Design

- **Universal Compatibility**: Works seamlessly with Astro, Next.js, and other frameworks
- **Standard Schema V1**: Universal validation interface for maximum compatibility
- **Unified Toolkit**: Combines markdown processing, schema validation, and content management
- **Modern Tooling**: Built with TypeScript, Turborepo, and modern development practices

### Critical Principles

1. **Framework Agnostic**: Never couple code to specific frameworks
2. **Performance Consciousness**: Target sub-50ms validation for typical documents
3. **Standard Schema V1**: Always use the universal validation interface
4. **Developer Experience**: Prioritize excellent documentation and examples
5. **Community Focus**: Design for contribution and ecosystem growth

## Technology Stack

- **Runtime**: Node.js 18+ with TypeScript 5.3+
- **Build System**: Turborepo with pnpm workspaces
- **Validation**: Standard Schema V1 with Zod implementation
- **Bundling**: tsup for efficient TypeScript bundling
- **Testing**: Vitest for comprehensive testing
- **Integration**: @docs-score/core workspace dependency

## Architecture Overview

```
fieldtest/
├── packages/
│   ├── core/                           # Core markdown processing
│   ├── validate/                       # Validation utilities
│   ├── registry/                       # Schema registry
│   ├── shared/                         # Common utilities
│   ├── examples/                       # Example implementations
│   └── integrations/
│       └── mcp/fieldtest-mcp-server/  # MCP server for AI workflows
├── grit-plugins/                       # Biome GritQL linting plugins
├── docs/                               # Documentation
│   ├── guides/                         # How-to guides
│   ├── reference/                      # API reference
│   └── explainers/                     # Conceptual articles
└── scripts/                            # Build and utility scripts
```

## Key Features

### Unified Package

All functionality is consolidated in `@watthem/fieldtest`:

- `parseMarkdown()` / `serializeMarkdown()` - Markdown processing
- `validateWithSchema()` - Content validation
- `loadUserSchema()` / `getBuiltInSchema()` - Schema management
- `validateAstroContent()` / `validateNextContent()` - Framework helpers

### Developer Tools

- **Biome Integration**: Fast linting with custom GritQL plugins
- **MCP Server**: AI-powered content validation workflows
- **TypeScript-first**: Full type safety throughout

This framework ensures consistent, high-quality development while maintaining focus on framework-agnostic validation and excellent developer experience.
