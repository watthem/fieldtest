---
name: "forage-approve"
description: "Review a completed ticket or handoff and record approval or requested changes."
user-invokable: true
metadata:
  version: 2026.04.23
  channel: DEV
  protocol_version: "0.1"
  reads: ["tickets/<id>.md", "coordination/SYNC/*", "index/active_facts.json"]
  writes: ["tickets/<id>.md", "coordination/SYNC/*"]
  router_calls: [emit_validated_fact, set_stage]
  idempotent: false
---

# Forage Approve

Review a completed ticket or handoff.

## Trigger

`/forage-approve <id>`

## Behavior

1. Resolve and read the ticket.
2. Read recent SYNC/FIN packets that mention the ticket.
3. Verify acceptance criteria against concrete evidence.
4. Run or inspect quality/test evidence.
5. If accepted, emit an approval fact and move the ticket to the next review/done stage.
6. If changes are needed, append requested changes with file paths and keep the ticket active.

## Rules

- Findings first, ordered by severity.
- Approval requires evidence, not confidence.
- If ownership is unclear, ask "Who is owning this and by when?"
