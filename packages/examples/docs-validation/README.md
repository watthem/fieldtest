# 📘 API Guide Validation
This example validates a Markdown guide file using a Zod schema.

## Files
- `api-guide.md` — A sample documentation file
- `schema.ts` — Defines guideStandard, a Standard Schema validator

## How to Use
```bash
fieldtest validate api-guide.md --schema ./schema.ts
```
