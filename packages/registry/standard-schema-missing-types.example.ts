import type { StandardSchemaV1 } from "./standard-schema";
import { standardValidate } from "./standardValidate";

// Schema without 'types' property
const noTypesSchema: StandardSchemaV1 = {
	"~standard": {
		version: 1,
		vendor: "fieldtest-no-types",
		validate(value) {
			return typeof value === "number"
				? { value }
				: { issues: [{ message: "Must be a number" }] };
		},
		// types: intentionally omitted
	},
};

async function run() {
	try {
		// This will not have type inference, but should work at runtime
		const value = await standardValidate(noTypesSchema, 123);
		console.log("No-types success:", value);
	} catch (err) {
		console.error("No-types should not fail:", err);
	}

	try {
		const value = await standardValidate(noTypesSchema, "oops" as any);
		console.log("No-types should not succeed:", value);
	} catch (err) {
		console.error("No-types expected failure:", err);
	}
}

run();
