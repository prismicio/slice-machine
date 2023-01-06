import { expect, it, vi } from "vitest";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";

import { createSliceMachineManager } from "../src";
import { expectHookHandlerToHaveBeenCalledWithData } from "./__testutils__/expectHookHandlerToHaveBeenCalledWithData";

it("returns the adapter's `slice-library:read` return value", async () => {
	const sliceIDs = ["id1", "id2"];
	const hookHandler = vi.fn(() => {
		return { id: "foo", sliceIDs };
	});
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("slice-library:read", hookHandler);
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const res = await manager.slices.readSliceLibrary({ libraryID: "foo" });

	expect(res).toStrictEqual({
		sliceIDs: sliceIDs,
		errors: [],
	});
	expectHookHandlerToHaveBeenCalledWithData(hookHandler, {
		libraryID: "foo",
	});
});

it("validates the adapter's return value", async () => {
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			// @ts-expect-error - We are purposely returning an invalid value.
			hook("slice-library:read", () => {
				return { id: "foo", sliceIDs: [Symbol()] };
			});
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const res = await manager.slices.readSliceLibrary({ libraryID: "foo" });

	expect(res).toStrictEqual({
		sliceIDs: [],
		errors: [
			expect.objectContaining({
				message: expect.stringMatching(/expecting string/i),
			}),
		],
	});
});

it("ignores plugins that implement `slice-library:read`", async () => {
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("slice-library:read", () => {
				return { id: "foo", sliceIDs: ["id"] };
			});
		},
	});
	const plugin = createTestPlugin({
		meta: { name: "ignored-plugin" },
		setup: ({ hook }) => {
			hook("slice-library:read", () => {
				return { id: "foo", sliceIDs: ["id2"] };
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

	const res = await manager.slices.readSliceLibrary({ libraryID: "foo" });

	expect(res).toStrictEqual({
		sliceIDs: ["id"],
		errors: [],
	});
});

it("throws if plugins have not been initialized", async () => {
	const cwd = await createTestProject();
	const manager = createSliceMachineManager({ cwd });

	await expect(async () => {
		await manager.slices.readSliceLibrary({ libraryID: "foo" });
	}).rejects.toThrow(/plugins have not been initialized/i);
});
