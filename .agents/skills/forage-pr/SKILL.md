---
name: forage-pr
description: Publish completed work by checking scope, committing, pushing, and preparing a PR.
user-invokable: true
metadata:
  version: 2026.04.23
  channel: DEV
  protocol_version: "0.1"
  reads: ["tickets/<id>.md", "index/active_facts.json"]
  writes: ["tickets/<id>.md"]
  router_calls: [emit_validated_fact, set_stage]
  idempotent: false
---

# Forage PR

Publish completed ticket work.

## Trigger

`/forage-pr <id>`

## Behavior

1. Resolve and read the ticket.
2. Check `git status --short` and separate intentional changes from unrelated dirty state.
3. Run the project quality gate if one exists:
   - `node scripts/quality-check.mjs`
   - `python scripts/quality_check.py`
   - otherwise project-specific test commands.
4. Commit intentional changes with a ticket-scoped message.
5. Create branch `ticket/<short-id>-<slug>` if publishing.
6. Push only with explicit approval in environments that require approval.
7. Open or draft a PR when GitHub tooling is available.
8. Add evidence to the ticket and move to publish/review as configured.

## Rules

- Never include unrelated dirty files.
- Never amend commits unless explicitly requested.
- If publishing is blocked, record the blocker and owner.
