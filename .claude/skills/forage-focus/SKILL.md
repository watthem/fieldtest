---
name: forage-focus
description: Session start ritual. Read context, show what matters, get into flow.
user-invokable: true
metadata:
  version: 2026.04.23
  channel: DEV
  protocol_version: "0.1"
  reads: ["index/active_facts.json", "tickets/*", "context/*"]
  writes: []
  idempotent: true
---

# Forage Focus

Session start. Read context, show what matters, get into flow.

## Trigger

`/forage focus`

## Behavior

1. Read context documents, skipping silently if missing:
   - `MENTAL-MODEL.md`
   - `UPSKILL.md`
   - `.forage/context/*`
2. Read `.forage/index/active_facts.json`.
3. Check `git status --short`.
4. Display a session brief with context, active work, branch, and modified-file count.
5. End with ONE recommended action.

## Rules

- Read-only. Does not modify files.
- If a context document does not exist, skip it silently.
- Prefer durable repo state over chat memory.
