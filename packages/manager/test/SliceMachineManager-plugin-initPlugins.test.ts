import { expect, it } from "vitest";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";

import { createSliceMachineManager } from "../src";

it("initializes the plugin runner", async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const sliceMachinePluginRunner = manager.getSliceMachinePluginRunner();
	const registeredHooksForAdapter = sliceMachinePluginRunner?.hooksForOwner(
		adapter.meta.name,
	);

	expect(registeredHooksForAdapter).toContainEqual(
		expect.objectContaining({
			meta: expect.objectContaining({
				owner: adapter.meta.name,
			}),
		}),
	);
});

it("provides the correct project root to the plugin runner", async () => {
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("debug", (_data, { project }) => project.root);
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const sliceMachinePluginRunner = manager.getSliceMachinePluginRunner();

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const { data } = await sliceMachinePluginRunner!.callHook("debug", undefined);

	const projectRoot = await manager.project.getRoot();

	expect(data[0]).toBe(projectRoot);
});

it("provides the correct Slice Machine config to the plugin runner", async () => {
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("debug", (_data, { project }) => project.config);
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const sliceMachinePluginRunner = manager.getSliceMachinePluginRunner();

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const { data } = await sliceMachinePluginRunner!.callHook("debug", undefined);

	const sliceMachineConfig = await manager.project.getSliceMachineConfig();

	expect(data[0]).toStrictEqual(sliceMachineConfig);
});

it("provides SliceMachineManager's native plugins to the plugin runner", async () => {
	const commandInitHook = () => void 0;
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("debug", commandInitHook);
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const sliceMachinePluginRunner = manager.getSliceMachinePluginRunner();
	const registeredHooksForAdapter = sliceMachinePluginRunner?.hooksForOwner(
		adapter.meta.name,
	);

	expect(registeredHooksForAdapter).toContainEqual(
		expect.objectContaining({
			meta: expect.objectContaining({
				external: commandInitHook,
				owner: adapter.meta.name,
				type: "debug",
			}),
		}),
	);
});
