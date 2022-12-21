import { expect, it } from "vitest";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";

import { createSliceMachineManager } from "../src";

it("returns all Slices", async (ctx) => {
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
				if (libraryID === "foo") {
					return { id: libraryID, sliceIDs: [model1.id] };
				} else if (libraryID === "bar") {
					return { id: libraryID, sliceIDs: [model2.id] };
				}

				throw new Error("not implemented");
			});
		},
	});
	const cwd = await createTestProject({ adapter, libraries: ["foo", "bar"] });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const res = await manager.slices.readAllSlices();

	expect(res).toStrictEqual({
		models: [
			{ libraryID: "foo", model: model1 },
			{ libraryID: "bar", model: model2 },
		],
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
