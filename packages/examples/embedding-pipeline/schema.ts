import type { StandardSchemaV1 } from "@standard-schema/spec";
import { z } from "zod";

export const embeddingSchema = z.object({
	title: z.string(),
	slug: z.string(),
	keywords: z.array(z.string()),
	category: z.string(),
});

export const embeddingStandard: StandardSchemaV1 = {
	"~standard": {
		version: 1,
		vendor: "zod",
		validate: (value) => {
			const result = embeddingSchema.safeParse(value);
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
			input: embeddingSchema._input,
			output: embeddingSchema._output,
		},
	},
};
