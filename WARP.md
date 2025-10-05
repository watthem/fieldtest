# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Essential Commands
```bash
# Install dependencies (must use pnpm)
pnpm install

# Build all packages in dependency order
pnpm build

# Development mode with watch
pnpm dev

# Run all tests
pnpm test

# Lint and format code
pnpm biome:check
pnpm biome:fix

# Clean build artifacts
pnpm clean
```

### Package-specific Commands
```bash
# Build individual packages
pnpm --filter @watthem/fieldtest build
pnpm --filter @fieldtest/validate build
pnpm --filter @fieldtest/registry build

# Run examples
cd packages/fieldtest-demo && pnpm run example
cd packages/registry && pnpm run-examples

# Test specific functionality
cd packages/core && pnpm test
cd packages/validate && pnpm test
```

### Framework Testing
```bash
# Test Astro integration (when implemented)
cd apps/astro-site && pnpm dev

# Test Next.js integration (when implemented) 
cd apps/next-app && pnpm dev

# Test MCP server
cd packages/integrations/mcp && pnpm dev
```

## Architecture Overview

FieldTest is a **TypeScript monorepo** using **Turborepo + pnpm workspaces** that provides framework-agnostic content validation. The project consolidates the former FKit project into a comprehensive validation toolkit.

### Core Design Principles
1. **Framework Agnostic**: Never couple to specific frameworks - works with Astro, Next.js, any modern framework
2. **Standard Schema V1**: Universal validation interface following https://standardschema.dev spec
3. **Performance First**: Target <50ms validation per document, <200MB memory for 5000+ documents
4. **Monorepo Architecture**: Turborepo for efficient builds with intelligent caching
5. **Zero-Config Integration**: Simple setup with excellent developer experience

### Monorepo Structure
```
packages/
├── core/                 # @watthem/fieldtest - Main SDK with parsing/validation
├── validate/             # @fieldtest/validate - Validation utilities 
├── registry/             # @fieldtest/registry - Schema management
├── validation-lib/       # @fieldtest/validation-lib - Extended validation with CLI
├── shared/               # @fieldtest/shared - Common utilities
├── examples/             # Usage examples for different scenarios
├── fieldtest-demo/       # Demo validation examples
└── integrations/
    ├── mcp/              # Model Context Protocol server for AI workflows
    └── obsidian/         # Obsidian integration tools

apps/                     # Framework integration demos (planned)
├── astro-site/           # Astro.js demo application
└── next-app/             # Next.js demo application
```

### Key Technical Concepts

#### Standard Schema V1 Interface
The project implements the **Standard Schema V1** specification for universal validation compatibility:

```typescript
interface StandardSchemaV1<Input = unknown, Output = Input> {
  readonly "~standard": {
    readonly version: 1;
    readonly vendor: string;
    readonly validate: (value: unknown) => Result<Output>;
  };
}
```

#### FieldTestDocument Type
Core document structure (replaces legacy `FkitDocument`):

```typescript
interface FieldTestDocument {
  raw: string;           // Original markdown content
  frontmatter: any;      // Parsed frontmatter data
  body: string;          // Body content without frontmatter
}
```

#### Framework Integration Pattern
Universal validation approach that works across frameworks:

```typescript
// Works with any framework
import { parseMarkdown, validateWithSchema } from '@watthem/fieldtest';

const document = parseMarkdown(content);
const result = validateWithSchema(document.frontmatter, schema);
```

## Development Workflow

### Package Dependencies
- **@watthem/fieldtest** (core): Main package with parsing and basic validation
- **@fieldtest/validate**: Validation utilities depending on core
- **@fieldtest/registry**: Schema management depending on validate and core
- **@fieldtest/validation-lib**: Extended validation with CLI functionality

### Build System
- **Turborepo**: Handles task orchestration and caching
- **tsup**: TypeScript bundling for all packages
- **pnpm workspaces**: Dependency management across packages
- **Biome**: Formatting, linting, and custom GritQL plugins

### Performance Targets
- **Document Processing**: <50ms per document
- **Batch Processing**: Handle 5,000+ documents efficiently  
- **Memory Usage**: <200MB for processing 5,000 documents
- **Build Performance**: <20 seconds for full monorepo build
- **Framework Overhead**: <5ms for framework-specific features

## Testing Strategy

### Current State
- Uses **Vitest** for testing (configured in individual packages)
- No test files currently exist (project in active development)
- CI pipeline configured in `.github/workflows/publish.yml`

### Testing Commands
```bash
# Run all tests
pnpm test

# Test specific package
pnpm --filter @watthem/fieldtest test
pnpm --filter @fieldtest/validate test

# Watch mode testing
cd packages/validation-lib && pnpm test:watch
```

## Code Quality Tools

### Biome Configuration
The project uses **Biome 2.2.5** for formatting and linting with:
- **Indent Style**: Tabs
- **Line Width**: 100 characters
- **Quote Style**: Single quotes
- **Semicolons**: Always required
- **Import Organization**: Automatic

### Custom GritQL Plugins
Located in `grit-plugins/`:
- **`fieldtest-migration.grit`**: Detects legacy `@fieldtest/*` imports and `FkitDocument` usage
- **`schema-usage.grit`**: Ensures validation results are checked and schemas follow conventions

### Linting Commands
```bash
# Check formatting and lint issues
pnpm biome:check

# Fix formatting and auto-fixable lint issues  
pnpm biome:fix

# Lint specific directories
pnpm biome lint packages/ apps/
```

## Migration Context

### FKit Consolidation
This project consolidates the former **FKit** project with these key changes:
- `FkitDocument` → `FieldTestDocument`
- `@fieldtest/*` packages → `@watthem/fieldtest` (core) + `@fieldtest/*` (utilities)
- Unified validation using Standard Schema V1
- Framework-agnostic design replacing framework-specific implementations

### Breaking Changes from Legacy
- Legacy imports need updating to new package structure
- Document interface renamed and simplified
- Validation API unified around Standard Schema V1
- Schema definition format standardized

## AI Integration

### MCP Server
The **Model Context Protocol server** (`packages/integrations/mcp/`) provides AI-powered content workflows:
- Content validation automation
- Schema generation from content analysis
- AI-powered content classification

### Obsidian Integration
Tools for Obsidian note management and validation (`packages/integrations/obsidian/`).

## Publication

### GitHub Packages
- Publishes to GitHub Packages registry (`npm.pkg.github.com`)
- Automated publishing on main branch pushes and version tags
- Uses `@fieldtest/*` scope for utility packages
- Uses `@watthem/fieldtest` for core package

### Package Filtering
```bash
# Publish specific packages
pnpm --filter "@fieldtest/*" publish --no-git-checks
```

## Common Patterns

### Schema Definition
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

### Content Validation
```typescript
import { loadUserSchema, validateWithSchema } from '@watthem/fieldtest';

const schema = loadUserSchema(blogPostSchema);
const result = validateWithSchema(document, schema);

if (result.valid) {
  // Handle valid content
} else {
  // Handle validation errors
  console.error(result.errors);
}
```

### Markdown Processing
```typescript
import { parseMarkdown, serializeMarkdown } from '@watthem/fieldtest';

const doc = parseMarkdown(content);
console.log(doc.frontmatter); // Parsed frontmatter
console.log(doc.body);        // Content body

const serialized = serializeMarkdown(doc);
```