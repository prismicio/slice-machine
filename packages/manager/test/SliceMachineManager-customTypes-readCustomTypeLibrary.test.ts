import { expect, it } from "vitest";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";

import { createSliceMachineManager } from "../src";

it("returns the adapter's `custom-type-library:read` return value", async () => {
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("custom-type-library:read", () => {
				return { ids: ["id"] };
			});
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const res = await manager.customTypes.readCustomTypeLibrary();

	expect(res).toStrictEqual({
		ids: ["id"],
		errors: [],
	});
});

it("validates the adapter's return value", async () => {
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			// @ts-expect-error - We are purposely returning an invalid value.
			hook("custom-type-library:read", () => {
				return { ids: [Symbol()] };
			});
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const res = await manager.customTypes.readCustomTypeLibrary();

	expect(res).toStrictEqual({
		ids: [],
		errors: [
			expect.objectContaining({
				message: expect.stringMatching(/expecting string/i),
			}),
		],
	});
});

it("ignores plugins that implement `custom-type-library:read`", async () => {
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("custom-type-library:read", () => {
				return { ids: ["id"] };
			});
		},
	});
	const plugin = createTestPlugin({
		meta: { name: "ignored-plugin" },
		setup: ({ hook }) => {
			hook("custom-type-library:read", () => {
				return { ids: ["bar"] };
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

	const res = await manager.customTypes.readCustomTypeLibrary();

	expect(res).toStrictEqual({
		ids: ["id"],
		errors: [],
	});
});

it("throws if plugins have not been initialized", async () => {
	const cwd = await createTestProject();
	const manager = createSliceMachineManager({ cwd });

	await expect(async () => {
		await manager.customTypes.readCustomTypeLibrary();
	}).rejects.toThrow(/plugins have not been initialized/i);
});
