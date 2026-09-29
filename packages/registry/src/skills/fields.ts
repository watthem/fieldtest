/**
 * Front-matter fields each skill host accepts. Hosts add fields between
 * releases; update this file (and `checkedAt`) from the sources below.
 */
export const SKILL_FIELDS = {
	spec: {
		source: "https://agentskills.io/specification",
		checkedAt: "2026-09-29",
		keys: ["name", "description", "license", "compatibility", "metadata", "allowed-tools"],
	},
	claudeCode: {
		source: "https://code.claude.com/docs/en/skills",
		checkedAt: "2026-09-29",
		keys: [
			"name",
			"description",
			"when_to_use",
			"argument-hint",
			"arguments",
			"disable-model-invocation",
			"user-invocable",
			"allowed-tools",
			"disallowed-tools",
			"model",
			"effort",
			"context",
			"agent",
			"background",
			"hooks",
			"paths",
			"shell",
			"metadata",
			"license",
			"compatibility",
		],
		/** `description` + `when_to_use` are truncated at this length in the skill listing. */
		listingLimit: 1536,
	},
} as const;

/** Recommended body limits from the spec's progressive-disclosure guidance. */
export const SKILL_BODY_LIMITS = { lines: 500, tokens: 5000 } as const;
