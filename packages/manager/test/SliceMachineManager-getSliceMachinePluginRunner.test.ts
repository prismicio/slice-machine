import { expect, it } from "vitest";
import { SliceMachinePluginRunner } from "@slicemachine/plugin-kit";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";

import { createSliceMachineManager } from "../src";

it("returns undefined if plugins have not been initialized", async () => {
	const manager = createSliceMachineManager();

	const pluginRunner = manager.getSliceMachinePluginRunner();

	expect(pluginRunner).toBe(undefined);
});

it("returns plugin runner if plugins have been initialized", async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const pluginRunner = manager.getSliceMachinePluginRunner();

	expect(pluginRunner).toBeInstanceOf(SliceMachinePluginRunner);
});
