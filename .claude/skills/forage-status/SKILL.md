---
name: forage-status
description: Show all active tickets grouped by pipeline, or detail for one ticket.
user-invokable: true
metadata:
  version: 2026.04.23
  channel: DEV
  protocol_version: "0.1"
  reads: ["index/active_facts.json", "tickets/<id>.md"]
  writes: []
  idempotent: true
---

# Forage Status

Read-only view of active work.

## Trigger

- `/forage status` -> overview of all active tickets.
- `/forage status <id>` -> full detail for one ticket.

## Behavior: Overview

1. Read `.forage/index/active_facts.json`.
2. Group by pipeline, then by stage.
3. Display active count, stage, short ID, title, priority, and channel.

## Behavior: Detail

1. Resolve ID using forgiving input.
2. Read `.forage/tickets/<id>.md`.
3. Read matching facts from `index/active_facts.json`.
4. Display frontmatter, body, stage history, and accumulated active facts.
