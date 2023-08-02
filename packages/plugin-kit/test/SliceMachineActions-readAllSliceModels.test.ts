import { it, expect } from "vitest";

import { createMemoryAdapter } from "./__testutils__/createMemoryAdapter";

import { createSliceMachinePluginRunner } from "../src";

it("returns all slice models from all libraries", async (ctx) => {
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

	const res = await pluginRunner.rawActions.readAllSliceModels();

	expect(res).toStrictEqual(
		sliceLibraries.flatMap((library) =>
			library.models.map((model) => {
				return {
					libraryID: library.id,
					model,
				};
			}),
		),
	);
});

it("returns empty array when project has no Slice Libraries", async (ctx) => {
	ctx.project.config.adapter = createMemoryAdapter({ sliceLibraries: [] });
	ctx.project.config.libraries = [];

	const pluginRunner = createSliceMachinePluginRunner({ project: ctx.project });

	await pluginRunner.init();

	const res = await pluginRunner.rawActions.readAllSliceModels();

	expect(res).toStrictEqual([]);
});
