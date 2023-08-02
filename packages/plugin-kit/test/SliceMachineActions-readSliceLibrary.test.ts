import { it, expect } from "vitest";

import { createMemoryAdapter } from "./__testutils__/createMemoryAdapter";
import { replaceTestAdapter } from "./__testutils__/replaceTestAdapter";

import { createSliceMachinePluginRunner } from "../src";

it("returns Slice library", async (ctx) => {
	const sliceLibraries = [
		{
			id: "lib-1",
			models: [ctx.mock.model.sharedSlice(), ctx.mock.model.sharedSlice()],
		},
		{
			id: "lib-2",
			models: [ctx.mock.model.sharedSlice(), ctx.mock.model.sharedSlice()],
		},
	];

	ctx.project.config.adapter = createMemoryAdapter({ sliceLibraries });
	ctx.project.config.libraries = sliceLibraries.map((library) => library.id);

	const pluginRunner = createSliceMachinePluginRunner({ project: ctx.project });

	await pluginRunner.init();

	const res = await pluginRunner.rawActions.readSliceLibrary({
		libraryID: sliceLibraries[0].id,
	});
	expect(res).toStrictEqual({
		id: sliceLibraries[0].id,
		sliceIDs: sliceLibraries[0].models.map((model) => model.id),
	});
});

it("throws when no Slice Library is returned", async (ctx) => {
	const adapter = createMemoryAdapter({ customTypeModels: [] });

	await replaceTestAdapter(ctx, { adapter });

	const fn = () =>
		ctx.pluginRunner.rawActions.readSliceLibrary({ libraryID: "foo" });
	await expect(fn).rejects.toThrowError("Slice library `foo` not found.");
});
