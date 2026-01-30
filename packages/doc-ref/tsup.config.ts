import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["index.ts", "vitest.ts", "src/cli.ts"],
	format: ["cjs", "esm"],
	dts: true,
	clean: true,
	sourcemap: true,
	treeshake: true,
	minify: true,
	external: ["vitest"],
});
