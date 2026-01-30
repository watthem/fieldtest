import fs from "fs";
import path from "path";
import yaml from "yaml";
import { z } from "zod";

export type OpenApiSpec = Record<string, any>;

export interface OpenApiSchemaRegistry {
	components: Record<string, z.ZodTypeAny>;
	paths: Record<
		string,
		Record<
			string,
			{
				requestBody?: z.ZodTypeAny;
				responses: Record<string, z.ZodTypeAny>;
			}
		>
	>;
}

interface SchemaContext {
	spec: OpenApiSpec;
	getComponentSchema: (name: string) => z.ZodTypeAny;
}

export function loadOpenApiSpec(filePath: string): OpenApiSpec {
	const absolute = path.resolve(process.cwd(), filePath);
	const raw = fs.readFileSync(absolute, "utf-8");
	try {
		return JSON.parse(raw);
	} catch {
		return yaml.parse(raw) as OpenApiSpec;
	}
}

function resolveRef(ref: string): string {
	const match = ref.match(/^#\/components\/schemas\/(.+)$/);
	if (!match) {
		throw new Error(`Unsupported $ref: ${ref}`);
	}
	return match[1];
}

function withNullable(schema: z.ZodTypeAny, nullable?: boolean): z.ZodTypeAny {
	return nullable ? schema.nullable() : schema;
}

function schemaToZod(schema: any, ctx: SchemaContext): z.ZodTypeAny {
	if (!schema) return z.any();

	if (schema.$ref) {
		const name = resolveRef(schema.$ref);
		return ctx.getComponentSchema(name);
	}

	if (schema.const !== undefined) {
		return z.literal(schema.const);
	}

	if (schema.enum) {
		const values = schema.enum as unknown[];
		if (values.every((value) => typeof value === "string")) {
			if (values.length === 1) {
				return withNullable(z.literal(values[0] as string), schema.nullable);
			}
			return withNullable(z.enum(values as [string, ...string[]]), schema.nullable);
		}
		if (values.length === 1) {
			return withNullable(z.literal(values[0] as any), schema.nullable);
		}
		const literals = values.map((value) => z.literal(value as any));
		return withNullable(
			z.union(literals as unknown as [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]),
			schema.nullable
		);
	}

	if (schema.oneOf || schema.anyOf) {
		const variants = (schema.oneOf ?? schema.anyOf).map((item: any) => schemaToZod(item, ctx));
		if (variants.length === 1) {
			return withNullable(variants[0], schema.nullable);
		}
		return withNullable(z.union(variants as [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]), schema.nullable);
	}

	if (schema.allOf) {
		const parts = schema.allOf.map((item: any) => schemaToZod(item, ctx));
		return withNullable(parts.reduce((acc: z.ZodTypeAny, next: z.ZodTypeAny) => acc.and(next)), schema.nullable);
	}

	switch (schema.type) {
		case "string": {
			let base = z.string();
			if (schema.minLength !== undefined) base = base.min(schema.minLength);
			if (schema.maxLength !== undefined) base = base.max(schema.maxLength);
			return withNullable(base, schema.nullable);
		}
		case "number": {
			let base = z.number();
			if (schema.minimum !== undefined) base = base.min(schema.minimum);
			if (schema.maximum !== undefined) base = base.max(schema.maximum);
			return withNullable(base, schema.nullable);
		}
		case "integer": {
			let base = z.number().int();
			if (schema.minimum !== undefined) base = base.min(schema.minimum);
			if (schema.maximum !== undefined) base = base.max(schema.maximum);
			return withNullable(base, schema.nullable);
		}
		case "boolean":
			return withNullable(z.boolean(), schema.nullable);
		case "array": {
			const items = schema.items ? schemaToZod(schema.items, ctx) : z.any();
			let base = z.array(items);
			if (schema.minItems !== undefined) base = base.min(schema.minItems);
			if (schema.maxItems !== undefined) base = base.max(schema.maxItems);
			return withNullable(base, schema.nullable);
		}
		case "object": {
			const properties = schema.properties ?? {};
			const required = new Set(schema.required ?? []);
			const shape: Record<string, z.ZodTypeAny> = {};
			for (const [key, value] of Object.entries(properties)) {
				const zodSchema = schemaToZod(value, ctx);
				shape[key] = required.has(key) ? zodSchema : zodSchema.optional();
			}
			let base: z.ZodObject<any> = z.object(shape);
			if (schema.additionalProperties === true) {
				base = base.passthrough();
			} else if (schema.additionalProperties) {
				base = base.catchall(schemaToZod(schema.additionalProperties, ctx));
			}
			return withNullable(base, schema.nullable);
		}
		case "null":
			return z.null();
		default:
			return z.any();
	}
}

export function buildOpenApiSchemas(spec: OpenApiSpec): OpenApiSchemaRegistry {
	const componentSchemas = spec?.components?.schemas ?? {};
	const cache = new Map<string, z.ZodTypeAny>();
	const building = new Set<string>();

	const ctx: SchemaContext = {
		spec,
		getComponentSchema: (name: string) => {
			if (cache.has(name)) return cache.get(name)!;
			if (building.has(name)) {
				return z.lazy(() => cache.get(name) ?? z.any());
			}
			building.add(name);
			const rawSchema = componentSchemas[name];
			const built = schemaToZod(rawSchema, ctx);
			cache.set(name, built);
			building.delete(name);
			return built;
		},
	};

	for (const name of Object.keys(componentSchemas)) {
		ctx.getComponentSchema(name);
	}

	const pathSchemas: OpenApiSchemaRegistry["paths"] = {};
	const paths = spec?.paths ?? {};

	for (const [pathKey, pathItem] of Object.entries(paths)) {
		pathSchemas[pathKey] = {};
		for (const [method, operation] of Object.entries(pathItem as Record<string, any>)) {
			if (!operation || typeof operation !== "object") continue;
			const requestSchema = operation.requestBody?.content?.["application/json"]?.schema;
			const responses = operation.responses ?? {};

			const responseSchemas: Record<string, z.ZodTypeAny> = {};
			for (const [status, response] of Object.entries(responses)) {
				const schema = (response as any)?.content?.["application/json"]?.schema;
				if (schema) {
					responseSchemas[status] = schemaToZod(schema, ctx);
				}
			}

			pathSchemas[pathKey][method] = {
				requestBody: requestSchema ? schemaToZod(requestSchema, ctx) : undefined,
				responses: responseSchemas,
			};
		}
	}

	return {
		components: Object.fromEntries(cache.entries()),
		paths: pathSchemas,
	};
}

export function loadOpenApiSchemas(filePath: string): OpenApiSchemaRegistry {
	const spec = loadOpenApiSpec(filePath);
	return buildOpenApiSchemas(spec);
}
