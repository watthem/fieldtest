# FKit / @fieldtest/* → @watthem/fieldtest Migration Guide

## Overview

**All FKit and `@fieldtest/*` modules have been consolidated into a single package: `@watthem/fieldtest`.**

This migration unifies the former FKit and FieldTest packages into one toolkit for TypeScript validation, schema management, and content processing. All exports are now available from `@watthem/fieldtest`.

## 🚀 What Changed

### Package Name Changes

| Old (FKit or FieldTest) | New (@watthem/fieldtest) | Description |
|-------------------------|--------------------------|-------------|
| `@fieldtest/core`       | `@watthem/fieldtest`     | Core SDK functionality |
| `@fieldtest/validate`   | `@watthem/fieldtest`     | Validation utilities |
| `@fieldtest/registry`   | `@watthem/fieldtest`     | Schema registry |

### Import Statement Updates

**Before (FKit or `@fieldtest/*`):**

```typescript
import { parseMarkdown, FkitDocument } from '@fieldtest/core';
import { validateWithSchema } from '@fieldtest/validate';
import { loadSchema } from '@fieldtest/registry';
```

**After (`@watthem/fieldtest`):**

```typescript
import { parseMarkdown, FieldTestDocument, validateWithSchema, loadSchema } from '@watthem/fieldtest';
```

### Type Name Changes

- `FkitDocument` → `FieldTestDocument`
- All other types remain the same

## 📦 New Unified Structure

```
fieldtest/
├── src/                  # Consolidated source for @watthem/fieldtest
├── packages/             # Legacy modules (core, validate, registry, etc.) now internal
└── docs/                 # Documentation
```

## 🎯 What to Use Going Forward

### For Schema Validation

```typescript
import { validateWithSchema, marketingCopySchema } from '@watthem/fieldtest';
```

### For Markdown Processing

```typescript
import { parseMarkdown, serializeMarkdown } from '@watthem/fieldtest';
```

### For Schema Registry

```typescript
import { loadUserSchema, getBuiltInSchema } from '@watthem/fieldtest';
```

### For Framework Integration

```typescript
// Astro
import { validateAstroContent } from '@watthem/fieldtest';

// Next.js
import { validateNextContent } from '@watthem/fieldtest';
```

## 🔧 Integration Tools

### MCP Server

- **Location:** `packages/integrations/mcp/fieldtest-mcp-server/`
- **Usage:** AI agent integration for content validation
- **Updated:** Now uses `@watthem/fieldtest` internally

### Obsidian Integration

- **Location:** `packages/integrations/obsidian/`
- **Usage:** Obsidian plugin for note validation

## ⚠️ Breaking Changes

1. **Package Names:** All FKit and `@fieldtest/*` imports must be updated to `@watthem/fieldtest`
2. **Type Names:** `FkitDocument` → `FieldTestDocument`
3. **Import Paths:** Some internal import paths have been reorganized

## 🚨 Action Required

**If you have existing code using FKit or `@fieldtest/*`:**

1. **Update package.json dependencies:**

   ```diff
   - "@fieldtest/core": "^0.1.0"
   - "@fieldtest/validate": "^0.1.0"
   - "@fieldtest/registry": "^0.1.0"
   + "@watthem/fieldtest": "workspace:^"
   ```

2. **Update import statements:**

   ```bash
   # Find and replace across your codebase
   find . -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/@fieldtest\/core/@watthem\/fieldtest/g'
   find . -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/@fieldtest\/validate/@watthem\/fieldtest/g'
   find . -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/@fieldtest\/registry/@watthem\/fieldtest/g'
   find . -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/FkitDocument/FieldTestDocument/g'
   ```

3. **Reinstall dependencies:**

   ```bash
   pnpm install
   ```

## ✅ Benefits of Consolidation

- **Single Source of Truth:** All validation tools in one place
- **Reduced Complexity:** No more confusion between FKit vs multiple FieldTest packages
- **Better DX:** Consistent naming and patterns
- **Easier Maintenance:** Single codebase to maintain
- **Improved Performance:** Shared dependencies and optimizations

## 🎉 What's Next

- **Use `@watthem/fieldtest` for ALL new validation work**
- **Migrate existing `@fieldtest/*` imports to `@watthem/fieldtest`**
- **Reference this guide when onboarding new team members**
- **Update documentation and examples to use `@watthem/fieldtest` patterns**

---

**Remember: All FKit and `@fieldtest/*` functionality now ships in `@watthem/fieldtest`. There's no reason to go back to the old packages.**

*Migration completed: January 2025*

