import { expect, it, vi } from "vitest";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { expectHookHandlerToHaveBeenCalledWithData } from "./__testutils__/expectHookHandlerToHaveBeenCalledWithData";

import { createSliceMachineManager } from "../src";

it("calls plugins' `custom-type:update` hook", async (ctx) => {
	const model = ctx.mockPrismic.model.customType();
	const hookHandler = vi.fn();
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("custom-type:update", hookHandler);
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const res = await manager.customTypes.updateCustomType({ model });

	expectHookHandlerToHaveBeenCalledWithData(hookHandler, { model });
	expect(res).toStrictEqual({
		errors: [],
	});
});

it("throws if plugins have not been initialized", async (ctx) => {
	const cwd = await createTestProject();
	const manager = createSliceMachineManager({ cwd });

	await expect(async () => {
		await manager.customTypes.updateCustomType({
			model: ctx.mockPrismic.model.customType(),
		});
	}).rejects.toThrow(/plugins have not been initialized/i);
});

it("updates content relationships when a custom type id changes", async (ctx) => {
	const model = ctx.mockPrismic.model.customType({
		fields: { title: ctx.mockPrismic.model.keyText() },
	});
	const hookHandler = vi.fn();
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("custom-type:update", hookHandler);
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const model2 = ctx.mockPrismic.model.customType({
		fields: { title2: ctx.mockPrismic.model.keyText() },
	});

	const res = await manager.customTypes.updateCustomType({
		model,
		updateMeta: {
			fieldIdChanged: {
				previousPath: ["title"],
				newPath: ["title2"],
			},
		},
	});

	expectHookHandlerToHaveBeenCalledWithData(hookHandler, { model });
	expect(res).toStrictEqual({
		errors: [],
	});
});
