import type { StandardSchemaV1 } from "./standard-schema";
import { standardValidate } from "./standardValidate";

// Schema that returns an invalid result (neither value nor issues)
const badResultSchema: StandardSchemaV1 = {
	"~standard": {
		version: 1,
		vendor: "fieldtest-bad-result",
		validate(value) {
			// Always returns an empty object, which is not spec-compliant
			return {} as any;
		},
		types: {
			input: undefined,
			output: undefined,
		},
	},
};

async function run() {
	try {
		const value = await standardValidate(badResultSchema, "anything");
		console.log("Bad-result should not succeed:", value);
	} catch (err) {
		console.error("Bad-result expected failure or error:", err);
	}
}

run();
