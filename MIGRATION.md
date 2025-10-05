# Migrating to @watthem/fieldtest

## Overview

**FieldTest has consolidated all functionality into a single, unified package: `@watthem/fieldtest`.**

If you're using legacy `@fieldtest/*` scoped packages, this guide will help you migrate to the modern, unified package with improved performance and developer experience.

## 🚀 What Changed

### Package Consolidation

| Legacy Package | New Package | What It Included |
|----------------|-------------|------------------|
| `@fieldtest/core` | `@watthem/fieldtest` | Markdown parsing, core utilities |
| `@fieldtest/validate` | `@watthem/fieldtest` | Validation functions |
| `@fieldtest/registry` | `@watthem/fieldtest` | Schema management |

### Import Statement Updates

**Before (multiple packages):**

```typescript
import { parseMarkdown } from '@fieldtest/core';
import { validateWithSchema } from '@fieldtest/validate';
import { loadSchema } from '@fieldtest/registry';
```

**After (unified package):**

```typescript
import { parseMarkdown, validateWithSchema, loadSchema } from '@watthem/fieldtest';
```

### Type Updates

- **Document type:** Now consistently named `FieldTestDocument`
- All validation types remain the same
- Enhanced TypeScript support with better inference

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

See [docs/getting-started.md](./docs/getting-started.md) for a guided Standard Schema example.

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

1. **Package imports:** All `@fieldtest/*` imports must use `@watthem/fieldtest`
2. **Document type:** Use `FieldTestDocument` for all document types
3. **Import paths:** No more nested package imports

## 🚨 Migration Steps

### Step 1: Update Dependencies

```bash
# Uninstall legacy packages
npm uninstall @fieldtest/core @fieldtest/validate @fieldtest/registry

# Install unified package
npm install @watthem/fieldtest
```

### Step 2: Update Imports

**Automated replacement (Linux/Mac):**

```bash
# Update all @fieldtest/* imports
find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" | \
  xargs sed -i 's/@fieldtest\/[a-z-]*/@watthem\/fieldtest/g'

# Update document type name
find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" | \
  xargs sed -i 's/\bFkitDocument\b/FieldTestDocument/g'
```

**Automated replacement (Windows PowerShell):**

```powershell
# Update imports
Get-ChildItem -Recurse -Include *.ts,*.tsx,*.js | ForEach-Object {
  (Get-Content $_) -replace '@fieldtest/[a-z-]*', '@watthem/fieldtest' | Set-Content $_
  (Get-Content $_) -replace '\bFkitDocument\b', 'FieldTestDocument' | Set-Content $_
}
```

### Step 3: Test Your Code

```bash
# Reinstall dependencies
npm install

# Run tests
npm test

# Build
npm run build
```

## ✅ Benefits of the Unified Package

- 🎯 **Single import source:** One package for all validation needs
- 📦 **Smaller bundle size:** Eliminated duplicate dependencies
- ⚡ **Better performance:** Optimized build and runtime
- 🔧 **Easier upgrades:** Single version to manage
- 📚 **Clearer documentation:** One API to learn
- 🛠️ **Better tooling:** Improved TypeScript inference and IDE support

## 🆘 Troubleshooting

### "Cannot find module '@fieldtest/core'"

**Solution:** Remove legacy packages and install `@watthem/fieldtest`:

```bash
npm uninstall @fieldtest/core @fieldtest/validate @fieldtest/registry
npm install @watthem/fieldtest
```

### Type errors with "FieldTestDocument"

**Solution:** Update your type imports:

```typescript
// Before
import type { FkitDocument } from '@fieldtest/core';

// After
import type { FieldTestDocument } from '@watthem/fieldtest';
```

### Validation still using old API

**Solution:** Use the new unified API:

```typescript
import { loadUserSchema, validateWithSchema } from '@watthem/fieldtest';

const schema = loadUserSchema(mySchema);
const result = validateWithSchema(content, schema);
```

## 🎉 What's Next

- ✅ Use `@watthem/fieldtest` for all validation work
- 📖 Check out the [Getting Started guide](./docs/getting-started.md)
- 🎯 Explore [framework integrations](./docs/guides/framework-integration.md)
- 💡 Browse [examples](./packages/examples/)

---

**The unified `@watthem/fieldtest` package provides everything you need for content validation in one clean, performant package.**
