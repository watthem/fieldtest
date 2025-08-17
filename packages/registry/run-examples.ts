import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

const examples = fs.readdirSync(".").filter((f) => f.endsWith(".example.ts"));
let passed = 0,
	failed = 0;

for (const file of examples) {
	const jsFile = path.join("dist", file.replace(".ts", ".js"));
	try {
		execSync(`tsc ${file} --module commonjs --esModuleInterop --outDir dist`);
		const output = execSync(`node ${jsFile}`, { encoding: "utf8" });
		console.log(`\x1b[32m[SUCCESS]\x1b[0m ${file}\n${output}`);
		passed++;
	} catch (e: any) {
		console.log(`\x1b[31m[FAIL]\x1b[0m ${file}\n${e.stdout || e.message}`);
		failed++;
	}
}
console.log(`\nSummary: ${passed} passed, ${failed} failed`);
