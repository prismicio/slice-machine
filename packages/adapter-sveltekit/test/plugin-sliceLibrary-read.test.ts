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
const model1 = mock.model.sharedSlice({
	id: "bar_baz",
	variations: [mock.model.sharedSliceVariation()],
});

// Slice model to be used in general tests.
const model2 = mock.model.sharedSlice({
	id: "qux_quux",
	variations: [mock.model.sharedSliceVariation()],
});

test("returns Slice library data", async (ctx) => {
	const libraryID = "slices";
	await ctx.pluginRunner.callHook("slice:create", { libraryID, model: model1 });
	await ctx.pluginRunner.callHook("slice:create", { libraryID, model: model2 });

	const {
		data: [sliceLibrary],
	} = await ctx.pluginRunner.callHook("slice-library:read", { libraryID });

	expect(sliceLibrary).toStrictEqual({
		id: libraryID,
		sliceIDs: [model1.id, model2.id].sort(),
	});
});
