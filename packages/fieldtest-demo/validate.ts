import fs from "fs";
import path from "path";
import {
	DocumentSchema,
	PostSchema,
	formatZodError,
	validate,
	type z,
} from "@fieldtest/validation-lib";

// Example: Validate a Markdown frontmatter (Astro/Next.js)
const blogFrontmatter = {
	title: "Hello World",
	description: "A demo post",
	slug: "hello-world",
	published: true,
};

const [isPostValid, postResult] = validate(PostSchema, blogFrontmatter);
console.log("\nBlog Post Frontmatter:");
if (isPostValid) {
	console.log("✅ Valid:", postResult);
} else {
	console.error("❌ Invalid:", formatZodError(postResult as z.ZodError));
}

// Example: Validate a CMS JSON payload (e.g., Contentful)
const cmsEntry = {
	title: "Getting Started",
	url: "https://example.com/docs/getting-started",
	headings: [
		{ level: 1, text: "Getting Started" },
		{ level: 2, text: "Installation" },
	],
	links: [{ href: "https://example.com", text: "Home" }],
};

const [isDocValid, docResult] = validate(DocumentSchema, cmsEntry);
console.log("\nCMS Entry:");
if (isDocValid) {
	console.log("✅ Valid:", docResult);
} else {
	console.error("❌ Invalid:", formatZodError(docResult as z.ZodError));
}
