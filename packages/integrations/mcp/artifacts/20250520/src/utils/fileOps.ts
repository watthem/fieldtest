import path from "path";
import fs from "fs/promises";

export async function moveFile(src: string, dest: string) {
	await fs.mkdir(path.dirname(dest), { recursive: true });
	await fs.rename(src, dest);
}

// TODO: Implement real duplicate detection logic, using e.g. content hash or similarity
export async function findDuplicates(
	filepath: string,
	frontmatter: any,
): Promise<boolean> {
	// Placeholder: Always returns false for now
	return false;
}

export function markArchived(
	frontmatter: any,
	opts: { archived?: boolean; duplicate?: boolean },
) {
	return { ...frontmatter, ...opts };
}
