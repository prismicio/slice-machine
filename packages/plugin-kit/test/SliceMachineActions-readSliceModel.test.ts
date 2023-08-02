import { it, expect } from "vitest";

import { createMemoryAdapter } from "./__testutils__/createMemoryAdapter";
import { replaceTestAdapter } from "./__testutils__/replaceTestAdapter";

it("returns Slice model", async (ctx) => {
	const libraryID = "libraryID";
	const model = ctx.mock.model.sharedSlice();
	const sliceLibraries = [{ id: libraryID, models: [model] }];

	const adapter = createMemoryAdapter({ sliceLibraries });

	await replaceTestAdapter(ctx, { adapter });

	const res = await ctx.pluginRunner.rawActions.readSliceModel({
		libraryID,
		sliceID: model.id,
	});

	expect(res).toStrictEqual({ model });
});

it("throws when no slice model is returned", async (ctx) => {
	const libraryID = "libraryID";
	const sliceLibraries = [{ id: libraryID, models: [] }];

	const adapter = createMemoryAdapter({ sliceLibraries });

	await replaceTestAdapter(ctx, { adapter });

	const fn = () =>
		ctx.pluginRunner.rawActions.readSliceModel({
			libraryID,
			sliceID: "foo",
		});
	await expect(fn).rejects.toThrowError(
		`Slice \`foo\` not found in the \`${libraryID}\` library.`,
	);
});
