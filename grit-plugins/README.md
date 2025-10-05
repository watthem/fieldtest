# FieldTest Biome Plugins

Custom GritQL plugins for the Biome linter to help with FieldTest migration and best practices.

## Available Plugins

### 1. `fieldtest-migration.grit`

Detects legacy `@fieldtest/*` imports and outdated type names.

**What it catches:**

- Legacy import statements: `import { ... } from '@fieldtest/core'`
- Outdated type names from previous package versions
- Legacy exports: `export * from '@fieldtest/validate'`
- Require statements: `require('@fieldtest/registry')`

**Example warnings:**

```typescript
import { parseMarkdown } from '@fieldtest/core';
// ⚠️ Legacy @fieldtest/* packages have been consolidated.
//    Use '@watthem/fieldtest' instead. See MIGRATION.md for details.

const doc: OldDocumentType = parseMarkdown(content);
// ❌ Update to use 'FieldTestDocument'
```

### 2. `schema-usage.grit`

Ensures validation results are properly checked and schemas follow conventions.

**What it catches:**

- Unchecked validation results
- Incomplete schema definitions (missing `version` or `name`)
- Non-camelCase field names
- Unhandled schema loading

**Example warnings:**

```typescript
const result = validateWithSchema(doc, schema);
// ⚠️ Validation result should be checked.
//    Use 'if (result.valid)' or handle 'result.errors'.

const schema = {
  name: 'my-schema',
  // ❌ Standard Schema must include 'version' and 'name' fields
  fields: { /* ... */ }
};
```

## Usage

### Installation

Install Biome if you haven't already:

```bash
pnpm add -D @biomejs/biome
```

### Configuration

Add the plugins to your `biome.json`:

```json
{
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

### Running

```bash
# Check for issues
pnpm biome lint

# Check specific files
pnpm biome lint src/

# Format and lint
pnpm biome check --write .
```

## Plugin Output

### Migration Helper Example

```
$ pnpm biome lint

src/lib/parser.ts
  warn: Legacy @fieldtest/* packages have been consolidated.
        Use '@watthem/fieldtest' instead. See MIGRATION.md for details.
    1 │ import { parseMarkdown } from '@fieldtest/core';
      │        ^^^^^^^^^^^^^^^^^
    
src/types.ts
  error: Update to use 'FieldTestDocument'
    5 │ export type Document = OldDocumentType;
      │                        ^^^^^^^^^^^^^^^
```

### Schema Usage Example

```
$ pnpm biome lint

src/validation.ts
  warn: Validation result should be checked.
        Use 'if (result.valid)' or handle 'result.errors'.
   10 │ const result = validateWithSchema(content, schema);
      │       ^^^^^^

src/schemas/blog.ts
  error: Standard Schema must include 'version' and 'name' fields.
   15 │ const blogSchema = {
      │       ^^^^^^^^^^
```

## Limitations

**Current version of Biome (2.x) plugins are diagnostic-only.**

- ✅ Detects issues and provides helpful messages
- ❌ Cannot automatically fix issues (no auto-fix support yet)

You need to manually update the code based on the diagnostics.

**Future versions** of Biome may support automatic fixes for these patterns.

## Writing Custom Plugins

You can extend FieldTest's Biome plugins or create your own. See the [Biome plugin documentation](https://biomejs.dev/linter/plugins/) for GritQL syntax.

### Example: Custom Rule

**grit-plugins/custom-rule.grit:**

```grit
language js

pattern my_custom_check() {
  `myCustomFunction()` where {
    register_diagnostic(
      message = "Custom rule: Consider using a different approach",
      severity = "hint"
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

## CI Integration

Add Biome linting to your CI pipeline:

### GitHub Actions

```yaml
name: Lint

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm biome lint
```

## Severity Levels

Biome diagnostics have different severity levels:

| Severity | Description | Example |
|----------|-------------|---------|
| `error` | Must be fixed | Outdated type names |
| `warn` | Should be fixed | Legacy imports |
| `info` | Informational | Non-standard naming |
| `hint` | Suggestion | Code improvements |

## Troubleshooting

### Plugin Not Running

**Issue:** Biome doesn't show plugin diagnostics

**Solutions:**

1. Check plugin paths in `biome.json` are correct
2. Ensure `.grit` files are in the right location
3. Run `pnpm biome lint` with `--verbose` flag

### False Positives

**Issue:** Plugin flags valid code

**Solution:** File an issue or adjust the plugin pattern. You can temporarily disable specific rules:

```json
{
  "plugins": [
    // Comment out to disable
    // "./grit-plugins/schema-usage.grit"
  ]
}
```

### Performance

**Issue:** Linting is slow with plugins

**Solution:** Run plugins only on specific directories:

```bash
pnpm biome lint src/ packages/
```

## Learn More

- 📖 [Biome Plugin Documentation](https://biomejs.dev/linter/plugins/)
- 📚 [FieldTest Migration Guide](../MIGRATION.md)
- 🎓 [Biome Integration Guide](../docs/guides/biome-integration.md)
- 💡 [GritQL Syntax](https://docs.grit.io/)

## Contributing

Found a pattern that should be checked? Submit a pull request with:

1. New `.grit` file in this directory
2. Tests for the pattern
3. Documentation of what it catches

See [CONTRIBUTING.md](../CONTRIBUTING.md) for details.
