import { test, expect } from "vitest";
import { createMockFactory } from "@prismicio/mock";

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

test("returns the Slice model", async (ctx) => {
	await ctx.pluginRunner.callHook("slice:create", {
		libraryID: "slices",
		model,
	});

	const {
		data: [resModel],
	} = await ctx.pluginRunner.callHook("slice:read", {
		libraryID: "slices",
		sliceID: model.id,
	});

	expect(resModel).toStrictEqual({ model });
});
