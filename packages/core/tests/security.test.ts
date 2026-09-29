import { describe, expect, it } from "vitest";
import { parseDocument } from "../src";

// Front matter must be parsed as data, never executed.
describe("parseDocument does not execute front matter", () => {
	for (const fence of ["---js", "---javascript"]) {
		it(`reports ${fence} front matter as unsupported without running it`, () => {
			const g = globalThis as { __fieldtestPwned?: string };
			delete g.__fieldtestPwned;
			const payload = `${fence}\n{ title: (globalThis.__fieldtestPwned = "ran", "x") }\n---\nbody`;
			const doc = parseDocument(payload);
			expect(doc.issues[0]?.message).toMatch(/not supported/);
			expect(doc.frontmatter).toEqual({});
			expect(g.__fieldtestPwned).toBeUndefined();
		});
	}
});
