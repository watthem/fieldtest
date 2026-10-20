import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/check.ts"],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  minify: false, // Keep readable for development
  splitting: false,
});
