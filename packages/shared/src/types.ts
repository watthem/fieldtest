/**
 * Common types for the fieldtest workspace
 */

// Simple MetricResult type definition
export interface MetricResult {
	id: string;
	value: number;
	threshold?: number;
	passed: boolean;
	message?: string;
}
import { z } from "zod";

/**
 * Issue type for validation results
 */
export interface Issue {
	type: string;
	severity: "error" | "warning" | "info";
	message: string;
	path?: string;
	line?: number;
	column?: number;
}

/**
 * Common validation result interface
 */
export interface ValidationResult<T> {
	isValid: boolean;
	data?: T;
	errors?: Array<{
		path: string;
		message: string;
	}>;
}

/**
 * Report format for validation results
 */
export interface ValidationReport {
	timestamp: string;
	url: string;
	results: Record<string, ValidationResult<unknown>>;
	issues: Issue[];
	metrics?: Record<string, MetricResult>;
	summary: {
		valid: number;
		invalid: number;
		total: number;
	};
}

/**
 * Framework types for better integration with Astro and Next.js
 */
export enum Framework {
	Astro = "astro",
	NextJS = "nextjs",
	Unknown = "unknown",
}

/**
 * Configuration options for the validation library
 */
export interface ValidationOptions {
	/**
	 * The maximum depth to crawl
	 * @default 3
	 */
	maxDepth?: number;

	/**
	 * The concurrency limit for crawling
	 * @default 5
	 */
	concurrency?: number;

	/**
	 * Paths or patterns to ignore
	 */
	ignore?: string[];

	/**
	 * Whether to validate URLs
	 * @default true
	 */
	validateUrls?: boolean;

	/**
	 * Whether to validate heading structure
	 * @default true
	 */
	validateHeadings?: boolean;

	/**
	 * Whether to validate document structure
	 * @default true
	 */
	validateDocuments?: boolean;

	/**
	 * The framework being used (for framework-specific validations)
	 */
	framework?: Framework;
}
