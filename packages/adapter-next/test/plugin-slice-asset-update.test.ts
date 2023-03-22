import { test, expect } from "vitest";
import { createMockFactory } from "@prismicio/mock";
import { Buffer } from "node:buffer";
import * as fs from "node:fs/promises";
import * as path from "node:path";

/**
 * !!! DO NOT use this mock factory in tests !!!
 *
 * @remarks
 * Its seed is not specific enough to be used outside the most general cases.
 */
const mock = createMockFactory({ seed: import.meta.url });

// Slice model to be used in general tests.
const model = mock.model.sharedSlice({
	id: "bar_baz",
	variations: [mock.model.sharedSliceVariation()],
});

const assetID = "slices.txt";
const assetData = Buffer.from("data");

test("writes a new Slice asset", async (ctx) => {
	await ctx.pluginRunner.callHook("slice:create", {
		libraryID: "slices",
		model,
	});
	await ctx.pluginRunner.callHook("slice:asset:update", {
		libraryID: "slices",
		sliceID: model.id,
		asset: { id: assetID, data: assetData },
	});

	expect(
		await fs.readFile(path.join(ctx.project.root, "slices", "BarBaz", assetID)),
	).toStrictEqual(assetData);
});

test("updates an existing Slice asset", async (ctx) => {
	await ctx.pluginRunner.callHook("slice:create", {
		libraryID: "slices",
		model,
	});
	await ctx.pluginRunner.callHook("slice:asset:update", {
		libraryID: "slices",
		sliceID: model.id,
		asset: { id: assetID, data: assetData },
	});

	const newAssetData = Buffer.from("new data");
	await ctx.pluginRunner.callHook("slice:asset:update", {
		libraryID: "slices",
		sliceID: model.id,
		asset: { id: assetID, data: newAssetData },
	});

	expect(
		await fs.readFile(path.join(ctx.project.root, "slices", "BarBaz", assetID)),
	).toStrictEqual(newAssetData);
});

test("supports models with mismatching ID and name", async (ctx) => {
	const model = ctx.mock.model.sharedSlice({
		id: "foo",
		name: "Bar",
	});

	await ctx.pluginRunner.callHook("slice:create", {
		libraryID: "slices",
		model,
	});
	await ctx.pluginRunner.callHook("slice:asset:update", {
		libraryID: "slices",
		sliceID: model.id,
		asset: { id: assetID, data: assetData },
	});

	expect(
		await fs.readFile(path.join(ctx.project.root, "slices", "Bar", assetID)),
	).toStrictEqual(assetData);
});
