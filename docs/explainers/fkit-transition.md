# FKit to FieldTest Transition

Understanding the transition from FKit to FieldTest and what changed.

## What Happened?

**FKit** (Flat File Knowledge Infrastructure Toolkit) and the `@fieldtest/*` packages have been **consolidated into a single package**: `@watthem/fieldtest`.

This transition simplifies the ecosystem, reduces confusion, and provides a better developer experience.

---

## Timeline

### Before: Multiple Packages

Previously, the functionality was split across multiple packages:

```
@fieldtest/core         # Core markdown processing
@fieldtest/validate     # Validation utilities
@fieldtest/registry     # Schema registry
@fieldtest/astro        # Astro integration
@fieldtest/next         # Next.js integration
```

**Problems:**

- ❌ Confusing which package to install
- ❌ Version mismatch issues
- ❌ Duplicated dependencies
- ❌ Hard to maintain

### Now: Unified Package

All functionality is in `@watthem/fieldtest`:

```typescript
import {
  // Core
  parseMarkdown,
  serializeMarkdown,
  
  // Validation
  validateWithSchema,
  loadUserSchema,
  
  // Registry
  getBuiltInSchema,
  registerSchema,
  
  // Framework integration
  validateAstroContent,
  validateNextContent,
  
  // Types
  StandardSchemaV1,
  FieldTestDocument
} from '@watthem/fieldtest';
```

**Benefits:**

- ✅ Single package to install
- ✅ Consistent versioning
- ✅ Smaller bundle size
- ✅ Easier maintenance
- ✅ Better DX

---

## What Changed

### Package Names

| Old Package | New Package |
|------------|------------|
| `@fieldtest/core` | `@watthem/fieldtest` |
| `@fieldtest/validate` | `@watthem/fieldtest` |
| `@fieldtest/registry` | `@watthem/fieldtest` |
| `@fieldtest/astro` | `@watthem/fieldtest` |
| `@fieldtest/next` | `@watthem/fieldtest` |

### Type Names

| Old Type | New Type |
|----------|----------|
| `FkitDocument` | `FieldTestDocument` |
| `FkitSchema` | `StandardSchemaV1` |

All other types remain the same.

### Import Paths

**Before:**

```typescript
import { parseMarkdown, FkitDocument } from '@fieldtest/core';
import { validateWithSchema } from '@fieldtest/validate';
import { loadSchema } from '@fieldtest/registry';
```

**After:**

```typescript
import { 
  parseMarkdown, 
  FieldTestDocument,
  validateWithSchema,
  loadSchema
} from '@watthem/fieldtest';
```

### API Changes

Most APIs remain the same. Key changes:

1. **`FkitDocument` → `FieldTestDocument`**

```typescript
// Before
const doc: FkitDocument = parseMarkdown(content);

// After
const doc: FieldTestDocument = parseMarkdown(content);
```

2. **Unified exports** — All exports from one package

```typescript
// Before - multiple imports
import { parseMarkdown } from '@fieldtest/core';
import { validateWithSchema } from '@fieldtest/validate';

// After - single import
import { parseMarkdown, validateWithSchema } from '@watthem/fieldtest';
```

---

## Migration Guide

### Step 1: Update package.json

**Remove old packages:**

```diff
{
  "dependencies": {
-   "@fieldtest/core": "^0.1.0",
-   "@fieldtest/validate": "^0.1.0",
-   "@fieldtest/registry": "^0.1.0",
+   "@watthem/fieldtest": "^1.0.0"
  }
}
```

### Step 2: Update Imports

**Option A: Manual update**

Find and replace in each file:

```typescript
// Before
import { parseMarkdown, FkitDocument } from '@fieldtest/core';
import { validateWithSchema } from '@fieldtest/validate';

// After
import { parseMarkdown, FieldTestDocument, validateWithSchema } from '@watthem/fieldtest';
```

**Option B: Automated update (Linux/Mac)**

```bash
# Update package imports
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/@fieldtest\/[a-zA-Z-]*/@watthem\/fieldtest/g'

# Update type names
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/FkitDocument/FieldTestDocument/g'
```

**Option B: Automated update (Windows PowerShell)**

```powershell
# Update package imports
Get-ChildItem -Recurse -Include *.ts,*.tsx | ForEach-Object {
  (Get-Content $_) -replace '@fieldtest/[a-zA-Z-]*', '@watthem/fieldtest' | Set-Content $_
}

# Update type names
Get-ChildItem -Recurse -Include *.ts,*.tsx | ForEach-Object {
  (Get-Content $_) -replace 'FkitDocument', 'FieldTestDocument' | Set-Content $_
}
```

### Step 3: Reinstall Dependencies

```bash
# Remove node_modules and lockfile
rm -rf node_modules pnpm-lock.yaml

# Reinstall
pnpm install
```

### Step 4: Test Your Application

```bash
# Run tests
pnpm test

# Build
pnpm build

# Validate content
pnpm validate-content
```

### Step 5: Update Documentation

Update any internal documentation references:

- README files
- API documentation
- Code comments
- Configuration files

---

## Automated Migration with Biome

FieldTest includes Biome plugins to detect legacy usage:

### Setup Biome

```bash
pnpm add -D @biomejs/biome
```

### Configure biome.json

```json
{
  "plugins": [
    "./node_modules/@watthem/fieldtest/grit-plugins/fieldtest-migration.grit"
  ]
}
```

### Run Linting

```bash
pnpm biome lint
```

**Output:**

```
warn: Legacy @fieldtest/* packages have been consolidated. 
      Use '@watthem/fieldtest' instead.
  --> src/lib/validation.ts:1:8
  | import { parseMarkdown } from '@fieldtest/core';
  |        ^^^^^^^^^^^^^^^^^
  See MIGRATION.md for details.

error: Replace 'FkitDocument' with 'FieldTestDocument'
  --> src/types/content.ts:5:12
  | const doc: FkitDocument = parseMarkdown(content);
  |            ^^^^^^^^^^^^
```

The plugin identifies all legacy usage in your codebase.

---

## Common Migration Issues

### Issue 1: Module Not Found

**Error:**

```
Cannot find module '@fieldtest/core'
```

**Solution:**

- Remove old packages from package.json
- Install `@watthem/fieldtest`
- Update imports

### Issue 2: Type Errors

**Error:**

```
Type 'FkitDocument' is not defined
```

**Solution:**

- Replace `FkitDocument` with `FieldTestDocument`
- Update imports to include the new type

### Issue 3: Duplicate Packages

**Error:**

```
Multiple versions of fieldtest detected
```

**Solution:**

```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Issue 4: Build Errors

**Error:**

```
Module not found: @fieldtest/validate
```

**Solution:**
Check for:

- Cached build artifacts (clear `dist/`, `.next/`, `.astro/`)
- Old import statements
- Dependencies in monorepo packages

---

## Why the Consolidation?

### Developer Experience

**Before:** Multiple packages to manage

```json
{
  "dependencies": {
    "@fieldtest/core": "0.1.0",
    "@fieldtest/validate": "0.1.2",  // Version mismatch!
    "@fieldtest/registry": "0.1.0"
  }
}
```

**After:** One package, one version

```json
{
  "dependencies": {
    "@watthem/fieldtest": "1.0.0"
  }
}
```

### Bundle Size

**Before:** Separate packages = duplicated dependencies

```
node_modules/
├── @fieldtest/core/
│   └── node_modules/
│       └── zod/
├── @fieldtest/validate/
│   └── node_modules/
│       └── zod/  ← Duplicated!
```

**After:** Single package = shared dependencies

```
node_modules/
├── @watthem/fieldtest/
└── zod/  ← Shared
```

### Maintenance

**Before:** Update each package separately

```bash
pnpm update @fieldtest/core
pnpm update @fieldtest/validate
pnpm update @fieldtest/registry
# etc.
```

**After:** One update command

```bash
pnpm update @watthem/fieldtest
```

---

## What Stayed the Same

✅ **Core API** — Same functions, same behavior

```typescript
// Still works the same
const doc = parseMarkdown(markdown);
const result = validateWithSchema(content, schema);
```

✅ **Schema Format** — Standard Schema unchanged

```typescript
// Same schema format
const schema = {
  version: '1',
  name: 'blog-post',
  fields: {
    title: { type: 'string', required: true }
  }
};
```

✅ **Validation Results** — Same structure

```typescript
// Same result format
const result = validateWithSchema(content, schema);
if (result.valid) {
  // ...
} else {
  console.error(result.errors);
}
```

---

## Getting Help

### Check the Docs

- 📖 [Full Migration Guide](../../MIGRATION.md)
- 📚 [API Reference](../reference/api.md)
- 🎓 [Getting Started](../getting-started.md)

### Common Questions

**Q: Do I have to migrate immediately?**

A: The old packages are deprecated but will work for now. We recommend migrating soon to get bug fixes and new features.

**Q: Will my schemas break?**

A: No. Standard Schema format is unchanged. Your existing schemas work as-is.

**Q: What about my custom integrations?**

A: Update import statements and type names. The core API is the same.

**Q: Can I use both old and new packages?**

A: Not recommended. Mixing old and new packages can cause conflicts. Migrate fully.

---

## Future Roadmap

With the unified `@watthem/fieldtest` package:

- ✅ Faster releases
- ✅ Better TypeScript support
- ✅ Improved Biome plugins
- ✅ More framework integrations
- ✅ Enhanced MCP features
- ✅ Better documentation

---

## Summary

| Aspect | Before (FKit) | After (FieldTest) |
|--------|---------------|-------------------|
| Package count | 5+ | 1 |
| Import paths | Multiple | Single |
| Type names | `FkitDocument` | `FieldTestDocument` |
| Versioning | Independent | Unified |
| Bundle size | Larger | Smaller |
| DX | Complex | Simple |

**The transition brings simplicity, consistency, and a better developer experience.**

---

## Next Steps

1. 📖 [Follow the migration guide](../../MIGRATION.md)
2. 🔧 [Use Biome plugins](../guides/biome-integration.md) to find legacy usage
3. ✅ Run your tests
4. 🚀 Deploy with confidence

Welcome to the unified FieldTest! 🎉
