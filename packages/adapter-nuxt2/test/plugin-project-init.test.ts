import { test, expect, vi, describe } from "vitest";
import { createSliceMachinePluginRunner } from "@slicemachine/plugin-kit";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import prettier from "prettier";

import adapter from "../src";

test("installs dependencies", async (ctx) => {
	const log = vi.fn();
	const installDependencies = vi.fn();

	await ctx.pluginRunner.callHook("project:init", { log, installDependencies });

	expect(installDependencies).toHaveBeenCalledWith({
		dependencies: {
			"@nuxtjs/prismic": "^1.4.2",
		},
		dev: true,
	});
});

describe("Prismic module", () => {
	test("configures Prismic module", async (ctx) => {
		const log = vi.fn();
		const installDependencies = vi.fn();

		const nuxtConfigPath = path.join(ctx.project.root, "nuxt.config.js");
		await fs.writeFile(nuxtConfigPath, "export default {}");

		await ctx.pluginRunner.callHook("project:init", {
			log,
			installDependencies,
		});

		await expect(fs.readFile(nuxtConfigPath, "utf-8")).resolves
			.toMatchInlineSnapshot(`
			"export default {
			  buildModules: [\\"@nuxtjs/prismic\\"],

			  prismic: {
			    endpoint: \\"https://qwerty.cdn.prismic.io/api/v2\\",
			    modern: true
			  }
			};"
		`);
	});

	test("configures Prismic module with TypeScript project", async (ctx) => {
		const log = vi.fn();
		const installDependencies = vi.fn();

		const nuxtConfigPath = path.join(ctx.project.root, "nuxt.config.ts");
		await fs.writeFile(nuxtConfigPath, "export default {}");

		await ctx.pluginRunner.callHook("project:init", {
			log,
			installDependencies,
		});

		await expect(fs.readFile(nuxtConfigPath, "utf-8")).resolves
			.toMatchInlineSnapshot(`
			"export default {
			  buildModules: [\\"@nuxtjs/prismic\\"],

			  prismic: {
			    endpoint: \\"https://qwerty.cdn.prismic.io/api/v2\\",
			    modern: true
			  }
			};"
		`);
	});

	test("warns user that Nuxt config could not be updated", async (ctx) => {
		const log = vi.fn();
		const installDependencies = vi.fn();

		const errorSpy = vi
			.spyOn(console, "error")
			.mockImplementationOnce(() => undefined);
		const warnSpy = vi
			.spyOn(console, "warn")
			.mockImplementation(() => undefined);

		const nuxtConfigPath = path.join(ctx.project.root, "nuxt.config.ts");
		await fs.writeFile(nuxtConfigPath, "export default () => ({})");

		await ctx.pluginRunner.callHook("project:init", {
			log,
			installDependencies,
		});

		expect(errorSpy).toHaveBeenCalledWith("Failed to update nuxt.config.ts");
		expect(warnSpy.mock.calls).toMatchInlineSnapshot(`
			[
			  [
			    "Ensure that the following has been added to nuxt.config.ts.",
			  ],
			  [
			    "{
				buildModules: [\\"@nuxtjs/prismic\\"],
				prismic: {
					endpoint: \\"https://qwerty.cdn.prismic.io/api/v2\\",
					modern: true
				}
			}",
			  ],
			]
		`);
	});
});

describe("Slice Simulator page", () => {
	test("creates a Slice Simulator page file", async (ctx) => {
		const log = vi.fn();
		const installDependencies = vi.fn();

		await ctx.pluginRunner.callHook("project:init", {
			log,
			installDependencies,
		});

		const contents = await fs.readFile(
			path.join(ctx.project.root, "pages", "slice-simulator.vue"),
			"utf8",
		);

		expect(contents).toMatchInlineSnapshot(`
			"<template>
			  <SliceSimulator v-slot=\\"{ slices }\\">
			    <SliceZone :slices=\\"slices\\" :components=\\"components\\" />
			  </SliceSimulator>
			</template>

			<script>
			import { SliceSimulator } from \\"@slicemachine/adapter-nuxt2/dist/simulator.cjs\\";
			import { components } from \\"~/slices\\";

			export default {
			  components: {
			    SliceSimulator,
			  },
			  data() {
			    return { components };
			  },
			};
			</script>
			"
		`);
	});

	test("does not overwrite Slice Simulator page file if it already exists", async (ctx) => {
		const log = vi.fn();
		const installDependencies = vi.fn();

		const filePath = path.join(
			ctx.project.root,
			"pages",
			"slice-simulator.vue",
		);
		const contents = "foo";

		await fs.mkdir(path.dirname(filePath), { recursive: true });
		await fs.writeFile(filePath, contents);

		await ctx.pluginRunner.callHook("project:init", {
			log,
			installDependencies,
		});

		const postHookContents = await fs.readFile(filePath, "utf8");

		expect(postHookContents).toBe(contents);
	});

	test("creates Slice Simulator page file in the src directory if it exists", async (ctx) => {
		const log = vi.fn();
		const installDependencies = vi.fn();

		await fs.mkdir(path.join(ctx.project.root, "src/pages"), {
			recursive: true,
		});

		await ctx.pluginRunner.callHook("project:init", {
			log,
			installDependencies,
		});

		const pagesDir = await fs.readdir(
			path.join(ctx.project.root, "src", "pages"),
		);

		expect(pagesDir).toContain("slice-simulator.vue");
	});

	test("Slice Simulator page file is formatted by default", async (ctx) => {
		const log = vi.fn();
		const installDependencies = vi.fn();

		await ctx.pluginRunner.callHook("project:init", {
			log,
			installDependencies,
		});

		const contents = await fs.readFile(
			path.join(ctx.project.root, "pages", "slice-simulator.vue"),
			"utf8",
		);

		expect(contents).toBe(await prettier.format(contents, { parser: "vue" }));
	});

	test("Slice Simulator page file is not formatted if formatting is disabled", async (ctx) => {
		ctx.project.config.adapter.options.format = false;
		const pluginRunner = createSliceMachinePluginRunner({
			project: ctx.project,
			nativePlugins: {
				[ctx.project.config.adapter.resolve]: adapter,
			},
		});
		await pluginRunner.init();

		// Force unusual formatting to detect that formatting did not happen.
		const prettierOptions = { printWidth: 10 };
		await fs.writeFile(
			path.join(ctx.project.root, ".prettierrc"),
			JSON.stringify(prettierOptions),
		);

		const log = vi.fn();
		const installDependencies = vi.fn();

		await pluginRunner.callHook("project:init", { log, installDependencies });

		const contents = await fs.readFile(
			path.join(ctx.project.root, "pages", "slice-simulator.vue"),
			"utf8",
		);

		expect(contents).not.toBe(
			await prettier.format(contents, {
				...prettierOptions,
				parser: "vue",
			}),
		);
	});
});

describe("modify slicemachine.config.json", () => {
	test("adds default localSliceSimulatorURL", async (ctx) => {
		const log = vi.fn();
		const installDependencies = vi.fn();

		await ctx.pluginRunner.callHook("project:init", {
			log,
			installDependencies,
		});

		const contents = JSON.parse(
			await fs.readFile(
				path.join(ctx.project.root, "slicemachine.config.json"),
				"utf8",
			),
		);

		expect(contents.localSliceSimulatorURL).toBe(
			"http://localhost:3000/slice-simulator",
		);
	});

	test("does not modify localSliceSimulatorURL if it already exists", async (ctx) => {
		const log = vi.fn();
		const installDependencies = vi.fn();

		const preHookConfig = {
			...ctx.project.config,
			localSliceSimulatorURL: "foo",
		};

		await fs.writeFile(
			path.join(ctx.project.root, "slicemachine.config.json"),
			JSON.stringify(preHookConfig),
		);

		await ctx.pluginRunner.callHook("project:init", {
			log,
			installDependencies,
		});

		const contents = JSON.parse(
			await fs.readFile(
				path.join(ctx.project.root, "slicemachine.config.json"),
				"utf8",
			),
		);

		expect(contents.localSliceSimulatorURL).toBe(
			preHookConfig.localSliceSimulatorURL,
		);
	});

	test("nests default Slice Library under src directory if it exists", async (ctx) => {
		const log = vi.fn();
		const installDependencies = vi.fn();

		await fs.mkdir(path.join(ctx.project.root, "src"), { recursive: true });

		await ctx.pluginRunner.callHook("project:init", {
			log,
			installDependencies,
		});

		const contents = JSON.parse(
			await fs.readFile(
				path.join(ctx.project.root, "slicemachine.config.json"),
				"utf8",
			),
		);

		expect(contents.libraries).toStrictEqual(["./src/slices"]);
	});

	test("does not nest the default Slice Library under src directory if it is not empty", async (ctx) => {
		const log = vi.fn();
		const installDependencies = vi.fn();

		await fs.mkdir(path.join(ctx.project.root, "src"), { recursive: true });

		await fs.mkdir(path.join(ctx.project.root, "slices", "FooBar"), {
			recursive: true,
		});
		await fs.writeFile(
			path.join(ctx.project.root, "slices", "FooBar", "model.json"),
			JSON.stringify(ctx.mock.model.sharedSlice()),
		);

		await ctx.pluginRunner.callHook("project:init", {
			log,
			installDependencies,
		});

		const contents = JSON.parse(
			await fs.readFile(
				path.join(ctx.project.root, "slicemachine.config.json"),
				"utf8",
			),
		);

		expect(contents.libraries).toStrictEqual(["./slices"]);
	});

	test("does not modify Slice Library if it is not the default", async (ctx) => {
		const log = vi.fn();
		const installDependencies = vi.fn();

		const preHookConfig = {
			...ctx.project.config,
			libraries: ["./foo"],
		};

		await fs.writeFile(
			path.join(ctx.project.root, "slicemachine.config.json"),
			JSON.stringify(preHookConfig),
		);

		await fs.mkdir(path.join(ctx.project.root, "src"), { recursive: true });

		await ctx.pluginRunner.callHook("project:init", {
			log,
			installDependencies,
		});

		const contents = JSON.parse(
			await fs.readFile(
				path.join(ctx.project.root, "slicemachine.config.json"),
				"utf8",
			),
		);

		expect(contents.libraries).toStrictEqual(preHookConfig.libraries);
	});
});
