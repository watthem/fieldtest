import type { StandardSchemaV1 } from "./standard-schema";

export async function standardValidate<T extends StandardSchemaV1>(
	schema: T,
	input: StandardSchemaV1.InferInput<T>,
): Promise<StandardSchemaV1.InferOutput<T>> {
	let result = schema["~standard"].validate(input);
	if (result instanceof Promise) result = await result;
	// if the `issues` field exists, the validation failed
	if ((result as StandardSchemaV1.FailureResult).issues) {
		throw new Error(
			JSON.stringify(
				(result as StandardSchemaV1.FailureResult).issues,
				null,
				2,
			),
		);
	}
	return (
		result as StandardSchemaV1.SuccessResult<StandardSchemaV1.InferOutput<T>>
	).value;
}
