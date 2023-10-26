import { test, expect } from "vitest";
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
	).toStrictEqual(["index.js", "model.json"]);
	expect(await fs.readdir(ctx.project.root)).toContain("prismicio-types.d.ts");
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
			.getImportDeclarationOrThrow("next/dynamic")
			.getImportClauseOrThrow()
			.getText(),
	).toBe("dynamic");
	expect(
		file
			.getVariableDeclarationOrThrow("components")
			.getInitializerIfKindOrThrow(tsm.SyntaxKind.ObjectLiteralExpression)
			.getPropertyOrThrow("bar_baz")
			.getText(),
	).toBe('bar_baz: dynamic(() => import("./QuxQuux"))');
});

test("library index file includes created Slice without lazy-loading when disabled", async (ctx) => {
	ctx.project.config.adapter.options.lazyLoadSlices = false;
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

	const contents = await fs.readFile(
		path.join(ctx.project.root, "slices", "index.js"),
		"utf8",
	);
	const file = parseSourceFile(contents);

	expect(
		file
			.getImportDeclarationOrThrow("./QuxQuux")
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

test("component file contains default export containing a component", async (ctx) => {
	await ctx.pluginRunner.callHook("slice:create", {
		libraryID: "slices",
		model,
	});

	const contents = await fs.readFile(
		path.join(ctx.project.root, "slices", "QuxQuux", "index.js"),
		"utf8",
	);

	expect(/^default export QuxQuux;?$/.test(contents));
});

test("component file is correctly typed with JSDoc when TypeScript is disabled", async (ctx) => {
	await ctx.pluginRunner.callHook("slice:create", {
		libraryID: "slices",
		model,
	});

	const contents = await fs.readFile(
		path.join(ctx.project.root, "slices", "QuxQuux", "index.js"),
		"utf8",
	);
	const file = parseSourceFile(contents);
	const jsDocTags = file
		.getVariableStatementOrThrow("QuxQuux")
		.getJsDocs()[0]
		.getTags()
		.map((tag) => tag.getText());

	expect(jsDocTags).toStrictEqual([
		'@typedef {import("@prismicio/client").Content.QuxQuuxSlice} QuxQuuxSlice',
		'@typedef {import("@prismicio/react").SliceComponentProps<QuxQuuxSlice>} QuxQuuxProps',
		"@param {QuxQuuxProps}\n ",
	]);
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
		path.join(ctx.project.root, "slices", "QuxQuux", "index.tsx"),
		"utf8",
	);
	const file = parseSourceFile(contents);
	const propsTypeAlias = file.getTypeAliasOrThrow("QuxQuuxProps");

	expect(file.getImportDeclarationOrThrow("@prismicio/client").getText()).toBe(
		'import { Content } from "@prismicio/client";',
	);
	expect(propsTypeAlias.getTypeNodeOrThrow().getText()).toBe(
		"SliceComponentProps<Content.QuxQuuxSlice>",
	);
	expect(propsTypeAlias.isExported()).toBe(true);
	expect(
		file.getVariableDeclarationOrThrow("QuxQuux").getType().getText(),
	).toBe(
		"({ slice }: SliceComponentProps<Content.QuxQuuxSlice>) => JSX.Element",
	);
});

test("component file writes to .js file by default", async (ctx) => {
	await ctx.pluginRunner.callHook("slice:create", {
		libraryID: "slices",
		model,
	});

	expect(await fs.readdir(path.join(ctx.project.root, "slices", "QuxQuux")))
		.includes("index.js")
		.not.includes("index.jsx")
		.not.includes("index.tsx");
});

test("component file writes to .jsx file if JSX extension is enabled", async (ctx) => {
	ctx.project.config.adapter.options.jsxExtension = true;
	const pluginRunner = createSliceMachinePluginRunner({
		project: ctx.project,
		nativePlugins: {
			[ctx.project.config.adapter.resolve]: adapter,
		},
	});
	await pluginRunner.init();

	await pluginRunner.callHook("slice:create", { libraryID: "slices", model });

	expect(await fs.readdir(path.join(ctx.project.root, "slices", "QuxQuux")))
		.includes("index.jsx")
		.not.includes("index.js")
		.not.includes("index.tsx");
});

test("component file writes to .tsx file if TypeScript is enabled", async (ctx) => {
	ctx.project.config.adapter.options.typescript = true;
	const pluginRunner = createSliceMachinePluginRunner({
		project: ctx.project,
		nativePlugins: {
			[ctx.project.config.adapter.resolve]: adapter,
		},
	});
	await pluginRunner.init();

	await pluginRunner.callHook("slice:create", { libraryID: "slices", model });

	expect(await fs.readdir(path.join(ctx.project.root, "slices", "QuxQuux")))
		.includes("index.tsx")
		.not.includes("index.js")
		.not.includes("index.jsx");
});

test("component file is formatted by default", async (ctx) => {
	await ctx.pluginRunner.callHook("slice:create", {
		libraryID: "slices",
		model,
	});

	const contents = await fs.readFile(
		path.join(ctx.project.root, "slices", "QuxQuux", "index.js"),
		"utf8",
	);

	expect(contents).toBe(
		await prettier.format(contents, { parser: "typescript" }),
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
		path.join(ctx.project.root, "slices", "QuxQuux", "index.js"),
		"utf8",
	);

	expect(contents).not.toBe(
		await prettier.format(contents, {
			...prettierOptions,
			parser: "typescript",
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
			export default function TestSliceCreate() {
				return (
					<div>Custom contents</div>
				);
			}
		`,
	});

	const componentContents = await fs.readFile(
		path.join(ctx.project.root, "slices", "QuxQuux", "index.js"),
		"utf8",
	);

	expect(componentContents).toContain(
		"export default function TestSliceCreate()",
	);
});
