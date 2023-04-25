import { expect, it, vi } from "vitest";
import { Buffer } from "node:buffer";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { expectHookHandlerToHaveBeenCalledWithData } from "./__testutils__/expectHookHandlerToHaveBeenCalledWithData";

import { createSliceMachineManager } from "../src";

it("returns a Custom Type's mocks config", async () => {
	const mocksConfig = { bar: "baz" };
	const hookHandler = vi.fn(() => {
		return { data: Buffer.from(JSON.stringify(mocksConfig)) };
	});
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("custom-type:asset:read", hookHandler);
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const res = await manager.customTypes.readCustomTypeMocksConfig({
		customTypeID: "foo",
	});

	expect(res).toStrictEqual({
		mocksConfig,
		errors: [],
	});
	expectHookHandlerToHaveBeenCalledWithData(hookHandler, {
		customTypeID: "foo",
		assetID: "mocks.config.json",
	});
});

it("ignores plugins that implement `custom-type:read:asset`", async () => {
	const mocksConfig = { bar: "baz" };
	const ignoredMocksConfig = { qux: "quux" };
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("custom-type:asset:read", () => {
				return { data: Buffer.from(JSON.stringify(mocksConfig)) };
			});
		},
	});
	const plugin = createTestPlugin({
		meta: { name: "ignored-plugin" },
		setup: ({ hook }) => {
			hook("custom-type:asset:read", () => {
				return { data: Buffer.from(JSON.stringify(ignoredMocksConfig)) };
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

	const res = await manager.customTypes.readCustomTypeMocksConfig({
		customTypeID: "foo",
	});

	expect(res.mocksConfig).toStrictEqual(mocksConfig);
});

it("throws if plugins have not been initialized", async () => {
	const cwd = await createTestProject();
	const manager = createSliceMachineManager({ cwd });

	await expect(async () => {
		await manager.customTypes.readCustomTypeMocksConfig({
			customTypeID: "foo",
		});
	}).rejects.toThrow(/plugins have not been initialized/i);
});
