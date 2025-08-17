# FieldTest Validation Toolkit - Claude Code Instructions

## Project Overview

**FieldTest** is a comprehensive TypeScript validation toolkit for content management and schema validation across modern frameworks. It consolidates the former FKit project and provides framework-agnostic validation, schema management, and content processing capabilities.

## Development Commands

### Essential Commands
```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Development mode
pnpm dev

# Testing
pnpm test

# Linting
pnpm lint

# Clean build artifacts
pnpm clean
```

### Framework-Specific Testing
```bash
# Test Astro integration
cd apps/astro-site
pnpm dev

# Test Next.js integration
cd apps/next-app
pnpm dev

# Test MCP server
cd packages/integrations/mcp
pnpm dev
```

## Architecture Overview

### Monorepo Structure
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

### Key Technologies
- **Runtime**: Node.js 18+ with TypeScript 5.3+
- **Build System**: Turborepo with pnpm workspaces
- **Validation**: Standard Schema V1 with Zod implementation
- **Bundling**: tsup for efficient TypeScript bundling
- **Testing**: Vitest for comprehensive testing
- **Integration**: @docs-score/core workspace dependency

## Core Design Principles

### Framework-Agnostic Approach
- **Universal Compatibility**: Works seamlessly with Astro, Next.js, and other frameworks
- **Standard Schema V1**: Universal validation interface for maximum compatibility
- **Unified Toolkit**: Combines markdown processing, schema validation, and content management
- **Modern Tooling**: Built with TypeScript, Turborepo, and modern development practices

### Critical Architecture Patterns
```typescript
// Universal validation interface
interface FieldTestDocument {
    frontmatter: Record<string, any>;
    body: string;
    metadata: {
        path: string;
        size: number;
        modified: Date;
    };
}

// Schema plugin interface
interface SchemaPlugin {
    name: string;
    schema: StandardSchemaV1;
    validator: (doc: FieldTestDocument) => ValidationResult;
}
```

## Performance Targets

### Validation Performance
- **Document Processing**: <50ms per document for typical content
- **Batch Processing**: Handle 5,000+ documents efficiently
- **Memory Usage**: <200MB for processing 5,000 documents
- **Framework Integration**: <5ms overhead for framework-specific features

### Build Performance
- **Monorepo Build**: <20 seconds for full build
- **Individual Package**: <3 seconds for single package build
- **Watch Mode**: <500ms for incremental builds
- **Test Suite**: <8 seconds for complete test run

## Development Priorities

### Current Development Status
- [x] Turborepo + pnpm workspace configuration
- [x] Core markdown parsing and serialization
- [x] Standard Schema V1 interface implementation
- [x] Framework-agnostic validation utilities
- [x] Schema registry with built-in schemas
- [x] FKit → FieldTest migration completion
- [x] @docs-score/core integration
- [x] MCP server foundation
- [x] Obsidian integration tools

### Next Immediate Steps
1. Complete enhanced Astro.js integration with content collections
2. Implement Next.js App Router support
3. Develop CLI tooling for validation workflows
4. Create automated migration tools for fkit-cli consolidation
5. Expand MCP server capabilities for AI workflows
6. Establish community contribution guidelines

## Critical Implementation Notes

### Standard Schema V1 Compatibility
- Never couple code to specific frameworks or validation libraries
- Always use Standard Schema V1 interface for validation
- Test compatibility across Astro, Next.js, and other frameworks
- Provide clear migration paths for framework changes

### Framework Integration Best Practices
- Maintain framework-agnostic core functionality
- Use adapter pattern for framework-specific features
- Provide clear examples for each supported framework
- Ensure consistent APIs across all integrations

### Performance Consciousness
- Target sub-50ms validation for typical documents
- Implement efficient parsing and serialization algorithms
- Use streaming processing for large content collections
- Monitor memory usage and optimize for large datasets

## Consolidation Opportunities

### fkit-cli Integration
The standalone fkit-cli project shows significant overlap with FieldTest:

**Shared Patterns**:
- **Markdown Processing**: Both use similar frontmatter parsing
- **Schema Validation**: Common validation approaches using structured schemas
- **CLI Tooling**: Command-line interfaces for validation workflows
- **Type System**: Consistent TypeScript patterns and interfaces

**Recommended Consolidation**:
1. **Merge CLI Functionality**: Integrate fkit-cli commands into @fieldtest/validation-lib
2. **Unified Schema Registry**: Share schema definitions between systems
3. **Common Type Definitions**: Use FieldTestDocument instead of FkitDocument
4. **Shared Validation Logic**: Centralize validation in @fieldtest/validate

### docs-score Integration
FieldTest already integrates with @docs-score/core:
- **Site Scanning**: Comprehensive content analysis
- **Quality Assessment**: Documentation quality metrics
- **Validation Workflows**: Automated content validation

## Success Metrics

### Technical Performance
- **Validation Speed**: <50ms per document for typical content
- **Memory Usage**: <200MB for processing 5,000 documents
- **Build Performance**: <20 seconds for full monorepo build
- **Framework Integration**: <5ms overhead for framework-specific features

### Business Impact
- **Community Adoption**: 5,000+ npm downloads per month
- **Framework Integrations**: Official support from 3+ major frameworks
- **Schema Contributions**: 50+ community-contributed schemas
- **Developer Productivity**: 70% reduction in validation setup time

## Risk Mitigation

### Technical Risks
- **Framework Evolution**: Implement adapter pattern for framework integrations
- **Performance Degradation**: Continuous benchmarking and optimization
- **Compatibility Issues**: Comprehensive test suite across frameworks
- **API Changes**: Semantic versioning with clear migration paths

### Adoption Risks
- **Learning Curve**: Comprehensive examples and step-by-step tutorials
- **Migration Complexity**: Automated migration tools and clear guides
- **Framework Lock-in**: Maintain framework-agnostic core functionality
- **Community Building**: Engage with framework communities

## Context for AI Assistants

When working on this project, always remember:

1. **Framework-Agnostic Design**: This toolkit must work across multiple frameworks
2. **Performance Consciousness**: Target sub-50ms validation for typical documents
3. **Standard Schema V1**: Always use the universal validation interface
4. **Developer Experience**: Prioritize excellent documentation and examples
5. **Community Focus**: Design for contribution and ecosystem growth

This project serves as a comprehensive validation toolkit that bridges different frameworks and provides unified content management capabilities. Quality, performance, and developer experience are paramount given its role as a foundational toolkit.