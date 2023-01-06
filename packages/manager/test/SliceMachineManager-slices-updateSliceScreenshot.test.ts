import { expect, it, vi } from "vitest";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { expectHookHandlerToHaveBeenCalledWithData } from "./__testutils__/expectHookHandlerToHaveBeenCalledWithData";

import { createSliceMachineManager } from "../src";

it("saves a Slice variation's screenshot as an asset", async () => {
	const imageData = Buffer.from("image-data");
	const hookHandler = vi.fn();
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("slice:asset:update", hookHandler);
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const res = await manager.slices.updateSliceScreenshot({
		libraryID: "foo",
		sliceID: "bar",
		variationID: "baz",
		data: imageData,
	});

	expect(res).toStrictEqual({
		errors: [],
	});
	expectHookHandlerToHaveBeenCalledWithData(hookHandler, {
		libraryID: "foo",
		sliceID: "bar",
		asset: {
			id: `screenshot-baz.png`,
			data: imageData,
		},
	});
});

it("throws if plugins have not been initialized", async () => {
	const cwd = await createTestProject();
	const manager = createSliceMachineManager({ cwd });

	await expect(async () => {
		await manager.slices.updateSliceScreenshot({
			libraryID: "foo",
			sliceID: "bar",
			variationID: "baz",
			data: Buffer.from("image-data"),
		});
	}).rejects.toThrow(/plugins have not been initialized/i);
});
