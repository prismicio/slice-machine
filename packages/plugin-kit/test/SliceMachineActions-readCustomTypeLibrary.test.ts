import { it, expect } from "vitest";

import { createSliceMachineProject } from "./__testutils__/createSliceMachineProject";
import { createTestAdapter } from "./__testutils__/createTestAdapter";

import { createSliceMachinePluginRunner } from "../src";

it("returns the Custom Type library", async () => {
	const customTypeIDs = ["foo", "bar"];

	const adapter = createTestAdapter({
		setup: ({ hook }) => {
			hook("custom-type-library:read", async () => {
				return { ids: customTypeIDs };
			});
		},
	});
	const project = createSliceMachineProject(adapter);

	const pluginRunner = createSliceMachinePluginRunner({ project });
	await pluginRunner.init();

	const res = await pluginRunner.rawActions.readCustomTypeLibrary();
	expect(res).toStrictEqual({ ids: customTypeIDs });
});

it("throws when no Custom Type library is returned", async () => {
	const adapter = createTestAdapter();
	const project = createSliceMachineProject(adapter);

	const pluginRunner = createSliceMachinePluginRunner({ project });
	await pluginRunner.init();

	const fn = () => pluginRunner.rawActions.readCustomTypeLibrary();
	await expect(fn).rejects.toThrowError("Couldn't read Custom Type library.");
});
