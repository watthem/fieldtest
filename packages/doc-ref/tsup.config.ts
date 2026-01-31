import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["index.ts", "vitest.ts", "executable.ts", "src/cli.ts"],
	format: ["cjs", "esm"],
	dts: true,
	clean: true,
	sourcemap: true,
	treeshake: true,
	minify: false,
	splitting: false,
});
