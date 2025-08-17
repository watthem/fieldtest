# @fieldtest/validation-lib

A TypeScript validation library that works with both Astro and Next.js applications, building on top of Zod and integrated with @docs-score/core.

## Features

- **Framework Agnostic**: Works with both Astro and Next.js
- **Zod Integration**: Built on top of Zod for powerful schema validation
- **@docs-score/core Integration**: Leverages existing validation from @docs-score/core
- **CLI Interface**: Command-line tools for validation
- **Common Schemas**: Pre-built schemas for common validation needs
- **Type Safety**: Full TypeScript support with inferred types

## Installation

```bash
# If you're in the monorepo
pnpm add @fieldtest/validation-lib

# If you're outside the monorepo
npm install @fieldtest/validation-lib
```

## Usage

### Basic Validation

```typescript
import { validate, z } from '@fieldtest/validation-lib';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().min(18)
});

const userData = {
  name: "Alice",
  email: "alice@example.com",
  age: 25
};

const [isValid, result] = validate(schema, userData);

if (isValid) {
  console.log("Valid data:", result);
} else {
  console.error("Invalid data:", result.errors);
}
```

### Using Pre-defined Schemas

```typescript
import { validate, DocumentSchema } from '@fieldtest/validation-lib';

const document = {
  title: "Getting Started",
  url: "https://example.com/docs/getting-started",
  headings: [
    { level: 1, text: "Getting Started" },
    { level: 2, text: "Installation" }
  ]
};

const [isValid, result] = validate(DocumentSchema, document);

if (!isValid) {
  console.error("Invalid document structure");
}
```

### Integration with @docs-score/core

```typescript
import { scanSite } from '@docs-score/core';
import { validate, ScanOptionsSchema } from '@fieldtest/validation-lib';

const options = {
  entry: "https://example.com",
  maxDepth: 3,
  concurrency: 5
};

const [isValid, validatedOptions] = validate(ScanOptionsSchema, options);

if (isValid) {
  const results = await scanSite(validatedOptions);
  console.log(`Scanned ${results.pages.length} pages`);
}
```

### CLI Usage

```bash
# Validate a URL
npx validate url https://example.com --depth 3 --concurrency 5 --output results.json

# Validate a configuration file
npx validate config ./config.json --schema ValidationConfig
```

## API Reference

### Core Functions

- `validate<T>(schema: z.ZodType<T>, input: unknown): [boolean, T | z.ZodError]`
- `validateAsync<T>(schema: z.ZodType<T>, input: unknown): Promise<[boolean, T | z.ZodError]>`
- `formatZodError(error: z.ZodError): string`

### Pre-defined Schemas

- `URLSchema`: Validates URLs
- `EmailSchema`: Validates email addresses
- `DocumentSchema`: Validates document structure
- `ValidationConfigSchema`: Validates configuration files
- `ScanOptionsSchema`: Validates @docs-score/core scan options

## License

MIT
