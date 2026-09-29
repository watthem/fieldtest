# AGENTS.md

FieldTest is a TypeScript pnpm/Turborepo monorepo for validating Markdown front matter and documents against Standard Schema. Published packages: `@fieldtest/core` (parser and checks), `@fieldtest/registry` (schema registry). Other packages under `packages/` are satellites or examples. Front matter is parsed as YAML only and is never executed.

## Commands (Node 20+, pnpm)

```bash
pnpm install --frozen-lockfile
pnpm build   # turbo, all packages
pnpm test    # turbo, all packages
pnpm --filter @fieldtest/core --filter @fieldtest/registry lint   # tsc, same as CI
```

CI runs build, lint and test on Node 20 and 22 (`.github/workflows/ci.yml`).

## Testing rules

- Commit a new test only when its absence could let a real security, money, or data-loss bug ship unseen. Otherwise verify by running the thing and report what you saw.
- Do not write unit tests after the code just to confirm it works. For a complex feature: one end-to-end happy path and one sad path; unit tests only for real edge cases.
- Never test what the type system, linter, or schema already guarantees.
- Existing tests stay. Never edit a test to make it pass.

## Security

Never add a parser with executable front-matter engines (`gray-matter` defaults, `---js`). Use `parseDocument`, which rejects non-YAML fences. Keep the payload regression test in `packages/core/tests/security.test.ts`.

## Where work is tracked

GitHub issues and Projects on `watthem/fieldtest`. Forage was retired on 2026-09-24; do not use or recreate Forage skills, tickets, or `.forage/` state.

## Code Review Rules

When reviewing a PR, flag:

- Any executable front-matter engine or custom YAML tag enabled in a parser (for example `gray-matter` with default engines, `eval`-style loaders).
- zod peer-dependency drift: `@fieldtest/core` and `@fieldtest/registry` use zod 4; a package pinning a different zod major, or making zod a hard dependency of core, needs justification.
- Breaking changes to exported API (`packages/core/src/index.ts` and other package entry points) without a `CHANGELOG.md` entry.
