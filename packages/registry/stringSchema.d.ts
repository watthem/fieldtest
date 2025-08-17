import type { StandardSchemaV1 } from "./standard-schema";
export interface StringSchema extends StandardSchemaV1<string> {
	type: "string";
	message: string;
}
export declare function stringSchema(message?: string): StringSchema;
//# sourceMappingURL=stringSchema.d.ts.map
