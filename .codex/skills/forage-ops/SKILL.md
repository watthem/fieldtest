---
name: "forage-ops"
description: "Inspect Forage control-plane health, indexes, ledgers, and skill drift."
user-invokable: true
metadata:
  version: 2026.04.23
  channel: DEV
  protocol_version: "0.1"
  reads: [config.json, active.json, "index/*", "ledger/*", "skills/*"]
  writes: []
  idempotent: true
---

# Forage Ops

Inspect control-plane health.

## Trigger

`/forage-ops`

## Behavior

1. Find `.forage/` and report whether legacy and v0.1 layouts are present.
2. Check JSON files parse:
   - `.forage/config.json`
   - `.forage/active.json`
   - `.forage/index/*.json`
3. Check ledger files are append-only NDJSON and parse line by line.
4. Run `forage-router skills:check` when available.
5. Report active-ticket count, resolved-ticket count, and any drift or parse failures.

## Rules

- Read-only by default.
- Prefer exact file paths and command outputs over narrative guesses.
