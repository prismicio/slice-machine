import { test, expect } from "vitest";
import { createMockFactory } from "@prismicio/mock";
import { createSliceMachinePluginRunner } from "@slicemachine/plugin-kit";
import prettier from "prettier";
import * as fs from "node:fs/promises";
import * as path from "node:path";

import { testGlobalContentTypes } from "./__testutils__/testGlobalContentTypes";

import adapter from "../src";

/**
 * !!! DO NOT use this mock factory in tests !!!
 *
 * @remarks
 * Its seed is not specific enough to be used outside the most general cases.
 */
const mock = createMockFactory({ seed: import.meta.url });

// Custom Type model to be used in general tests.
const model = mock.model.customType({ id: "foo" });

test("creates a Custom Type model and global types file on Slice creation", async (ctx) => {
	await ctx.pluginRunner.callHook("custom-type:create", { model });

	expect(
		await fs.readdir(path.join(ctx.project.root, "customtypes", model.id)),
	).toStrictEqual(["index.json"]);
	expect(await fs.readdir(ctx.project.root)).toContain("prismicio-types.d.ts");
});

test("model file matches the given model", async (ctx) => {
	await ctx.pluginRunner.callHook("custom-type:create", { model });

	expect(
		JSON.parse(
			await fs.readFile(
				path.join(ctx.project.root, "customtypes", model.id, "index.json"),
				"utf8",
			),
		),
	).toStrictEqual(model);
});

test("model.json is formatted by default", async (ctx) => {
	await ctx.pluginRunner.callHook("custom-type:create", { model });

	const contents = await fs.readFile(
		path.join(ctx.project.root, "customtypes", model.id, "index.json"),
		"utf8",
	);

	expect(contents).toBe(await prettier.format(contents, { parser: "json" }));
});

test("model.json is not formatted if formatting is disabled", async (ctx) => {
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

	await pluginRunner.callHook("custom-type:create", { model });

	const contents = await fs.readFile(
		path.join(ctx.project.root, "customtypes", model.id, "index.json"),
		"utf8",
	);

	expect(contents).not.toBe(
		await prettier.format(contents, {
			...prettierOptions,
			parser: "json",
		}),
	);
});

testGlobalContentTypes({
	model,
	hookCall: async ({ pluginRunner }) => {
		await pluginRunner.callHook("custom-type:create", { model });
	},
});
