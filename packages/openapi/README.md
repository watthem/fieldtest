# @fieldtest/openapi

Convert OpenAPI specs into Zod schemas you can validate with FieldTest.

## Install

```bash
pnpm add @fieldtest/openapi
```

## Usage

```ts
import { loadOpenApiSchemas } from "@fieldtest/openapi";
import { validate } from "@fieldtest/validation-lib";

const { components, paths } = loadOpenApiSchemas("./openapi.yaml");

const UserSchema = components.User;
const [ok, result] = validate(UserSchema, { id: "123" });
```

## Path schemas

The registry includes request/response schemas when possible:

```ts
const registry = loadOpenApiSchemas("./openapi.yaml");
const createUser = registry.paths["/users"].post;

const bodySchema = createUser.requestBody;
const responseSchema = createUser.responses["201"];
```

## Notes

- Supports common OpenAPI schema features: `$ref`, `enum`, `oneOf`, `anyOf`, `allOf`, `nullable`, object/array types.
- Only resolves local `#/components/schemas/*` refs.
- Parses JSON or YAML OpenAPI files.
