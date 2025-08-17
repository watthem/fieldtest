import type { StandardSchemaV1 } from "./standard-schema";
export declare function standardValidate<T extends StandardSchemaV1>(
	schema: T,
	input: StandardSchemaV1.InferInput<T>,
): Promise<StandardSchemaV1.InferOutput<T>>;
//# sourceMappingURL=standardValidate.d.ts.map
