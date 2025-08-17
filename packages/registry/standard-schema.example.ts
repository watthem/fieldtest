import { standardValidate } from "./standardValidate";
import { stringSchema } from "./stringSchema";

async function run() {
	const schema = stringSchema("Must be a string");

	// Successful validation
	try {
		const value = await standardValidate(schema, "hello world");
		console.log("Success:", value);
	} catch (err) {
		console.error("Should not fail:", err);
	}

	// Failed validation
	try {
		// Cast to unknown to bypass TS type check for demonstration
		const value = await standardValidate(schema, 123 as unknown as string);
		console.log("Should not succeed:", value);
	} catch (err) {
		console.error("Expected failure:", err);
	}
}

run();
