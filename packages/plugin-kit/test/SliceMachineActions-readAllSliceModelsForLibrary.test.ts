import { it, expect } from "vitest";

import { createSliceMachineProject } from "./__testutils__/createSliceMachineProject";
import { createTestAdapter } from "./__testutils__/createTestAdapter";

import { createSliceMachinePluginRunner } from "../src";

it("returns all slice models for a library", async (ctx) => {
	const models = [ctx.mock.model.sharedSlice(), ctx.mock.model.sharedSlice()];
	const library = {
		id: "lib",
		sliceIDs: models.map((model) => model.id),
	};

	const adapter = createTestAdapter({
		setup: ({ hook }) => {
			hook("slice-library:read", async (args) => {
				if (args.libraryID === library.id) {
					return library;
				}

				throw new Error("not implemented");
			});
			hook("slice:read", async (args) => {
				if (args.libraryID === library.id) {
					const model = models.find((model) => model.id === args.sliceID);

					if (model) {
						return { model };
					}
				}

				throw new Error("not implemented");
			});
		},
	});
	const project = createSliceMachineProject(adapter);
	project.config.libraries = [library.id];

	const pluginRunner = createSliceMachinePluginRunner({ project });
	await pluginRunner.init();

	const res = await pluginRunner.rawActions.readAllSliceModelsForLibrary({
		libraryID: library.id,
	});
	expect(res).toStrictEqual(
		models.map((model) => {
			return { model };
		}),
	);
});

it("throws when Slice Library does not exist", async () => {
	const adapter = createTestAdapter();
	const project = createSliceMachineProject(adapter);

	const pluginRunner = createSliceMachinePluginRunner({ project });
	await pluginRunner.init();

	const fn = () =>
		pluginRunner.rawActions.readAllSliceModelsForLibrary({ libraryID: "foo" });
	await expect(fn).rejects.toThrowError("Slice library `foo` not found.");
});
