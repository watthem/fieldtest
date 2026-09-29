import { describe, expect, it } from "vitest";
import { parseMarkdown } from "../src";

// Front matter must be parsed as data, never executed.
describe("parseMarkdown does not execute front matter", () => {
	for (const fence of ["---js", "---javascript"]) {
		it(`rejects ${fence} front matter without running it`, () => {
			const g = globalThis as { __fieldtestPwned?: string };
			delete g.__fieldtestPwned;
			const payload = `${fence}\n{ title: (globalThis.__fieldtestPwned = "ran", "x") }\n---\nbody`;
			expect(() => parseMarkdown(payload)).toThrow(/not supported/);
			expect(g.__fieldtestPwned).toBeUndefined();
		});
	}
});
