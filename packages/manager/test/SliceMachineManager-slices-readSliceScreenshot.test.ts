import { expect, it, vi } from "vitest";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { expectHookHandlerToHaveBeenCalledWithData } from "./__testutils__/expectHookHandlerToHaveBeenCalledWithData";

import { createSliceMachineManager } from "../src";

it("returns the Slice's variation screenshot asset", async () => {
	const imageData = Buffer.from("image-data");
	const hookHandler = vi.fn(() => {
		return { data: imageData };
	});
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("slice:asset:read", hookHandler);
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const res = await manager.slices.readSliceScreenshot({
		libraryID: "foo",
		sliceID: "bar",
		variationID: "baz",
	});

	expect(res).toStrictEqual({
		data: imageData,
		errors: [],
	});
	expectHookHandlerToHaveBeenCalledWithData(hookHandler, {
		libraryID: "foo",
		sliceID: "bar",
		assetID: `screenshot-baz.png`,
	});
});

it("validates the adapter's return value", async () => {
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			// @ts-expect-error - We are purposely returning an invalid value.
			hook("slice:asset:read", () => {
				return { data: Symbol() };
			});
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const res = await manager.slices.readSliceScreenshot({
		libraryID: "foo",
		sliceID: "bar",
		variationID: "baz",
	});

	expect(res).toStrictEqual({
		data: undefined,
		errors: [expect.objectContaining({ name: "DecodeError" })],
	});
});

it("ignores plugins that implement `custom-type:read:asset`", async () => {
	const imageData = Buffer.from("image-data");
	const ignoredImageData = Buffer.from("ignored-image-data");
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("slice:asset:read", () => {
				return { data: imageData };
			});
		},
	});
	const plugin = createTestPlugin({
		meta: { name: "ignored-plugin" },
		setup: ({ hook }) => {
			hook("slice:asset:read", () => {
				return { data: ignoredImageData };
			});
		},
	});
	const cwd = await createTestProject({ adapter, plugins: [plugin] });
	const manager = createSliceMachineManager({
		nativePlugins: {
			[adapter.meta.name]: adapter,
			[plugin.meta.name]: plugin,
		},
		cwd,
	});

	await manager.plugins.initPlugins();

	const res = await manager.slices.readSliceScreenshot({
		libraryID: "foo",
		sliceID: "bar",
		variationID: "baz",
	});

	expect(res).toStrictEqual({
		data: imageData,
		errors: [],
	});
});

it("throws if plugins have not been initialized", async () => {
	const cwd = await createTestProject();
	const manager = createSliceMachineManager({ cwd });

	await expect(async () => {
		await manager.slices.readSliceScreenshot({
			libraryID: "foo",
			sliceID: "bar",
			variationID: "baz",
		});
	}).rejects.toThrow(/plugins have not been initialized/i);
});
