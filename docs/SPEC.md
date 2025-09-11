# FieldTest – Technical Specification

## Architecture

```md
packages/
├── fieldtest/         # Core schema library (Zod-based)
├── fieldtest/apps/    # Astro or Next.js apps
│   ├── src/
│   │   ├── index.ts   # Export all shared Zod schemas
│   │   ├── cli.ts     # CLI entry point
│   │   ├── validate.ts
│   │   └── utils/
│   └── package.json
├── web-dashboard/     # Astro or Next.js web dashboard (optional)
├── fieldtest-action/  # GitHub Action entrypoint
pnpm-workspace.yaml
```

---

## CLI Tool

- Command: `fieldtest validate`
- Accepts config or paths to content + schema modules
- Outputs validation errors, missing fields, suggestions
- Optional JSON output for GitHub annotations

```bash
fieldtest validate \
  --schema ./schemas/post.schema.ts \
  --content ./content/blog
````

---

## Schema Format

- All schemas use **Zod** (with inference support)
- Schemas follow a common `FieldTestSchema` interface
- Support for inheritance/extension across projects
- Optional support for `.schema.json` generation

---

## GitHub Action

- Runs `fieldtest validate` on push or PR
- Fails build on schema violations
- Annotates PRs with schema errors (future)

---

## Dashboard (`/validate`)

- Lists all registered schemas
- Upload or paste content for validation
- Shows diffs for schema changes over time
- Supports schema previews and documentation links

---

## IDE Integration (Future)

- VS Code extension using Language Server Protocol
- Inline decorators for fields with schema violations
- Auto-suggestions based on schema constraints

---

## Compatibility Targets

- Astro (ESM, Markdown-first)
- Next.js (App router & Pages router)
- Markdown/MDX (via `gray-matter` or unified/remark)
- Headless CMS (Sanity, Contentful, etc.)
- JSON data (from REST or GraphQL)

---

## Configuration

```ts
// fieldtest.config.ts
export default {
  contentGlob: "content/**/*.md",
  schemaGlob: "schemas/**/*.ts",
  exclude: ["archive/**"],
  validateLLMS: true
}
```

`exclude` accepts glob patterns for files or directories that FieldTest should ignore when scanning.

---

## Open Questions

- Should `FieldTest` generate type definitions or just validate?
- Should dashboards allow schema editing in the browser?
- Should we offer a "FieldTest Cloud" for hosted validation and diffs?

---

## Tech Stack

- **Zod** for runtime + inferred type safety
- **Tsup** for bundling CLI + lib
- **pnpm workspaces** for modular development
- **Vitest** for test coverage
- **Astro/Next.js** for dashboard
- **Bun** optional for fast CLI runs
- **GitHub Actions** for CI validation
