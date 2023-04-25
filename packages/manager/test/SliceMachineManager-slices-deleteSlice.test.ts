import { expect, it, vi } from "vitest";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { expectHookHandlerToHaveBeenCalledWithData } from "./__testutils__/expectHookHandlerToHaveBeenCalledWithData";

import { createSliceMachineManager } from "../src";

it("calls plugins' `slice:delete` hook", async (ctx) => {
	const model = ctx.mockPrismic.model.sharedSlice();
	const hookHandler = vi.fn();
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("slice:read", () => ({ model }));
			hook("custom-type-library:read", () => ({ ids: ["foo"] }));
			hook("custom-type:read", () => ({
				model: ctx.mockPrismic.model.customType(),
			}));
			hook("slice:delete", hookHandler);
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const res = await manager.slices.deleteSlice({
		libraryID: "foo",
		sliceID: model.id,
	});

	expectHookHandlerToHaveBeenCalledWithData(hookHandler, {
		libraryID: "foo",
		model,
	});
	expect(res).toStrictEqual({
		errors: [],
	});
});

it("throws if plugins have not been initialized", async (ctx) => {
	const cwd = await createTestProject();
	const manager = createSliceMachineManager({ cwd });

	await expect(async () => {
		await manager.slices.deleteSlice({
			libraryID: "foo",
			sliceID: ctx.mockPrismic.model.sharedSlice().id,
		});
	}).rejects.toThrow(/plugins have not been initialized/i);
});

it("removes deleted slice from custom types referencing it", async (ctx) => {
	const sliceModel = ctx.mockPrismic.model.sharedSlice();
	const mockCustomTypeWithoutSlice = ctx.mockPrismic.model.customType({
		tabs: {
			"Tab 1": {
				"Slice Zone": {
					type: "Slices",
					config: {
						choices: {},
					},
				},
			},
		},
	});

	const mockCustomTypeModelWithSlice = JSON.parse(
		JSON.stringify(mockCustomTypeWithoutSlice),
	);

	mockCustomTypeModelWithSlice.json["Tab 1"]["Slice Zone"].config.choices = {
		[sliceModel.id]: {
			type: "Slice",
		},
	};

	const updateCustomTypeHook = vi.fn();
	const deleteSliceHook = vi.fn();
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("slice:read", () => ({ model: sliceModel }));
			hook("custom-type-library:read", () => ({ ids: ["foo"] }));
			hook("custom-type:read", () => ({
				model: mockCustomTypeModelWithSlice,
			}));
			hook("slice:delete", deleteSliceHook);
			hook("custom-type:update", updateCustomTypeHook);
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const res = await manager.slices.deleteSlice({
		libraryID: "foo",
		sliceID: sliceModel.id,
	});

	expect(deleteSliceHook).toHaveBeenCalledOnce();
	expect(updateCustomTypeHook).toHaveBeenCalledOnce();
	expectHookHandlerToHaveBeenCalledWithData(updateCustomTypeHook, {
		model: mockCustomTypeWithoutSlice,
	});
	expect(res).toStrictEqual({
		errors: [],
	});
});
