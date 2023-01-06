import { expect, it, vi } from "vitest";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { expectHookHandlerToHaveBeenCalledWithData } from "./__testutils__/expectHookHandlerToHaveBeenCalledWithData";

import { createSliceMachineManager } from "../src";

it("returns the adapter's `slice:read` return value", async (ctx) => {
	const model = ctx.mockPrismic.model.sharedSlice();
	const hookHandler = vi.fn(() => {
		return { model };
	});
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("slice:read", hookHandler);
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const res = await manager.slices.readSlice({
		libraryID: "foo",
		sliceID: model.id,
	});

	expect(res).toStrictEqual({
		model,
		errors: [],
	});
	expectHookHandlerToHaveBeenCalledWithData(hookHandler, {
		libraryID: "foo",
		sliceID: model.id,
	});
});

it("validates the adapter's return value", async () => {
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			// @ts-expect-error - We are purposely returning an invalid value.
			hook("slice:read", () => {
				return { model: Symbol() };
			});
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const res = await manager.slices.readSlice({
		libraryID: "foo",
		sliceID: "id",
	});

	expect(res).toStrictEqual({
		model: undefined,
		errors: [expect.objectContaining({ name: "DecodeError" })],
	});
});

it("ignores plugins that implement `slice-library:read`", async (ctx) => {
	const model = ctx.mockPrismic.model.sharedSlice();
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("slice:read", () => {
				return { model };
			});
		},
	});
	const plugin = createTestPlugin({
		meta: { name: "ignored-plugin" },
		setup: ({ hook }) => {
			hook("slice:read", () => {
				return { model: ctx.mockPrismic.model.sharedSlice() };
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

	const res = await manager.slices.readSlice({
		libraryID: "foo",
		sliceID: model.id,
	});

	expect(res).toStrictEqual({
		model,
		errors: [],
	});
});

it("throws if plugins have not been initialized", async () => {
	const cwd = await createTestProject();
	const manager = createSliceMachineManager({ cwd });

	await expect(async () => {
		await manager.slices.readSlice({
			libraryID: "foo",
			sliceID: "id",
		});
	}).rejects.toThrow(/plugins have not been initialized/i);
});
