# OpenAPI Integration

FieldTest can generate Zod schemas directly from an OpenAPI spec. This makes it easy to validate request/response payloads using your API contract.

## Install

```bash
pnpm add @fieldtest/openapi @fieldtest/validation-lib
```

## Load schemas

```ts
import { loadOpenApiSchemas } from "@fieldtest/openapi";
import { validate } from "@fieldtest/validation-lib";

const registry = loadOpenApiSchemas("./openapi.yaml");

// Components
const UserSchema = registry.components.User;
const [ok, result] = validate(UserSchema, { id: "123", name: "Ada" });
```

## Validate request/response bodies

```ts
const createUser = registry.paths["/users"].post;

const [isRequestValid, requestResult] = validate(
  createUser.requestBody!,
  { name: "Ada" }
);

const [isResponseValid, responseResult] = validate(
  createUser.responses["201"],
  { id: "123", name: "Ada" }
);
```

## Supported schema features

- `$ref` (local `#/components/schemas/*`)
- `enum`
- `oneOf`, `anyOf`, `allOf`
- `nullable`
- `object`, `array`, `string`, `number`, `integer`, `boolean`

## Limitations

- External `$ref` is not resolved.
- Only `application/json` content is supported for request/response bodies.
- Custom formats are not validated beyond basic string/number constraints.
