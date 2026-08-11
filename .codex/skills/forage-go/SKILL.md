---
name: "forage-go"
description: "Resume work in a Forage repo by reading ACT, active tickets, and git state."
user-invokable: true
metadata:
  version: 2026.04.23
  channel: DEV
  protocol_version: "0.1"
  reads: [active.json, "items/*", "coordination/ACT.md", "coordination/ACT/*", "index/active_facts.json"]
  writes: []
  idempotent: true
---

# Forage Go

Resume a session in a Forage-enabled repo.

## Trigger

`/forage-go`

## Behavior

1. Find the nearest `.forage/` directory.
2. Read the active coordination file:
   - Prefer `.forage/coordination/ACT.md`.
   - Otherwise read the newest `.forage/coordination/ACT/*.md`.
3. Read active work from `.forage/active.json` or `.forage/index/active_facts.json`.
4. Read the referenced ticket or item file.
5. Check `git status --short`.
6. Output the current mission, active item, dirty-state summary, and next smallest action.

## Rules

- Do not implement before reading ACT and the active ticket.
- If ACT and active indexes disagree, report the mismatch and use ACT as the session authority.
- Keep the output short enough to paste into a new agent session.
