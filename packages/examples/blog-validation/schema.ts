import type { StandardSchemaV1 } from "@standard-schema/spec";
import { z } from "zod";

export const blogPostSchema = z.object({
	title: z.string(),
	slug: z.string(),
	date: z.string(),
	description: z.string(),
	tags: z.array(z.string()),
});

export const blogPostStandard: StandardSchemaV1 = {
	"~standard": {
		version: 1,
		vendor: "zod",
		validate: (value) => {
			const result = blogPostSchema.safeParse(value);
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
			input: blogPostSchema._input,
			output: blogPostSchema._output,
		},
	},
};
