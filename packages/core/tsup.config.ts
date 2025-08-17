import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["cjs", "esm"],
	dts: false,
	clean: true,
	sourcemap: true,
	treeshake: true,
	minify: false, // Keep readable for development
	splitting: false
});
