# FieldTest – Product Requirements Document

## Summary

**FieldTest** is a modular schema validation toolkit for content-rich websites and apps. It ensures structural consistency across Markdown files, CMS payloads, and other content formats using a shared validation layer based on [Standard Schema](https://standardschema.dev/).

It is designed for modern frameworks like **Astro** and **Next.js**, with support for both local CLI tooling and CI/CD integrations. FieldTest now integrates with **Biome** to provide custom linting rules and improve developer experience through GritQL plugins.

---

## Goals

- ✅ Prevent runtime layout regressions from schema mismatches
- ✅ Catch missing/undefined fields early in dev or CI
- ✅ Make content types auditable and testable like code
- ✅ Support LLM-readable content definitions (e.g. `llms.txt`)
- ✅ Enable safe collaboration between developers and content teams
- 🆕 Provide automated migration tooling from legacy packages
- 🆕 Enforce best practices through custom Biome linting plugins

---

## Key Deliverables

### Core Features

- [x] `@watthem/fieldtest` unified package
- [x] Standard Schema-based validation
- [x] Markdown parsing and serialization
- [x] Framework integrations (Astro, Next.js)
- [x] MCP integration for AI workflows
- [x] Schema registry and management

### Tooling & Developer Experience

- [x] CLI tool: `fieldtest validate`
- [x] GitHub Action for schema enforcement
- [x] Biome integration with custom GritQL plugins
  - [x] Migration helper plugin for legacy imports
  - [x] Schema usage validation plugin
  - [ ] Standard Schema naming conventions plugin
- [ ] VS Code Extension (inline decorators, type hints)
- [ ] Web dashboard `/validate` (in Astro or Next)

### Documentation & Community

- [ ] Comprehensive getting-started guide
- [ ] API reference documentation
- [ ] Framework integration guides
- [ ] Standard Schema explainer
- [ ] Tutorial: Build a blog with FieldTest + Biome
- [ ] Tutorial: Write custom Biome plugins
- [ ] npm-friendly README

### Future Enhancements

- [ ] FieldTest Cloud (hosted dashboard + notifications)
- [ ] Additional framework integrations
- [ ] Biome plugin auto-fixes (when supported)

---

## Success Criteria

- CLI and GitHub Action detect breaking schema changes before runtime
- Markdown and CMS data can be validated locally or in CI
- Works seamlessly in both Astro and Next.js with minimal config
- Schema definitions are reusable, typed, and extensible
- Biome plugins help developers catch migration issues and validation errors
- Documentation is clear, comprehensive, and accessible to new users
- Devs adopt FieldTest across multiple content-focused projects

---

## Target Users

- Frontend developers using Markdown or CMS data
- DevOps or platform engineers managing CI
- Technical content teams looking to avoid accidental structure drift
- Developers building content-rich applications
- Open-source contributors building custom validation workflows

---

## Biome Integration Strategy

### Why Biome?

Biome provides a unified linter and formatter that can be extended through GritQL plugins. This allows FieldTest to:

1. **Modernize the toolchain** by replacing ESLint/Prettier with a single, faster tool
2. **Help users adopt best practices** through custom diagnostic rules
3. **Automate migration detection** from legacy package structures
4. **Enforce schema validation patterns** to prevent common mistakes

### Planned GritQL Plugins

#### 1. Migration Helper Plugin

Detects legacy `@fieldtest/*` imports and outdated type names, emitting warnings that guide developers to the unified `@watthem/fieldtest` package.

#### 2. Schema Usage Validation Plugin

Ensures that calls to `validateWithSchema()` properly handle validation results, preventing silent failures when `result.valid` is ignored.

#### 3. Standard Schema Naming Plugin

Scans schema definitions and flags non-standard naming patterns, missing required fields (version, name), and other schema quality issues.

### Integration Timeline

1. **Phase 1**: Install Biome, create `biome.json`, apply to FieldTest codebase
2. **Phase 2**: Develop and test GritQL plugins internally
3. **Phase 3**: Publish plugins as part of FieldTest distribution
4. **Phase 4**: Document plugin usage and contribute tutorials
5. **Phase 5**: Engage community for additional plugin ideas

---

## Documentation Strategy

Following the [Diátaxis framework](https://diataxis.fr/), FieldTest documentation is organized into four categories:

### 1. Tutorials (Learning-oriented)

- Build a blog with Astro/Next.js and FieldTest
- Write a custom Biome plugin for FieldTest

### 2. How-to Guides (Problem-oriented)

- Validate content with Standard Schema
- Integrate FieldTest in modern frameworks
- Migrate from legacy packages
- Use Biome plugins for validation

### 3. Reference (Information-oriented)

- API documentation for all exported functions and types
- Schema specification
- Plugin reference

### 4. Explanation (Understanding-oriented)

- What is Standard Schema?
- Why FieldTest?
- Content validation best practices
- How Biome plugins enhance DX

---

## Open Source Contribution Plan

1. **Finish comprehensive documentation** following the Diátaxis structure
2. **Publish Biome configuration** and GritQL plugins in the repository
3. **Write tests** for validation API and Biome plugins using Vitest
4. **Engage the community** through issues, discussions, and contribution guidelines
5. **Host documentation** on GitHub Pages or similar platform
6. **Maintain backwards compatibility** while encouraging migration to latest patterns
