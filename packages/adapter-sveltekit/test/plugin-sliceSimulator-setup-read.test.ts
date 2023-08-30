import { it, describe, expect } from "vitest";
import { SliceSimulatorSetupStepValidationMessage } from "@slicemachine/plugin-kit/*";
import * as fs from "node:fs/promises";
import * as path from "node:path";

describe("step 1", () => {
	it("includes the correct title, description, and body", async (ctx) => {
		const { data } = await ctx.pluginRunner.callHook(
			"slice-simulator:setup:read",
			undefined,
		);

		expect(data[0][0].title).toMatchInlineSnapshot('"Install packages"');
		expect(data[0][0].description).toMatchInlineSnapshot(
			'"The simulator requires some dependencies."',
		);
		expect(data[0][0].body).toMatchInlineSnapshot(`
			"The simulator requires extra dependencies. Run the following command to install them.

			~~~sh
			npm install --save @prismicio/svelte
			~~~"
		`);
	});

	it("returns a validation error if no required dependencies are returned", async (ctx) => {
		const { data } = await ctx.pluginRunner.callHook(
			"slice-simulator:setup:read",
			undefined,
		);

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const validate = data[0][0].validate!;

		const res = (await validate()) as SliceSimulatorSetupStepValidationMessage;

		expect(res.title).toMatch(/missing all dependencies/i);
		expect(res.message).toMatch(
			/install the required dependencies to continue/i,
		);
	});

	it("does not return any errors if all required dependencies are returned", async (ctx) => {
		const pkgPath = path.join(
			ctx.project.root,
			"node_modules",
			"@prismicio",
			"svelte",
		);
		await fs.mkdir(pkgPath, { recursive: true });
		await fs.writeFile(
			path.join(pkgPath, "package.json"),
			JSON.stringify({ name: "@prismicio/svelte", main: "index.js" }),
		);
		await fs.writeFile(path.join(pkgPath, "index.js"), "");

		const { data } = await ctx.pluginRunner.callHook(
			"slice-simulator:setup:read",
			undefined,
		);

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const validate = data[0][0].validate!;

		expect(await validate()).toBe(undefined);
	});
});

describe("step 2", () => {
	it("includes the correct title, description, and body", async (ctx) => {
		const { data } = await ctx.pluginRunner.callHook(
			"slice-simulator:setup:read",
			undefined,
		);

		expect(data[0][1].title).toMatchInlineSnapshot(
			'"Create a page for the simulator"',
		);
		expect(data[0][1].description).toMatchInlineSnapshot(
			'"Create a file at `src/routes/slice-simulator/+page.svelte` containing this code."',
		);
		expect(data[0][1].body).toMatchInlineSnapshot(`
			"Create a file at \`src/routes/slice-simulator/+page.svelte\` containing the following code. This route will be used to simulate and develop your components.

			~~~svelte
			<script>
			  import { SliceSimulator } from \\"@slicemachine/adapter-sveltekit/simulator\\";
			  import { SliceZone } from \\"@prismicio/svelte\\";
			  import { components } from \\"$lib/slices\\";
			</script>

			<SliceSimulator let:slices>
			  <SliceZone {slices} {components} />
			</SliceSimulator>
			~~~"
		`);
	});
});

describe("step 3", () => {
	it("includes the correct title, description, and body", async (ctx) => {
		const { data } = await ctx.pluginRunner.callHook(
			"slice-simulator:setup:read",
			undefined,
		);

		expect(data[0][1].title).toMatchInlineSnapshot(
			'"Create a page for the simulator"',
		);
		expect(data[0][1].description).toMatchInlineSnapshot(
			'"Create a file at `src/routes/slice-simulator/+page.svelte` containing this code."',
		);
		expect(data[0][1].body).toMatchInlineSnapshot(`
			"Create a file at \`src/routes/slice-simulator/+page.svelte\` containing the following code. This route will be used to simulate and develop your components.

			~~~svelte
			<script>
			  import { SliceSimulator } from \\"@slicemachine/adapter-sveltekit/simulator\\";
			  import { SliceZone } from \\"@prismicio/svelte\\";
			  import { components } from \\"$lib/slices\\";
			</script>

			<SliceSimulator let:slices>
			  <SliceZone {slices} {components} />
			</SliceSimulator>
			~~~"
		`);
	});

	it.todo(
		"returns a validation error if a Slice Simulator URL is not configured",
		// async (ctx) => {
		// 	const { data } = await ctx.pluginRunner.callHook(
		// 		"slice-simulator:setup:read",
		// 		undefined,
		// 	);
		//
		// 	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		// 	const validate = data[0][0].validate!;
		//
		// 	const res =
		// 		(await validate()) as SliceSimulatorSetupStepValidationMessage;
		// },
	);

	it.todo(
		"returns a validation error if an invalid Slice Simulator URL is provided",
		// async (ctx) => {
		// 	const { data } = await ctx.pluginRunner.callHook(
		// 		"slice-simulator:setup:read",
		// 		undefined,
		// 	);
		//
		// 	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		// 	const validate = data[0][0].validate!;
		//
		// 	const res =
		// 		(await validate()) as SliceSimulatorSetupStepValidationMessage;
		// },
	);

	it.todo(
		"returns a validation error if the Slice Simulator URL cannot be accessed",
		// async (ctx) => {
		// 	const { data } = await ctx.pluginRunner.callHook(
		// 		"slice-simulator:setup:read",
		// 		undefined,
		// 	);
		//
		// 	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		// 	const validate = data[0][0].validate!;
		//
		// 	const res =
		// 		(await validate()) as SliceSimulatorSetupStepValidationMessage;
		// },
	);
});
