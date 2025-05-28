import { vi, test, expect, describe, beforeAll } from "vitest";
import { createMockFactory } from "@prismicio/mock";
import { createSliceMachinePluginRunner } from "@slicemachine/plugin-kit";
import prettier from "prettier";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as tsm from "ts-morph";

import { parseSourceFile } from "./__testutils__/parseSourceFile";
import { testGlobalContentTypes } from "./__testutils__/testGlobalContentTypes";

import adapter from "../src";

/**
 * !!! DO NOT use this mock factory in tests !!!
 *
 * @remarks
 * Its seed is not specific to be used outside the most general cases.
 */
const mock = createMockFactory({ seed: import.meta.url });

// Slice model to be used in general tests.
const model = mock.model.sharedSlice({
	id: "bar_baz",
	name: "QuxQuux",
	variations: [mock.model.sharedSliceVariation()],
});

test("creates a Slice component, model, and global types file on Slice creation", async (ctx) => {
	await ctx.pluginRunner.callHook("slice:create", {
		libraryID: "slices",
		model,
	});

	expect(
		await fs.readdir(path.join(ctx.project.root, "slices", "QuxQuux")),
	).toStrictEqual(["index.svelte", "model.json"]);
	expect(await fs.readdir(path.join(ctx.project.root, "src"))).toContain(
		"prismicio-types.d.ts",
	);
});

test("supports configuring the location of the global types file", async (ctx) => {
	ctx.project.config.adapter.options.generatedTypesFilePath =
		"./foo/bar/baz.ts";
	const pluginRunner = createSliceMachinePluginRunner({
		project: ctx.project,
		nativePlugins: {
			[ctx.project.config.adapter.resolve]: adapter,
		},
	});
	await pluginRunner.init();

	await pluginRunner.callHook("slice:create", {
		libraryID: "slices",
		model,
	});

	expect(
		await fs.readdir(
			path.dirname(
				path.join(
					ctx.project.root,
					ctx.project.config.adapter.options.generatedTypesFilePath,
				),
			),
		),
	).toContain(
		path.basename(ctx.project.config.adapter.options.generatedTypesFilePath),
	);
});

test("upserts a library index.js file", async (ctx) => {
	await ctx.pluginRunner.callHook("slice:create", {
		libraryID: "slices",
		model,
	});

	expect(await fs.readdir(path.join(ctx.project.root, "slices")))
		.includes("index.js")
		.not.includes("index.ts");
});

test("upserts a library index.ts file when TypeScript is enabled", async (ctx) => {
	ctx.project.config.adapter.options.typescript = true;
	const pluginRunner = createSliceMachinePluginRunner({
		project: ctx.project,
		nativePlugins: {
			[ctx.project.config.adapter.resolve]: adapter,
		},
	});
	await pluginRunner.init();

	await pluginRunner.callHook("slice:create", { libraryID: "slices", model });

	expect(await fs.readdir(path.join(ctx.project.root, "slices")))
		.includes("index.ts")
		.not.includes("index.js");
});

test("library index file includes created Slice", async (ctx) => {
	await ctx.pluginRunner.callHook("slice:create", {
		libraryID: "slices",
		model,
	});

	const contents = await fs.readFile(
		path.join(ctx.project.root, "slices", "index.js"),
		"utf8",
	);
	const file = parseSourceFile(contents);

	expect(
		file
			.getImportDeclarationOrThrow("./QuxQuux/index.svelte")
			.getImportClauseOrThrow()
			.getText(),
	).toBe("QuxQuux");
	expect(
		file
			.getVariableDeclarationOrThrow("components")
			.getInitializerIfKindOrThrow(tsm.SyntaxKind.ObjectLiteralExpression)
			.getPropertyOrThrow("bar_baz")
			.getText(),
	).toBe("bar_baz: QuxQuux");
});

test("model.json file matches the given model", async (ctx) => {
	await ctx.pluginRunner.callHook("slice:create", {
		libraryID: "slices",
		model,
	});

	expect(
		JSON.parse(
			await fs.readFile(
				path.join(ctx.project.root, "slices", "QuxQuux", "model.json"),
				"utf8",
			),
		),
	).toStrictEqual(model);
});

test("model.json is formatted by default", async (ctx) => {
	await ctx.pluginRunner.callHook("slice:create", {
		libraryID: "slices",
		model,
	});

	const contents = await fs.readFile(
		path.join(ctx.project.root, "slices", "QuxQuux", "model.json"),
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

	await pluginRunner.callHook("slice:create", { libraryID: "slices", model });

	const contents = await fs.readFile(
		path.join(ctx.project.root, "slices", "QuxQuux", "model.json"),
		"utf8",
	);

	expect(contents).not.toBe(
		await prettier.format(contents, {
			...prettierOptions,
			parser: "json",
		}),
	);
});

test("component file has correct contents", async (ctx) => {
	await ctx.pluginRunner.callHook("slice:create", {
		libraryID: "slices",
		model,
	});

	const contents = await fs.readFile(
		path.join(ctx.project.root, "slices", "QuxQuux", "index.svelte"),
		"utf8",
	);

	expect(contents).includes("<script>");
	expect(contents).toMatchSnapshot();
});

test("component file is correctly typed when TypeScript is enabled", async (ctx) => {
	ctx.project.config.adapter.options.typescript = true;
	const pluginRunner = createSliceMachinePluginRunner({
		project: ctx.project,
		nativePlugins: {
			[ctx.project.config.adapter.resolve]: adapter,
		},
	});
	await pluginRunner.init();

	await pluginRunner.callHook("slice:create", { libraryID: "slices", model });

	const contents = await fs.readFile(
		path.join(ctx.project.root, "slices", "QuxQuux", "index.svelte"),
		"utf8",
	);

	expect(contents).includes('<script lang="ts">');
	expect(contents).toMatchSnapshot();
});

test("component file is formatted by default", async (ctx) => {
	await ctx.pluginRunner.callHook("slice:create", {
		libraryID: "slices",
		model,
	});

	const contents = await fs.readFile(
		path.join(ctx.project.root, "slices", "QuxQuux", "index.svelte"),
		"utf8",
	);

	expect(contents).toBe(
		await prettier.format(contents, {
			plugins: ["prettier-plugin-svelte"],
			parser: "svelte",
		}),
	);
});

test("component file is not formatted if formatting is disabled", async (ctx) => {
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

	await pluginRunner.callHook("slice:create", { libraryID: "slices", model });

	const contents = await fs.readFile(
		path.join(ctx.project.root, "slices", "QuxQuux", "index.svelte"),
		"utf8",
	);

	expect(contents).not.toBe(
		await prettier.format(contents, {
			...prettierOptions,
			plugins: ["prettier-plugin-svelte"],
			parser: "svelte",
		}),
	);
});

testGlobalContentTypes({
	model,
	hookCall: async ({ pluginRunner }) => {
		await pluginRunner.callHook("slice:create", { libraryID: "slices", model });
	},
});

test("component file contains given contents instead of default one", async (ctx) => {
	await ctx.pluginRunner.callHook("slice:create", {
		libraryID: "slices",
		model,
		componentContents: `
			<div>TestSliceCreate</div>
		`,
	});

	const componentContents = await fs.readFile(
		path.join(ctx.project.root, "slices", "QuxQuux", "index.svelte"),
		"utf8",
	);

	expect(componentContents).toContain("<div>TestSliceCreate</div>");
});

describe("Svelte <=4 syntax", () => {
	beforeAll(async () => {
		const originalVersion = await import("svelte/package.json");

		vi.doMock("svelte/package.json", () => ({ version: "4.0.0" }));

		return () => vi.doMock("svelte/package.json", () => originalVersion);
	});

	test("component file has correct contents", async (ctx) => {
		await ctx.pluginRunner.callHook("slice:create", {
			libraryID: "slices",
			model,
		});

		const contents = await fs.readFile(
			path.join(ctx.project.root, "slices", "QuxQuux", "index.svelte"),
			"utf8",
		);

		expect(contents).includes("<script>");
		expect(contents).toMatchSnapshot();
	});

	test("component file is correctly typed when TypeScript is enabled", async (ctx) => {
		ctx.project.config.adapter.options.typescript = true;
		const pluginRunner = createSliceMachinePluginRunner({
			project: ctx.project,
			nativePlugins: {
				[ctx.project.config.adapter.resolve]: adapter,
			},
		});
		await pluginRunner.init();

		await pluginRunner.callHook("slice:create", { libraryID: "slices", model });

		const contents = await fs.readFile(
			path.join(ctx.project.root, "slices", "QuxQuux", "index.svelte"),
			"utf8",
		);

		expect(contents).includes('<script lang="ts">');
		expect(contents).toMatchSnapshot();
	});
});
