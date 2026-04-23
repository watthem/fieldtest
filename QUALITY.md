# Quality Gates

Fieldtest already has Biome and Turbo scripts. This repo-level gate standardizes how agents should run them and adds report-only codebase analysis.

Run the standard gate:

```bash
node scripts/quality-check.mjs
```

Run deeper report-only analysis:

```bash
node scripts/quality-check.mjs --analysis
```

Watch local changes continuously:

```bash
node scripts/quality-watch.mjs
```

The standard gate runs Biome, then existing lint/test/docs-validation scripts when present. `--analysis` adds Fallow and Knip.

Do not apply Fallow or Knip fixes automatically in this monorepo. Review unused-file and unused-export findings package by package first.
