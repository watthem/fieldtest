import type { Page } from "playwright";
import type { Observation, InteractiveElement } from "./schemas.js";

/**
 * Extract a structured observation from a Playwright page.
 * Uses the accessibility tree for interactive elements and DOM queries for text content.
 * No LLM needed — pure DOM extraction.
 */
export async function observe(page: Page): Promise<Observation> {
  const url = page.url();
  const title = await page.title();

  const [interactiveElements, headings, visibleText] = await Promise.all([
    extractInteractiveElements(page),
    extractHeadings(page),
    extractVisibleText(page),
  ]);

  return {
    url,
    title,
    interactiveElements,
    headings,
    visibleText,
    timestamp: new Date().toISOString(),
  };
}

async function extractInteractiveElements(
  page: Page,
): Promise<InteractiveElement[]> {
  const elements: InteractiveElement[] = await page.evaluate(() => {
    const selectors = [
      "a[href]",
      "button",
      "input",
      "select",
      "textarea",
      "[role=button]",
      "[role=link]",
      "[role=checkbox]",
      "[role=radio]",
      "[role=tab]",
      "[role=menuitem]",
      "[onclick]",
    ];

    const seen = new Set<Element>();
    const results: Array<{
      ref: number;
      tag: string;
      role?: string;
      text: string;
      selector: string;
      type?: string;
      placeholder?: string;
      href?: string;
      disabled?: boolean;
      checked?: boolean;
      value?: string;
    }> = [];

    let ref = 0;

    for (const sel of selectors) {
      for (const el of document.querySelectorAll(sel)) {
        if (seen.has(el)) continue;
        seen.add(el);

        // Skip hidden elements
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) continue;
        const style = window.getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden") continue;

        const tag = el.tagName.toLowerCase();
        const text = (
          el.textContent?.trim() ||
          el.getAttribute("aria-label") ||
          el.getAttribute("title") ||
          el.getAttribute("placeholder") ||
          ""
        ).slice(0, 200);

        // Build a unique selector
        let uniqueSelector: string;
        const id = el.getAttribute("id");
        if (id) {
          uniqueSelector = `#${CSS.escape(id)}`;
        } else {
          const nth = Array.from(
            el.parentElement?.querySelectorAll(tag) ?? [],
          ).indexOf(el);
          const parent = el.parentElement;
          const parentTag = parent ? parent.tagName.toLowerCase() : "body";
          uniqueSelector = `${parentTag} > ${tag}:nth-of-type(${nth + 1})`;
        }

        const entry: (typeof results)[number] = {
          ref: ref++,
          tag,
          text,
          selector: uniqueSelector,
        };

        const role = el.getAttribute("role");
        if (role) entry.role = role;

        if (el instanceof HTMLInputElement) {
          entry.type = el.type;
          if (el.placeholder) entry.placeholder = el.placeholder;
          if (el.type === "checkbox" || el.type === "radio")
            entry.checked = el.checked;
          if (el.disabled) entry.disabled = true;
          if (el.value) entry.value = el.value;
        }
        if (el instanceof HTMLSelectElement && el.disabled)
          entry.disabled = true;
        if (el instanceof HTMLButtonElement && el.disabled)
          entry.disabled = true;
        if (el instanceof HTMLAnchorElement) entry.href = el.href;

        results.push(entry);
      }
    }

    return results;
  });

  return elements;
}

async function extractHeadings(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    return Array.from(
      document.querySelectorAll("h1, h2, h3, h4, h5, h6"),
    ).map((el) => el.textContent?.trim() ?? "");
  });
}

async function extractVisibleText(page: Page): Promise<string> {
  const text = await page.evaluate(() => {
    return document.body?.innerText?.trim() ?? "";
  });
  // Cap at 2000 chars to keep observation payload reasonable for LLM context
  return text.slice(0, 2000);
}
