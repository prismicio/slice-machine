import { expect, it, vi } from "vitest";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";

import { createSliceMachineManager } from "../src";

// TODO: test readCustomTypeMocksConfig
it("", async (ctx) => {
	const model = ctx.mockPrismic.model.customType();
	const hookHandler = vi.fn();
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("custom-type:create", hookHandler);
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const res = await manager.customTypes.createCustomType({ model });

	expect(hookHandler).toHaveBeenCalledWith(
		{ model },
		expect.objectContaining({
			actions: expect.anything(),
			helpers: expect.anything(),
			project: expect.anything(),
			options: expect.anything(),
		}),
	);
	expect(res).toStrictEqual({
		errors: [],
	});
});

it("throws if plugins have not been initialized", async (ctx) => {
	const cwd = await createTestProject();
	const manager = createSliceMachineManager({ cwd });

	await expect(async () => {
		await manager.customTypes.createCustomType({
			model: ctx.mockPrismic.model.customType(),
		});
	}).rejects.toThrow(/plugins have not been initialized/i);
});
