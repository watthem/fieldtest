# @fieldtest/doc-ref

Doc-driven testing tool with executable specifications support. Concordion-style testing for TypeScript.

## Features

- **Doc Reference Pattern**: Tests reference documentation, ensuring links and specs stay in sync
- **Executable Specifications**: Documentation that IS the test (Concordion-style)
- **Vitest Integration**: First-class support for Vitest test runner
- **Markdown Parsing**: Extract tables, code examples, and assertions from specs

## Installation

```bash
pnpm add @fieldtest/doc-ref
```

## Quick Start

### Doc Reference Pattern

Link tests to documentation sections:

```typescript
import { linkedDescribe, testFromTable } from '@fieldtest/doc-ref/vitest';

linkedDescribe('docs/api.md#authentication', 'Auth API', (spec) => {
  it('validates tokens correctly', () => {
    // spec.targetSection contains the documentation
    expect(spec.targetSection).toBeDefined();
  });

  // Generate tests from markdown tables
  testFromTable(spec.targetSection?.tables[0], (row, headers) => {
    const input = row[0];
    const expected = row[1];
    expect(process(input)).toBe(expected);
  });
});
```

### Executable Specifications

Documentation that IS the test:

```typescript
import { createFixtureRegistry, runSpec } from '@fieldtest/doc-ref/executable';

// Create fixture registry
const registry = createFixtureRegistry();

// Register fixtures
registry.register('pricing', (ctx) => {
  const quantity = Number(ctx.inputs.quantity);
  const unitPrice = Number(ctx.inputs.unitPrice);
  return {
    total: `$${(quantity * unitPrice).toFixed(2)}`,
    discount: quantity > 10 ? '10%' : '0%'
  };
});

// Run spec - markdown contains inline bindings
const result = await runSpec('docs/pricing.md#examples', registry);
console.log(`${result.passed}/${result.passed + result.failed} assertions passed`);
```

**Example Markdown Spec:**

```markdown
# Pricing Specification

## Examples

| Quantity | Unit Price |
|----------|------------|
| [2](!set:quantity) | [$10.00](!set:unitPrice) |

After calculation, the total should be [$20.00](!verify:total).
```

## Inline Binding Syntax

Concordion-style bindings use the format `[value](!command:field)`:

- `[100](!set:quantity)` - Sets `inputs.quantity = "100"`
- `[$20.00](!verify:total)` - Verifies output `total` equals `"$20.00"`
- `[calculate](!execute:pricing)` - Runs the `pricing` fixture

## API Reference

### Main Entry (`@fieldtest/doc-ref`)

```typescript
import {
  parseInlineBindings,
  extractTables,
  extractCodeExamples,
  extractAssertions,
  parseMarkdownSections,
  loadSpec,
  specSection,
} from '@fieldtest/doc-ref';
```

### Vitest Entry (`@fieldtest/doc-ref/vitest`)

```typescript
import {
  linkedDescribe,
  testFromTable,
  testFromExamples,
  validateDocLinks,
  testAssertions,
} from '@fieldtest/doc-ref/vitest';
```

### Executable Entry (`@fieldtest/doc-ref/executable`)

```typescript
import {
  createFixtureRegistry,
  runSpec,
  SpecRunner,
  createSpecRunner,
} from '@fieldtest/doc-ref/executable';
```

## SpecRunner Fluent API

```typescript
import { createSpecRunner } from '@fieldtest/doc-ref/executable';

const runner = createSpecRunner()
  .basePath('docs/')
  .throwOnMissing(false)
  .fixture('add', (ctx) => Number(ctx.inputs.a) + Number(ctx.inputs.b))
  .fixture('multiply', (ctx) => Number(ctx.inputs.a) * Number(ctx.inputs.b));

const results = await runner.runAll([
  'arithmetic.md#addition',
  'arithmetic.md#multiplication',
]);
```

## License

MIT
