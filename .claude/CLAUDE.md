# FieldTest Validation Toolkit - Claude Code Project Instructions

## Project Identity

**FieldTest** is a comprehensive TypeScript validation toolkit for content management and schema validation across modern frameworks. It consolidates the former FKit project and provides framework-agnostic validation capabilities.

## Essential Development Commands

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

# Framework-specific testing
cd apps/astro-site && pnpm dev
cd apps/next-app && pnpm dev
cd packages/integrations/mcp && pnpm dev
```

## Critical Performance Targets

- **Document Processing**: <50ms per document for typical content
- **Batch Processing**: Handle 5,000+ documents efficiently
- **Memory Usage**: <200MB for processing 5,000 documents
- **Build Performance**: <20 seconds for full monorepo build

## Architecture Understanding

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

### Key Design Principles
1. **Framework Agnostic**: Never couple to specific frameworks
2. **Standard Schema V1**: Universal validation interface for maximum compatibility
3. **Performance First**: Target <50ms validation per document
4. **Developer Experience**: Prioritize excellent documentation and examples
5. **Community Focus**: Design for contribution and ecosystem growth

## Implementation Patterns

### Universal Validation Interface
```typescript
// Always use Standard Schema V1 interface
interface SchemaPlugin {
    name: string;
    schema: StandardSchemaV1;
    validator: (doc: FieldTestDocument) => ValidationResult;
}

// Universal validation function
const validateContent = (document: FieldTestDocument, schema: StandardSchemaV1) => {
    const result = schema.validate(document.frontmatter);
    return {
        valid: result.success,
        errors: result.errors,
        data: result.data
    };
};
```

### Framework Integration Patterns
```typescript
// Astro integration
export const validateAstroContent = (entry: CollectionEntry<T>, schema: StandardSchemaV1) => {
    const document = {
        frontmatter: entry.data,
        body: entry.body,
        metadata: { path: entry.id, size: entry.body.length, modified: new Date() }
    };
    return validateWithSchema(document.frontmatter, schema);
};

// Next.js integration
export const validateNextContent = (content: string, schema: StandardSchemaV1) => {
    const document = parseMarkdown(content);
    return validateWithSchema(document.frontmatter, schema);
};
```

## Development Priorities

### Current Status
- [x] Turborepo + pnpm workspace configuration
- [x] Core markdown parsing and serialization
- [x] Standard Schema V1 interface implementation
- [x] Framework-agnostic validation utilities
- [x] Schema registry with built-in schemas
- [x] FKit → FieldTest migration completion
- [x] @docs-score/core integration
- [x] MCP server foundation
- [x] Obsidian integration tools

### Next Steps
1. Complete enhanced Astro.js integration with content collections
2. Implement Next.js App Router support
3. Develop CLI tooling for validation workflows
4. Create automated migration tools for fkit-cli consolidation
5. Expand MCP server capabilities for AI workflows

## Quality Standards

### Performance Requirements
- All changes must maintain <50ms validation per document
- Monorepo build must complete in <20 seconds
- Memory usage must stay under 200MB for 5,000 documents
- Framework integration overhead must be <5ms

### Testing Standards
- Unit tests for all new functionality
- Integration tests for framework compatibility
- Performance benchmarks for validation operations
- Cross-framework compatibility testing

## Consolidation Opportunities

### fkit-cli Integration
The standalone fkit-cli project shows significant overlap:

**Shared Patterns**:
- **Markdown Processing**: Similar frontmatter parsing patterns
- **Schema Validation**: Common validation approaches
- **CLI Tooling**: Command-line interfaces for validation workflows
- **Type System**: Consistent TypeScript patterns

**Recommended Action**: Merge fkit-cli functionality into @fieldtest/validation-lib

### docs-score Integration
FieldTest already integrates with @docs-score/core:
- **Site Scanning**: Comprehensive content analysis
- **Quality Assessment**: Documentation quality metrics
- **Validation Workflows**: Automated content validation

## Context for AI Assistants

When working on this project:

1. **Framework-Agnostic Design**: This toolkit must work across multiple frameworks
2. **Performance Consciousness**: Always benchmark and optimize for speed
3. **Standard Schema V1**: Consider how features work with the universal validation interface
4. **Developer Experience**: Prioritize excellent documentation and examples
5. **Community Focus**: Design for contribution and ecosystem growth

## Success Metrics

- **Community Adoption**: 5,000+ npm downloads per month
- **Framework Integrations**: Official support from 3+ major frameworks
- **Schema Contributions**: 50+ community-contributed schemas
- **Developer Productivity**: 70% reduction in validation setup time

Remember: This project serves as a comprehensive validation toolkit that bridges different frameworks and provides unified content management capabilities. Quality, performance, and developer experience are paramount given its role as a foundational toolkit.