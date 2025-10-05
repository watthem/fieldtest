# API Reference

> **Note**: Full API documentation is being updated. For now, please refer to the TypeScript definitions in the source code.

## Core Functions

### validateWithSchema(content, schema)

Validates content against a Standard Schema.

- **Parameters:**
  - `content: any` - The content to validate
  - `schema: StandardSchemaV1` - The schema to validate against
- **Returns:** `ValidationResult`

### parseMarkdown(markdown)

Parses markdown content with frontmatter extraction.

- **Parameters:**
  - `markdown: string` - Raw markdown content
- **Returns:** `ParsedMarkdown`

### serializeMarkdown(document)

Serializes a document back to markdown format.

- **Parameters:**
  - `document: FieldTestDocument` - The document to serialize
- **Returns:** `string`

## Schema Registry

### registerSchema(name, schema)

Registers a custom schema in the global registry.

- **Parameters:**
  - `name: string` - Schema identifier
  - `schema: StandardSchemaV1` - The schema definition

### getSchema(name)

Retrieves a registered schema by name.

- **Parameters:**
  - `name: string` - Schema identifier
- **Returns:** `StandardSchemaV1 | undefined`

## Types

For complete type definitions, see the TypeScript source files in `packages/core/src/types.ts`.

Key types:
- `StandardSchemaV1` - Schema definition interface
- `ValidationResult` - Validation output
- `FieldTestDocument` - Parsed document structure
- `ParsedMarkdown` - Markdown parsing result

