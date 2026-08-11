---
name: "forage-feedback"
description: "Score session quality across 4 dimensions after wrap-up."
user-invokable: true
metadata:
  version: 2026.04.23
  channel: DEV
  protocol_version: "0.1"
  reads: ["index/active_facts.json", "coordination/ACT/*", "coordination/SYNC/*"]
  writes: ["coordination/SYNC/*"]
  idempotent: true
---

# Forage Feedback

Capture session quality signal.

## Trigger

`/forage-feedback`

## Behavior

1. Snapshot vitals:
   - `.forage/index/active_facts.json`
   - `git status --porcelain`
   - `git log --oneline -5`
2. Score 4 dimensions:
   - Closure: touched tickets updated; no ghost tasks left implicit.
   - Evidence: meaningful commits and/or ledger events exist.
   - Handshake: coordination state coherent.
   - Memory: durable learnings captured.
3. Append a SYNC entry with timestamp, score, and per-dimension pass/fail.
4. Output one line with score and channel.
