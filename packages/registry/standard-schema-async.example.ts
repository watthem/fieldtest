import type { StandardSchemaV1 } from "./standard-schema";
import { standardValidate } from "./standardValidate";

// Async string schema
const asyncStringSchema: StandardSchemaV1<string> = {
	"~standard": {
		version: 1,
		vendor: "fieldtest-async",
		async validate(value) {
			await new Promise((resolve) => setTimeout(resolve, 10));
			return typeof value === "string"
				? { value }
				: { issues: [{ message: "Must be a string (async)" }] };
		},
		types: {
			input: "" as string,
			output: "" as string,
		},
	},
};

async function run() {
	// Successful validation
	try {
		const value = await standardValidate(asyncStringSchema, "async ok");
		console.log("Async success:", value);
	} catch (err) {
		console.error("Async should not fail:", err);
	}

	// Failed validation
	try {
		const value = await standardValidate(
			asyncStringSchema,
			42 as unknown as string,
		);
		console.log("Async should not succeed:", value);
	} catch (err) {
		console.error("Async expected failure:", err);
	}
}

run();
