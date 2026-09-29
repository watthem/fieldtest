import type { Outline } from "./types";

const FENCE = /^ {0,3}(`{3,}|~{3,})\s*([^\s`]*)/;
const ATX = /^ {0,3}(#{1,6})(?:\s+(.*?))?\s*#*\s*$/;
const LIST_ITEM = /^\s*(?:[-*+]|\d{1,9}[.)])\s+/;
const TABLE_SEP = /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/;
const LINK = /(!?)\[([^\]]*)\]\(\s*<?([^)\s>]+)>?(?:\s+["'][^)]*["'])?\s*\)/g;
const INLINE_CODE = /`[^`]*`/g;

function isRelative(href: string): boolean {
	return !/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(href);
}

/**
 * Reduce a Markdown body to the elements most documents share, so a schema can check them.
 *
 * A line scanner, not a full CommonMark parser: ATX headings, fenced code,
 * inline links, list items, and pipe tables. Content inside fences is skipped.
 *
 * @param body The Markdown body (front matter removed)
 * @param firstLine 1-based file line where the body starts, so reported lines match the file
 */
export function buildOutline(body: string, firstLine = 1): Outline {
	const lines = body.split(/\r?\n/);
	const outline: Outline = {
		lines: body === "" ? 0 : lines.length,
		approxTokens: Math.ceil(body.length / 4),
		headings: [],
		codeBlocks: [],
		links: [],
		listItems: 0,
		tables: 0,
	};
	let fence: string | null = null;
	let inTable = false;

	lines.forEach((text, i) => {
		const line = firstLine + i;
		const f = text.match(FENCE);
		if (fence) {
			if (f && f[1][0] === fence[0] && f[1].length >= fence.length && !f[2]) fence = null;
			return;
		}
		if (f) {
			fence = f[1];
			outline.codeBlocks.push(f[2] ? { lang: f[2], line } : { line });
			inTable = false;
			return;
		}
		const h = text.match(ATX);
		if (h) outline.headings.push({ depth: h[1].length, text: (h[2] ?? "").trim(), line });
		if (LIST_ITEM.test(text)) outline.listItems++;

		if (TABLE_SEP.test(text) && text.includes("-") && i > 0 && lines[i - 1].includes("|")) {
			if (!inTable) outline.tables++;
			inTable = true;
		} else if (!text.includes("|")) {
			inTable = false;
		}

		for (const m of text.replace(INLINE_CODE, (s) => " ".repeat(s.length)).matchAll(LINK)) {
			if (m[1]) continue; // images
			outline.links.push({ href: m[3], text: m[2], line, relative: isRelative(m[3]) });
		}
	});
	return outline;
}
