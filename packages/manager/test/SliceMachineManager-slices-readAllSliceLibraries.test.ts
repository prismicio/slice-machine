import { expect, it } from "vitest";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";

import { createSliceMachineManager } from "../src";

it("returns all Slice Libraries defined in the project's Slice Machine config", async () => {
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("slice-library:read", ({ libraryID }) => {
				if (libraryID === "foo") {
					return { id: "foo", sliceIDs: ["id1", "id2"] };
				} else if (libraryID === "bar") {
					return { id: "bar", sliceIDs: ["id3", "id4"] };
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

	const res = await manager.slices.readAllSliceLibraries();

	expect(res).toStrictEqual({
		libraries: [
			{ libraryID: "foo", sliceIDs: ["id1", "id2"] },
			{ libraryID: "bar", sliceIDs: ["id3", "id4"] },
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
