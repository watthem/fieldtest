# Progress Log - @fieldtest/doc-ref

## Session: 2025-01-31

### What We Built

Created the complete `@fieldtest/doc-ref` package from scratch - a doc-driven testing tool with Concordion-style executable specifications.

### Files Created

```
packages/doc-ref/
├── package.json              # Package config with 3 entry points
├── tsconfig.json             # TypeScript config
├── tsup.config.ts            # Build config (CJS + ESM + DTS)
├── vitest.config.ts          # Test config
├── README.md                 # Package documentation
├── index.ts                  # Main entry: parsing utilities
├── vitest.ts                 # Vitest entry: test helpers
├── executable.ts             # Executable entry: spec runner
├── src/
│   ├── types.ts              # 20+ type definitions
│   ├── markdown.ts           # Parsing: sections, tables, bindings
│   ├── vitest.ts             # linkedDescribe, testFromTable, etc.
│   ├── executable.ts         # createFixtureRegistry, runSpec, SpecRunner
│   └── cli.ts                # Basic CLI (analyze mode)
├── tests/
│   ├── markdown.test.ts      # 26 tests
│   ├── executable.test.ts    # 13 tests
│   └── fixtures/
│       ├── simple.md         # Basic test document
│       └── pricing.md        # Executable spec example
```

### Key Implementations

#### 1. Inline Binding Parser (`parseInlineBindings`)
Extracts Concordion-style bindings from markdown:
```
[value](!set:field)      → Sets input
[value](!verify:field)   → Verifies output
[value](!execute:field)  → Runs fixture
```

#### 2. Fixture Registry (`createFixtureRegistry`)
```typescript
const registry = createFixtureRegistry();
registry.register('pricing', (ctx) => ({
  total: calculateTotal(ctx.inputs)
}));
```

#### 3. Spec Runner (`runSpec`)
Loads spec, executes bindings against fixtures, returns results:
```typescript
const result = await runSpec('docs/spec.md#section', registry);
// { passed: 5, failed: 1, skipped: 0, results: [...], duration: 42 }
```

#### 4. Vitest Integration
- `linkedDescribe()` - Links test suites to doc sections
- `testFromTable()` - Generates tests from markdown tables
- `testFromExamples()` - Tests from code blocks
- `testAssertions()` - Tests from MUST/SHOULD statements

### Test Results

```
✓ tests/executable.test.ts  (13 tests) 32ms
✓ tests/markdown.test.ts    (26 tests) 36ms

Test Files  2 passed (2)
Tests       39 passed (39)
```

### Build Output

```
dist/
├── index.{js,mjs,d.ts}       # Main entry
├── vitest.{js,mjs,d.ts}      # Vitest entry
├── executable.{js,mjs,d.ts}  # Executable entry
└── src/cli.{js,mjs,d.ts}     # CLI entry
```

### Issues Encountered & Solved

1. **Vitest globals not injecting** - Removed explicit `import { describe } from "vitest"` and relied on `globals: true` in config. Vitest 0.34.x has quirky behavior where imported test functions are undefined at collection time.

2. **Module resolution** - Changed `moduleResolution: "bundler"` to `"node"` for compatibility.

### Acceptance Criteria: All Met ✅

- [x] `pnpm --filter @fieldtest/doc-ref build` succeeds
- [x] `pnpm --filter @fieldtest/doc-ref test` passes (39 tests)
- [x] Import from `@fieldtest/doc-ref/executable` works
- [x] Can execute markdown specs with inline bindings

### What's NOT Done Yet

- CLI `--execute` flag (currently only analyzes)
- HTML report generation
- Watch mode
- MCP server integration
- Real-world dogfooding spec

### Commands to Resume

```bash
cd /Users/matthewhendricks/git/oss/@watthem/fieldtest

# Build
pnpm --filter @fieldtest/doc-ref build

# Test
pnpm --filter @fieldtest/doc-ref test

# Try it out
node -e "
const { createFixtureRegistry, runSpec } = require('./packages/doc-ref/dist/executable.js');
const path = require('path');

const registry = createFixtureRegistry();
registry.register('pricing', (ctx) => ({
  total: '\$' + (Number(ctx.inputs.quantity) * 10).toFixed(2)
}));

runSpec(path.join(__dirname, 'packages/doc-ref/tests/fixtures/pricing.md'), registry)
  .then(r => console.log('Result:', r.passed, 'passed,', r.failed, 'failed'));
"
```

---

*Last updated: 2025-01-31 ~00:45 UTC*
