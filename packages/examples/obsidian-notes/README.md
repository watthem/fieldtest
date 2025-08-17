# 🧠 Obsidian Notes Validation
This example shows how to validate daily notes from an Obsidian vault.

## Files
- `daily-2025-05-19.md` — A sample daily note
- `schema.ts` — Defines noteStandard, a Zod schema for validating daily metadata

## How to Use
```bash
fieldtest validate daily-2025-05-19.md --schema ./schema.ts
```
