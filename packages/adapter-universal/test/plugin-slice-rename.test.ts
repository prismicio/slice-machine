import { test, expect } from "vitest";
import { createMockFactory } from "@prismicio/mock";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as tsm from "ts-morph";

import { parseSourceFile } from "./__testutils__/parseSourceFile";
import { testGlobalContentTypes } from "./__testutils__/testGlobalContentTypes";

/**
 * !!! DO NOT use this mock factory in tests !!!
 *
 * @remarks
 * Its seed is not specific to be used outside the most general cases.
 */
const mock = createMockFactory({ seed: import.meta.url });

// Slice model to be used in general tests.
const oldModel = mock.model.sharedSlice({
	id: "bar_baz",
	name: "QuxQuux",
	variations: [mock.model.sharedSliceVariation()],
});

// Slice model to be used in general tests.
const newModel = mock.model.sharedSlice({
	id: "bar_baz",
	name: "NewModel",
	variations: [mock.model.sharedSliceVariation()],
});

test("renames the Slice directory", async (ctx) => {
	await ctx.pluginRunner.callHook("slice:create", {
		libraryID: "slices",
		model: oldModel,
	});
	await ctx.pluginRunner.callHook("slice:rename", {
		libraryID: "slices",
		model: newModel,
	});

	expect(
		await fs.readdir(path.join(ctx.project.root, "slices", "NewModel")),
	).toStrictEqual(["index.js", "model.json"]);
});

test("updates the Slice in the library index", async (ctx) => {
	await ctx.pluginRunner.callHook("slice:create", {
		libraryID: "slices",
		model: oldModel,
	});

	const beforeFile = parseSourceFile(
		await fs.readFile(
			path.join(ctx.project.root, "slices", "index.js"),
			"utf8",
		),
	);

	expect(
		beforeFile
			.getVariableDeclarationOrThrow("components")
			.getInitializerIfKindOrThrow(tsm.SyntaxKind.ObjectLiteralExpression)
			.getPropertyOrThrow("bar_baz")
			.getLastChildOrThrow()
			.getText(),
	).toMatch('"./QuxQuux"');

	await ctx.pluginRunner.callHook("slice:rename", {
		libraryID: "slices",
		model: newModel,
	});

	const afterFile = parseSourceFile(
		await fs.readFile(
			path.join(ctx.project.root, "slices", "index.js"),
			"utf8",
		),
	);

	expect(
		afterFile
			.getVariableDeclarationOrThrow("components")
			.getInitializerIfKindOrThrow(tsm.SyntaxKind.ObjectLiteralExpression)
			.getPropertyOrThrow("bar_baz")
			.getLastChildOrThrow()
			.getText(),
	).toMatch('"./NewModel"');
});

testGlobalContentTypes({
	model: newModel,
	hookCall: async ({ pluginRunner }) => {
		await pluginRunner.callHook("slice:create", {
			libraryID: "slices",
			model: oldModel,
		});
		await pluginRunner.callHook("slice:rename", {
			libraryID: "slices",
			model: newModel,
		});
	},
});
