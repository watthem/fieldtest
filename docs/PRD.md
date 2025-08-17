# FieldTest – Product Requirements Document

## Summary

**FieldTest** is a modular schema validation toolkit for content-rich websites and apps. It ensures structural consistency across Markdown files, CMS payloads, and other content formats using a shared validation layer based on [Zod](https://zod.dev/) and [Standard Schema](https://standardschema.dev/).

It is designed for modern frameworks like **Astro** and **Next.js**, with support for both local CLI tooling and CI/CD integrations.

---

## Goals

- ✅ Prevent runtime layout regressions from schema mismatches
- ✅ Catch missing/undefined fields early in dev or CI
- ✅ Make content types auditable and testable like code
- ✅ Support LLM-readable content definitions (e.g. `llms.txt`)
- ✅ Enable safe collaboration between developers and content teams

---

## Key Deliverables

- [x] `@schemas` shared module (Zod-based)
- [x] CLI tool: `fieldtest validate`
- [x] GitHub Action for schema enforcement
- [x] Web dashboard `/validate` (in Astro or Next)
- [x] Support `llms.txt` validation
- [ ] VS Code Extension (inline decorators, type hints)
- [ ] FieldTest Cloud (hosted dashboard + notifications)

---

## Success Criteria

- CLI and GitHub Action detect breaking schema changes before runtime
- Markdown and CMS data can be validated locally or in CI
- Works seamlessly in both Astro and Next.js with minimal config
- Schema definitions are reusable, typed, and extensible
- Devs adopt FieldTest across multiple content-focused projects

---

## Target Users

- Frontend developers using Markdown or CMS data
- DevOps or platform engineers managing CI
- Technical content teams looking to avoid accidental structure drift
