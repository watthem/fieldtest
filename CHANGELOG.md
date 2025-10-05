# Changelog

All notable changes to FieldTest will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-05

### Added

#### Core Features

- **`@watthem/fieldtest`** — Unified package for all validation functionality
- **Standard Schema support** — Built on [Standard Schema](https://standardschema.dev) for maximum compatibility
- **Markdown processing** — Parse and serialize markdown with frontmatter
- **Schema registry** — Manage and reuse validation schemas
- **Framework integrations** — Helpers for Astro, Next.js, Remix, SvelteKit, and Nuxt

#### Developer Experience

- **Biome integration** — Fast linting and formatting with custom GritQL plugins
  - Migration helper plugin for detecting legacy imports
  - Schema usage validation plugin
- **TypeScript-first** — Full TypeScript support with proper type definitions
- **Monorepo architecture** — Using pnpm workspaces and Turborepo

#### Integrations

- **MCP server** — Model Context Protocol server for AI-powered content validation
- **Framework examples** — Example implementations for Astro and Next.js

#### Documentation

- **Comprehensive guides** — Getting started, schema validation, framework integration, Biome setup
- **API reference** — Complete API documentation with examples
- **Explainer articles** — Standard Schema, Why FieldTest, migration guide
- **Contributing guide** — Clear contribution guidelines

### Changed

- **Package consolidation** — All functionality unified in `@watthem/fieldtest`
- **Type naming** — `FkitDocument` → `FieldTestDocument`
- **Consistent branding** — All references updated to "FieldTest"

### Migration

See [MIGRATION.md](./MIGRATION.md) for complete migration instructions.

**Quick migration:**

```bash
# Update imports
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/@fieldtest\/[a-zA-Z-]*/@watthem\/fieldtest/g'

# Update type names
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/FkitDocument/FieldTestDocument/g'
```

---

## Future

### Planned Features

- VS Code extension with inline validation
- Additional built-in schemas
- Auto-fix support for Biome plugins (when available)
- FieldTest Cloud for hosted validation

---

[1.0.0]: https://github.com/watthem/fieldtest/releases/tag/v1.0.0
