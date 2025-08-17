# FKit → FieldTest Migration Guide

## Overview

**All FKit code is now under FieldTest. Use `@fieldtest/*` for all validation and schema work.**

This migration consolidates the FKit and FieldTest projects into a single, unified toolkit for TypeScript validation, schema management, and content processing.

## 🚀 What Changed

### Package Name Changes

| Old (FKit) | New (FieldTest) | Description |
|------------|-----------------|-------------|
| `@fieldtest/core` | `@fieldtest/core` | Core SDK functionality |
| `@fieldtest/validate` | `@fieldtest/validate` | Validation utilities |
| `@fieldtest/registry` | `@fieldtest/registry` | Schema registry |
| `@fieldtest/examples` | `fieldtest/packages/examples` | Usage examples |
| `@fieldtest/fieldtest-demo` | `@fieldtest/fieldtest-demo` | Demo package |

### Import Statement Updates

**Before (FKit):**

```typescript
import { parseMarkdown, FkitDocument } from '@fieldtest/core';
import { validateWithSchema } from '@fieldtest/validate';
import { loadSchema } from '@fieldtest/registry';
```

**After (FieldTest):**

```typescript
import { parseMarkdown, FieldTestDocument } from '@fieldtest/core';
import { validateWithSchema } from '@fieldtest/validate';
import { loadSchema } from '@fieldtest/registry';
```

### Type Name Changes

- `FkitDocument` → `FieldTestDocument`
- All other types remain the same

## 📦 New Unified Structure

```
fieldtest/
├── packages/
│   ├── core/              # @fieldtest/core - Core SDK
│   ├── validate/          # @fieldtest/validate - Validation utilities
│   ├── registry/          # @fieldtest/registry - Schema registry
│   ├── shared/            # @fieldtest/shared - Shared utilities
│   ├── validation-lib/    # @fieldtest/validation-lib - Extended validation
│   ├── integrations/      # MCP server, Obsidian tools
│   ├── examples/          # Usage examples and demos
│   └── fieldtest-demo/    # Demo applications
├── apps/
│   ├── astro-site/        # Astro.js demo
│   └── next-app/          # Next.js demo
└── docs/                  # Documentation
```

## 🎯 What to Use Going Forward

### For Schema Validation

```typescript
import { validateWithSchema } from '@fieldtest/validate';
import { marketingCopySchema } from '@fieldtest/validate';
```

### For Markdown Processing

```typescript
import { parseMarkdown, serializeMarkdown } from '@fieldtest/core';
```

### For Schema Registry

```typescript
import { loadUserSchema, getBuiltInSchema } from '@fieldtest/registry';
```

### For Framework Integration

```typescript
// Astro
import { validateAstroContent } from '@fieldtest/validate';

// Next.js  
import { validateNextContent } from '@fieldtest/validate';
```

## 🔧 Integration Tools

### MCP Server

- **Location:** `packages/integrations/mcp/fieldtest-mcp-server/`
- **Usage:** AI agent integration for content validation
- **Updated:** Now uses `@fieldtest/*` packages internally

### Obsidian Integration

- **Location:** `packages/integrations/obsidian/`
- **Usage:** Obsidian plugin for note validation

## ⚠️ Breaking Changes

1. **Package Names:** All `@fieldtest/*` imports must be updated to `@fieldtest/*`
2. **Type Names:** `FkitDocument` → `FieldTestDocument`
3. **Import Paths:** Some internal import paths have been reorganized

## 🚨 Action Required

**If you have existing code using FKit:**

1. **Update package.json dependencies:**

   ```diff
   - "@fieldtest/core": "^0.1.0"
   - "@fieldtest/validate": "^0.1.0"
   + "@fieldtest/core": "workspace:^"
   + "@fieldtest/validate": "workspace:^"
   ```

2. **Update import statements:**

   ```bash
   # Find and replace across your codebase
   find . -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/@fieldtest\//@fieldtest\//g'
   find . -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/FkitDocument/FieldTestDocument/g'
   ```

3. **Reinstall dependencies:**

   ```bash
   pnpm install
   ```

## ✅ Benefits of Consolidation

- **Single Source of Truth:** All validation tools in one place
- **Reduced Complexity:** No more confusion between FKit vs FieldTest
- **Better DX:** Consistent naming and patterns
- **Easier Maintenance:** Single codebase to maintain
- **Improved Performance:** Shared dependencies and optimizations

## 🎉 What's Next

- **Use `@fieldtest/*` for ALL new validation work**
- **Migrate existing `@fieldtest/*` imports to `@fieldtest/*`**
- **Reference this guide when onboarding new team members**
- **Update documentation and examples to use FieldTest patterns**

---

**Remember: All FKit functionality lives in FieldTest now. There's no reason to go back to the old patterns.**

*Migration completed: January 2025*
