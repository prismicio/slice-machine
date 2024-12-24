import { expect, it, vi } from "vitest";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";

import { createSliceMachineManager } from "../src";
import { expectHookHandlerToHaveBeenCalledWithData } from "./__testutils__/expectHookHandlerToHaveBeenCalledWithData";

it("returns the adapter's `custom-type:read` return value", async (ctx) => {
	const model = ctx.mockPrismic.model.customType();
	const hookHandler = vi.fn(() => {
		return { model };
	});
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("custom-type:read", hookHandler);
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const res = await manager.customTypes.readCustomType({ id: model.id });

	expect(res).toStrictEqual({
		// TODO: update prismic/mock
		model: { ...model, format: "custom" },
		errors: [],
	});
	expectHookHandlerToHaveBeenCalledWithData(hookHandler, {
		id: model.id,
	});
});

it("validates the adapter's return value", async () => {
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			// @ts-expect-error - We are purposely returning an invalid value.
			hook("custom-type:read", () => {
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

	const res = await manager.customTypes.readCustomType({ id: "id" });

	expect(res).toStrictEqual({
		model: undefined,
		errors: [expect.objectContaining({ name: "DecodeError" })],
	});
});

it("ignores plugins that implement `custom-type-library:read`", async (ctx) => {
	const model = ctx.mockPrismic.model.customType();
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("custom-type:read", () => {
				return { model };
			});
		},
	});
	const plugin = createTestPlugin({
		meta: { name: "ignored-plugin" },
		setup: ({ hook }) => {
			hook("custom-type:read", () => {
				return { model: ctx.mockPrismic.model.customType() };
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

	const res = await manager.customTypes.readCustomType({ id: model.id });

	expect(res).toStrictEqual({
		model: { ...model, format: "custom" },
		errors: [],
	});
});

it("throws if plugins have not been initialized", async () => {
	const cwd = await createTestProject();
	const manager = createSliceMachineManager({ cwd });

	await expect(async () => {
		await manager.customTypes.readCustomType({ id: "id" });
	}).rejects.toThrow(/plugins have not been initialized/i);
});
