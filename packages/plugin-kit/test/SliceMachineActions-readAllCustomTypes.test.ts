import { it, expect } from "vitest";

import { createSliceMachineProject } from "./__testutils__/createSliceMachineProject";
import { createTestAdapter } from "./__testutils__/createTestAdapter";

import { createSliceMachinePluginRunner } from "../src";

it("returns all Custom Type models", async (ctx) => {
	const customTypeModels = [
		ctx.mock.model.customType(),
		ctx.mock.model.customType(),
	];

	const adapter = createTestAdapter({
		setup: ({ hook }) => {
			hook("custom-type-library:read", async () => {
				return { ids: customTypeModels.map((model) => model.id) };
			});
			hook("custom-type:read", async (args) => {
				const model = customTypeModels.find(
					(customTypeModel) => customTypeModel.id === args.id,
				);

				if (model) {
					return { model };
				}

				throw new Error("not implemented");
			});
		},
	});
	const project = createSliceMachineProject(adapter);

	const pluginRunner = createSliceMachinePluginRunner({ project });
	await pluginRunner.init();

	const res = await pluginRunner.rawActions.readAllCustomTypeModels();
	expect(res).toStrictEqual(
		customTypeModels.map((model) => {
			return { model };
		}),
	);
});

it("returns empty array when project has no Custom Types", async () => {
	const adapter = createTestAdapter({
		setup: ({ hook }) => {
			hook("custom-type-library:read", async () => {
				return { ids: [] };
			});
		},
	});
	const project = createSliceMachineProject(adapter);

	const pluginRunner = createSliceMachinePluginRunner({ project });
	await pluginRunner.init();

	const res = await pluginRunner.rawActions.readAllCustomTypeModels();
	expect(res).toStrictEqual([]);
});
