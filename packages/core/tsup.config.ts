import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["cjs", "esm"],
	dts: false, // TODO: Fix type errors before enabling
	clean: true,
	sourcemap: true,
	treeshake: true,
	minify: false, // Keep readable for development
	splitting: false
});
