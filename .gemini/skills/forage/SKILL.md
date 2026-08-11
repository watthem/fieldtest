---
name: "forage"
description: "Show ONE next action from the active facts index. Entry point for all forage work."
user-invokable: true
metadata:
  version: 2026.04.23
  channel: DEV
  protocol_version: "0.1"
  reads: ["index/active_facts.json"]
  writes: []
  idempotent: true
---

# Forage

One entry point. One next action. No wall of options.

## Trigger

`/forage`

## Behavior

1. Find the nearest `.forage/` directory from the current working directory.
2. Read `.forage/index/active_facts.json`.
3. Pick ONE next action using this priority:
   - P0 first, then P1, P2, P3.
   - Within the same priority, tickets closest to terminal stage first.
   - Within the same stage, oldest `updated` timestamp first.
4. Display 2-3 lines maximum:

```
DEV-009 "Fix webhook retry logic"      build  P1  [DEV]
  3 active tickets across dev, support
```

5. If no active tickets exist:

```
No active tickets. Use /forage new <type> <title> to create one.
```

## Progressive Disclosure

- `/forage` -> one next action.
- `/forage status` -> all active tickets grouped by pipeline.
- `/forage status <id>` -> full detail for one ticket.

## Language Rules

- Never say "overdue", "stale", "behind", or "you should".
- State facts: the ticket, its stage, and the count.
- Include channel tag `[DEV]`, `[BETA]`, or `[STABLE]`.
