# Migration Guide

This guide helps you migrate from FKit or legacy `@fieldtest/*` packages to the new unified `@watthem/fieldtest` package.

## Quick Migration

For most projects, migration is straightforward:

### 1. Update Dependencies

::: code-group

```bash [npm]
# Remove old packages
npm uninstall @fieldtest/core @fieldtest/validate @fieldtest/registry fkit

# Install new package
npm install @watthem/fieldtest
```

```bash [pnpm]
# Remove old packages  
pnpm remove @fieldtest/core @fieldtest/validate @fieldtest/registry fkit

# Install new package
pnpm add @watthem/fieldtest
```

```bash [yarn]
# Remove old packages
yarn remove @fieldtest/core @fieldtest/validate @fieldtest/registry fkit

# Install new package
yarn add @watthem/fieldtest
```

:::

### 2. Update Imports

Replace all legacy imports with the new unified imports:

```typescript
// OLD - Legacy imports ❌
import { parseMarkdown } from '@fieldtest/core';
import { validateWithSchema } from '@fieldtest/validate';
import { getBuiltInSchema } from '@fieldtest/registry';

// NEW - Unified imports ✅
import { parseMarkdown, validateWithSchema, getBuiltInSchema } from '@watthem/fieldtest';
```

### 3. Update Type Names

The main document type has been renamed:

```typescript
// OLD ❌
import type { FkitDocument } from '@fieldtest/core';

// NEW ✅
import type { FieldTestDocument } from '@watthem/fieldtest';
```

### 4. Update Schema Definitions

Schema structure remains the same, but ensure you're using Standard Schema v1:

```typescript
// This works the same in both versions ✅
import type { StandardSchemaV1 } from '@watthem/fieldtest';

const schema: StandardSchemaV1 = {
  version: '1',
  name: 'blog-post',
  fields: {
    title: { type: 'string', required: true },
    author: { type: 'string', required: true },
    published: { type: 'boolean', required: true }
  }
};
```

## Automated Migration

For large codebases, use these automated migration scripts:

### Unix/Linux/macOS

```bash
#!/bin/bash
# migrate-fieldtest.sh

echo "🔄 Migrating to @watthem/fieldtest..."

# Update package.json
if [ -f "package.json" ]; then
  echo "📦 Updating package.json..."
  
  # Remove old dependencies
  npm uninstall @fieldtest/core @fieldtest/validate @fieldtest/registry fkit 2>/dev/null || true
  pnpm remove @fieldtest/core @fieldtest/validate @fieldtest/registry fkit 2>/dev/null || true
  yarn remove @fieldtest/core @fieldtest/validate @fieldtest/registry fkit 2>/dev/null || true
  
  # Install new dependency
  if command -v pnpm &> /dev/null; then
    pnpm add @watthem/fieldtest
  elif command -v yarn &> /dev/null; then
    yarn add @watthem/fieldtest
  else
    npm install @watthem/fieldtest
  fi
fi

# Update imports in TypeScript/JavaScript files
echo "🔧 Updating imports..."
find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | \
  grep -v node_modules | \
  xargs sed -i 's/@fieldtest\/[a-zA-Z-]*/@watthem\/fieldtest/g' 2>/dev/null || true

# Update type names
echo "🏷️  Updating type names..."
find . -name "*.ts" -o -name "*.tsx" | \
  grep -v node_modules | \
  xargs sed -i 's/FkitDocument/FieldTestDocument/g' 2>/dev/null || true

echo "✅ Migration complete! Please test your application."
echo "📖 Check https://fieldtest.watthem.blog/migration for any manual steps."
```

### Windows PowerShell

```powershell
# migrate-fieldtest.ps1

Write-Host "🔄 Migrating to @watthem/fieldtest..." -ForegroundColor Blue

# Update package.json
if (Test-Path "package.json") {
    Write-Host "📦 Updating package.json..." -ForegroundColor Green
    
    # Remove old dependencies (suppress errors)
    & npm uninstall @fieldtest/core @fieldtest/validate @fieldtest/registry fkit 2>$null
    & pnpm remove @fieldtest/core @fieldtest/validate @fieldtest/registry fkit 2>$null
    
    # Install new dependency
    if (Get-Command pnpm -ErrorAction SilentlyContinue) {
        & pnpm add @watthem/fieldtest
    } elseif (Get-Command yarn -ErrorAction SilentlyContinue) {
        & yarn add @watthem/fieldtest
    } else {
        & npm install @watthem/fieldtest
    }
}

# Update imports
Write-Host "🔧 Updating imports..." -ForegroundColor Green
Get-ChildItem -Recurse -Include "*.ts", "*.tsx", "*.js", "*.jsx" | 
    Where-Object { $_.DirectoryName -notlike "*node_modules*" } | 
    ForEach-Object {
        (Get-Content $_.FullName) -replace '@fieldtest/[a-zA-Z-]*', '@watthem/fieldtest' | 
        Set-Content $_.FullName
    }

# Update type names
Write-Host "🏷️  Updating type names..." -ForegroundColor Green
Get-ChildItem -Recurse -Include "*.ts", "*.tsx" | 
    Where-Object { $_.DirectoryName -notlike "*node_modules*" } | 
    ForEach-Object {
        (Get-Content $_.FullName) -replace 'FkitDocument', 'FieldTestDocument' | 
        Set-Content $_.FullName
    }

Write-Host "✅ Migration complete! Please test your application." -ForegroundColor Green
Write-Host "📖 Check https://fieldtest.watthem.blog/migration for any manual steps." -ForegroundColor Cyan
```

## Breaking Changes

### Package Structure

| Old Package | New Package | Notes |
|-------------|-------------|-------|
| `@fieldtest/core` | `@watthem/fieldtest` | Core functionality |
| `@fieldtest/validate` | `@watthem/fieldtest` | Now included in main package |
| `@fieldtest/registry` | `@watthem/fieldtest` | Now included in main package |
| `fkit` | `@watthem/fieldtest` | Completely replaced |

### API Changes

#### Document Interface

```typescript
// OLD ❌
interface FkitDocument {
  frontmatter: any;
  body: string;
  metadata?: {
    path: string;
    size: number;
    modified: Date;
  };
}

// NEW ✅
interface FieldTestDocument {
  raw: string;           // Added: original content
  frontmatter: any;      // Same
  body: string;          // Same
  metadata?: {           // Optional: simplified
    path?: string;
    lastModified?: Date;
    [key: string]: any;
  };
}
```

#### Function Names

Most function names remain the same:

| Function | Old | New | Status |
|----------|-----|-----|--------|
| `parseMarkdown` | ✅ | ✅ | No change |
| `serializeMarkdown` | ✅ | ✅ | No change |
| `validateWithSchema` | ✅ | ✅ | No change |
| `loadUserSchema` | ✅ | ✅ | No change |
| `getBuiltInSchema` | ✅ | ✅ | No change |

#### Error Handling

Error structure has been improved:

```typescript
// OLD ❌
interface ValidationError {
  field: string;
  message: string;
}

// NEW ✅ 
interface ValidationError {
  field: string;
  message: string;
  code: string;        // Added: error code
  path?: string[];     // Added: nested field path
}
```

### Configuration Changes

#### Schema Definitions

Schema structure is **mostly compatible** but with some improvements:

```typescript
// Both versions work ✅
const schema: StandardSchemaV1 = {
  version: '1',
  name: 'blog-post',
  fields: {
    title: { type: 'string', required: true },
    tags: { type: 'string', array: true }
  }
};

// NEW: Enhanced field options ✅
const enhancedSchema: StandardSchemaV1 = {
  version: '1', 
  name: 'blog-post',
  fields: {
    title: { 
      type: 'string', 
      required: true,
      description: 'Post title',           // New: documentation
      minLength: 1,                        // New: validation rules
      maxLength: 200
    },
    status: {
      type: 'string',
      required: true,
      enum: ['draft', 'published']         // New: enumeration support
    }
  },
  metadata: {                              // New: schema metadata
    description: 'Blog post schema with enhanced validation'
  }
};
```

## Framework-Specific Migration

### Astro

Most Astro integrations continue to work:

```typescript
// OLD - Still works ✅
import { validateAstroContent } from '@fieldtest/validate';

// NEW - Preferred ✅
import { validateWithSchema, loadUserSchema } from '@watthem/fieldtest';

// Content collections - minimal changes needed
const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    author: z.string()
  }).refine(data => {
    // Update this line:
    const result = validateWithSchema(
      generateMarkdown(data), 
      loadUserSchema(blogSchema)
    );
    return result.valid;
  })
});
```

### Next.js

Update your validation calls:

```typescript
// OLD ❌
import { validateNextContent } from '@fieldtest/validate';

// NEW ✅
import { validateWithSchema, loadUserSchema } from '@watthem/fieldtest';

export async function generateStaticParams() {
  const schema = loadUserSchema(blogPostSchema);
  
  return posts.map(post => {
    // OLD ❌
    // const result = validateNextContent(content, schema);
    
    // NEW ✅
    const result = validateWithSchema(content, schema);
    
    if (!result.valid) {
      throw new Error(`Invalid post: ${result.errors.map(e => e.message).join(', ')}`);
    }
    
    return { slug: post.slug };
  });
}
```

## Testing Your Migration

After migration, test thoroughly:

### 1. Type Check

```bash
# TypeScript projects
npx tsc --noEmit

# Or with your preferred type checker
pnpm type-check
```

### 2. Run Tests

```bash
# Run your existing tests
npm test
# or
pnpm test
# or  
yarn test
```

### 3. Build Your Project

```bash
# Test production build
npm run build
# or
pnpm build
```

### 4. Validate Sample Content

Create a simple validation test:

```typescript
// test-migration.ts
import { loadUserSchema, validateWithSchema } from '@watthem/fieldtest';
import type { StandardSchemaV1 } from '@watthem/fieldtest';

const testSchema: StandardSchemaV1 = {
  version: '1',
  name: 'test',
  fields: {
    title: { type: 'string', required: true }
  }
};

const markdown = `---
title: "Test Post"
---
# Content
`;

const schema = loadUserSchema(testSchema);
const result = validateWithSchema(markdown, schema);

if (result.valid) {
  console.log('✅ Migration successful!');
} else {
  console.error('❌ Migration issue:', result.errors);
}
```

Run the test:

```bash
npx tsx test-migration.ts
```

## Common Issues

### Import Errors

**Problem**: `Cannot resolve module '@watthem/fieldtest'`

**Solution**: Clear your package manager cache and reinstall:

```bash
# npm
rm -rf node_modules package-lock.json
npm install

# pnpm  
rm -rf node_modules pnpm-lock.yaml
pnpm install

# yarn
rm -rf node_modules yarn.lock  
yarn install
```

### Type Errors

**Problem**: `Property 'raw' does not exist on type 'FkitDocument'`

**Solution**: Update all `FkitDocument` references to `FieldTestDocument`:

```bash
# Find remaining references
grep -r "FkitDocument" . --include="*.ts" --include="*.tsx"

# Replace them
sed -i 's/FkitDocument/FieldTestDocument/g' path/to/file.ts
```

### Runtime Errors

**Problem**: Functions not found at runtime

**Solution**: Ensure you're importing from the correct package:

```typescript
// Wrong ❌
import { parseMarkdown } from '@fieldtest/core';

// Correct ✅  
import { parseMarkdown } from '@watthem/fieldtest';
```

## Getting Help

If you encounter issues during migration:

1. **Check the [API Reference](./reference/api)** for updated function signatures
2. **Review [Examples](./examples/)** for migration patterns
3. **Search [GitHub Issues](https://github.com/watthem/fieldtest/issues)** for similar problems
4. **Open a new issue** with your specific migration challenge
5. **Join [GitHub Discussions](https://github.com/watthem/fieldtest/discussions)** for community support

## Need Manual Help?

For complex migrations or enterprise support, contact [hello@matthewhendricks.net](mailto:hello@matthewhendricks.net).

---

**Migration complete?** 🎉 Check out our [Getting Started guide](./getting-started) to explore new features in FieldTest!