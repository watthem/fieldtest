---
name: forage-stage
description: Set an explicit ticket stage and append a stage-history note.
user-invokable: true
metadata:
  version: 2026.04.23
  channel: DEV
  protocol_version: "0.1"
  reads: ["index/active_facts.json", "tickets/<id>.md"]
  writes: ["tickets/<id>.md"]
  router_calls: [set_stage]
  idempotent: false
---

# Forage Stage

Set an explicit stage for a ticket.

## Trigger

`/forage stage <id> <stage>`

## Behavior

1. Resolve the ticket ID.
2. Validate the target stage against the pipeline.
3. Call `forage-router set_stage`.
4. Update ticket frontmatter and append a stage-history note.
5. If the stage is terminal, set `resolved_at`.
6. Output the ticket, previous stage, target stage, and channel.

## Rules

- Use this for explicit operator-directed moves or blocking.
- Do not invent completion evidence. If evidence is missing, say what is missing.
