import { expect, it, vi } from "vitest";
import { SharedSliceContent } from "@prismicio/types-internal/lib/content";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { expectHookHandlerToHaveBeenCalledWithData } from "./__testutils__/expectHookHandlerToHaveBeenCalledWithData";

import { createSliceMachineManager } from "../src";

const variationID = "baz";
const sliceMock: SharedSliceContent = {
	__TYPE__: "SharedSliceContent",
	variation: variationID,
	primary: {},
	items: [],
};

it("updates slice model by calling plugins' `slice:update` hook", async (ctx) => {
	const variationModel = ctx.mockPrismic.model.sharedSliceVariation({
		id: variationID,
	});
	const sliceModel = ctx.mockPrismic.model.sharedSlice({
		variations: [variationModel],
	});
	const newSliceModel = { ...sliceModel, variations: [] };
	const mocks = [sliceMock];
	const hookHandler = vi.fn();
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("slice:read", () => {
				return { model: sliceModel };
			});
			hook("slice:update", hookHandler);
			hook("slice:asset:read", () => {
				return { data: Buffer.from(JSON.stringify(mocks)) };
			});
			hook("slice:asset:update", vi.fn());
			hook("slice:asset:delete", vi.fn());
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const res = await manager.slices.deleteSliceVariation({
		libraryID: "foo",
		sliceID: "bar",
		variationID,
	});

	expectHookHandlerToHaveBeenCalledWithData(hookHandler, {
		libraryID: "foo",
		model: newSliceModel,
	});
	expect(res).toStrictEqual({
		errors: [],
		assetsErrors: [],
	});
});

it("cleans up variation screenshot by calling plugins' `slice:asset:delete` hook", async (ctx) => {
	const variationModel = ctx.mockPrismic.model.sharedSliceVariation({
		id: variationID,
	});
	const sliceModel = ctx.mockPrismic.model.sharedSlice({
		variations: [variationModel],
	});
	const mocks = [sliceMock];
	const hookHandler = vi.fn();
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("slice:read", () => {
				return { model: sliceModel };
			});
			hook("slice:update", vi.fn());
			hook("slice:asset:read", () => {
				return { data: Buffer.from(JSON.stringify(mocks)) };
			});
			hook("slice:asset:update", vi.fn());
			hook("slice:asset:delete", hookHandler);
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const res = await manager.slices.deleteSliceVariation({
		libraryID: "foo",
		sliceID: "bar",
		variationID,
	});

	expectHookHandlerToHaveBeenCalledWithData(hookHandler, {
		libraryID: "foo",
		sliceID: "bar",
		assetID: `screenshot-${variationID}.png`,
	});
	expect(res).toStrictEqual({
		errors: [],
		assetsErrors: [],
	});
});

it("cleans up variation mocks by calling plugins' `slice:asset:update` hook", async (ctx) => {
	const variationModel = ctx.mockPrismic.model.sharedSliceVariation({
		id: variationID,
	});
	const sliceModel = ctx.mockPrismic.model.sharedSlice({
		variations: [variationModel],
	});
	const mocks = [sliceMock];
	const hookHandler = vi.fn();
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("slice:read", () => {
				return { model: sliceModel };
			});
			hook("slice:update", vi.fn());
			hook("slice:asset:read", () => {
				return { data: Buffer.from(JSON.stringify(mocks)) };
			});
			hook("slice:asset:update", hookHandler);
			hook("slice:asset:delete", vi.fn());
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const res = await manager.slices.deleteSliceVariation({
		libraryID: "foo",
		sliceID: "bar",
		variationID,
	});

	expectHookHandlerToHaveBeenCalledWithData(hookHandler, {
		libraryID: "foo",
		sliceID: "bar",
		asset: {
			data: Buffer.from(JSON.stringify([])),
			id: "mocks.json",
		},
	});
	expect(res).toStrictEqual({
		errors: [],
		assetsErrors: [],
	});
});

it("throws if plugins have not been initialized", async () => {
	const cwd = await createTestProject();
	const manager = createSliceMachineManager({ cwd });

	await expect(async () => {
		await manager.slices.deleteSliceVariation({
			libraryID: "foo",
			sliceID: "bar",
			variationID,
		});
	}).rejects.toThrow(/plugins have not been initialized/i);
});
