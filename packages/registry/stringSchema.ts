import type { StandardSchemaV1 } from "./standard-schema";

// Step 1: Define the schema interface
export interface StringSchema extends StandardSchemaV1<string> {
	type: "string";
	message: string;
}

// Step 2: Implement the schema interface
export function stringSchema(message = "Invalid type"): StringSchema {
	return {
		type: "string",
		message,
		"~standard": {
			version: 1,
			vendor: "fieldtest",
			validate(value) {
				return typeof value === "string"
					? { value }
					: { issues: [{ message }] };
			},
			types: {
				input: "" as string,
				output: "" as string,
			},
		},
	};
}
