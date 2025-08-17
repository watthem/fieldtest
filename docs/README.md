# FieldTest Validation Toolkit

A comprehensive TypeScript validation toolkit for content management and schema validation across modern frameworks.

## Quick Start

### Installation
```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build
```

### Basic Usage
```bash
# Development mode
pnpm dev

# Test framework integrations
cd apps/astro-site && pnpm dev
cd apps/next-app && pnpm dev

# Test MCP server
cd packages/integrations/mcp && pnpm dev
```

## Project Structure

```
fieldtest/
├── apps/                       # Applications
│   ├── astro-site/            # Astro.js demo application
│   └── next-app/              # Next.js demo application
├── packages/                   # Core packages
│   ├── core/                  # @fieldtest/core - Core SDK
│   ├── shared/                # @fieldtest/shared - Common utilities
│   ├── validation-lib/        # @fieldtest/validation-lib - Extended validation
│   ├── validate/              # @fieldtest/validate - Validation utilities
│   ├── registry/              # @fieldtest/registry - Schema management
│   ├── examples/              # Usage examples and demos
│   ├── fieldtest-demo/        # Demo applications
│   └── integrations/          # Tool integrations
│       ├── mcp/               # Model Context Protocol server
│       └── obsidian/          # Obsidian integration
└── docs/                      # Documentation
```

## Development Commands

### Monorepo Management
```bash
# Testing
pnpm test

# Linting
pnpm lint

# Clean build artifacts
pnpm clean
```

### Package-Specific Development
```bash
# Work on core package
cd packages/core
pnpm dev

# Work on validation-lib
cd packages/validation-lib
pnpm build

# Run examples
cd packages/examples
pnpm dev
```

## Key Features

- **Framework Agnostic**: Works seamlessly with Astro, Next.js, and other modern frameworks
- **Standard Schema V1**: Universal validation interface for maximum compatibility
- **Unified Toolkit**: Combines markdown processing, schema validation, and content management
- **Modern Tooling**: Built with TypeScript, Turborepo, and modern development practices
- **AI Integration**: MCP server and workflow automation capabilities

## Performance Targets

- **Document Processing**: <50ms per document for typical content
- **Batch Processing**: Handle 5,000+ documents efficiently
- **Memory Usage**: <200MB for processing 5,000 documents
- **Build Performance**: <20 seconds for full monorepo build

## Migration from FKit

**🚀 MIGRATION COMPLETE:** All FKit code is now under FieldTest. Use `@fieldtest/*` for all validation and schema work.

Key changes:
- `FkitDocument` → `FieldTestDocument`
- All packages now under `@fieldtest/*` namespace
- Enhanced framework integration and AI capabilities

See [MIGRATION.md](./MIGRATION.md) for complete migration details.

## Integration Opportunities

### Consolidation with fkit-cli
The standalone fkit-cli project shows significant overlap:
- **Shared Patterns**: Similar markdown processing and schema validation
- **CLI Tooling**: Command-line interfaces for validation workflows
- **Type System**: Consistent TypeScript patterns and interfaces

**Recommended**: Merge fkit-cli functionality into @fieldtest/validation-lib

### docs-score Integration
FieldTest already integrates with @docs-score/core:
- **Site Scanning**: Comprehensive content analysis
- **Quality Assessment**: Documentation quality metrics
- **Validation Workflows**: Automated content validation

## Documentation

- [BLUEPRINT.md](./BLUEPRINT.md) - Project vision and architecture
- [AGENTS.md](./AGENTS.md) - Comprehensive AI assistant guidelines
- [CLAUDE.md](./CLAUDE.md) - Claude Code specific instructions
- [MIGRATION.md](./MIGRATION.md) - FKit → FieldTest migration guide

## Contributing

See [AGENTS.md](./AGENTS.md) for comprehensive development guidelines and coding standards.

## License

MIT