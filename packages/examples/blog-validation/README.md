# 📝 Blog Post Validation

This example demonstrates how to use Fieldtest with a Zod-based schema to validate blog posts written in Markdown.

## Files

- `blog-post.md` — A sample blog post with frontmatter
- `schema.ts` — Defines `blogPostStandard`, a Standard Schema-wrapped Zod schema

## How to Use

```bash
fieldtest validate blog-post.md --schema ./schema.ts
```
