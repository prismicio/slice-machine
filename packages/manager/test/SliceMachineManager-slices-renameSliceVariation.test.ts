import { expect, it, vi } from "vitest";
import { SharedSliceContent } from "@prismicio/types-internal/lib/content";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { expectHookHandlerToHaveBeenCalledWithData } from "./__testutils__/expectHookHandlerToHaveBeenCalledWithData";

import { createSliceMachineManager } from "../src";

const variationID = "baz";
const variationName = "Baz";
const newVariationID = "qux";
const newVariationName = "Qux";
const sliceMock: SharedSliceContent = {
	__TYPE__: "SharedSliceContent",
	variation: variationID,
	primary: {},
	items: [],
};

it("updates slice model by calling plugins' `slice:update` hook", async (ctx) => {
	const variationModel = ctx.mockPrismic.model.sharedSliceVariation({
		id: variationID,
		name: variationName,
	});
	const sliceModel = ctx.mockPrismic.model.sharedSlice({
		variations: [variationModel],
	});
	const newVariationModel = {
		...variationModel,
		name: newVariationName,
	};
	const newSliceModel = {
		...sliceModel,
		variations: [newVariationModel],
	};
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

	const res = await manager.slices.renameSliceVariation({
		libraryID: "foo",
		sliceID: "bar",
		variationID,
		model: newVariationModel,
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

// TODO: Implement when we support renaming variation ID, see: DT-1708
it.todo(
	"renames variation screenshot by calling plugins' `slice:asset:delete` and `slice:asset:update` hooks",
);

// TODO: Implement when we support renaming variation ID, see: DT-1708
it.todo(
	"renames variation mocks by calling plugins' `slice:asset:update` hook",
);

// TODO: Implement when we support renaming variation ID, see: DT-1708
it.todo("throws if renamed variation ID matches another existing variation");

// TODO: Remove when we support renaming variation ID, see: DT-1708
it("throws if variation ID is being renaming", async (ctx) => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	await expect(async () => {
		await manager.slices.renameSliceVariation({
			libraryID: "foo",
			sliceID: "bar",
			variationID,
			model: ctx.mockPrismic.model.sharedSliceVariation({
				id: newVariationID,
			}),
		});
	}).rejects.toThrow(
		/renaming variation ID is not supported yet by the backend, only rename its name/i,
	);
});

it("throws if plugins have not been initialized", async (ctx) => {
	const cwd = await createTestProject();
	const manager = createSliceMachineManager({ cwd });

	await expect(async () => {
		await manager.slices.renameSliceVariation({
			libraryID: "foo",
			sliceID: "bar",
			variationID,
			model: ctx.mockPrismic.model.sharedSliceVariation({ id: variationID }),
		});
	}).rejects.toThrow(/plugins have not been initialized/i);
});
