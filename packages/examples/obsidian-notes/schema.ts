import type { StandardSchemaV1 } from "@standard-schema/spec";
import { z } from "zod";

export const noteSchema = z.object({
	title: z.string(),
	tags: z.array(z.string()),
	createdAt: z.string(),
});

export const noteStandard: StandardSchemaV1 = {
	"~standard": {
		version: 1,
		vendor: "zod",
		validate: (value) => {
			const result = noteSchema.safeParse(value);
			if (result.success) {
				return { value: result.data };
			} else {
				return {
					issues: result.error.errors.map((err) => ({
						message: err.message,
						path: err.path,
					})),
				};
			}
		},
		types: {
			input: noteSchema._input,
			output: noteSchema._output,
		},
	},
};
