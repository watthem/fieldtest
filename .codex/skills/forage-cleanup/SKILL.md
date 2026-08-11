---
name: "forage-cleanup"
description: "Perform repo necropsy: analyze dirty or abandoned projects, group changes into story-shaped commits, and leave a readable recovery map."
user-invokable: true
metadata:
  version: 2026.04.26
  channel: DEV
  protocol_version: "0.1"
  reads: ["coordination/ACT.md", "coordination/ACT/*", "index/active_facts.json", "tickets/*"]
  writes: ["coordination/SYNC/*"]
  idempotent: false
---

# Forage Cleanup

Repo necropsy for old projects, sporadic brain dumps, abandoned working trees, and migration leftovers.

## Trigger

- `/forage-cleanup`
- "Clean up this old project"
- "Group this dirty git tree"
- "Prepare this abandoned repo for new work"
- "Turn this brain dump into semantic commits"

## Role

Act as both librarian and coder.

As librarian, preserve provenance: infer intent, classify material, label uncertainty, and leave a trail that another agent can understand later.

As coder, inspect real diffs, verify what can be verified, avoid destructive shortcuts, and create commits that make the project history tell a coherent story.

## Operating Principle

The goal is not to make the project look finished. The goal is to convert an ambiguous dirty tree into a clean, readable archive of what was found, what changed, and what remains uncertain.

Every commit should answer:

- What kind of work was this?
- Why are these files grouped together?
- What confidence do we have about the project state?
- What should the next agent inspect first?

## Behavior

1. Find the repository root and check `git status --short`.
2. If a `.forage/` directory exists, read session context before touching files:
   - Prefer `.forage/coordination/ACT.md`.
   - Otherwise read the newest `.forage/coordination/ACT/*.md`.
   - Read `.forage/index/active_facts.json` when present.
3. Build a necropsy inventory without staging anything:
   - `git status --short`
   - `git diff --stat`
   - `git diff --name-status`
   - `git ls-files --others --exclude-standard`
   - `git log --oneline -12`
4. Classify the dirty tree into evidence groups:
   - Feature or behavior changes.
   - Refactors and file moves.
   - Dependency, lockfile, build, or tooling changes.
   - Generated artifacts, caches, exports, or compiled output.
   - Documentation, notes, sketches, and planning files.
   - Secrets, local environment files, machine state, and disposable junk.
5. Inspect each candidate group with targeted diffs before staging:
   - Use `git diff -- <path>` for tracked files.
   - Use file reads for untracked text files.
   - Use `git diff --cached` after staging each group.
6. Create semantic commits one group at a time.
7. Stop and report ambiguity instead of guessing when a group might include secrets, destructive deletes, or unrelated user work.
8. End with a project state assessment and the next smallest recovery action.

## Grouping Rules

Never use `git add .`, `git add -A`, or broad wildcard staging during necropsy.

Use this grouping priority:

1. Intent: files clearly serving the same feature, fix, refactor, migration, or documentation effort.
2. Boundary: files under the same module, package, app, service, or domain.
3. Change type: source, tests, docs, dependencies, config, generated output, local environment.
4. Confidence: keep uncertain or suspicious files isolated so future readers can discard or inspect them cleanly.

Prefer smaller commits when the story is unclear. A readable six-commit archive is better than one undifferentiated dump.

## Commit Message Format

Use archival messages unless the group is clearly finished and verified.

```text
wip(<scope>): archive <plain-language summary>

Necropsy:
- Grouping rationale: <why these files belong together>
- Evidence: <commands, tests, or files inspected>
- Assumed state: <working | partial | broken | unknown>
- Next reader: <what to inspect first>
```

Use `chore(<scope>): archive <summary>` for tooling, generated metadata, and repository hygiene.

Use `docs(<scope>): archive <summary>` for notes and documentation.

Do not use a confident fix or feature prefix unless the behavior was verified.

## Hygiene Rules

- Treat secrets as contamination. Do not commit `.env`, credentials, tokens, private keys, local database dumps, or machine-specific state.
- If junk patterns are missing from `.gitignore`, stage a focused `.gitignore` update as its own commit.
- Do not delete untracked files with `git clean` unless the operator explicitly requested deletion.
- Do not rewrite, squash, rebase, amend, or reorder existing commits unless explicitly requested.
- Do not hide uncertainty. Record it in the commit body or final assessment.
- Do not run formatters across the repo unless formatting is the explicit group being archived.

## Verification

Run the lightest useful checks after commits are created:

1. Detect the project stack from files such as `package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`, or `Makefile`.
2. Prefer declared project commands:
   - `npm test`, `npm run build`, or `npm run typecheck` for Node projects when present.
   - Equivalent local test or build commands for other stacks.
3. If checks are expensive, missing, or expected to fail, say so and capture the reason.

Verification failure does not invalidate archival commits. It becomes part of the project state assessment.

## Final Output

Report:

- Commits created, with one-line rationale for each.
- Files intentionally left uncommitted and why.
- Suspected project state: active feature, migration, dependency churn, experiment, abandoned draft, or unknown.
- Verification commands run and results.
- Recommended next action for future development.

Keep the assessment factual. Avoid shame language about old work.
