import { SliceMachinePluginRunner } from "@slicemachine/plugin-kit";
import { expect, it } from "vitest";

import { createSliceMachineManager } from "../src";

it("returns undefined if plugins have not been initialized", () => {
	const manager = createSliceMachineManager();

	const pluginRunner = manager.getSliceMachinePluginRunner();

	expect(pluginRunner).toBe(undefined);
});

it("returns plugin runner if plugins have been initialized", async () => {
	const manager = createSliceMachineManager();

	await manager.plugins.initPlugins();

	const pluginRunner = manager.getSliceMachinePluginRunner();

	expect(pluginRunner).toBeInstanceOf(SliceMachinePluginRunner);
});
