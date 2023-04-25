import { it, expect, vi } from "vitest";

import * as adapter from "./__fixtures__/adapter";
import * as plugin from "./__fixtures__/plugin";
import { createSliceMachineProject } from "./__testutils__/createSliceMachineProject";

import { createSliceMachinePluginRunner } from "../src";

it("inits adapter", async () => {
	const project = createSliceMachineProject(adapter.valid);
	const pluginRunner = createSliceMachinePluginRunner({ project });

	// @ts-expect-error - Calling private method
	const loadPlugin = vi.spyOn(pluginRunner, "_loadPlugin");
	// @ts-expect-error - Calling private method
	const setupPlugin = vi.spyOn(pluginRunner, "_setupPlugin");
	// @ts-expect-error - Calling private method
	const validateAdapter = vi.spyOn(pluginRunner, "_validateAdapter");

	await pluginRunner.init();

	expect(loadPlugin).toHaveBeenCalledOnce();
	expect(setupPlugin).toHaveBeenCalledOnce();
	// @ts-expect-error - Issue with Vitest types
	expect(setupPlugin.calls[0][1]).toBe("adapter");
	expect(validateAdapter).toHaveBeenCalledOnce();
});

it("inits plugins", async () => {
	const project = createSliceMachineProject(adapter.valid, [
		plugin.valid,
		plugin.valid,
	]);
	const pluginRunner = createSliceMachinePluginRunner({ project });

	// @ts-expect-error - Calling private method
	const loadPlugin = vi.spyOn(pluginRunner, "_loadPlugin");
	// @ts-expect-error - Calling private method
	const setupPlugin = vi.spyOn(pluginRunner, "_setupPlugin");
	// @ts-expect-error - Calling private method
	const validateAdapter = vi.spyOn(pluginRunner, "_validateAdapter");

	await pluginRunner.init();

	expect(loadPlugin).toHaveBeenCalledTimes(3);
	expect(setupPlugin).toHaveBeenCalledTimes(3);
	expect(
		// @ts-expect-error - Issue with Vitest types
		setupPlugin.calls.map(([loadedPlugin, as]) => [loadedPlugin.meta.name, as]),
	).toMatchInlineSnapshot(`
		[
		  [
		    "adapter-valid",
		    "adapter",
		  ],
		  [
		    "plugin-valid",
		    "plugin",
		  ],
		  [
		    "plugin-valid",
		    "plugin",
		  ],
		]
	`);
	expect(validateAdapter).toHaveBeenCalledTimes(1);
});
