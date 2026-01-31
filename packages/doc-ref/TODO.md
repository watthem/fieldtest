# TODO - @fieldtest/doc-ref

## Immediate (Next Session)

### CLI Enhancement
- [ ] Add `--execute` flag to run specs from command line
- [ ] Add `--fixtures` flag to specify fixture file
- [ ] Output format options: `--format json|text|html`
- [ ] Exit code reflects pass/fail for CI integration

```bash
# Target usage:
doc-ref --execute docs/pricing.md --fixtures ./fixtures.ts
doc-ref --execute docs/*.md --format json > results.json
```

### Watch Mode
- [ ] `doc-ref --watch` re-runs on spec changes
- [ ] `doc-ref --watch --fixtures` also watches fixture file
- [ ] Integration with vitest watch mode?

### HTML Reports (Concordion-style)
- [ ] Generate HTML from spec with pass/fail highlighting
- [ ] Green background on passing `!verify:` bindings
- [ ] Red background + actual value on failures
- [ ] Summary stats at top

## Short Term

### Testing & Validation
- [ ] Write a real spec for `@fieldtest/core` using this tool (dogfooding)
- [ ] Add integration test that runs full spec → report flow
- [ ] Test with malformed markdown (error handling)
- [ ] Test with missing fixtures (graceful failure)

### Documentation
- [ ] Add examples to main FieldTest docs site
- [ ] Tutorial: "Your First Executable Spec"
- [ ] Comparison with other spec tools (Cucumber, etc.)

### Developer Experience
- [ ] VS Code extension for syntax highlighting `(!cmd:field)`
- [ ] Snippet support for common patterns
- [ ] Hover preview of binding meaning

## Medium Term

### MCP Integration
- [ ] Add `doc-ref` tools to MCP server
- [ ] `run_spec` tool for AI to execute specs
- [ ] `validate_spec` tool to check spec syntax
- [ ] `suggest_fixtures` tool to generate fixture stubs

### Framework Examples
- [ ] Astro example: spec-driven content validation
- [ ] Next.js example: API spec testing
- [ ] Add to `packages/examples/`

### Advanced Features
- [ ] Table-driven specs (each row = separate test context)
- [ ] Spec composition (`!include:other-spec.md#section`)
- [ ] Before/after hooks for setup/teardown
- [ ] Parameterized fixtures

## Long Term / Ideas

### Bi-directional Sync
- [ ] Generate fixture stubs from spec bindings
- [ ] Detect unused fixtures
- [ ] Suggest spec updates when fixtures change

### Spec Coverage
- [ ] Track which code paths specs exercise
- [ ] Report on "specification coverage"
- [ ] Identify undocumented behavior

### AI-Assisted Workflow
- [ ] AI reads failing spec, suggests fixture implementation
- [ ] AI reviews spec for completeness
- [ ] Spec → code generation pipeline

## Won't Do (Explicitly Out of Scope)

- **Gherkin syntax** - We're markdown-native, not Given/When/Then
- **Database fixtures** - That's the user's fixture code responsibility
- **UI testing** - This is for logic/behavior specs, not E2E
- **Spec editor GUI** - Markdown editors already exist
