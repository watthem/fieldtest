/**
 * Core API tests, following the examples in docs/reference/api.md.
 */
import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { check, checkDocument, formatIssues, parseDocument, serializeMarkdown } from "../src";

const post = `---
title: Hello
date: 2025-01-01
tags: [intro]
---
# Hello

Read the [guide](https://example.com).
`;

describe("parseDocument", () => {
	it("splits front matter (YAML 1.2) from the body and builds an outline", () => {
		const doc = parseDocument(post);
		expect(doc.frontmatter).toEqual({ title: "Hello", date: "2025-01-01", tags: ["intro"] });
		expect(doc.body.startsWith("# Hello")).toBe(true);
		expect(doc.bodyLine).toBe(6);
		expect(doc.keyLines).toEqual({ title: 2, date: 3, tags: 4 });
		expect(doc.outline.headings).toEqual([{ depth: 1, text: "Hello", line: 6 }]);
		expect(doc.outline.links[0]).toMatchObject({ href: "https://example.com", relative: false, line: 8 });
		expect(doc.issues).toEqual([]);
	});

	it("reports invalid YAML as an issue with the file line instead of throwing", () => {
		const doc = parseDocument("---\nname: x\ndescription: Use it: now\n---\nbody");
		expect(doc.frontmatter).toEqual({});
		expect(doc.issues).toHaveLength(1);
		expect(doc.issues[0]).toMatchObject({ source: "parse", severity: "error", line: 3 });
		expect(doc.issues[0].hint).toMatch(/quote/);
	});
});

describe("check", () => {
	it("returns { ok: true, value } on success and { ok: false, issues } on failure", async () => {
		const schema = z.object({ title: z.string(), count: z.number() });
		const good = await check(schema, { title: "Hi", count: 42 });
		expect(good).toEqual({ ok: true, value: { title: "Hi", count: 42 }, issues: [] });
		const bad = await check(schema, { title: "Hi" });
		expect(bad.ok).toBe(false);
		expect(bad.issues[0].path).toEqual(["count"]);
	});

	it("treats a valid value with an `issues` field as a success", async () => {
		const r = await check(z.object({ issues: z.array(z.string()) }), { issues: ["a"] });
		expect(r.ok).toBe(true);
	});

	it("works with any Standard Schema library", async () => {
		const r = await check(v.object({ n: v.number() }), { n: "1" });
		expect(r.ok).toBe(false);
		expect(r.issues[0].path).toEqual(["n"]);
	});

	it("throws a readable error with throwOnError", async () => {
		await expect(check(z.string(), 1, { throwOnError: true })).rejects.toThrow(/string/);
	});
});

describe("serializeMarkdown", () => {
	it("round-trips with parseDocument", () => {
		const md = serializeMarkdown({ title: "My Post", draft: false }, "# Hello\n");
		const doc = parseDocument(md);
		expect(doc.frontmatter).toEqual({ title: "My Post", draft: false });
		expect(doc.body).toBe("# Hello\n");
	});
});

describe("checkDocument", () => {
	const frontmatter = z.object({ title: z.string(), date: z.string(), tags: z.array(z.string()) });
	const outline = z.object({ headings: z.array(z.object({ depth: z.number() })).min(1) });

	it("passes a document whose front matter and outline match", async () => {
		const r = await checkDocument(parseDocument(post, { path: "post.md" }), { frontmatter, outline });
		expect(r.ok).toBe(true);
		expect(r.issues).toEqual([]);
	});

	it("fails with located issues from front matter and outline", async () => {
		const doc = parseDocument("---\ntitle: 3\ndate: x\ntags: []\n---\nno headings", { path: "bad.md" });
		const r = await checkDocument(doc, { frontmatter, outline });
		expect(r.ok).toBe(false);
		expect(formatIssues(r.issues)).toContain("bad.md:2 title:");
		expect(r.issues.map((i) => i.source)).toEqual(["frontmatter", "outline"]);
	});
});
