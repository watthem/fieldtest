# Interesting Insights - @fieldtest/doc-ref

## The "Aha" Moment

**Documentation that IS the test** - not documentation that describes tests, but markdown files that *execute* as tests. This flips the usual relationship:

```
Traditional: Code → Tests → Documentation (docs rot)
Concordion:  Documentation → Executable Specs → Verified behavior (docs stay true)
```

## Why This Matters

### 1. Living Documentation
When your spec file says `[$20.00](!verify:total)` and that assertion runs on every CI build, you *know* the docs are accurate. No more "the docs say X but the code does Y."

### 2. Business-Readable Tests
Product managers can read and even *write* specs:

```markdown
## Pricing Rules

When a customer orders [15](!set:quantity) items at [$5.00](!set:unitPrice),
they should receive a [10%](!verify:discount) discount,
making the total [$67.50](!verify:total).
```

That's a test. It's also documentation. It's also a requirement.

### 3. The Binding Syntax is Elegant

```
[value](!command:field)
```

- Looks like a markdown link (renders nicely)
- The `!` prefix signals "this is executable"
- Three commands cover all cases: `set`, `verify`, `execute`

## Design Decisions Worth Remembering

### Fixture Context Accumulation
Inputs accumulate through `!set:` bindings, so you can spread setup across natural prose:

```markdown
Given a quantity of [5](!set:quantity) items
at a unit price of [$10.00](!set:unitPrice)...
```

Both values are available in `ctx.inputs` when the fixture runs.

### Section Targeting with Anchors
`docs/spec.md#examples` loads the whole file but targets just that section. This lets you:
- Run subset of specs during development
- Organize large specs into logical sections
- Link tests directly to relevant documentation

### Async-First Design
All fixtures can be async - important for testing real systems:

```typescript
registry.register('createUser', async (ctx) => {
  const user = await db.users.create(ctx.inputs);
  return { id: user.id, email: user.email };
});
```

## The Concordion Heritage

This pattern comes from [Concordion](https://concordion.org/) (Java) and similar tools like:
- **Cucumber** - but Gherkin syntax is more rigid
- **FitNesse** - wiki-based, heavier weight
- **Gauge** - markdown specs but different binding approach

Our approach is lighter - just markdown with inline bindings, no special syntax beyond the `[value](!cmd:field)` pattern.

## Potential for AI Integration

Executable specs are *perfect* for AI-assisted development:

1. **AI writes spec** from requirements conversation
2. **Human reviews** readable markdown
3. **AI implements** fixtures to make spec pass
4. **Spec becomes** permanent documentation

The spec is the contract between human intent and machine implementation.

## Questions to Explore

- Could we auto-generate fixture stubs from specs?
- What about bi-directional sync (spec changes → code suggestions)?
- How do we handle spec versioning alongside code versioning?
- Can specs reference other specs? (spec composition)
