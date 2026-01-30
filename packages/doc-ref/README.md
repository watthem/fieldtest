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

## Two Modes of Use

This tool supports two complementary workflows:

### 1. Doc → Test Validation
Validate that your documentation is structured correctly and contains expected content.

```typescript
import { getSections, parseMarkdownFile } from '@fieldtest/doc-ref';

// Check that install guide has platform sections
const sections = getSections('docs/install.md');
const titles = sections.map(s => s.title.toLowerCase());
expect(titles.some(t => t.includes('linux'))).toBe(true);
```

### 2. Test → Doc Linking
Ensure tests reference real documentation and those references stay valid.

```typescript
import { generateReport } from '@fieldtest/doc-ref';

// Validate all DOC: references in test files point to real docs
const report = await generateReport('./my-project');
if (report.invalidRefs > 0) {
  console.error(`${report.invalidRefs} broken doc references`);
}
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

## Quick Reference

### Type Signatures

```typescript
// Markdown parsing - these take file paths, not ParsedDoc objects
function parseMarkdownFile(filePath: string): ParsedDoc
function parseMarkdown(content: string): ParsedDoc      // For raw strings
function getSections(filePath: string): DocSection[]    // Convenience wrapper
function getSection(filePath: string, anchor: string): DocSection | undefined
function hasAnchor(filePath: string, anchor: string): boolean

// Report generation
function generateReport(projectDir: string, options?: DocRefOptions): Promise<ValidationReport>
function formatReport(report: ValidationReport): string

// Low-level scanning
function scanDocReferences(projectDir: string, options?: DocRefOptions): Promise<DocReference[]>
function validateReferences(refs: DocReference[], projectDir: string): ValidationResult[]
```

### Key Types

```typescript
interface ParsedDoc {
  sections: Map<string, DocSection>;  // Keyed by slug
  anchors: string[];                   // All section slugs
  lineCount: number;
}

interface DocSection {
  title: string;      // Original heading text
  slug: string;       // URL-friendly anchor
  level: number;      // 1-6 for markdown, 0 for HTML id
  line: number;       // Line number in file
  content: string;    // Section text (excluding heading)
  examples: CodeExample[];
  assertions: DocAssertion[];
}
```

## Common Patterns

### Validate doc structure exists

```typescript
import { getSections } from '@fieldtest/doc-ref';

const sections = getSections('docs/api.md');
expect(sections.some(s => s.title === 'Authentication')).toBe(true);
```

### Check for required platform sections

```typescript
import { getSections } from '@fieldtest/doc-ref';

const sections = getSections('docs/install.md');
const titles = sections.map(s => s.title.toLowerCase());

expect(titles.some(t => t.includes('linux'))).toBe(true);
expect(titles.some(t => t.includes('macos'))).toBe(true);
expect(titles.some(t => t.includes('windows'))).toBe(true);
```

### Validate internal links

```typescript
import { parseMarkdownFile } from '@fieldtest/doc-ref';
import * as fs from 'fs';
import * as path from 'path';

const docsDir = 'docs';
const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.md'));

for (const file of files) {
  const content = fs.readFileSync(path.join(docsDir, file), 'utf-8');
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    const [, , linkPath] = match;
    if (linkPath.startsWith('/') || linkPath.startsWith('./')) {
      const resolved = path.resolve(docsDir, linkPath.replace(/^\//, ''));
      expect(fs.existsSync(resolved)).toBe(true);
    }
  }
}
```

### Extract and test code examples

```typescript
import { getSections } from '@fieldtest/doc-ref';

const sections = getSections('docs/api.md');
const authSection = sections.find(s => s.slug === 'authentication');

// Verify examples exist
expect(authSection?.examples.length).toBeGreaterThan(0);

// Get the first code example
const example = authSection?.examples[0];
expect(example?.lang).toBe('typescript');
```

### Link tests to doc sections

```typescript
// DOC: docs/api.md#rate-limits
describe('Rate Limits', () => {
  it('enforces 100 requests per minute', () => {
    // Test implementation tied to documented behavior
  });
});
```

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
