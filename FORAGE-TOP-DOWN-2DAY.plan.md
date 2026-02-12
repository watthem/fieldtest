# Forage Top-Down 2-Day Plan

Repo: `oss/@watthem/fieldtest`
Namespace: `fieldtest`
Enabled Pipelines: `dev`
Window: `Day 1 + Day 2`
Status: `READY_FOR_EXECUTION`
Cohort: `Tier 2 (Representative)`

## Day 1 Execution Set

| Pipeline | Selected Item | Current Stage | Action | Success Signal |
|---|---|---|---|---|
| dev | `fieldtest.DEV-2026-02-002` | `draft` | Run `/forage focus <item-id>`, capture fkit-cli consolidation boundary, then execute one valid stage transition. | Item advances with merge/deprecate command matrix documented. |

## Day 1 Checks

1. Validate structure: `./forage/ops/forage.sh validate oss/@watthem/fieldtest` (or repo-local equivalent).
2. Verify forage CI workflow path before Day 2 (`.github/workflows/forage*.yml`).
3. Record Day 1 notes directly in selected item stage history.

## Day 2 Stress Cases

1. ID resolution test: operate on `fieldtest.DEV-2026-02-002` using short form `DEV-002`.
2. Handoff test: second operator continues the selected item from `.forage` state only.
3. CI execution test: trigger validate/status workflow run.
4. Capture one failure mode and classify: protocol bug, workflow gap, or documentation gap.

## Repo-Specific OSS Hypothesis

1. CLI-to-library consolidation workflow is OSS-ready when decisions remain auditable through stage history and CI traces.

## Exit Criteria

1. At least one selected item transitions cleanly with updated history.
2. Day 2 ID/handoff checks complete (or explicit blocker documented).
3. Repo-level OSS recommendation recorded: `open-source now`, `after hardening`, or `internal only`.
