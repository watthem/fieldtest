---
name: forage-end
description: Session wrap-up. Commit work, emit events, write FIN coordination packet.
user-invokable: true
metadata:
  version: 2026.04.23
  channel: DEV
  protocol_version: "0.1"
  reads: ["index/active_facts.json", "coordination/ACT/*"]
  writes: ["coordination/ACT/*", "coordination/SYNC/*"]
  router_calls: [emit_validated_fact]
  idempotent: false
---

# Forage End

Session wrap-up. Commit, update state, close coordination.

## Trigger

`/forage-end`

## Behavior

1. Check `git status --short`.
2. Stage and commit intentional work only, unless the operator asked not to commit.
3. Review touched tickets and emit a session-ended fact for each.
4. Write a FIN packet to `.forage/coordination/ACT/` or update `.forage/coordination/ACT.md` depending on repo layout.
5. Append a session summary to `.forage/coordination/SYNC/` when that directory exists.
6. Output tickets touched, commits created, events logged, and unfinished owners.

## Rules

- Always ask: "Who is owning [Task X] and by when?" for unfinished work.
- Flag orphan tasks with `[ORPHAN]`.
- Never leave implicit work. If it is not in the ledger or ticket history, it did not happen.
