import { expect, it } from "vitest";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";

import { createSliceMachineManager } from "../src";

it("returns all Slices for a Slice Library", async (ctx) => {
	const model1 = ctx.mockPrismic.model.sharedSlice();
	const model2 = ctx.mockPrismic.model.sharedSlice();
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("slice:read", ({ sliceID }) => {
				if (sliceID === model1.id) {
					return { model: model1 };
				} else if (sliceID === model2.id) {
					return { model: model2 };
				}

				throw new Error("not implemented");
			});
			hook("slice-library:read", ({ libraryID }) => {
				return { id: libraryID, sliceIDs: [model1.id, model2.id] };
			});
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const res = await manager.slices.readAllSlicesForLibrary({
		libraryID: "foo",
	});

	expect(res).toStrictEqual({
		models: [{ model: model1 }, { model: model2 }],
		errors: [],
	});
});

it("throws if plugins have not been initialized", async () => {
	const cwd = await createTestProject();
	const manager = createSliceMachineManager({ cwd });

	await expect(async () => {
		await manager.slices.readAllSliceLibraries();
	}).rejects.toThrow(/plugins have not been initialized/i);
});
