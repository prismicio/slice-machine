import { it, expect } from "vitest";

import { createSliceMachineProject } from "./__testutils__/createSliceMachineProject";
import { createTestAdapter } from "./__testutils__/createTestAdapter";

import { createSliceMachinePluginRunner } from "../src";

it("returns Custom Type model", async (ctx) => {
	const model = ctx.mock.model.customType();

	const adapter = createTestAdapter({
		setup: ({ hook }) => {
			hook("custom-type:read", async (args) => {
				if (args.id === model.id) {
					return { model };
				}

				throw new Error("not implemented");
			});
		},
	});
	const project = createSliceMachineProject(adapter);

	const pluginRunner = createSliceMachinePluginRunner({ project });
	await pluginRunner.init();

	const res = await pluginRunner.rawActions.readCustomTypeModel({
		id: model.id,
	});
	expect(res).toStrictEqual({ model });
});

it("throws when no Custom Type model is returned", async () => {
	const adapter = createTestAdapter();
	const project = createSliceMachineProject(adapter);

	const pluginRunner = createSliceMachinePluginRunner({ project });
	await pluginRunner.init();

	const fn = () => pluginRunner.rawActions.readCustomTypeModel({ id: "foo" });
	await expect(fn).rejects.toThrowError("Custom Type `foo` not found.");
});
