# @fieldtest/registry

Ready-made [FieldTest](https://github.com/watthem/fieldtest) checks, and the `fieldtest` CLI.

```bash
npm install @fieldtest/registry zod
```

## Agent skills

```bash
npx fieldtest skills .claude/skills --profile claude-code
```

Checks every SKILL.md under the given folders:

- `--profile spec` (default): the [Agent Skills specification](https://agentskills.io/specification): `name` (1–64 lowercase letters, digits, single hyphens, matching its folder), `description` (1–1024), `compatibility` (≤500), `metadata` (string to string), `allowed-tools` (string). Unknown keys are errors.
- `--profile claude-code`: the fields [Claude Code](https://code.claude.com/docs/en/skills) accepts. Unknown keys are warnings with a "did you mean" (`user-invokable` → `user-invocable`), and a warning when `description` + `when_to_use` passes the 1,536-character listing limit.
- Both: invalid YAML (with a fix for unquoted colons), body over 500 lines or about 5,000 tokens, relative links that don't resolve, and copies of the same skill whose contents differ.

Exits 1 on errors. `--json` prints the full report; `--errors-only` hides warnings.

```ts
import { checkSkillTree } from "@fieldtest/registry";
const report = await checkSkillTree([".claude/skills"], { profile: "claude-code" });
```

## Obsidian Bases

`validateBasesMetadata`, `validateSystemSpecificMetadata`, `generateDefaultMetadata`, and their zod schemas.

MIT
