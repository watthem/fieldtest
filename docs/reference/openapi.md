# OpenAPI Reference

FieldTest can load OpenAPI specs and turn schemas into Zod validators.

## `loadOpenApiSpec(filePath)`

Load a JSON or YAML OpenAPI spec from disk.

```ts
import { loadOpenApiSpec } from "@fieldtest/openapi";

const spec = loadOpenApiSpec("./openapi.yaml");
```

## `buildOpenApiSchemas(spec)`

Build a schema registry from a parsed OpenAPI object.

```ts
import { buildOpenApiSchemas } from "@fieldtest/openapi";

const registry = buildOpenApiSchemas(spec);
const UserSchema = registry.components.User;
```

## `loadOpenApiSchemas(filePath)`

Convenience wrapper that loads and builds schemas in one call.

```ts
import { loadOpenApiSchemas } from "@fieldtest/openapi";

const registry = loadOpenApiSchemas("./openapi.yaml");
```

## Registry shape

```ts
interface OpenApiSchemaRegistry {
  components: Record<string, ZodTypeAny>;
  paths: Record<string, Record<string, {
    requestBody?: ZodTypeAny;
    responses: Record<string, ZodTypeAny>;
  }>>;
}
```

## Supported OpenAPI schema features

- `$ref` (local `#/components/schemas/*`)
- `enum`
- `oneOf`, `anyOf`, `allOf`
- `nullable`
- `object`, `array`, `string`, `number`, `integer`, `boolean`

## Limitations

- External `$ref` is not resolved.
- Only `application/json` content is supported for request/response bodies.
- Custom formats are not validated beyond basic string/number constraints.
