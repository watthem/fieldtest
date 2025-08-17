# Changelog

All notable changes to the FieldTest Validation Toolkit will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-07-XX

### Added

- **Complete migration from FKit to FieldTest** - Consolidated all validation functionality under the FieldTest brand
- **@fieldtest/core** - Core markdown processing and schema validation utilities
- **@fieldtest/validate** - Framework-agnostic validation library with pre-built schemas
- **@fieldtest/registry** - Schema registry for managing validation schemas
- **@fieldtest/shared** - Common utilities and types
- **@fieldtest/validation-lib** - Extended validation capabilities for Astro and Next.js
- **@fieldtest/integrations** - MCP server and Obsidian tool integrations
- **Standard Schema support** - Built on standardschema.dev for maximum compatibility
- **Modern build tooling** - Using tsup, vitest, and turborepo for efficient development
- **Framework demos** - Astro and Next.js example applications
- **Comprehensive documentation** - Migration guide, usage examples, and API documentation

### Changed

- **Project identity**: Rebranded from "FKit SDK" to "FieldTest Validation Toolkit"
- **Package naming**: All packages now use `@fieldtest/*` scope instead of `@fieldtest/*`
- **Type naming**: `FkitDocument` → `FieldTestDocument`
- **Improved consistency** - Standardized descriptions and metadata across all packages

### Migration

- See [MIGRATION.md](./MIGRATION.md) for complete migration instructions from FKit
- All `@fieldtest/*` imports should be updated to `@fieldtest/*`
- Update any `FkitDocument` type references to `FieldTestDocument`

---

## Pre-FieldTest History (FKit Era)

### 2025-05-20

- Optimized repomix with file exclusions and cleanup
- Updated commit scripts with improved message extraction
- Added MCP server functionality for AI-powered workflows
- Implemented core logic for content scanning with MCP tools

### 2025-05-19

- Added comprehensive documentation for FKit and FieldTest usage
- Refactored schema validation and added usage examples
- Improved README and core package documentation

### 2025-05-18

- Initial FKit SDK architecture and core packages
- Established project structure and onboarding documentation
- Created foundational validation and registry packages

[0.1.0]: https://github.com/yourorg/fieldtest/releases/tag/v0.1.0
