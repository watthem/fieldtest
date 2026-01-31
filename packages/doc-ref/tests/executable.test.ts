import * as path from "node:path";
import {
	createFixtureRegistry,
	runSpec,
	SpecRunner,
	createSpecRunner,
} from "../src/executable";
import { parseInlineBindings } from "../src/markdown";

describe("createFixtureRegistry", () => {
	it("should create an empty registry", () => {
		const registry = createFixtureRegistry();

		expect(registry.list()).toHaveLength(0);
	});

	it("should register and retrieve fixtures", () => {
		const registry = createFixtureRegistry();
		const fixture = () => ({ result: "test" });

		registry.register("testFixture", fixture);

		expect(registry.has("testFixture")).toBe(true);
		expect(registry.get("testFixture")).toBe(fixture);
	});

	it("should list registered fixtures", () => {
		const registry = createFixtureRegistry();

		registry.register("fixture1", () => 1);
		registry.register("fixture2", () => 2);

		expect(registry.list()).toEqual(["fixture1", "fixture2"]);
	});

	it("should return undefined for missing fixtures", () => {
		const registry = createFixtureRegistry();

		expect(registry.get("nonexistent")).toBeUndefined();
		expect(registry.has("nonexistent")).toBe(false);
	});
});

describe("runSpec", () => {
	const fixturesDir = path.join(__dirname, "fixtures");

	it("should run a simple spec with fixtures", async () => {
		const registry = createFixtureRegistry();

		registry.register("pricing", (ctx) => {
			const quantity = Number(
				String(ctx.inputs.quantity).replace(/[^0-9.-]/g, ""),
			);
			const unitPrice = Number(
				String(ctx.inputs.unitPrice).replace(/[^0-9.-]/g, ""),
			);
			const subtotal = quantity * unitPrice;
			const discount = quantity > 10 ? 0.1 : 0;
			const total = subtotal * (1 - discount);

			return {
				total: `$${total.toFixed(2)}`,
				discount: discount > 0 ? `${discount * 100}%` : "0%",
			};
		});

		const result = await runSpec(
			path.join(fixturesDir, "pricing.md") + "#examples",
			registry,
		);

		expect(result.specPath).toContain("pricing.md");
		expect(result.duration).toBeGreaterThanOrEqual(0);
	});

	it("should handle async fixtures", async () => {
		const registry = createFixtureRegistry();

		registry.register("asyncFixture", async (ctx) => {
			await new Promise((resolve) => setTimeout(resolve, 10));
			return { value: ctx.inputs.input };
		});

		// Create a temp spec content with async fixture
		const content = `# Test\n\nSet [test](!set:input) and [run](!execute:asyncFixture).`;
		const bindings = parseInlineBindings(content);

		expect(bindings).toHaveLength(2);
	});

	it("should report fixture not found errors", async () => {
		const registry = createFixtureRegistry();

		const result = await runSpec(
			path.join(fixturesDir, "pricing.md"),
			registry,
		);

		// Should have some skipped due to missing fixtures
		expect(result.skipped).toBeGreaterThan(0);
	});

	it("should count passed and failed assertions", async () => {
		const registry = createFixtureRegistry();

		// Register a fixture that always returns the same value
		registry.register("total", () => "$20.00");

		const result = await runSpec(
			path.join(fixturesDir, "pricing.md") + "#examples",
			registry,
		);

		// Result should have counts
		expect(typeof result.passed).toBe("number");
		expect(typeof result.failed).toBe("number");
	});
});

describe("SpecRunner", () => {
	const fixturesDir = path.join(__dirname, "fixtures");

	it("should provide fluent API for configuration", async () => {
		const runner = createSpecRunner()
			.basePath(fixturesDir)
			.throwOnMissing(false)
			.fixture("total", () => "$20.00");

		const result = await runner.run("pricing.md#examples");

		expect(result.specPath).toContain("pricing.md");
	});

	it("should allow chaining fixture registrations", () => {
		const runner = new SpecRunner()
			.fixture("a", () => 1)
			.fixture("b", () => 2)
			.fixture("c", () => 3);

		const registry = runner.getRegistry();

		expect(registry.list()).toEqual(["a", "b", "c"]);
	});

	it("should run multiple specs", async () => {
		const runner = createSpecRunner()
			.basePath(fixturesDir)
			.throwOnMissing(false);

		const results = await runner.runAll(["simple.md", "pricing.md"]);

		expect(results).toHaveLength(2);
	});
});

describe("parseInlineBindings integration", () => {
	it("should handle complex markdown with mixed bindings", () => {
		const content = `
# Pricing Test

Given a quantity of [5](!set:quantity) items
at a unit price of [$10.00](!set:unitPrice),
when we [calculate](!execute:pricing) the total,
we expect the total to be [$50.00](!verify:total)
and no discount applied: [0%](!verify:discount).
`;
		const bindings = parseInlineBindings(content);

		expect(bindings).toHaveLength(5);

		// Check order and types
		expect(bindings[0]).toMatchObject({ command: "set", field: "quantity" });
		expect(bindings[1]).toMatchObject({ command: "set", field: "unitPrice" });
		expect(bindings[2]).toMatchObject({ command: "execute", field: "pricing" });
		expect(bindings[3]).toMatchObject({ command: "verify", field: "total" });
		expect(bindings[4]).toMatchObject({ command: "verify", field: "discount" });
	});

	it("should handle table cells with bindings", () => {
		const content = `
| [2](!set:qty) | [$5.00](!set:price) |
`;
		const bindings = parseInlineBindings(content);

		expect(bindings).toHaveLength(2);
	});
});
