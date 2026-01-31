import { parseMarkdown, validate, formatZodError, z } from "@fieldtest/core";
import fs from "node:fs/promises";
import path from "node:path";

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const docsDir = path.resolve(__dirname, "..", "docs");

const frontmatterSchema = z
  .object({
    title: z.string().min(1).optional(),
    date: z.union([z.string(), z.date()]).optional(),
  })
  .passthrough();

function log(message) {
  process.stdout.write(`${message}\n`);
}

async function collectMarkdownFiles(dir) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist" || entry.name === ".vitepress") {
        continue;
      }
      files.push(...(await collectMarkdownFiles(fullPath)));
    } else if (entry.isFile() && (fullPath.endsWith(".md") || fullPath.endsWith(".mdx"))) {
      files.push(fullPath);
    }
  }
  return files;
}

async function main() {
  const files = await collectMarkdownFiles(docsDir);
  if (files.length === 0) {
    log("FieldTest: no markdown files found (skipping)");
    return;
  }

  let failures = 0;
  for (const file of files) {
    const raw = await fs.readFile(file, "utf8");
    const doc = parseMarkdown(raw);
    const [ok, result] = validate(frontmatterSchema, doc.frontmatter);
    if (!ok) {
      failures += 1;
      log(`\n${file}`);
      log(formatZodError(result));
    }
  }

  if (failures > 0) {
    log(`\nFieldTest: ${failures} issue(s) found`);
    process.exit(1);
  }

  log("FieldTest: ok");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
