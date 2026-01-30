# @fieldtest/doc-ref

> Doc-driven testing validation - ensure tests reference documentation and those references are valid.

## The Problem

Documentation and tests often drift apart. Tests claim to validate behavior described in docs, but:
- The doc file was renamed or deleted
- The referenced line numbers changed after edits
- The section heading was reworded

## The Solution

`@fieldtest/doc-ref` scans your test files for documentation references and validates they point to real, existing content.

## Installation

```bash
npm install @fieldtest/doc-ref
# or
pnpm add @fieldtest/doc-ref
```

## Quick Start

```typescript
import { generateReport, formatReport } from '@fieldtest/doc-ref';

const report = await generateReport('./my-project');
console.log(formatReport(report));
```

## Doc Reference Patterns

Add references in your test files using these patterns:

```javascript
// DOC: comment (recommended - most explicit)
/**
 * DOC: docs/public/reference/api.md
 * Section: Rate Limits
 */
describe("Rate Limits", () => {
  // ...
});

// Parenthesized path in test descriptions
describe("Rate Limits (docs/public/reference/api.md)", () => {
  // ...
});

// Line reference
it("returns 1 for identical vectors (reference.md:207)", () => {
  // ...
});

// Line range
describe("Feature A (docs/reference.md:206-209)", () => {
  // ...
});

// Section anchor
describe("TF-IDF behavior (explainer.md#how-tfidf-works)", () => {
  // ...
});
```

### Supported Patterns

| Pattern | Example | Use Case |
|---------|---------|----------|
| `DOC:` comment | `DOC: docs/api.md` | Explicit doc reference in JSDoc |
| Parenthesized path | `(docs/api.md)` | In describe/it strings |
| Line reference | `api.md:207` | Link to specific line |
| Line range | `api.md:206-209` | Link to line range |
| Anchor reference | `api.md#auth` | Link to heading/section |

### Nested Paths

All patterns support nested directory paths:
- `docs/public/reference/api.md`
- `docs/guides/setup.md#installation`
- `docs/public/api.md:50-75`

## API

### `generateReport(projectDir, options?)`

Generate a full validation report for a project.

```typescript
const report = await generateReport('./my-project', {
  testPatterns: ['**/*.test.ts'],
  docsDir: 'docs',
  validateLines: true,
  validateAnchors: true,
});
```

Returns a `ValidationReport`:

```typescript
interface ValidationReport {
  projectDir: string;
  totalRefs: number;
  validRefs: number;
  invalidRefs: number;
  results: ValidationResult[];
  coverage: DocCoverage[];
  orphanedDocs: string[];
  testsWithoutRefs: string[];
}
```

### `scanDocReferences(projectDir, options?)`

Scan test files for doc references without validating.

```typescript
const refs = await scanDocReferences('./my-project');
// Returns: DocReference[]
```

### `validateReferences(references, projectDir, options?)`

Validate an array of doc references.

```typescript
const results = validateReferences(refs, './my-project');
// Returns: ValidationResult[]
```

### `formatReport(report)`

Format a report as a human-readable string.

```typescript
console.log(formatReport(report));
```

## Options

```typescript
interface DocRefOptions {
  // Glob patterns for test files
  testPatterns?: string[];  // default: ["**/*.test.{js,ts}", "**/*.spec.{js,ts}"]

  // Directory containing docs
  docsDir?: string;  // default: "docs"

  // Doc file extensions
  docExtensions?: string[];  // default: [".md"]

  // Validate line numbers exist
  validateLines?: boolean;  // default: true

  // Validate anchor references
  validateAnchors?: boolean;  // default: true
}
```

## Example Output

```
=== Doc-Test Validation Report ===

Project: /path/to/my-project
Total References: 22
Valid: 22
Invalid: 0

Doc Coverage:
  reference.md: 20 refs (covered)
  explainer.md: 2 refs (covered)
  tutorial.md: 0 refs (orphan)

Orphaned Docs (no test references): 1

Tests Without Doc References: 3
```

## CI Integration

Add to your CI pipeline to catch doc-test drift:

```typescript
import { generateReport } from '@fieldtest/doc-ref';

const report = await generateReport('.');

if (report.invalidRefs > 0) {
  console.error(`Found ${report.invalidRefs} invalid doc references`);
  process.exit(1);
}

console.log(`All ${report.validRefs} doc references are valid`);
```

## Why Doc-Driven Testing?

1. **Living Documentation** - Docs stay accurate because tests enforce them
2. **Traceability** - Every test traces back to a documented behavior
3. **Coverage Visibility** - See which docs have test coverage
4. **Drift Detection** - Catch when docs and tests diverge

## License

MIT
