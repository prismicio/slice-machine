import { expect, it, vi } from "vitest";
import { Buffer } from "node:buffer";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";

import { createSliceMachineManager } from "../src";
import { expectHookHandlerToHaveBeenCalledWithData } from "./__testutils__/expectHookHandlerToHaveBeenCalledWithData";

it("saves a Custom Type's mock config as an asset", async () => {
	const mocksConfig = { bar: "baz" };
	const hookHandler = vi.fn();
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("custom-type:asset:update", hookHandler);
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const res = await manager.customTypes.updateCustomTypeMocksConfig({
		customTypeID: "foo",
		mocksConfig,
	});

	expect(res).toStrictEqual({
		errors: [],
	});
	expectHookHandlerToHaveBeenCalledWithData(hookHandler, {
		customTypeID: "foo",
		asset: {
			id: "mocks.config.json",
			data: Buffer.from(JSON.stringify(mocksConfig, null, "\t")),
		},
	});
});

it("throws if plugins have not been initialized", async () => {
	const cwd = await createTestProject();
	const manager = createSliceMachineManager({ cwd });

	await expect(async () => {
		await manager.customTypes.updateCustomTypeMocksConfig({
			customTypeID: "foo",
			mocksConfig: { bar: "baz" },
		});
	}).rejects.toThrow(/plugins have not been initialized/i);
});
