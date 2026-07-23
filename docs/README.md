# FieldTest Documentation

Welcome to FieldTest! This documentation will help you get started with content validation using Standard Schema.

## 📖 Getting Started

New to FieldTest? Start here:

- **[Getting Started Guide](./getting-started.md)** — Install FieldTest and validate your first markdown file
- **[Why FieldTest?](./explainers/why-fieldtest.md)** — Understand the problems FieldTest solves

## 🎓 Guides (How-to)

Step-by-step instructions for common tasks:

- **[Schema Validation Guide](./guides/schema-validation.md)** — Create schemas and validate content
- **[Framework Integration](./guides/framework-integration.md)** — Use FieldTest with Astro, Next.js, and other frameworks
- **[Biome Integration](./guides/biome-integration.md)** — Set up Biome linting with FieldTest plugins
- **[OpenAPI Integration](./guides/openapi-integration.md)** — Generate Zod schemas from OpenAPI specs

## 📚 Reference

Complete API documentation:

- **[API Reference](./reference/api.md)** — All functions, types, and utilities
- **[OpenAPI Reference](./reference/openapi.md)** — OpenAPI → Zod conversion helpers

## 💡 Explainers (Understanding)

Conceptual articles to deepen your understanding:

- **[What is Standard Schema?](./explainers/standard-schema.md)** — Learn about Standard Schema and why it matters
- **[Why FieldTest?](./explainers/why-fieldtest.md)** — The problems FieldTest solves and when to use it

## 🚀 Quick Links

- [Examples](../packages/examples/) — Real-world use cases
- [Changelog](../CHANGELOG.md) — Version history and changes

## 🗂️ Documentation Structure

This documentation follows the [Diátaxis framework](https://diataxis.fr/):

```
docs/
├── getting-started.md           # Quick start guide
├── guides/                      # How-to guides
│   ├── schema-validation.md
│   ├── framework-integration.md
│   └── biome-integration.md
├── reference/                   # API documentation
│   └── api.md
└── explainers/                  # Conceptual articles
    ├── standard-schema.md
    └── why-fieldtest.md
```

## 🎯 Find What You Need

### I want to

**Get started quickly**
→ [Getting Started Guide](./getting-started.md)

**Validate markdown content**
→ [Schema Validation Guide](./guides/schema-validation.md)

**Use FieldTest with Astro or Next.js**
→ [Framework Integration Guide](./guides/framework-integration.md)

**Set up Biome linting**
→ [Biome Integration Guide](./guides/biome-integration.md)

**Understand Standard Schema**
→ [Standard Schema Explainer](./explainers/standard-schema.md)

**Look up API details**
→ [API Reference](./reference/api.md)

**See example code**
→ [Examples](../packages/examples/)

## 🔧 Tools & Integrations

- **[MCP Server](../packages/integrations/mcp/fieldtest-mcp-server/)** — AI-powered content validation

## 🌟 Features

FieldTest provides:

- ✅ **Markdown parsing** with frontmatter support
- ✅ **Schema validation** using Standard Schema
- ✅ **Schema registry** for reusable validation rules
- ✅ **Framework integrations** (Astro, Next.js, and more)
- ✅ **MCP integration** for AI workflows

## 💬 Community & Support

- 🐛 [Report bugs](https://github.com/watthem/fieldtest/issues)
- 💬 [Discussions](https://github.com/watthem/fieldtest/discussions)
- 📧 Contact: <hello@matthewhendricks.net>

## 📦 Installation

```bash
npm install @fieldtest/core
```

Or with pnpm:

```bash
pnpm add @fieldtest/core
```

**Requirements:** Node.js 18+ and PNPM 8+

## 🚀 Quick Example

```typescript
import { loadUserSchema, validateWithSchema } from '@fieldtest/core';
import type { StandardSchemaV1 } from '@fieldtest/core';

// Define schema
const schema: StandardSchemaV1 = {
  version: '1',
  name: 'blog-post',
  fields: {
    title: { type: 'string', required: true },
    published: { type: 'boolean', required: true }
  }
};

// Validate content
const loaded = loadUserSchema(schema);
const result = validateWithSchema(markdown, loaded);

if (!result.valid) {
  console.error('Validation failed:', result.errors);
}
```

## 📖 Contributing

Want to contribute? Check out:

- [Contributing Guidelines](../CONTRIBUTING.md)
- [Development Setup](../README.md#contributing)
- [Open Issues](https://github.com/watthem/fieldtest/issues)

## 📝 License

MIT © [Matthew Hendricks](https://matthewhendricks.net)

---

**Ready to get started?** → [Getting Started Guide](./getting-started.md)
