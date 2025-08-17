import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["index.ts"],
	format: ["cjs", "esm"],
	dts: false,
	clean: true,
	sourcemap: true,
	treeshake: true,
	minify: true,
});
