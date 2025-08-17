# FieldTest Validation Toolkit - Agent Guidelines

This file provides comprehensive guidance for AI assistants working on the FieldTest validation toolkit.

## Project Purpose

**FieldTest** is a comprehensive TypeScript validation toolkit for content management and schema validation across modern frameworks. It consolidates the former FKit project and provides framework-agnostic validation, schema management, and content processing capabilities.

## Core Philosophy & Design Principles

### The Unified Validation Approach

- **Framework Agnostic**: Works seamlessly with Astro, Next.js, and other modern frameworks
- **Standard Schema V1**: Universal validation interface for maximum compatibility
- **Unified Toolkit**: Combines markdown processing, schema validation, and content management
- **Modern Tooling**: Built with TypeScript, Turborepo, and modern development practices

### Key Design Principles

- **Universal Compatibility**: Never couple to specific frameworks or validation libraries
- **Performance First**: Target <50ms validation per document
- **Monorepo Excellence**: Leverage Turborepo + pnpm for optimal build performance
- **Content-Driven Development**: Content structure as first-class concern
- **Developer Experience**: Excellent DX across all supported frameworks

## Technical Architecture

### Monorepo Structure

```
fieldtest/
├── apps/                       # Applications
│   ├── astro-site/            # Astro.js demo application
│   └── next-app/              # Next.js demo application
├── packages/                   # Core packages
│   ├── core/                  # @fieldtest/core - Core SDK
│   │   ├── parseMarkdown.ts   # Markdown parsing with frontmatter
│   │   ├── serializeMarkdown.ts # Document serialization
│   │   ├── validateWithSchema.ts # Universal validation
│   │   └── types.ts           # Core type definitions
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

### Technology Stack

- **Runtime**: Node.js 18+ with TypeScript 5.3+
- **Build System**: Turborepo with pnpm workspaces
- **Validation**: Standard Schema V1 with Zod implementation
- **Bundling**: tsup for efficient TypeScript bundling
- **Testing**: Vitest for comprehensive testing
- **Integration**: @docs-score/core workspace dependency

## Development Commands

### Monorepo Management

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build
# or
turbo build

# Development mode
pnpm dev

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

# Test specific package
cd packages/validate
pnpm test
```

### Framework Integration Testing

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

## Code Style & Quality Standards

### TypeScript Standards

```typescript
// Core type definitions with Standard Schema V1 compatibility
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

// Error handling with detailed context
class FieldTestValidationError extends Error {
    constructor(
        message: string,
        public readonly file: string,
        public readonly line?: number,
        public readonly column?: number
    ) {
        super(message);
        this.name = 'FieldTestValidationError';
    }
}
```

### Standard Schema V1 Integration

```typescript
// Universal validation interface implementation
import type { StandardSchemaV1 } from './standard-schema';

export const validateWithSchema = <T>(
    data: unknown,
    schema: StandardSchemaV1<T>
): ValidationResult<T> => {
    try {
        const result = schema.validate(data);
        
        if (result.success) {
            return {
                success: true,
                data: result.data,
                errors: []
            };
        } else {
            return {
                success: false,
                data: undefined,
                errors: result.errors.map(error => ({
                    message: error.message,
                    path: error.path,
                    code: error.code
                }))
            };
        }
    } catch (error) {
        return {
            success: false,
            data: undefined,
            errors: [{
                message: error instanceof Error ? error.message : 'Unknown validation error',
                path: [],
                code: 'VALIDATION_ERROR'
            }]
        };
    }
};
```

### Framework Integration Patterns

```typescript
// Astro integration pattern
// packages/validate/src/astro.ts
import type { CollectionEntry } from 'astro:content';

export const validateAstroContent = <T>(
    entry: CollectionEntry<T>,
    schema: StandardSchemaV1
): ValidationResult => {
    const document = {
        frontmatter: entry.data,
        body: entry.body,
        metadata: {
            path: entry.id,
            size: entry.body.length,
            modified: new Date()
        }
    };
    
    return validateWithSchema(document.frontmatter, schema);
};

// Next.js integration pattern
// packages/validate/src/next.ts
import type { MDXDocument } from 'next/mdx';

export const validateNextContent = (
    content: string,
    schema: StandardSchemaV1
): ValidationResult => {
    const document = parseMarkdown(content);
    return validateWithSchema(document.frontmatter, schema);
};
```

### Schema Registry Patterns

```typescript
// packages/registry/src/getBuiltInSchema.ts
export const getBuiltInSchema = async (schemaName: string): Promise<StandardSchemaV1 | null> => {
    const builtInSchemas = {
        'blog-post': () => import('./schemas/blog-post'),
        'marketing-copy': () => import('./schemas/marketing-copy'),
        'api-documentation': () => import('./schemas/api-documentation'),
        'astro-content': () => import('./schemas/astro-content'),
        'next-content': () => import('./schemas/next-content')
    };
    
    const schemaLoader = builtInSchemas[schemaName];
    if (!schemaLoader) {
        return null;
    }
    
    try {
        const module = await schemaLoader();
        return module.schema;
    } catch (error) {
        console.error(`Failed to load schema "${schemaName}":`, error);
        return null;
    }
};

// packages/registry/src/loadUserSchema.ts
export const loadUserSchema = async (schemaPath: string): Promise<StandardSchemaV1> => {
    try {
        const schemaModule = await import(schemaPath);
        const schema = schemaModule.default || schemaModule.schema;
        
        if (!isValidStandardSchema(schema)) {
            throw new Error(`Invalid schema at ${schemaPath}: must implement StandardSchemaV1`);
        }
        
        return schema;
    } catch (error) {
        throw new Error(`Failed to load schema from ${schemaPath}: ${error.message}`);
    }
};
```

## Performance Requirements

### Validation Performance Targets

- **Document Processing**: <50ms per document for typical content
- **Batch Processing**: Handle 5,000+ documents efficiently
- **Memory Usage**: <200MB for processing 5,000 documents
- **Framework Integration**: <5ms overhead for framework-specific features

### Build Performance Standards

- **Monorepo Build**: <20 seconds for full build
- **Individual Package**: <3 seconds for single package build
- **Watch Mode**: <500ms for incremental builds
- **Test Suite**: <8 seconds for complete test run

### Framework Performance

- **Astro Integration**: <100ms for content collection processing
- **Next.js Integration**: <50ms for MDX processing
- **MCP Server**: <200ms for workflow operations
- **Schema Loading**: <30ms for built-in schemas

## Framework Integration Guidelines

### Astro.js Integration

```typescript
// packages/validate/src/astro/contentCollections.ts
import { defineCollection, z } from 'astro:content';
import { createZodAdapter } from '@fieldtest/validate';

// Define content collections with FieldTest validation
const blogCollection = defineCollection({
    type: 'content',
    schema: createZodAdapter(z.object({
        title: z.string(),
        description: z.string(),
        pubDate: z.date(),
        tags: z.array(z.string()).default([])
    }))
});

export const collections = {
    blog: blogCollection
};
```

### Next.js Integration

```typescript
// packages/validate/src/next/mdxComponents.ts
import { validateNextContent } from '@fieldtest/validate';

export const validateMDXContent = async (
    source: string,
    schema: StandardSchemaV1
) => {
    const result = validateNextContent(source, schema);
    
    if (!result.success) {
        throw new Error(`MDX validation failed: ${result.errors.map(e => e.message).join(', ')}`);
    }
    
    return result.data;
};
```

### MCP Server Integration

```typescript
// packages/integrations/mcp/src/server.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { validateWithSchema } from '@fieldtest/validate';

export class FieldTestMCPServer {
    private server: Server;
    
    constructor() {
        this.server = new Server({
            name: 'fieldtest-mcp-server',
            version: '1.0.0'
        });
        
        this.setupHandlers();
    }
    
    private setupHandlers() {
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            
            switch (name) {
                case 'validate_content':
                    return await this.validateContent(args);
                case 'classify_content':
                    return await this.classifyContent(args);
                default:
                    throw new Error(`Unknown tool: ${name}`);
            }
        });
    }
    
    private async validateContent(args: any) {
        const { content, schema } = args;
        const document = parseMarkdown(content);
        const result = validateWithSchema(document.frontmatter, schema);
        
        return {
            valid: result.success,
            errors: result.errors,
            data: result.data
        };
    }
}
```

## Testing Guidelines

### Unit Testing Patterns

```typescript
// packages/core/tests/parseMarkdown.test.ts
import { describe, it, expect } from 'vitest';
import { parseMarkdown } from '../parseMarkdown';

describe('parseMarkdown', () => {
    it('should parse frontmatter and body correctly', () => {
        const content = `---
title: Test Post
date: 2025-07-18
tags: [test, example]
---

# Test Content

This is the body of the post.`;

        const result = parseMarkdown(content);
        
        expect(result.frontmatter).toEqual({
            title: 'Test Post',
            date: '2025-07-18',
            tags: ['test', 'example']
        });
        
        expect(result.body).toBe('# Test Content\n\nThis is the body of the post.');
    });
    
    it('should handle missing frontmatter gracefully', () => {
        const content = '# Just a title\n\nNo frontmatter here.';
        
        const result = parseMarkdown(content);
        
        expect(result.frontmatter).toEqual({});
        expect(result.body).toBe(content);
    });
});
```

### Integration Testing

```typescript
// packages/validate/tests/framework.test.ts
import { describe, it, expect } from 'vitest';
import { validateAstroContent, validateNextContent } from '../src';

describe('Framework Integration', () => {
    it('should validate Astro content successfully', async () => {
        const mockEntry = {
            data: {
                title: 'Test Post',
                description: 'Test description',
                pubDate: new Date('2025-07-18')
            },
            body: '# Test Content',
            id: 'test-post'
        };
        
        const schema = await getBuiltInSchema('astro-content');
        const result = validateAstroContent(mockEntry, schema);
        
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
    });
    
    it('should validate Next.js content successfully', () => {
        const content = `---
title: Test Post
description: Test description
---

# Test Content`;
        
        const schema = await getBuiltInSchema('next-content');
        const result = validateNextContent(content, schema);
        
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
    });
});
```

### Performance Testing

```typescript
// packages/core/tests/performance.test.ts
import { describe, it, expect } from 'vitest';
import { performance } from 'perf_hooks';

describe('Performance Tests', () => {
    it('should parse markdown in <50ms', () => {
        const content = generateLargeMarkdownContent();
        const iterations = 100;
        
        const startTime = performance.now();
        for (let i = 0; i < iterations; i++) {
            parseMarkdown(content);
        }
        const endTime = performance.now();
        
        const avgTime = (endTime - startTime) / iterations;
        expect(avgTime).toBeLessThan(50);
    });
});
```

## Consolidation Guidelines

### FKit → FieldTest Migration

The project has successfully consolidated FKit functionality into FieldTest. When working with legacy code:

```typescript
// OLD (FKit patterns)
import { FkitDocument, parseMarkdown } from '@fieldtest/core';

// NEW (FieldTest patterns)
import { FieldTestDocument, parseMarkdown } from '@fieldtest/core';
```

### Recommended Consolidation with fkit-cli

The standalone fkit-cli project shows significant overlap. Consider:

1. **Merge CLI Functionality**: Integrate fkit-cli commands into @fieldtest/validation-lib
2. **Unified Schema Registry**: Share schema definitions between systems
3. **Common Type Definitions**: Use FieldTestDocument across both projects
4. **Shared Validation Logic**: Centralize validation in @fieldtest/validate

### Integration with docs-score

FieldTest already integrates with @docs-score/core:

```typescript
// Leverage existing docs-score functionality
import { analyzeContent } from '@docs-score/core';
import { validateWithSchema } from '@fieldtest/validate';

export const validateAndAnalyze = async (content: string, schema: StandardSchemaV1) => {
    const validation = validateWithSchema(content, schema);
    const analysis = await analyzeContent(content);
    
    return {
        validation,
        analysis,
        score: analysis.score
    };
};
```

## Success Metrics & Goals

### Technical Performance Indicators

- **Validation Speed**: <50ms per document for typical content
- **Memory Efficiency**: <200MB for processing 5,000 documents
- **Build Performance**: <20 seconds for full monorepo build
- **Framework Integration**: <5ms overhead for framework-specific features

### Developer Experience Metrics

- **Setup Time**: <2 minutes from install to first validation
- **Framework Compatibility**: Support for 5+ major frameworks
- **Documentation Quality**: <3% of issues due to documentation gaps
- **Migration Ease**: <30 minutes to migrate from other validation tools

### Business Impact Metrics

- **Community Adoption**: 5,000+ npm downloads per month
- **Framework Integrations**: Official support from 3+ major frameworks
- **Schema Contributions**: 50+ community-contributed schemas
- **Developer Productivity**: 70% reduction in validation setup time

## Risk Mitigation Strategies

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

## Current Development Status

### Completed Infrastructure ✅

- [x] Turborepo + pnpm workspace configuration
- [x] Core markdown parsing and serialization
- [x] Standard Schema V1 interface implementation
- [x] Framework-agnostic validation utilities
- [x] Schema registry with built-in schemas
- [x] FKit → FieldTest migration completion
- [x] @docs-score/core integration
- [x] MCP server foundation
- [x] Obsidian integration tools

### In Progress 🚧

- **Enhanced Framework Integration**: Astro and Next.js improvements
- **CLI Tooling**: Validation workflow automation
- **Performance Optimization**: Large content collection handling
- **AI Integration**: MCP server workflow automation

### Next Immediate Steps

1. Complete enhanced Astro.js integration with content collections
2. Implement Next.js App Router support
3. Develop CLI tooling for validation workflows
4. Create automated migration tools for fkit-cli consolidation
5. Expand MCP server capabilities for AI workflows
6. Establish community contribution guidelines

## Notes for AI Assistants

When working on this project, remember:

### Framework-Agnostic Design

- Never couple code to specific frameworks
- Always use Standard Schema V1 interface for validation
- Test compatibility across Astro, Next.js, and other frameworks
- Provide clear migration paths for framework changes

### Performance Consciousness

- Target sub-50ms validation for typical documents
- Implement streaming processing for large content collections
- Use efficient parsing and serialization algorithms
- Monitor memory usage and optimize for large datasets

### Developer Experience Focus

- Prioritize excellent documentation and examples
- Provide clear error messages and debugging information
- Ensure consistent APIs across all packages
- Maintain backward compatibility when possible

### Community-Driven Development

- Design for contribution and extension
- Maintain clear architectural boundaries
- Provide comprehensive testing and validation
- Support multiple validation libraries through Standard Schema V1

---

*This file serves as the comprehensive guide for AI assistants working on the FieldTest validation toolkit. Update it as the project evolves, always maintaining focus on framework compatibility, performance, and developer experience.*
