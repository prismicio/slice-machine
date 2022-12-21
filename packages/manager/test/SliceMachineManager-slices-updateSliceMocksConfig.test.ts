import { expect, it, vi } from "vitest";
import { Buffer } from "node:buffer";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";

import { createSliceMachineManager } from "../src";
import { expectHookHandlerToHaveBeenCalledWithData } from "./__testutils__/expectHookHandlerToHaveBeenCalledWithData";

it("saves a Slice's mock config as an asset", async () => {
	const mocksConfig = { baz: "qux" };
	const hookHandler = vi.fn();
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("slice:asset:update", hookHandler);
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const res = await manager.slices.updateSliceMocksConfig({
		libraryID: "foo",
		sliceID: "bar",
		mocksConfig,
	});

	expect(res).toStrictEqual({
		errors: [],
	});
	expectHookHandlerToHaveBeenCalledWithData(hookHandler, {
		libraryID: "foo",
		sliceID: "bar",
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
		await manager.slices.updateSliceMocksConfig({
			libraryID: "foo",
			sliceID: "bar",
			mocksConfig: { baz: "qux" },
		});
	}).rejects.toThrow(/plugins have not been initialized/i);
});
