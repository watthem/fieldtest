---
name: forage-triage
description: Classify work as SELF/HUMAN/EXTERNAL after reading the dispatch board.
user-invokable: true
metadata:
  version: 2026.04.23
  channel: DEV
  protocol_version: "0.1"
  reads: ["index/active_facts.json", "coordination/HANDSHAKE/*"]
  writes: ["coordination/ACT/*"]
  idempotent: true
---

# Forage Triage

Classify pending work into actionable categories.

## Trigger

`/forage-triage`

## Behavior

1. Read `.forage/index/active_facts.json`.
2. Read `.forage/coordination/HANDSHAKE/`.
3. Classify each pending item:
   - `[SELF]`: this session can make progress now.
   - `[HUMAN]`: needs human judgment, credentials, or approval.
   - `[EXTERNAL]`: blocked on another agent or service.
4. Display a triage board with active counts.
5. Recommend the highest-priority `[SELF]` item if one exists.

## After Triage

- Starting a `[SELF]` task requires a claim file in `coordination/ACT/`.
- This prevents duplicate pickup by other agents.
