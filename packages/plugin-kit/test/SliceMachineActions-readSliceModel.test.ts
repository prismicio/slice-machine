import { it, expect } from "vitest";

import { createSliceMachineProject } from "./__testutils__/createSliceMachineProject";

import { createTestAdapter } from "./__testutils__/createTestAdapter";
import { createSliceMachinePluginRunner } from "../src";

it("returns Slice model", async (ctx) => {
	const libraryID = "libraryID";
	const model = ctx.mock.model.sharedSlice();

	const adapter = createTestAdapter({
		setup: ({ hook }) => {
			hook("slice:read", async (args) => {
				if (args.libraryID === libraryID && args.sliceID === model.id) {
					return { model };
				}

				throw new Error("not implemented");
			});
		},
	});
	const project = createSliceMachineProject(adapter);

	const pluginRunner = createSliceMachinePluginRunner({ project });
	await pluginRunner.init();

	const res = await pluginRunner.rawActions.readSliceModel({
		libraryID,
		sliceID: model.id,
	});
	expect(res).toStrictEqual({ model });
});

it("throws when no slice model is returned", async () => {
	const adapter = createTestAdapter();
	const project = createSliceMachineProject(adapter);

	const pluginRunner = createSliceMachinePluginRunner({ project });
	await pluginRunner.init();

	const fn = () =>
		pluginRunner.rawActions.readSliceModel({
			libraryID: "foo",
			sliceID: "bar",
		});
	await expect(fn).rejects.toThrowError(
		"Slice `bar` not found in the `foo` library.",
	);
});
