---
name: forage-next
description: Advance a ticket to its next pipeline stage. Appends stage_changed event to ledger.
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

# Forage Next

Advance a ticket to the next stage in its pipeline.

## Trigger

`/forage next <id>`

## Behavior

1. Resolve ID from short or full forms.
2. Read `.forage/tickets/<id>.md`.
3. Determine the next stage from the configured ordered stage list.
4. Call `forage-router set_stage '{"ticket_id":"<full-id>","stage":"<next_stage>"}'`.
5. Update ticket frontmatter: `stage`, `updated`, and `resolved_at` if terminal.
6. Append a stage-history comment explaining what changed.
7. Output the ticket, old stage, new stage, and channel.

## Escape Hatches

- Skip stages when explicit operator direction warrants it.
- Park work with `/forage stage <id> blocked`.
- No judgment language.
