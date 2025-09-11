import { minimatch } from "minimatch";

/**
 * Determine if a file path should be excluded based on glob patterns
 */
export function shouldExcludeFile(filePath: string, patterns: string[] = []): boolean {
	return patterns.some((pattern) => minimatch(filePath, pattern, { nocase: true }));
}

export default shouldExcludeFile;
