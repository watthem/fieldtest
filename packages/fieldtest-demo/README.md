# FieldTest Demo

A working example of the FieldTest schema validation toolkit, demonstrating validation for both Astro and Next.js sites, including CMS data.

## Features
- Validates Markdown frontmatter (blog posts, docs)
- Validates CMS JSON payloads
- CLI and (optionally) web dashboard for validation
- Uses shared schemas from `@fieldtest/validation-lib`

## Usage

```bash
pnpm install
pnpm --filter @fieldtest/demo run validate
```

## Example Validation
- Blog post Markdown (Astro/Next.js)
- CMS entry JSON (Contentful, Sanity, etc.)
