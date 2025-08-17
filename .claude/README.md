# FieldTest Validation Toolkit - AI Workflow Framework

## Overview

This directory contains specialized templates and contexts for AI assistants working on the FieldTest validation toolkit - a comprehensive TypeScript validation toolkit for content management and schema validation across modern frameworks.

## Project Context

**FieldTest** is a framework-agnostic validation toolkit that consolidates the former FKit project. It provides unified content validation, schema management, and markdown processing capabilities across Astro, Next.js, and other modern frameworks.

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

## Consolidation Opportunities

### fkit-cli Integration
The standalone fkit-cli project shows significant overlap:
- **Shared Patterns**: Similar markdown processing and schema validation
- **CLI Tooling**: Command-line interfaces for validation workflows
- **Type System**: Consistent TypeScript patterns and interfaces

**Recommendation**: Merge fkit-cli functionality into @fieldtest/validation-lib

### docs-score Integration
FieldTest already integrates with @docs-score/core:
- **Site Scanning**: Comprehensive content analysis
- **Quality Assessment**: Documentation quality metrics
- **Validation Workflows**: Automated content validation

This framework ensures consistent, high-quality development while maintaining the project's focus on framework-agnostic validation and performance excellence.