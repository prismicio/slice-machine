import { it, expect } from "vitest";

import { createSliceMachineProject } from "./__testutils__/createSliceMachineProject";
import { createTestAdapter } from "./__testutils__/createTestAdapter";

import { createSliceMachinePluginRunner } from "../src";

it("returns Slice library", async () => {
	const library = {
		id: "lib",
		sliceIDs: ["foo", "bar"],
	};

	const adapter = createTestAdapter({
		setup: ({ hook }) => {
			hook("slice-library:read", async (args) => {
				if (args.libraryID === library.id) {
					return library;
				}

				throw new Error("not implemented");
			});
		},
	});
	const project = createSliceMachineProject(adapter);

	const pluginRunner = createSliceMachinePluginRunner({ project });
	await pluginRunner.init();

	const res = await pluginRunner.rawActions.readSliceLibrary({
		libraryID: library.id,
	});
	expect(res).toStrictEqual(library);
});

it("throws when no Slice Library is returned", async () => {
	const adapter = createTestAdapter();
	const project = createSliceMachineProject(adapter);

	const pluginRunner = createSliceMachinePluginRunner({ project });
	await pluginRunner.init();

	const fn = () =>
		pluginRunner.rawActions.readSliceLibrary({ libraryID: "foo" });
	await expect(fn).rejects.toThrowError("Slice library `foo` not found.");
});
