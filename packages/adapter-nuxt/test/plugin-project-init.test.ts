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
			"@nuxtjs/prismic": "^3.0.0",
		},
		dev: true,
	});
});

describe("Prismic module", () => {
	test("configures Prismic module", async (ctx) => {
		const log = vi.fn();
		const installDependencies = vi.fn();

		const nuxtConfigPath = path.join(ctx.project.root, "nuxt.config.js");
		await fs.writeFile(nuxtConfigPath, "export default defineNuxtConfig({})");

		await ctx.pluginRunner.callHook("project:init", {
			log,
			installDependencies,
		});

		await expect(fs.readFile(nuxtConfigPath, "utf-8")).resolves
			.toMatchInlineSnapshot(`
			"export default defineNuxtConfig({
			  modules: [\\"@nuxtjs/prismic\\"],

			  prismic: {
			    endpoint: \\"qwerty\\"
			  }
			})"
		`);
	});

	test("configures Prismic module with TypeScript project", async (ctx) => {
		const log = vi.fn();
		const installDependencies = vi.fn();

		const nuxtConfigPath = path.join(ctx.project.root, "nuxt.config.ts");
		await fs.writeFile(nuxtConfigPath, "export default defineNuxtConfig({})");

		await ctx.pluginRunner.callHook("project:init", {
			log,
			installDependencies,
		});

		await expect(fs.readFile(nuxtConfigPath, "utf-8")).resolves
			.toMatchInlineSnapshot(`
			"export default defineNuxtConfig({
			  modules: [\\"@nuxtjs/prismic\\"],

			  prismic: {
			    endpoint: \\"qwerty\\"
			  }
			})"
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
			  <SliceSimulator #default=\\"{ slices }\\">
			    <SliceZone :slices=\\"slices\\" :components=\\"components\\" />
			  </SliceSimulator>
			</template>

			<script setup>
			import { SliceSimulator } from \\"@slicemachine/adapter-nuxt/simulator\\";
			import { components } from \\"~/slices\\";
			</script>
			"
		`);
	});

	test("creates a TypeScript Slice Simulator page file when TypeScript is enabled", async (ctx) => {
		ctx.project.config.adapter.options.typescript = true;
		const pluginRunner = createSliceMachinePluginRunner({
			project: ctx.project,
			nativePlugins: {
				[ctx.project.config.adapter.resolve]: adapter,
			},
		});
		await pluginRunner.init();

		const log = vi.fn();
		const installDependencies = vi.fn();

		await pluginRunner.callHook("project:init", { log, installDependencies });

		const contents = await fs.readFile(
			path.join(ctx.project.root, "pages", "slice-simulator.vue"),
			"utf8",
		);

		expect(contents).toMatchInlineSnapshot(`
			"<template>
			  <SliceSimulator #default=\\"{ slices }\\">
			    <SliceZone :slices=\\"slices\\" :components=\\"components\\" />
			  </SliceSimulator>
			</template>

			<script setup lang=\\"ts\\">
			import { SliceSimulator } from \\"@slicemachine/adapter-nuxt/simulator\\";
			import { components } from \\"~/slices\\";
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

		expect(contents).toBe(prettier.format(contents, { parser: "vue" }));
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
			prettier.format(contents, {
				...prettierOptions,
				parser: "vue",
			}),
		);
	});
});

describe("app.vue", () => {
	const NUXT_DEFAULT_APP_VUE = /* html */ `<template>
  <div>
    <NuxtWelcome />
  </div>
</template>
`;

	test("deletes default app.vue and creates a new index page if non-existent", async (ctx) => {
		const log = vi.fn();
		const installDependencies = vi.fn();

		const filePathAppVue = path.join(ctx.project.root, "app.vue");

		await fs.mkdir(path.dirname(filePathAppVue), { recursive: true });
		await fs.writeFile(filePathAppVue, NUXT_DEFAULT_APP_VUE);

		await ctx.pluginRunner.callHook("project:init", {
			log,
			installDependencies,
		});

		const contents = await fs.readFile(
			path.join(ctx.project.root, "pages", "index.vue"),
			"utf8",
		);

		await expect(() => fs.access(filePathAppVue)).rejects.toThrowError(
			/no such file or directory/,
		);
		expect(contents).toBe(NUXT_DEFAULT_APP_VUE);
	});

	test("deletes default app.vue and doesn't create a new index page if existent", async (ctx) => {
		const log = vi.fn();
		const installDependencies = vi.fn();

		const filePathAppVue = path.join(ctx.project.root, "app.vue");

		await fs.mkdir(path.dirname(filePathAppVue), { recursive: true });
		await fs.writeFile(filePathAppVue, NUXT_DEFAULT_APP_VUE);

		const filePathIndexVue = path.join(ctx.project.root, "pages", "index.vue");
		const contents = "foo";

		await fs.mkdir(path.dirname(filePathIndexVue), { recursive: true });
		await fs.writeFile(filePathIndexVue, contents);

		await ctx.pluginRunner.callHook("project:init", {
			log,
			installDependencies,
		});

		const postHookContents = await fs.readFile(filePathIndexVue, "utf8");

		await expect(() => fs.access(filePathAppVue)).rejects.toThrowError(
			/no such file or directory/,
		);
		expect(postHookContents).toBe(contents);
	});

	test("doesn't delete app.vue is it's not the default one", async (ctx) => {
		const log = vi.fn();
		const installDependencies = vi.fn();

		const filePathAppVue = path.join(ctx.project.root, "app.vue");
		const contents = "foo";

		await fs.mkdir(path.dirname(filePathAppVue), { recursive: true });
		await fs.writeFile(filePathAppVue, contents);

		await ctx.pluginRunner.callHook("project:init", {
			log,
			installDependencies,
		});

		const postHookContents = await fs.readFile(filePathAppVue, "utf8");
		expect(postHookContents).toBe(contents);
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
