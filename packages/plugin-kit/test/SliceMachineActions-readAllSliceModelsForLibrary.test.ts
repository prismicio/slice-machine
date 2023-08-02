import { it, expect } from "vitest";

import { createSliceMachinePluginRunner } from "../src";
import { createMemoryAdapter } from "./__testutils__/createMemoryAdapter";
import { replaceTestAdapter } from "./__testutils__/replaceTestAdapter";

it("returns all slice models for a library", async (ctx) => {
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

	const res = await pluginRunner.rawActions.readAllSliceModelsForLibrary({
		libraryID: sliceLibraries[0].id,
	});

	expect(res).toStrictEqual(
		sliceLibraries[0].models.map((model) => {
			return { model };
		}),
	);
});

it("throws when Slice Library does not exist", async (ctx) => {
	const adapter = createMemoryAdapter({ sliceLibraries: [] });

	await replaceTestAdapter(ctx, { adapter });

	const fn = () =>
		ctx.pluginRunner.rawActions.readAllSliceModelsForLibrary({
			libraryID: "foo",
		});
	await expect(fn).rejects.toThrowError("Slice library `foo` not found.");
});
