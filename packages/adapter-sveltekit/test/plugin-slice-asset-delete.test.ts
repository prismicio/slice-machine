import { test, expect } from "vitest";
import { createMockFactory } from "@prismicio/mock";
import { Buffer } from "node:buffer";

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

test("deletes the Slice asset", async (ctx) => {
	await ctx.pluginRunner.callHook("slice:create", {
		libraryID: "slices",
		model,
	});
	await ctx.pluginRunner.callHook("slice:asset:update", {
		libraryID: "slices",
		sliceID: model.id,
		asset: { id: assetID, data: assetData },
	});

	await ctx.pluginRunner.callHook("slice:asset:delete", {
		libraryID: "slices",
		sliceID: model.id,
		assetID,
	});

	const { data } = await ctx.pluginRunner.callHook("slice:asset:read", {
		libraryID: "slices",
		sliceID: model.id,
		assetID,
	});

	expect(data).toStrictEqual([]);
});
