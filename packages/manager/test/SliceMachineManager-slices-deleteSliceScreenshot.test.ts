import { expect, it, vi } from "vitest";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { expectHookHandlerToHaveBeenCalledWithData } from "./__testutils__/expectHookHandlerToHaveBeenCalledWithData";

import { createSliceMachineManager } from "../src";

it("deletes a Slice variation's screenshot from assets", async () => {
	const hookHandler = vi.fn();
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("slice:asset:delete", hookHandler);
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const res = await manager.slices.deleteSliceScreenshot({
		libraryID: "foo",
		sliceID: "bar",
		variationID: "baz",
	});

	expect(res).toStrictEqual({
		errors: [],
	});
	expectHookHandlerToHaveBeenCalledWithData(hookHandler, {
		libraryID: "foo",
		sliceID: "bar",
		assetID: `screenshot-baz.png`,
	});
});

it("throws if plugins have not been initialized", async () => {
	const cwd = await createTestProject();
	const manager = createSliceMachineManager({ cwd });

	await expect(async () => {
		await manager.slices.deleteSliceScreenshot({
			libraryID: "foo",
			sliceID: "bar",
			variationID: "baz",
		});
	}).rejects.toThrow(/plugins have not been initialized/i);
});
