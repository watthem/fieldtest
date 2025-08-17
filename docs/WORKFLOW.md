# FieldTest Validation Toolkit Development Workflow

## Git Workflow

### Branch Strategy
- `main` - Production-ready code, protected branch
- `develop` - Integration branch for features
- `feature/*` - Feature development branches
- `hotfix/*` - Critical bug fixes

### Commit Standards
```bash
# Format: <type>(<scope>): <description>
feat(validate): add Astro content collection support
fix(core): resolve frontmatter parsing edge case
docs(readme): update framework integration examples
perf(registry): optimize schema loading performance
refactor(validation-lib): consolidate CLI functionality
```

### Protected Branch Rules
- `main` requires PR review and passing CI
- All commits must pass lint, test, and build checks
- Semantic release handles version bumping

## Development Process

### Feature Development
1. Create feature branch from `develop`
2. Implement feature with comprehensive tests
3. Update documentation and examples
4. Test across all supported frameworks
5. Create PR to `develop`
6. Merge after review and CI passes

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

## Release Process

### Version Management
- Semantic versioning (semver) across all packages
- Automated releases via GitHub Actions
- Comprehensive changelog generation
- NPM package publishing for public packages

### Quality Gates
- All tests must pass across all frameworks
- Lint and format checks must pass
- Documentation must be updated
- Performance benchmarks must pass
- Cross-framework compatibility verified

## Continuous Integration

### GitHub Actions
- Build and test on push/PR
- Framework-specific integration testing
- Performance benchmarking
- Security scanning
- Dependency updates

### Pre-commit Hooks
- Format code with Prettier
- Lint with ESLint
- Type check with TypeScript
- Run unit tests
- Validate framework integrations

## Framework Integration Workflow

### Astro.js Integration
```bash
# Test Astro integration
cd apps/astro-site
pnpm dev

# Validate content collections
pnpm build
pnpm test
```

### Next.js Integration
```bash
# Test Next.js integration
cd apps/next-app
pnpm dev

# Validate App Router support
pnpm build
pnpm test
```

### MCP Server Integration
```bash
# Test MCP server
cd packages/integrations/mcp
pnpm dev

# Validate AI workflows
pnpm test:workflows
```

## Documentation Standards

### Required Documentation
- API documentation for all public interfaces
- Framework-specific integration guides
- Performance characteristics and benchmarks
- Migration guides for breaking changes
- Examples for each supported framework

### Documentation Structure
```
docs/
├── README.md          # Quick start guide
├── BLUEPRINT.md       # Project vision and architecture
├── AGENTS.md          # AI assistant guidelines
├── CLAUDE.md          # Claude Code instructions
├── LOG.md             # Development history
├── WORKFLOW.md        # This file
└── MIGRATION.md       # FKit → FieldTest migration guide
```

## Community Guidelines

### Contributing
- Follow the coding standards in AGENTS.md
- Include tests for all new features
- Update documentation for user-facing changes
- Maintain framework compatibility when possible
- Test across all supported frameworks

### Code Review Process
- All PRs require at least one review
- Focus on performance, security, and maintainability
- Ensure Standard Schema V1 compatibility
- Validate framework integration patterns
- Check for consolidation opportunities

## Consolidation Workflow

### fkit-cli Integration Process
1. **Analysis Phase**: Identify overlapping functionality
2. **Planning Phase**: Design unified architecture
3. **Implementation Phase**: Merge functionality into @fieldtest/validation-lib
4. **Testing Phase**: Ensure compatibility and performance
5. **Migration Phase**: Provide migration tools and documentation
6. **Deprecation Phase**: Sunset standalone fkit-cli

### Integration Checklist
- [ ] Identify shared patterns and code
- [ ] Design unified type system
- [ ] Implement consolidated functionality
- [ ] Create migration tools
- [ ] Update documentation
- [ ] Test performance impact
- [ ] Validate framework compatibility

## Performance Monitoring

### Key Metrics
- **Validation Speed**: <50ms per document
- **Memory Usage**: <200MB for 5,000 documents
- **Build Performance**: <20 seconds for full build
- **Framework Integration**: <5ms overhead

### Monitoring Tools
- Performance benchmarks in CI
- Memory usage tracking
- Build time monitoring
- Framework-specific performance tests

## AI Workflow Integration

### MCP Server Development
- Model Context Protocol server for AI-powered workflows
- File scanning and frontmatter validation
- Document classification and organization
- Automated content quality assessment

### AI-Powered Features
- Content classification using LLM APIs
- Metadata generation and validation
- Schema-based content quality assessment
- Automated content organization and tagging

## Framework Compatibility Matrix

| Framework | Status | Integration Level | Performance |
|-----------|--------|-------------------|-------------|
| Astro.js  | ✅ Supported | Content Collections | <100ms |
| Next.js   | ✅ Supported | App Router + Pages | <50ms |
| Nuxt.js   | 🚧 Planned | Content Module | TBD |
| SvelteKit | 🚧 Planned | Content API | TBD |
| Remix     | 🚧 Planned | Loader Integration | TBD |

## Quality Assurance

### Testing Strategy
- Unit tests for core functionality
- Integration tests for framework compatibility
- Performance benchmarks for validation operations
- End-to-end tests for complete workflows

### Performance Testing
- Validation speed benchmarks
- Memory usage monitoring
- Build performance tracking
- Framework integration overhead measurement

### Compatibility Testing
- Cross-framework validation
- Standard Schema V1 compliance
- Multiple validation library support
- Migration path validation