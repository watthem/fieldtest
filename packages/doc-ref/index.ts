/**
 * @fieldtest/doc-ref
 *
 * Doc-driven testing tool with executable specifications support.
 * Concordion-style testing for TypeScript.
 */

// Core types
export type {
	BindingCommand,
	InlineBinding,
	ParsedTable,
	CodeExample,
	SpecAssertion,
	DocSection,
	LoadedSpec,
	SpecOptions,
	FixtureContext,
	FixtureFunction,
	FixtureRegistry,
	AssertionResult,
	ExecutionResult,
	VitestSpecOptions,
	LinkValidation,
} from "./src/types";

// Markdown parsing
export {
	parseInlineBindings,
	extractTables,
	extractCodeExamples,
	extractAssertions,
	generateAnchor,
	parseMarkdownSections,
	loadSpec,
	specSection,
} from "./src/markdown";
