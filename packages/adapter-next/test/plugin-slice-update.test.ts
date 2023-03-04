import { test, expect } from "vitest";
import { createMockFactory } from "@prismicio/mock";
import * as fs from "node:fs/promises";
import * as path from "node:path";

import { expectGlobalContentTypes } from "./__testutils__/expectGlobalContentTypes";

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
	name: "QuxQuux",
	variations: [mock.model.sharedSliceVariation()],
});

test("updates model.json file with new model", async (ctx) => {
	await ctx.pluginRunner.callHook("slice:create", {
		libraryID: "slices",
		model: oldModel,
	});
	await ctx.pluginRunner.callHook("slice:update", {
		libraryID: "slices",
		model: newModel,
	});

	expect(
		JSON.parse(
			await fs.readFile(
				path.join(ctx.project.root, "slices", "QuxQuux", "model.json"),
				"utf8",
			),
		),
	).toStrictEqual(newModel);
});

test("global types file contains new model", async (ctx) => {
	await ctx.pluginRunner.callHook("slice:create", {
		libraryID: "slices",
		model: oldModel,
	});
	await ctx.pluginRunner.callHook("slice:update", {
		libraryID: "slices",
		model: newModel,
	});

	await expectGlobalContentTypes(ctx, {
		generateTypesConfig: {
			sharedSliceModels: [newModel],
		},
	});
});
