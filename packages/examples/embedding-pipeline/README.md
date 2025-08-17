# 🤖 Embedding Pipeline Validation
This example demonstrates schema validation for notes used in LLM embedding pipelines.

## Files
- `note.md` — A structured document for indexing
- `schema.ts` — Zod schema (embeddingStandard) defining required metadata

## How to Use
```bash
fieldtest validate note.md --schema ./schema.ts
```
