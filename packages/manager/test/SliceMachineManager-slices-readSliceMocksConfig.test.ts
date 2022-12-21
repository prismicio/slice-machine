import { expect, it, vi } from "vitest";
import { Buffer } from "node:buffer";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { expectHookHandlerToHaveBeenCalledWithData } from "./__testutils__/expectHookHandlerToHaveBeenCalledWithData";

import { createSliceMachineManager } from "../src";

it("returns a Slice's mocks config", async () => {
	const mocksConfig = { bar: "baz" };
	const hookHandler = vi.fn(() => {
		return { data: Buffer.from(JSON.stringify(mocksConfig)) };
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

	const res = await manager.slices.readSliceMocksConfig({
		libraryID: "foo",
		sliceID: "bar",
	});

	expect(res).toStrictEqual({
		mocksConfig,
		errors: [],
	});
	expectHookHandlerToHaveBeenCalledWithData(hookHandler, {
		libraryID: "foo",
		sliceID: "bar",
		assetID: "mocks.config.json",
	});
});

it("ignores plugins that implement `slice:read:asset`", async () => {
	const mocksConfig = { baz: "qux" };
	const ignoredMocksConfig = { quux: "corge" };
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("slice:asset:read", () => {
				return { data: Buffer.from(JSON.stringify(mocksConfig)) };
			});
		},
	});
	const plugin = createTestPlugin({
		meta: { name: "ignored-plugin" },
		setup: ({ hook }) => {
			hook("slice:asset:read", () => {
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

	const res = await manager.slices.readSliceMocksConfig({
		libraryID: "foo",
		sliceID: "bar",
	});

	expect(res.mocksConfig).toStrictEqual(mocksConfig);
});

it("throws if plugins have not been initialized", async () => {
	const cwd = await createTestProject();
	const manager = createSliceMachineManager({ cwd });

	await expect(async () => {
		await manager.slices.readSliceMocksConfig({
			libraryID: "foo",
			sliceID: "bar",
		});
	}).rejects.toThrow(/plugins have not been initialized/i);
});
