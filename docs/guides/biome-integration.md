# Biome Integration Guide

Learn how to use Biome with FieldTest for linting and code quality.

## What is Biome?

[Biome](https://biomejs.dev) is a fast, all-in-one toolchain for JavaScript and TypeScript that provides:

- 🚀 **Fast linting** — Faster than ESLint
- 🎨 **Code formatting** — Alternative to Prettier
- 🔧 **Import sorting** — Organize imports automatically
- 🔌 **Plugin system** — Custom rules via GritQL

FieldTest includes custom Biome plugins to help with migration and enforce best practices.

---

## Quick Start

### 1. Install Biome

```bash
pnpm add -D @biomejs/biome
```

### 2. Initialize Biome

```bash
pnpm exec biome init
```

This creates a `biome.json` configuration file.

### 3. Add FieldTest Plugins

Update your `biome.json`:

```json
{
  "$schema": "https://biomejs.dev/schemas/2.2.5/schema.json",
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "tab",
    "lineWidth": 100
  },
  "plugins": [
    "./grit-plugins/fieldtest-migration.grit",
    "./grit-plugins/schema-usage.grit"
  ]
}
```

### 4. Run Biome

```bash
# Lint your code
pnpm biome lint

# Format your code
pnpm biome format --write .

# Check and fix issues
pnpm biome check --write .
```

---

## FieldTest Plugins

### Migration Helper Plugin

Detects legacy `@fieldtest/*` imports and outdated type names.

**What it catches:**

```typescript
// ⚠️ Warning: Legacy import
import { parseMarkdown } from '@fieldtest/core';

// ❌ Error: Outdated type name
const doc: OldDocumentType = parseMarkdown(content);
```

**Suggested fixes:**

```typescript
// ✅ Use unified package
import { parseMarkdown, FieldTestDocument } from '@watthem/fieldtest';

const doc: FieldTestDocument = parseMarkdown(content);
```

### Schema Usage Plugin

Ensures validation results are properly handled.

**What it catches:**

```typescript
// ⚠️ Warning: Result not checked
const result = validateWithSchema(content, schema);
console.log('Done'); // Missing result.valid check

// ❌ Error: Missing required fields
const schema = {
  name: 'blog-post',
  // Missing 'version' field
  fields: { /* ... */ }
};
```

**Suggested fixes:**

```typescript
// ✅ Check validation result
const result = validateWithSchema(content, schema);
if (!result.valid) {
  console.error('Validation failed:', result.errors);
  throw new Error('Invalid content');
}

// ✅ Complete schema
const schema = {
  version: '1',
  name: 'blog-post',
  fields: { /* ... */ }
};
```

---

## Configuration

### Complete biome.json Example

```json
{
  "$schema": "https://biomejs.dev/schemas/2.2.5/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "files": {
    "ignoreUnknown": false,
    "ignore": [
      "node_modules",
      "dist",
      "build",
      ".turbo",
      "coverage",
      "*.config.js"
    ]
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "tab",
    "lineWidth": 100
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "suspicious": {
        "noExplicitAny": "warn"
      },
      "correctness": {
        "noUnusedVariables": "error"
      }
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "semicolons": "always"
    }
  },
  "assist": {
    "enabled": true,
    "actions": {
      "source": {
        "organizeImports": "on"
      }
    }
  },
  "plugins": [
    "./grit-plugins/fieldtest-migration.grit",
    "./grit-plugins/schema-usage.grit"
  ]
}
```

### NPM Scripts

Add Biome commands to `package.json`:

```json
{
  "scripts": {
    "lint": "biome lint .",
    "format": "biome format --write .",
    "check": "biome check --write .",
    "ci:check": "biome check ."
  }
}
```

---

## Editor Integration

### VS Code

Install the [Biome extension](https://marketplace.visualstudio.com/items?itemName=biomejs.biome):

```bash
code --install-extension biomejs.biome
```

**settings.json:**

```json
{
  "[javascript]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[typescript]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports.biome": "explicit"
  }
}
```

### JetBrains (WebStorm, IntelliJ)

Install the [Biome plugin](https://plugins.jetbrains.com/plugin/22761-biome):

1. Go to **Settings → Plugins**
2. Search for "Biome"
3. Install and restart

Configure in **Settings → Languages & Frameworks → Biome**.

---

## CI Integration

### GitHub Actions

Add Biome checks to your CI pipeline:

**.github/workflows/lint.yml:**

```yaml
name: Lint and Format

on: [push, pull_request]

jobs:
  biome:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run Biome
        run: pnpm biome check .
```

### Pre-commit Hooks

Use Husky and lint-staged:

**package.json:**

```json
{
  "scripts": {
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "biome check --write --no-errors-on-unmatched"
    ]
  }
}
```

**.husky/pre-commit:**

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm lint-staged
```

---

## Migration from ESLint/Prettier

### Step 1: Backup Configuration

```bash
cp .eslintrc.json .eslintrc.json.backup
cp .prettierrc .prettierrc.backup
```

### Step 2: Migrate Configuration

```bash
# Migrate ESLint config
pnpm biome migrate eslint

# Migrate Prettier config
pnpm biome migrate prettier
```

Biome will read your existing configuration and update `biome.json`.

### Step 3: Update Scripts

**Before:**

```json
{
  "scripts": {
    "lint": "eslint .",
    "format": "prettier --write ."
  }
}
```

**After:**

```json
{
  "scripts": {
    "lint": "biome lint .",
    "format": "biome format --write .",
    "check": "biome check --write ."
  }
}
```

### Step 4: Remove Old Dependencies

```bash
pnpm remove eslint prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

### Step 5: Clean Up Config Files

```bash
rm .eslintrc.json .prettierrc .eslintignore .prettierignore
```

---

## Working with Monorepos

### Root Configuration

**biome.json (root):**

```json
{
  "extends": [],
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "plugins": [
    "./grit-plugins/fieldtest-migration.grit",
    "./grit-plugins/schema-usage.grit"
  ]
}
```

### Package-Specific Configuration

**packages/my-package/biome.json:**

```json
{
  "extends": ["../../biome.json"],
  "linter": {
    "rules": {
      "suspicious": {
        "noConsoleLog": "off"
      }
    }
  }
}
```

### Turbo Integration

Add Biome to your Turbo pipeline:

**turbo.json:**

```json
{
  "pipeline": {
    "lint": {
      "dependsOn": ["^lint"],
      "outputs": []
    },
    "format": {
      "dependsOn": ["^format"],
      "outputs": ["**/*.{ts,tsx,js,jsx}"]
    }
  }
}
```

**Root package.json:**

```json
{
  "scripts": {
    "lint": "turbo run lint",
    "format": "turbo run format"
  }
}
```

---

## Advanced Usage

### Ignore Specific Diagnostics

Use comments to disable rules:

```typescript
// biome-ignore lint/suspicious/noExplicitAny: Legacy code
function legacyFunction(data: any) {
  // ...
}
```

### Custom Plugins

Create your own GritQL plugins:

**grit-plugins/custom-rule.grit:**

```grit
language js

pattern avoid_console_log() {
  `console.log($args)` where {
    register_diagnostic(
      message = "Avoid console.log in production code. Use a logger instead.",
      severity = "warn"
    )
  }
}
```

Add to `biome.json`:

```json
{
  "plugins": [
    "./grit-plugins/fieldtest-migration.grit",
    "./grit-plugins/schema-usage.grit",
    "./grit-plugins/custom-rule.grit"
  ]
}
```

---

## Performance Tips

### 1. Use Glob Patterns

Lint specific directories:

```bash
pnpm biome lint src/ packages/
```

### 2. Parallel Execution

In monorepos, use Turbo for parallel execution:

```bash
pnpm turbo run lint
```

### 3. Cache Results

Biome caches results automatically. Use `--use-server` for faster subsequent runs:

```bash
pnpm biome lint --use-server
```

---

## Troubleshooting

### Issue: Plugins Not Working

**Error:** Plugin diagnostics not showing

**Solution:**

1. Check plugin paths in `biome.json`
2. Ensure `.grit` files exist
3. Run with `--verbose` to see plugin loading

```bash
pnpm biome lint --verbose
```

### Issue: Format Conflicts

**Error:** Biome format differs from Prettier

**Solution:** Migrate Prettier config:

```bash
pnpm biome migrate prettier
```

Or manually adjust formatting settings in `biome.json`.

### Issue: Slow Linting

**Error:** Biome is slower than expected

**Solutions:**

1. Reduce file scope: `pnpm biome lint src/`
2. Add files to ignore list in `biome.json`
3. Disable unused plugins

---

## Best Practices

### 1. Run Biome in CI

Catch issues before merge:

```yaml
- name: Lint
  run: pnpm biome check .
```

### 2. Format on Save

Configure your editor to format on save.

### 3. Use Pre-commit Hooks

Prevent committing unformatted code:

```bash
pnpm lint-staged
```

### 4. Keep Configuration Simple

Start with `recommended` rules, add custom rules as needed.

### 5. Document Custom Rules

If you create custom plugins, document what they check and why.

---

## Resources

- 🌐 [Biome Official Documentation](https://biomejs.dev)
- 📖 [GritQL Syntax](https://docs.grit.io/)
- 🔧 [FieldTest Migration Guide](../../MIGRATION.md)
- 💡 [Plugin Examples](../../grit-plugins/)

---

## Next Steps

- 📚 [API Reference](../reference/api.md)
- 🎓 [Schema Validation Guide](./schema-validation.md)
- 💡 [Framework Integration](./framework-integration.md)
