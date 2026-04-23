---
name: forage-new
description: Create a new ticket in any pipeline. Emits initial fact and stage event to the ledger.
user-invokable: true
metadata:
  version: 2026.04.23
  channel: DEV
  protocol_version: "0.1"
  reads: ["index/tickets.json"]
  writes: ["tickets/<id>.md"]
  router_calls: [emit_validated_fact, set_stage]
  idempotent: false
---

# Forage New

Create a new ticket in any enabled pipeline.

## Trigger

`/forage new <type> <title>`

Examples:

- `/forage new dev Add webhook retry logic`
- `/forage new sup Fix login timeout on mobile`

## Behavior

1. Read `.forage/index/tickets.json` to get namespace, counters, and current month.
2. Resolve type:
   - `dev` -> DEV pipeline.
   - `sup` or `support` -> SUP pipeline.
   - Other types as configured.
3. Generate ID: `<namespace>.<TYPE>-<YYYY-MM>-<NNN>`.
4. Create `.forage/tickets/<full-id>.md` with frontmatter, scope, acceptance criteria, and stage history.
5. Call `forage-router emit_validated_fact` for ticket creation.
6. Call `forage-router set_stage` for the initial stage.
7. Output 2-3 lines with ID, title, stage, and channel.

## Validation

- Title must be non-empty.
- Pipeline type must be recognized.
- Counter must only increment.
- Router validates payloads before writing.
