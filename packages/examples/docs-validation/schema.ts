import type { StandardSchemaV1 } from "@standard-schema/spec";
import { z } from "zod";

export const guideSchema = z.object({
	title: z.string(),
	category: z.string(),
	summary: z.string(),
});

export const guideStandard: StandardSchemaV1 = {
	"~standard": {
		version: 1,
		vendor: "zod",
		validate: (value) => {
			const result = guideSchema.safeParse(value);
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
			input: guideSchema._input,
			output: guideSchema._output,
		},
	},
};
