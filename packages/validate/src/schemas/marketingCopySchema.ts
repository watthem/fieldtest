import { z } from "zod";

export const heroSectionSchema = z.object({
	title: z.string().min(1, "Hero title is required"),
	subtitle: z.string().min(1, "Hero subtitle is required"),
	ctaText: z.string().min(1, "CTA text is required"),
	ctaUrl: z.string().url("CTA URL must be valid"),
	backgroundImage: z.string().optional(),
	features: z.array(z.string()).optional(),
});

export const caseStudySchema = z.object({
	title: z.string().min(1, "Case study title is required"),
	summary: z.string().min(1, "Case study summary is required"),
	image: z.string().optional(),
	url: z.string().url().optional(),
	tags: z.array(z.string()).optional(),
	metrics: z
		.object({
			improvement: z.string().optional(),
			timeframe: z.string().optional(),
		})
		.optional(),
});

export const ctaSectionSchema = z.object({
	title: z.string().min(1, "CTA section title is required"),
	description: z.string().min(1, "CTA description is required"),
	primaryButton: z.object({
		text: z.string().min(1, "Primary button text is required"),
		url: z.string().url("Primary button URL must be valid"),
	}),
	secondaryButton: z
		.object({
			text: z.string().min(1, "Secondary button text is required"),
			url: z.string().url("Secondary button URL must be valid"),
		})
		.optional(),
});

export const marketingCopySchema = z.object({
	hero: heroSectionSchema,
	caseStudies: z
		.array(caseStudySchema)
		.min(1, "At least one case study is required"),
	cta: ctaSectionSchema,
	testimonials: z
		.array(
			z.object({
				quote: z.string().min(1, "Testimonial quote is required"),
				author: z.string().min(1, "Testimonial author is required"),
				title: z.string().optional(),
				company: z.string().optional(),
			}),
		)
		.optional(),
});

export type MarketingCopy = z.infer<typeof marketingCopySchema>;
