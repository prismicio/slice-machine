import { test, expect } from "vitest";
import { createMockFactory } from "@prismicio/mock";
import { createSliceMachinePluginRunner } from "@slicemachine/plugin-kit";
import prettier from "prettier";
import * as fs from "node:fs/promises";
import * as path from "node:path";

import { expectGlobalContentTypes } from "./__testutils__/expectGlobalContentTypes";

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
	expect(await fs.readdir(ctx.project.root)).toContain("prismicio.d.ts");
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

	expect(contents).toBe(prettier.format(contents, { parser: "json" }));
});

test("model.json is not formatted if formatting is disabled", async (ctx) => {
	ctx.project.config.adapter.options.format = false;
	const pluginRunner = createSliceMachinePluginRunner({ project: ctx.project });
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
		prettier.format(contents, {
			...prettierOptions,
			parser: "json",
		}),
	);
});

test("global types file contains TypeScript types for the model", async (ctx) => {
	await ctx.pluginRunner.callHook("custom-type:create", { model });

	await expectGlobalContentTypes(ctx, {
		generateTypesConfig: {
			customTypeModels: [model],
		},
	});
});

test("global types file is not formatted if formatting is disabled", async (ctx) => {
	ctx.project.config.adapter.options.format = false;
	const pluginRunner = createSliceMachinePluginRunner({ project: ctx.project });
	await pluginRunner.init();

	await pluginRunner.callHook("custom-type:create", { model });

	await expectGlobalContentTypes(ctx, {
		generateTypesConfig: {
			customTypeModels: [model],
		},
		format: false,
	});
});